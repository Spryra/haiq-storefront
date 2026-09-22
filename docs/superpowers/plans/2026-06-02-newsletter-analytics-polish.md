# HAIQ — Newsletter, Analytics Polish & Email System Plan
## Date: 2026-06-02

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5 distinct issues — analytics UI polish, product categorisation, Resend email system overhaul with Audiences + Webhooks, MX-based email validation, and resilient campaign sending.

**Architecture:**
- Track A (3 tasks) covers isolated UI/DB quick-wins with zero risk.
- Track B (6 tasks) replaces the current fire-and-forget campaign send with a full Resend-native pipeline: Batch API for speed, Audiences for contact management, Webhooks for automatic bounce/complaint handling, and MX DNS validation to stop fake emails at the door.
- All changes are backward-compatible. Old newsletter routes keep working; new behaviour is additive.

**Tech Stack:** React 18, Recharts 2, Node.js/Express, PostgreSQL (Neon), Resend SDK v2, DNS module (Node built-in), Zod, bcryptjs, jsonwebtoken.

---

## Codebase Snapshot (State at Time of Writing)

| File | Notes |
|------|-------|
| `admin/src/pages/AnalyticsPage.jsx` | ~852 lines. Contains all charts, tooltips, Top Customers table. |
| `admin/src/pages/NewsletterPage.jsx` | Campaign send, WhatsApp invite, subscriber list, CSV export. |
| `backend/src/services/email.service.js` | Resend SDK wrapper. `sendCampaign()` wraps body in `baseLayout()`. |
| `backend/src/routes/admin/admin.newsletter.routes.js` | Campaign route loops subs with individual try/catch. `LIMIT` not set on subscriber fetch. |
| `backend/src/routes/admin/admin.analytics.routes.js` | `/top-customers` has `LIMIT 10`. |
| `backend/src/routes/newsletter.routes.js` | Public subscribe/unsubscribe. No MX validation. |
| `backend/src/db/migrations/` | Latest is `011_delivery_zones.sql`. Next is `012`. |
| `backend/.env` | `RESEND_API_KEY=re_VrzDjGEJ_...` (revoked). `EMAIL_FROM=haiqafrica@gmail.com` (not a verified Resend sender domain). |

### Known Bugs (root causes identified)

1. **Campaign send silently fails** — Two causes working together:
   - The `RESEND_API_KEY` in `.env` is revoked. Every Resend call returns 401.
   - `EMAIL_FROM=haiqafrica@gmail.com` — Resend does not allow arbitrary Gmail addresses as senders. You must use a verified domain OR the sandbox address `onboarding@resend.dev`.

2. **Top Customers shows too many rows** — Backend query `LIMIT 10`, no frontend cap.

3. **`👑 Hidden from customers` badge** — Emoji badge still present in admin analytics card header.

4. **Janlin has `NULL` category_id** — Not assigned to any category in the database.

5. **No email domain validation** — Users can register with `fake@mailinator.com` or any disposable domain.

6. **Graph hover is jarring** — Default Recharts cursor is a bold filled rectangle. Tooltips snap on with no transition. Active dots have a stroke ring that pulses.

---

## Pre-Execution Prerequisites (You Must Do These in Resend Dashboard)

Before Tasks B4 and B5 can be executed, the following must be done manually in the Resend web dashboard. These cannot be automated.

### Step 1 — Domain Verification
1. Go to [resend.com](https://resend.com) → log in
2. **Settings → Domains → Add Domain**
3. Enter `haiq.ug` (or whatever domain you control DNS for)
4. Resend will provide DNS records (SPF, DKIM, DMARC). Add them in your DNS provider.
5. Click **Verify** once records propagate (usually 5–30 minutes)
6. This enables sending `FROM` addresses like `noreply@haiq.ug`, `hello@haiq.ug`, `orders@haiq.ug`

> **Interim (works immediately without domain):** We use `HAIQ Bakery <onboarding@resend.dev>` as the FROM address during development and testing. This works out of the box. Switch to your verified domain for production.

### Step 2 — Create Audience
1. Resend Dashboard → **Audiences → New Audience**
2. Name it: `HAIQ Newsletter`
3. Click **Create**
4. Copy the **Audience ID** (looks like `78261eea-dbf4-49e8-a97e-f2a3acd5ca62`)
5. You will add this to `.env` as `RESEND_AUDIENCE_ID=<copied-id>`

### Step 3 — Create Webhook Endpoint
1. Resend Dashboard → **Webhooks → Add Endpoint**
2. URL: `https://haiq-api.onrender.com/v1/webhooks/resend`
3. Select all events:
   - `email.sent`
   - `email.delivered`
   - `email.bounced`
   - `email.failed`
   - `email.complained` (spam reports)
   - `email.opened` (optional — useful for analytics)
4. Click **Create**
5. Copy the **Signing Secret** (starts with `whsec_...`)
6. Add to `.env` as `RESEND_WEBHOOK_SECRET=whsec_...`

### Step 4 — Note Your New API Key
New key provided: `re_[REDACTED_ROTATED]`
This replaces the revoked key currently in `.env`.

---

## Environment Variables — Final State After All Tasks

```env
# Existing (unchanged)
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=...
REFRESH_TOKEN_SECRET=...
ADMIN_JWT_SECRET=...
FRONTEND_URL=https://haiqweb.vercel.app
CORS_ORIGINS=...

# Updated
RESEND_API_KEY=re_[REDACTED_ROTATED]

# Updated — use verified domain once set up; use sandbox for testing
EMAIL_FROM=noreply@haiq.ug
EMAIL_FROM_NAME=HAIQ Bakery
EMAIL_FROM_SANDBOX=onboarding@resend.dev   # fallback for dev

# New
RESEND_AUDIENCE_ID=<audience-id-from-resend-dashboard>
RESEND_WEBHOOK_SECRET=whsec_<signing-secret-from-resend-dashboard>

# Also update in Render/Vercel production env vars
```

---

## Track A — Quick Fixes

---

### Task A1: Analytics — Top Customers (limit to 3, remove badge)

**Files:**
- Modify: `backend/src/routes/admin/admin.analytics.routes.js` (line ~102)
- Modify: `admin/src/pages/AnalyticsPage.jsx` (lines 793–799)

**What to change:**

- [ ] **Step 1: Change backend LIMIT from 10 to 3**

Find this in `admin.analytics.routes.js` (around line 82–110, the `/top-customers` route):

```sql
-- BEFORE
LIMIT  10

-- AFTER
LIMIT  3
```

Full query context for reference:
```sql
SELECT
  u.id,
  u.full_name,
  u.email,
  u.loyalty_tier,
  COUNT(o.id)::int         AS total_orders,
  COALESCE(SUM(o.total),0) AS total_spent
FROM   users u
JOIN   orders o ON o.user_id = u.id AND o.payment_status = 'paid'
GROUP  BY u.id, u.full_name, u.email, u.loyalty_tier
ORDER  BY total_spent DESC
LIMIT  3        -- changed from 10
```

- [ ] **Step 2: Remove the emoji badge from AnalyticsPage.jsx**

Find and remove this entire span element (lines 797–799):

```jsx
// REMOVE THIS ENTIRE BLOCK:
<span className="text-[10px] bg-haiq-gold/10 text-haiq-gold border border-haiq-gold/30 px-2.5 py-1 rounded-full uppercase tracking-widest">
  👑 Hidden from customers
</span>
```

The containing `div` on line 795 uses `flex items-start justify-between mb-4`. After removing the badge, change it to just `mb-4` since justify-between is no longer needed:

```jsx
// BEFORE
<div className="flex items-start justify-between mb-4">
  <SectionHeader label="Internal — Admin Only" title="Top Customers" />
  <span className="...">👑 Hidden from customers</span>
</div>

// AFTER
<div className="mb-4">
  <SectionHeader label="Internal — Admin Only" title="Top Customers" />
</div>
```

- [ ] **Step 3: Commit**

```bash
git add admin/src/pages/AnalyticsPage.jsx backend/src/routes/admin/admin.analytics.routes.js
git commit -m "feat(analytics): limit top customers to 3, remove hidden badge"
```

---

### Task A2: Analytics — Professional Graph Hover Behaviour

**Files:**
- Modify: `admin/src/pages/AnalyticsPage.jsx`

**Context — why the current hover feels bad:**
Recharts default hover on `BarChart` renders a filled rectangle behind the hovered bar. The default colour is a semi-transparent grey that clashes with the HAIQ dark theme. On `LineChart`, the `activeDot` has a coloured stroke ring that pulses. Tooltips have no enter animation — they snap on and off. The result is a "system UI" feeling instead of "premium product" feeling.

**Fix strategy:** The goal is *less is more* — make hover effects barely noticeable but clearly present. Subtle background wash, no borders or rings, smooth 120ms fade on the tooltip.

- [ ] **Step 1: Add tooltip animation style constant at top of component**

Near the top of the file, after the existing constants, add:

```jsx
// Shared tooltip wrapper style — used on ALL charts
const TOOLTIP_STYLE = {
  outline: 'none',
  filter: 'none',
}

// Shared cursor for all BarCharts — subtle wash, no border
const BAR_CURSOR = { fill: 'rgba(255,255,255,0.028)', strokeWidth: 0 }
```

- [ ] **Step 2: Update Revenue Breakdown LineChart**

Find the `<Tooltip content={revenueTooltip} />` line and update:

```jsx
// BEFORE
<Tooltip content={revenueTooltip} />

// AFTER
<Tooltip
  content={revenueTooltip}
  wrapperStyle={TOOLTIP_STYLE}
  animationDuration={120}
  animationEasing="ease-out"
/>
```

Update both `activeDot` props on Line components — remove the stroke ring:

```jsx
// BEFORE
activeDot={{ r: 5, fill: '#B8752A' }}
// AFTER
activeDot={{ r: 4, fill: '#B8752A', strokeWidth: 0 }}

// BEFORE
activeDot={{ r: 5, fill: '#8C7355' }}
// AFTER
activeDot={{ r: 4, fill: '#8C7355', strokeWidth: 0 }}

// BEFORE
activeDot={{ r: 4, fill: '#E8C88A' }}
// AFTER
activeDot={{ r: 3, fill: '#E8C88A', strokeWidth: 0 }}
```

- [ ] **Step 3: Update Orders by Status BarChart**

```jsx
// BEFORE
<Tooltip content={statusTooltip} />
<Bar dataKey="count" fill="#B8752A" radius={[3, 3, 0, 0]} name="orders" cursor={{ fill: 'rgba(184,117,42,0.08)' }} />

// AFTER
<Tooltip content={statusTooltip} cursor={BAR_CURSOR} wrapperStyle={TOOLTIP_STYLE} animationDuration={120} animationEasing="ease-out" />
<Bar dataKey="count" fill="#B8752A" radius={[3, 3, 0, 0]} name="orders" />
```

Note: `cursor` belongs on `<Tooltip>`, not on `<Bar>`. Moving it there is more correct.

- [ ] **Step 4: Update Zone Distribution PieChart**

```jsx
// BEFORE
<Tooltip content={zoneTooltip} />

// AFTER
<Tooltip
  content={zoneTooltip}
  wrapperStyle={TOOLTIP_STYLE}
  animationDuration={120}
  animationEasing="ease-out"
/>
```

For the Pie itself, suppress the default pop-out expand on hover by setting `activeShape` to just re-render the same shape with a subtle stroke:

```jsx
// BEFORE
<Pie data={zones} dataKey="order_count" nameKey="zone_name"
  cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2}>

// AFTER
<Pie data={zones} dataKey="order_count" nameKey="zone_name"
  cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2}
  activeShape={(props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
    return (
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius} outerRadius={outerRadius + 3}
        startAngle={startAngle} endAngle={endAngle}
        fill={fill}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={1}
      />
    )
  }}
>
```

Add `Sector` to recharts imports at the top of the file.

- [ ] **Step 5: Update Special Days Impact BarChart**

```jsx
// BEFORE
<Tooltip content={specialDaysTooltip} cursor={{ fill: 'rgba(184,117,42,0.08)' }} />

// AFTER
<Tooltip content={specialDaysTooltip} cursor={BAR_CURSOR} wrapperStyle={TOOLTIP_STYLE} animationDuration={120} animationEasing="ease-out" />
```

Remove the duplicate `cursor` prop from the `Bar` components in this chart too:

```jsx
// BEFORE
<Bar yAxisId="left" dataKey="revenue" fill="#B8752A" radius={[3, 3, 0, 0]} name="Avg Revenue (UGX)" cursor={{ fill: 'rgba(184,117,42,0.08)' }} />
<Bar yAxisId="right" dataKey="orders" fill="#D4A574" radius={[3, 3, 0, 0]} name="Avg Orders" cursor={{ fill: 'rgba(184,117,42,0.08)' }} />

// AFTER
<Bar yAxisId="left" dataKey="revenue" fill="#B8752A" radius={[3, 3, 0, 0]} name="Avg Revenue (UGX)" />
<Bar yAxisId="right" dataKey="orders" fill="#D4A574" radius={[3, 3, 0, 0]} name="Avg Orders" />
```

- [ ] **Step 6: Update Customer Growth AreaChart**

```jsx
// BEFORE
<Tooltip content={growthTooltip} />

// AFTER
<Tooltip
  content={growthTooltip}
  wrapperStyle={TOOLTIP_STYLE}
  animationDuration={120}
  animationEasing="ease-out"
/>
```

- [ ] **Step 7: Commit**

```bash
git add admin/src/pages/AnalyticsPage.jsx
git commit -m "polish(analytics): professional chart hover — subtle cursor, smooth tooltip fade, no active dot rings"
```

---

### Task A3: Janlin → Drinks Category

**Files:**
- Create: `backend/src/db/migrations/012_add_drinks_category.sql`

**Context:** The `categories` table currently has only `Cookies` (id=4) and `Gift Boxes` (id=5) as active categories. Janlin has `category_id = NULL`. No `Drinks` category exists.

- [ ] **Step 1: Create migration file**

Create `backend/src/db/migrations/012_add_drinks_category.sql`:

```sql
-- ============================================================
-- Migration 012: Add Drinks category and assign Janlin to it
-- ============================================================

-- 1. Insert Drinks category (idempotent via ON CONFLICT)
INSERT INTO categories (name, slug, description, sort_order)
VALUES ('Drinks', 'drinks', 'Premium handcrafted beverages', 6)
ON CONFLICT (slug) DO NOTHING;

-- 2. Assign Janlin to Drinks category
UPDATE products
SET    category_id = (SELECT id FROM categories WHERE slug = 'drinks'),
       updated_at  = NOW()
WHERE  slug = 'janlin';
```

- [ ] **Step 2: Verify migration will run**

The server auto-runs all `.sql` files in `src/db/migrations/` on startup via `runMigrations()` in `server.js`. Since `012_add_drinks_category.sql` is new, it will run on next restart and be recorded in the `_migrations` table.

- [ ] **Step 3: Restart backend to apply migration**

```bash
# In backend directory
npm start
# Expect to see in logs:
# ▶  Running migration: 012_add_drinks_category.sql
# ✅ Completed: 012_add_drinks_category.sql
```

- [ ] **Step 4: Verify in database**

```bash
node -e "
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT p.slug, p.name, c.name as category FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.slug=\\'janlin\\'')
  .then(r => { console.log(r.rows[0]); pool.end(); });
"
# Expected: { slug: 'janlin', name: 'Janlin', category: 'Drinks' }
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/db/migrations/012_add_drinks_category.sql
git commit -m "feat(db): add Drinks category and assign Janlin to it"
```

---

## Track B — Newsletter & Email System Overhaul

---

### Task B1: Update API Key + Fix FROM Sender

**Files:**
- Modify: `backend/.env`
- Modify: `backend/src/services/email.service.js`
- Modify: `backend/.env.example`

- [ ] **Step 1: Update `.env` with new API key**

```env
# BEFORE
RESEND_API_KEY=re_[REDACTED_REVOKED]
EMAIL_FROM=haiqafrica@gmail.com
EMAIL_FROM_NAME=HAIQ Bakery

# AFTER
RESEND_API_KEY=re_[REDACTED_ROTATED]
EMAIL_FROM=noreply@haiq.ug
EMAIL_FROM_NAME=HAIQ Bakery
EMAIL_FROM_DEV=onboarding@resend.dev
```

> Note: `EMAIL_FROM=noreply@haiq.ug` will only work once the domain `haiq.ug` is verified in Resend. Until then, locally and in testing use `EMAIL_FROM_DEV`. See the `email.service.js` change below.

- [ ] **Step 2: Update `email.service.js` FROM address resolution**

Find this line near the top of `email.service.js`:

```js
// BEFORE
const FROM = `${process.env.EMAIL_FROM_NAME || 'HAIQ Bakery'} <${process.env.EMAIL_FROM || 'orders@haiq.ug'}>`;
```

Replace with:

```js
// AFTER — uses verified domain in production, sandbox in dev/when domain not set
const EMAIL_DOMAIN_VERIFIED = process.env.EMAIL_FROM && !process.env.EMAIL_FROM.includes('gmail');
const FROM = EMAIL_DOMAIN_VERIFIED
  ? `${process.env.EMAIL_FROM_NAME || 'HAIQ Bakery'} <${process.env.EMAIL_FROM}>`
  : `${process.env.EMAIL_FROM_NAME || 'HAIQ Bakery'} <${process.env.EMAIL_FROM_DEV || 'onboarding@resend.dev'}>`;
```

This means:
- On production with `EMAIL_FROM=noreply@haiq.ug` → uses `noreply@haiq.ug`
- On dev with `EMAIL_FROM=haiqafrica@gmail.com` → falls back to `onboarding@resend.dev`
- If neither is set → uses `onboarding@resend.dev`

- [ ] **Step 3: Reinitialise Resend client to pick up new key**

The client is initialised once at module load:

```js
let resend;
try {
  resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
} catch (e) { ... }
```

This is correct — no change needed. The new key will be picked up on server restart.

- [ ] **Step 4: Test that email sending works**

After restarting the server, send a test campaign from the admin dashboard to a single real email. Verify it arrives.

- [ ] **Step 5: Update `.env.example`**

Add documentation for all new vars:

```env
# --- Email (Resend) -------------------------------------------
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=noreply@yourdomain.com         # Must be a Resend-verified domain
EMAIL_FROM_NAME=HAIQ Bakery
EMAIL_FROM_DEV=onboarding@resend.dev      # Sandbox sender for dev/testing (no domain needed)
RESEND_AUDIENCE_ID=                       # From Resend dashboard → Audiences → your audience → ID
RESEND_WEBHOOK_SECRET=                    # From Resend dashboard → Webhooks → signing secret
```

- [ ] **Step 6: Commit**

```bash
git add backend/.env.example backend/src/services/email.service.js
# DO NOT commit .env itself — it contains secrets
git commit -m "fix(email): update Resend FROM address resolution, fall back to sandbox sender in dev"
```

---

### Task B2: Resilient Campaign Sending with Delivery Tracking

**Files:**
- Modify: `backend/src/routes/admin/admin.newsletter.routes.js`
- Modify: `backend/src/db/migrations/012_add_drinks_category.sql` (append to it, or create `013`)
- Modify: `admin/src/pages/NewsletterPage.jsx`

**Context:** The current campaign route already has a `for` loop with individual `try/catch`, which is good — individual failures do not stop the campaign. What is missing:
1. Tracking which specific emails failed (for debugging and retry)
2. Returning `failed_count` alongside `sent_count` to the admin UI
3. The `newsletter_campaigns` table has no column for `failed_count` or `sent_count`

- [ ] **Step 1: Add columns to newsletter_campaigns table**

Add to migration (either append to `012` or create `013_newsletter_tracking.sql`):

```sql
-- Add tracking columns to newsletter_campaigns
ALTER TABLE newsletter_campaigns
  ADD COLUMN IF NOT EXISTS sent_count    INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS failed_count  INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS failed_emails JSONB   DEFAULT '[]';
```

- [ ] **Step 2: Update campaign route to track failures and update DB**

Find the campaign loop in `admin.newsletter.routes.js` and replace:

```js
// BEFORE
let sent = 0;
for (const sub of subs) {
  try {
    await emailService.sendCampaign({
      email:   sub.email,
      subject,
      html:    body_html,
    });
    sent++
  } catch (e) {
    logger.warn('Campaign email failed', { email: sub.email, error: e.message });
  }
}

res.json({ success: true, sent, total: subs.length, campaign_id: campaign.id });
```

Replace with:

```js
// AFTER
let sent = 0;
let failed = 0;
const failedEmails = [];

for (const sub of subs) {
  try {
    await emailService.sendCampaign({
      email:   sub.email,
      subject,
      html:    body_html,
    });
    sent++;
  } catch (e) {
    failed++;
    failedEmails.push({ email: sub.email, error: e.message });
    logger.warn('Campaign email failed', { email: sub.email, error: e.message });
  }
}

// Update campaign record with final counts
await query(
  `UPDATE newsletter_campaigns
   SET sent_count = $1, failed_count = $2, failed_emails = $3
   WHERE id = $4`,
  [sent, failed, JSON.stringify(failedEmails), campaign.id]
);

res.json({
  success:     true,
  sent,
  failed,
  total:       subs.length,
  campaign_id: campaign.id,
  message:     failed > 0
    ? `${sent} delivered, ${failed} failed. Check logs for details.`
    : `All ${sent} emails delivered successfully.`,
});
```

- [ ] **Step 3: Update NewsletterPage.jsx to show delivery stats**

Find the `sendCampaign` function and the success state display:

```jsx
// BEFORE — in sendCampaign function
setSent(r.data.sent)

// AFTER
setSent({ count: r.data.sent, failed: r.data.failed, total: r.data.total, message: r.data.message })
```

Find where `sent` is displayed in the JSX and update:

```jsx
// BEFORE
{sent !== null && (
  <p className="text-green-400 text-sm mt-3">✓ Sent to {sent} subscribers</p>
)}

// AFTER
{sent !== null && (
  <div className="mt-3 p-3 rounded" style={{ background: '#1A0A00', border: '1px solid rgba(184,117,42,0.3)' }}>
    <p className="text-sm font-semibold" style={{ color: sent.failed > 0 ? '#E8C88A' : '#6ECA8F' }}>
      {sent.failed > 0 ? '⚠' : '✓'} {sent.message}
    </p>
    {sent.failed > 0 && (
      <p className="text-xs mt-1" style={{ color: '#8C7355' }}>
        {sent.failed} email{sent.failed !== 1 ? 's' : ''} could not be delivered (test addresses or invalid domains).
      </p>
    )}
  </div>
)}
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/admin/admin.newsletter.routes.js admin/src/pages/NewsletterPage.jsx
git commit -m "feat(newsletter): track sent/failed counts per campaign, show delivery breakdown in UI"
```

---

### Task B3: Email Domain Validation (MX Record Check)

**Files:**
- Create: `backend/src/utils/emailValidator.js`
- Modify: `backend/src/controllers/auth.controller.js`
- Modify: `backend/src/routes/newsletter.routes.js`

**Why MX records and not just format checking:**
Format checking (`user@domain.com`) is trivially bypassed with `fake@asdkjfhaskdjfh.xyz`. An MX record check confirms that the domain has actual mail servers configured to receive email — a much stronger signal that the address is real. It does not confirm the specific mailbox exists (that would require SMTP verification, which is slow and blocked by most mail providers), but it eliminates the vast majority of fake/throwaway addresses.

**Disposable domain blocklist:** Covers known disposable services (Mailinator, Guerrilla Mail, temp-mail, etc.). These all have valid MX records, so the MX check alone won't catch them.

- [ ] **Step 1: Create `emailValidator.js` utility**

Create `backend/src/utils/emailValidator.js`:

```js
'use strict';
// emailValidator.js — MX record check + disposable domain blocklist
// Used at registration and newsletter subscription.
// Fail OPEN on DNS errors (do not block real users due to network issues).

const dns = require('dns').promises;
const { logger } = require('../config/logger');

// Known disposable/throwaway email domains
// Extend this list as new services emerge
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.de',
  'guerrillamail.biz',
  'guerrillamail.info',
  'temp-mail.org',
  'tempmail.com',
  'throwaway.email',
  'throwam.com',
  'dispostable.com',
  'yopmail.com',
  'yopmail.fr',
  '10minutemail.com',
  '10minutemail.net',
  'trashmail.com',
  'trashmail.me',
  'trashmail.at',
  'trashmail.io',
  'sharklasers.com',
  'guerrillaemail.com',
  'grr.la',
  'spam4.me',
  'maildrop.cc',
  'getairmail.com',
  'fakeinbox.com',
  'discard.email',
  'mailnull.com',
  'spamgourmet.com',
  'spamgourmet.net',
  'spamgourmet.org',
  'bccto.me',
  'mailzilla.com',
  'spambox.us',
  'cust.in',
  'example.com',
  'example.net',
  'example.org',
  'test.com',
]);

/**
 * Validate that an email address is likely to be real and deliverable.
 *
 * Returns:
 *   { valid: true }                          — passes all checks
 *   { valid: false, reason: string }         — failed a check (block registration)
 *   { valid: true, warning: string }         — DNS timed out (allow through)
 *
 * @param {string} email
 * @returns {Promise<{ valid: boolean, reason?: string, warning?: string }>}
 */
async function validateEmailDeliverability(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Email address is required.' };
  }

  const normalised = email.trim().toLowerCase();
  const atIndex    = normalised.lastIndexOf('@');

  if (atIndex === -1 || atIndex === 0 || atIndex === normalised.length - 1) {
    return { valid: false, reason: 'Invalid email address format.' };
  }

  const domain = normalised.slice(atIndex + 1);

  // Block disposable domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      valid:  false,
      reason: 'Disposable or temporary email addresses are not allowed. Please use your real email address.',
    };
  }

  // MX record lookup with 2-second timeout
  try {
    const records = await Promise.race([
      dns.resolveMx(domain),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DNS_TIMEOUT')), 2000)
      ),
    ]);

    if (!records || records.length === 0) {
      return {
        valid:  false,
        reason: `The email domain "${domain}" does not appear to accept emails. Please check your email address.`,
      };
    }

    // Domain has MX records — looks legitimate
    return { valid: true };

  } catch (err) {
    if (err.message === 'DNS_TIMEOUT') {
      // DNS lookup timed out — fail open (do not block real users)
      logger.warn('Email MX lookup timed out — allowing through', { domain });
      return { valid: true, warning: 'Could not verify email domain (DNS timeout)' };
    }

    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      // Domain does not exist or has no DNS records at all
      return {
        valid:  false,
        reason: `The email domain "${domain}" does not exist. Please check your email address.`,
      };
    }

    // Unknown DNS error — fail open
    logger.warn('Email MX lookup failed with unexpected error — allowing through', {
      domain,
      error: err.message,
      code:  err.code,
    });
    return { valid: true, warning: `Email domain check failed: ${err.message}` };
  }
}

module.exports = { validateEmailDeliverability };
```

- [ ] **Step 2: Apply validation in `auth.controller.js` register function**

Find the `register` function. After the basic format/password checks, add the MX check:

```js
// Add import at top of file
const { validateEmailDeliverability } = require('../utils/emailValidator');

// Inside register(), after password validation, before DB lookup:
const emailCheck = await validateEmailDeliverability(email);
if (!emailCheck.valid) {
  return res.status(400).json({
    success: false,
    error:   emailCheck.reason,
  });
}
if (emailCheck.warning) {
  // Log but do not block
  logger.warn('Email validation warning at registration', { email, warning: emailCheck.warning });
}
```

Full placement in `register()`:

```js
async function register(req, res, next) {
  try {
    const { email, password, full_name, first_name, last_name, phone } = req.body;

    // ... (existing name resolution and validation) ...

    if (!password || password.length < 6) { ... }
    if (!/[!@#$%^...]/.test(password)) { ... }

    // ← ADD HERE: email deliverability check
    const emailCheck = await validateEmailDeliverability(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ success: false, error: emailCheck.reason });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    // ... rest of function unchanged ...
  }
}
```

- [ ] **Step 3: Apply validation in `newsletter.routes.js` subscribe route**

```js
// Add import at top
const { validateEmailDeliverability } = require('../utils/emailValidator');

// Inside the POST /subscribe handler, after extracting email:
const normalised = email.trim().toLowerCase();

// ← ADD HERE
const emailCheck = await validateEmailDeliverability(normalised);
if (!emailCheck.valid) {
  return res.status(400).json({
    success: false,
    error:   emailCheck.reason,
  });
}

// ... rest of handler unchanged ...
```

- [ ] **Step 4: Test with known fake domains**

```bash
# Should return 400 with clear error message
curl -s -X POST http://localhost:3001/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mailinator.com","password":"Test123!","full_name":"Test User"}'
# Expected: { "success": false, "error": "Disposable or temporary email addresses are not allowed..." }

curl -s -X POST http://localhost:3001/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@thisdoesnotexist12345xyz.com","password":"Test123!","full_name":"Test User"}'
# Expected: { "success": false, "error": "The email domain ... does not exist..." }

# Should still pass through (gmail has valid MX)
curl -s -X POST http://localhost:3001/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"realuser@gmail.com","password":"Test123!","full_name":"Real User"}'
# Expected: proceeds to duplicate check, then 201 or 409
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/utils/emailValidator.js backend/src/controllers/auth.controller.js backend/src/routes/newsletter.routes.js
git commit -m "feat(security): MX record validation + disposable domain blocklist for email registration"
```

---

### Task B4: Resend Audiences Sync

**Files:**
- Create: `backend/src/services/resend.audience.service.js`
- Modify: `backend/src/routes/newsletter.routes.js`
- Modify: `backend/src/routes/admin/admin.newsletter.routes.js`
- Modify: `backend/src/services/email.service.js` (switch campaign to batch API)

**Context — Resend Audiences:**
Resend Audiences is a contact list feature. Each audience has an ID. Contacts (email + name) are stored in the audience. When a subscriber joins HAIQ's newsletter, they should be added to the Resend audience. When they unsubscribe, they should be removed. This keeps the Resend contact list in sync with the PostgreSQL source of truth.

**Why this matters:**
- Resend tracks email preferences per contact (unsubscribes are remembered)
- The Resend dashboard gives you a live view of your audience
- Batch sending via Audiences is more efficient than individual API calls
- Resend handles duplicate detection automatically

**Resend Batch API vs individual sends:**
Currently we send emails one-by-one in a loop. The Resend Batch API (`POST /emails/batch`) accepts up to 100 emails per call. For 200 subscribers, this means 2 API calls instead of 200. Much faster, and less chance of hitting rate limits.

- [ ] **Step 1: Create `resend.audience.service.js`**

Create `backend/src/services/resend.audience.service.js`:

```js
'use strict';
// resend.audience.service.js
// Manages Resend Audiences/Contacts in sync with our newsletter_subscribers table.
// The PostgreSQL table is the SOURCE OF TRUTH. Resend is the delivery layer.

const { Resend } = require('resend');
const { logger } = require('../config/logger');
const { query }  = require('../config/db');

let resend = null;
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

function getClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

/**
 * Add a single contact to the Resend audience.
 * Called when a new subscriber joins the newsletter.
 * Silently skips if RESEND_AUDIENCE_ID is not configured.
 *
 * @param {string} email
 * @param {string} [name]
 */
async function addContact(email, name = '') {
  const client = getClient();
  if (!client || !AUDIENCE_ID) {
    logger.info('Resend Audience not configured — skipping addContact', { email });
    return;
  }

  try {
    const [firstName, ...rest] = (name || '').trim().split(' ');
    await client.contacts.create({
      audienceId:  AUDIENCE_ID,
      email:       email.toLowerCase(),
      firstName:   firstName || '',
      lastName:    rest.join(' ') || '',
      unsubscribed: false,
    });
    logger.info('Added contact to Resend Audience', { email });
  } catch (err) {
    // 422 = already exists — treat as success
    if (err?.statusCode === 422 || err?.message?.includes('already exists')) {
      logger.info('Contact already in Resend Audience', { email });
      return;
    }
    logger.warn('Failed to add contact to Resend Audience', { email, error: err.message });
    // Do not throw — Resend sync failure should never block subscription
  }
}

/**
 * Remove a contact from the Resend audience (on unsubscribe).
 * Uses the contact's email to find and delete them.
 *
 * @param {string} email
 */
async function removeContact(email) {
  const client = getClient();
  if (!client || !AUDIENCE_ID) return;

  try {
    // First find the contact by email to get their ID
    const contacts = await client.contacts.list({ audienceId: AUDIENCE_ID });
    const contact  = contacts?.data?.find(c => c.email === email.toLowerCase());

    if (!contact) {
      logger.info('Contact not found in Resend Audience (already removed)', { email });
      return;
    }

    await client.contacts.remove({ audienceId: AUDIENCE_ID, id: contact.id });
    logger.info('Removed contact from Resend Audience', { email });
  } catch (err) {
    logger.warn('Failed to remove contact from Resend Audience', { email, error: err.message });
    // Do not throw — unsubscribe in DB is the source of truth
  }
}

/**
 * Send a batch campaign using the Resend Batch API.
 * Sends up to 100 emails per API call. Much faster than individual sends.
 *
 * @param {Array<{email: string, name: string}>} subscribers
 * @param {string} subject
 * @param {Function} htmlBuilder - function(email) => html string
 * @param {string} from - FROM address
 * @returns {{ sent: number, failed: number, failedEmails: Array }}
 */
async function sendBatchCampaign(subscribers, subject, htmlBuilder, from) {
  const client = getClient();
  if (!client) throw new Error('Resend client not initialised — check RESEND_API_KEY');

  const BATCH_SIZE = 100; // Resend's max per batch call
  let sent   = 0;
  let failed = 0;
  const failedEmails = [];

  // Split into chunks of 100
  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const chunk = subscribers.slice(i, i + BATCH_SIZE);

    const emails = chunk.map(sub => ({
      from,
      to:      sub.email,
      subject,
      html:    htmlBuilder(sub.email, sub.name),
    }));

    try {
      const result = await client.batch.send(emails);

      // result.data is an array of { id, from, to, ... } for each sent email
      if (result?.data) {
        sent += result.data.length;
        // Detect any that weren't in the success array
        const succeededEmails = new Set(result.data.map(r => Array.isArray(r.to) ? r.to[0] : r.to));
        chunk.forEach(sub => {
          if (!succeededEmails.has(sub.email)) {
            failed++;
            failedEmails.push({ email: sub.email, error: 'Not in batch response' });
          }
        });
      } else {
        // Batch call returned no data — count as failed
        failed += chunk.length;
        chunk.forEach(sub => failedEmails.push({ email: sub.email, error: 'Batch returned no data' }));
      }

      logger.info(`Campaign batch sent`, { batch: i / BATCH_SIZE + 1, count: chunk.length });

    } catch (batchErr) {
      // Entire batch failed — fall back to individual sends for this chunk
      logger.warn(`Batch failed, falling back to individual sends for chunk ${i / BATCH_SIZE + 1}`, {
        error: batchErr.message
      });

      for (const sub of chunk) {
        try {
          await client.emails.send({
            from,
            to:      sub.email,
            subject,
            html:    htmlBuilder(sub.email, sub.name),
          });
          sent++;
        } catch (individualErr) {
          failed++;
          failedEmails.push({ email: sub.email, error: individualErr.message });
          logger.warn('Individual fallback email failed', { email: sub.email, error: individualErr.message });
        }
      }
    }
  }

  return { sent, failed, failedEmails };
}

/**
 * Sync all active newsletter subscribers from PostgreSQL to Resend Audience.
 * One-time operation (or run when you want a full sync).
 * Safe to run multiple times — Resend deduplicates contacts.
 *
 * @returns {{ synced: number, failed: number }}
 */
async function syncAllSubscribersToAudience() {
  const client = getClient();
  if (!client || !AUDIENCE_ID) {
    throw new Error('RESEND_AUDIENCE_ID not configured. Set it in .env first.');
  }

  const { rows: subs } = await query(`
    SELECT email, name FROM newsletter_subscribers
    WHERE is_active = true
    ORDER BY subscribed_at ASC
  `);

  logger.info(`Starting full subscriber sync to Resend Audience`, { count: subs.length });

  let synced = 0;
  let failed = 0;

  for (const sub of subs) {
    try {
      await addContact(sub.email, sub.name);
      synced++;
    } catch (err) {
      failed++;
      logger.warn('Sync failed for subscriber', { email: sub.email, error: err.message });
    }
  }

  logger.info(`Subscriber sync complete`, { synced, failed });
  return { synced, failed };
}

module.exports = {
  addContact,
  removeContact,
  sendBatchCampaign,
  syncAllSubscribersToAudience,
};
```

- [ ] **Step 2: Wire addContact into newsletter subscribe route**

In `newsletter.routes.js`, after the successful INSERT/UPDATE:

```js
// Add import at top
const resendAudience = require('../services/resend.audience.service');

// After successful subscription (after the INSERT or UPDATE query):
// Non-blocking — audience sync failure must never block subscription
resendAudience.addContact(normalised, name.trim()).catch(err =>
  logger.warn('Resend Audience sync failed on subscribe', { email: normalised, error: err.message })
);
```

- [ ] **Step 3: Wire removeContact into unsubscribe route**

In `newsletter.routes.js`, after the UPDATE that sets `is_active = false`:

```js
resendAudience.removeContact(email).catch(err =>
  logger.warn('Resend Audience sync failed on unsubscribe', { email, error: err.message })
);
```

- [ ] **Step 4: Switch campaign sending to Batch API**

In `admin.newsletter.routes.js`, replace the campaign loop:

```js
// Add import at top
const resendAudience = require('../../services/resend.audience.service');

// In the /campaign POST handler, replace the loop with:
const EMAIL_FROM_DOMAIN = process.env.EMAIL_FROM && !process.env.EMAIL_FROM.includes('gmail')
  ? process.env.EMAIL_FROM
  : (process.env.EMAIL_FROM_DEV || 'onboarding@resend.dev');
const FROM = `${process.env.EMAIL_FROM_NAME || 'HAIQ Bakery'} <${EMAIL_FROM_DOMAIN}>`;

const { unsubscribeUrl } = require('../../services/email.service'); // expose this

const htmlBuilder = (email, name) => emailService.buildCampaignHtml(body_html, email);

const { sent, failed, failedEmails } = await resendAudience.sendBatchCampaign(
  subs,
  subject,
  htmlBuilder,
  FROM
);
```

This requires exposing `buildCampaignHtml` from `email.service.js`:

```js
// In email.service.js, add this export:
function buildCampaignHtml(bodyHtml, recipientEmail) {
  return baseLayout(`
    ${bodyHtml}
    ${unsubscribeFooter(recipientEmail)}
  `);
}
module.exports = {
  // ... existing exports ...
  buildCampaignHtml,
};
```

- [ ] **Step 5: Add sync endpoint to admin newsletter routes**

In `admin.newsletter.routes.js`, add:

```js
// POST /v1/admin/newsletter/sync-audience — sync all subscribers to Resend Audience
router.post('/sync-audience', requireSuperAdmin, async (req, res, next) => {
  try {
    const result = await resendAudience.syncAllSubscribersToAudience();
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});
```

- [ ] **Step 6: Add "Sync to Resend" button in NewsletterPage.jsx**

In the subscribers tab, add a button next to "Export CSV":

```jsx
const [syncing, setSyncing] = useState(false)
const [syncResult, setSyncResult] = useState(null)

const syncToResend = async () => {
  if (!confirm('Sync all active subscribers to Resend Audience?')) return
  setSyncing(true)
  try {
    const r = await adminApi.post('/admin/newsletter/sync-audience')
    setSyncResult(r.data)
  } catch (err) {
    setSyncResult({ error: err.response?.data?.error || 'Sync failed.' })
  } finally {
    setSyncing(false)
  }
}

// In JSX, near the Export CSV button:
<Button onClick={syncToResend} disabled={syncing} variant="outline" size="sm">
  {syncing ? 'Syncing...' : 'Sync to Resend Audience'}
</Button>
{syncResult && (
  <p className="text-xs mt-1" style={{ color: syncResult.error ? '#E27B7B' : '#6ECA8F' }}>
    {syncResult.error || `Synced ${syncResult.synced} subscribers (${syncResult.failed} failed)`}
  </p>
)}
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/services/resend.audience.service.js \
        backend/src/routes/newsletter.routes.js \
        backend/src/routes/admin/admin.newsletter.routes.js \
        backend/src/services/email.service.js \
        admin/src/pages/NewsletterPage.jsx
git commit -m "feat(newsletter): Resend Audiences sync, batch campaign sending, admin sync button"
```

---

### Task B5: Resend Webhooks for Automatic Bounce Handling

**Files:**
- Create: `backend/src/routes/webhooks/resend.webhook.js`
- Create migration for `newsletter_events` table (append to `012` or create `013`)
- Modify: `backend/src/routes/index.js`
- Modify: `backend/src/app.js`

**Context — why webhooks matter:**
Without webhooks, bounced emails accumulate silently. Every campaign attempt sends to invalid addresses. The sender reputation degrades (ISPs start marking all HAIQ emails as spam). With webhooks, Resend notifies the HAIQ backend in real time every time an email bounces, fails, or gets reported as spam. The system then automatically removes those addresses, keeping the list clean and the sender reputation healthy.

**Webhook signature verification:**
Resend signs every webhook payload with HMAC-SHA256. The signature is in the `svix-signature` header. Without verification, anyone could POST fake events to the endpoint. Verification is mandatory for production.

- [ ] **Step 1: Create migration for newsletter_events table**

Append to current migration or create `013_newsletter_events.sql`:

```sql
-- Track email delivery events from Resend webhooks
CREATE TABLE IF NOT EXISTS newsletter_events (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT        NOT NULL,
  event_type   TEXT        NOT NULL,  -- sent, delivered, bounced, failed, complained, opened
  resend_id    TEXT,                  -- Resend's email ID for cross-referencing
  campaign_id  UUID        REFERENCES newsletter_campaigns(id) ON DELETE SET NULL,
  raw_payload  JSONB,                 -- Full webhook payload for audit
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_events_email      ON newsletter_events(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_events_event_type ON newsletter_events(event_type);
CREATE INDEX IF NOT EXISTS idx_newsletter_events_occurred   ON newsletter_events(occurred_at DESC);
```

- [ ] **Step 2: Create the webhook handler**

Create `backend/src/routes/webhooks/resend.webhook.js`:

```js
'use strict';
// resend.webhook.js
// Handles Resend email event webhooks.
// Automatically unsubscribes bounced/complained contacts.
// Verifies webhook signature to prevent spoofing.

const crypto  = require('crypto');
const router  = require('express').Router();
const { query } = require('../../config/db');
const { logger } = require('../../config/logger');

/**
 * Verify Resend webhook signature.
 * Resend uses Svix for webhook delivery. The signature is in the
 * 'svix-signature' header as a comma-separated list of v1,base64sig pairs.
 *
 * @param {string} rawBody   - Raw request body as string
 * @param {object} headers   - Request headers
 * @returns {boolean}
 */
function verifyResendSignature(rawBody, headers) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    logger.warn('RESEND_WEBHOOK_SECRET not configured — skipping signature verification');
    return true; // Allow through in dev if secret not set
  }

  const msgId        = headers['svix-id'];
  const msgTimestamp = headers['svix-timestamp'];
  const msgSignature = headers['svix-signature'];

  if (!msgId || !msgTimestamp || !msgSignature) {
    logger.warn('Resend webhook missing Svix headers');
    return false;
  }

  // Reject webhooks older than 5 minutes (replay attack prevention)
  const timestampMs = parseInt(msgTimestamp, 10) * 1000;
  if (Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) {
    logger.warn('Resend webhook timestamp too old (possible replay attack)', {
      timestamp: msgTimestamp,
      diff: Math.abs(Date.now() - timestampMs)
    });
    return false;
  }

  // Compute expected signature
  const signedContent = `${msgId}.${msgTimestamp}.${rawBody}`;
  // Resend secrets are base64-encoded — strip the "whsec_" prefix
  const secretBytes   = Buffer.from(secret.replace('whsec_', ''), 'base64');
  const expectedSig   = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  // Compare against all provided signatures (there may be multiple)
  const provided = msgSignature.split(' ').map(s => s.split(',')[1]).filter(Boolean);
  return provided.some(sig => {
    try { return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig)); }
    catch { return false; }
  });
}

// Event types that should trigger automatic unsubscribe
const HARD_UNSUBSCRIBE_EVENTS = new Set(['email.bounced', 'email.complained']);

// Event types that we log but do not act on
const LOG_ONLY_EVENTS = new Set(['email.sent', 'email.delivered', 'email.opened', 'email.clicked']);

/**
 * POST /v1/webhooks/resend
 * Receives email delivery events from Resend.
 */
router.post('/', async (req, res) => {
  // Must use raw body for signature verification
  // This route gets raw body via app.js webhook middleware
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  // Verify signature
  if (!verifyResendSignature(rawBody, req.headers)) {
    logger.warn('Resend webhook signature verification failed');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let payload;
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  const eventType = payload.type;                        // e.g. "email.bounced"
  const email     = payload.data?.to?.[0] || payload.data?.to;
  const resendId  = payload.data?.email_id;

  logger.info('Resend webhook received', { eventType, email, resendId });

  // Always respond 200 first — Resend will retry if we take too long
  res.status(200).json({ received: true });

  // Process asynchronously after responding
  setImmediate(async () => {
    try {
      // Log the event regardless of type
      await query(
        `INSERT INTO newsletter_events (email, event_type, resend_id, raw_payload)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [email?.toLowerCase(), eventType, resendId, JSON.stringify(payload)]
      );

      // Hard unsubscribe for bounces and spam complaints
      if (HARD_UNSUBSCRIBE_EVENTS.has(eventType) && email) {
        const normalised = email.toLowerCase();

        await query(
          `UPDATE newsletter_subscribers
           SET is_active = false, subscribed = false
           WHERE email = $1 AND is_active = true`,
          [normalised]
        );

        logger.info(`Auto-unsubscribed ${normalised} due to ${eventType}`);

        // Also mark user account if email is used for a registered account
        // (soft warning — we do not delete the account, just flag the email)
        await query(
          `UPDATE users SET email_verified = false WHERE email = $1`,
          [normalised]
        );
      }

      if (LOG_ONLY_EVENTS.has(eventType)) {
        logger.info(`Email event logged: ${eventType}`, { email, resendId });
      }

    } catch (processingErr) {
      logger.error('Error processing Resend webhook event', {
        eventType,
        email,
        error: processingErr.message
      });
    }
  });
});

module.exports = router;
```

- [ ] **Step 3: Register the webhook route in `routes/index.js`**

In `backend/src/routes/index.js`, add:

```js
// Resend webhook — raw body needed for signature verification
// Must be registered BEFORE the json body parser in app.js
router.use('/webhooks/resend', require('./webhooks/resend.webhook'));
```

- [ ] **Step 4: Ensure raw body is available for webhook route in `app.js`**

The webhook endpoint needs the raw (unparsed) body to verify the HMAC signature. The `app.js` already has a special case for `/webhook` paths. Update it to also cover `/webhooks/resend`:

```js
// In app.js body parsing section:
app.use((req, res, next) => {
  // Keep raw body for webhook verification endpoints
  if (req.path.includes('/webhook')) {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});
```

This already works because `/webhooks/resend` includes the word `webhook`. No change needed if the existing rule is `/webhook` (substring match).

- [ ] **Step 5: Add webhook events view in admin newsletter page (optional but useful)**

In `admin/src/pages/NewsletterPage.jsx`, add a new tab "Events" showing the most recent delivery events from `newsletter_events` table:

New admin analytics route endpoint:

```js
// In admin.newsletter.routes.js, add:
router.get('/events', requireStaff, async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT email, event_type, occurred_at
      FROM   newsletter_events
      ORDER  BY occurred_at DESC
      LIMIT  100
    `);
    res.json({ success: true, events: rows });
  } catch (err) { next(err); }
});
```

In `NewsletterPage.jsx`, add an "Events" tab to the existing tab UI.

- [ ] **Step 6: Commit**

```bash
git add backend/src/routes/webhooks/ \
        backend/src/routes/index.js \
        backend/src/routes/admin/admin.newsletter.routes.js \
        admin/src/pages/NewsletterPage.jsx
git commit -m "feat(newsletter): Resend webhook handler — auto-unsubscribe bounces and spam complaints"
```

---

### Task B6: Admin Newsletter UI Polish

**Files:**
- Modify: `admin/src/pages/NewsletterPage.jsx`

This task consolidates all the UI improvements into a single polish pass after the infrastructure work (B1–B5) is done.

- [ ] **Step 1: Add campaign delivery stats display** (see B2 above — already specified)

- [ ] **Step 2: Add Sync to Resend Audience button** (see B4 above — already specified)

- [ ] **Step 3: Add bounced subscriber indicator**

In the subscriber list table, add a visual indicator for emails that have bounced:

```jsx
// When rendering subscriber rows, check if email has a bounce event
// Add this alongside the existing subscriber fetch:
const { data: eventsData } = await adminApi.get('/admin/newsletter/events').catch(() => ({ data: {} }))
const bouncedEmails = new Set(
  (eventsData?.events || [])
    .filter(e => e.event_type === 'email.bounced' || e.event_type === 'email.complained')
    .map(e => e.email)
)

// In the subscriber table row:
<td className="py-3 pr-4 text-light text-xs">
  {s.email}
  {bouncedEmails.has(s.email) && (
    <span className="ml-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
      style={{ background: 'rgba(226,123,123,0.15)', color: '#E27B7B', border: '1px solid rgba(226,123,123,0.3)' }}>
      bounced
    </span>
  )}
</td>
```

- [ ] **Step 4: Add HTML preview for campaign body**

Add a live preview iframe next to the body textarea:

```jsx
// Campaign tab — split into two columns on desktop
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label className="...">Email Body (HTML)</label>
    <textarea
      rows={16}
      value={bodyHtml}
      onChange={e => setBodyHtml(e.target.value)}
      style={inputSty}
      placeholder="Paste your HTML email body here..."
      className="w-full rounded"
    />
  </div>
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#8C7355' }}>
      Preview
    </p>
    <div className="rounded border overflow-hidden" style={{ height: 380, border: '1px solid rgba(184,117,42,0.2)' }}>
      {bodyHtml ? (
        <iframe
          srcDoc={bodyHtml}
          title="Email Preview"
          className="w-full h-full"
          style={{ background: '#fff' }}
          sandbox="allow-same-origin"
        />
      ) : (
        <div className="flex items-center justify-center h-full" style={{ color: '#8C7355', fontSize: 12 }}>
          Preview will appear here
        </div>
      )}
    </div>
  </div>
</div>
```

- [ ] **Step 5: Commit**

```bash
git add admin/src/pages/NewsletterPage.jsx
git commit -m "polish(newsletter): campaign delivery stats, bounced indicator, HTML preview pane"
```

---

## Execution Order & Risk Assessment

| # | Task | Files Changed | Time Est. | Risk | Notes |
|---|------|--------------|-----------|------|-------|
| 1 | A1 — Top Customers limit + remove badge | 2 files | 5 min | None | Pure UI/query trim |
| 2 | A2 — Graph hover polish | 1 file | 15 min | None | Visual only, no logic |
| 3 | A3 — Janlin → Drinks migration | 1 new file | 5 min | None | New category, UPDATE |
| 4 | B1 — API key + FROM fix | .env + 1 file | 10 min | None | Non-breaking |
| 5 | B2 — Resilient campaign + tracking | 3 files | 15 min | Low | Additive columns |
| 6 | B3 — MX email validation | 2 new + 2 existing | 20 min | Low | Fail-open on DNS error |
| 7 | B4 — Resend Audiences + batch | 4 files | 30 min | Medium | Needs RESEND_AUDIENCE_ID |
| 8 | B5 — Webhooks | 3 new + 2 existing | 25 min | Medium | Needs RESEND_WEBHOOK_SECRET |
| 9 | B6 — Admin UI polish | 1 file | 20 min | None | Pure UI |

**Total estimated time:** ~2.5 hours
**Tasks with external dependencies:** B4 (Resend Audience ID), B5 (Resend Webhook Secret)

---

## Post-Execution Verification Checklist

### Track A
- [ ] Analytics Top Customers shows exactly 3 rows
- [ ] No `👑 Hidden from customers` badge visible in admin analytics
- [ ] Hovering bars in "Orders by Status" shows only a very subtle wash
- [ ] Tooltips fade in smoothly (~120ms) on all charts
- [ ] Active dots on line charts have no stroke ring
- [ ] Pie chart hover expands segment by 3px with subtle stroke only
- [ ] Janlin product category shows "Drinks" in admin products list
- [ ] Backend migration 012 logged as completed in server startup

### Track B
- [ ] Test campaign sends successfully to a real email address
- [ ] Campaign admin UI shows "X delivered, Y failed" breakdown
- [ ] Registering with `fake@mailinator.com` returns clear error message
- [ ] Registering with `test@thisdoesntexist12345.com` returns domain error
- [ ] Registering with `real@gmail.com` still works normally
- [ ] Newsletter subscription adds contact to Resend Audience (verify in Resend dashboard)
- [ ] Newsletter unsubscribe removes contact from Resend Audience
- [ ] "Sync to Resend Audience" button syncs all active subscribers
- [ ] Webhook endpoint returns 200 to Resend (verify in Resend webhook logs)
- [ ] Simulated bounce event marks subscriber as inactive in DB
- [ ] Bounced subscriber shows "bounced" badge in admin subscriber list

---

## Important Notes

### Resend Free Tier Limits
- Free tier: 3,000 emails/month, 100/day
- Paid tiers start at ~$20/month for 50,000 emails
- Batch API available on all tiers
- Audiences available on all tiers

### DNS Propagation
After verifying your domain in Resend, DNS changes can take 5 minutes to 48 hours to propagate globally. Test from a different network than where you made the changes.

### Webhook Replay
Resend retries failed webhooks up to 5 times over 3 days. The `newsletter_events` INSERT uses `ON CONFLICT DO NOTHING` (on the resend_id) to prevent duplicate processing.

### MX Validation and Ugandan ISPs
Some local ISPs in Uganda have occasionally misconfigured DNS. The 2-second timeout + fail-open strategy means that if a legitimate Ugandan user's domain DNS is slow, they still get through. This is the correct tradeoff — it is better to let one bad email through than to block a real customer.

---

*Document generated: 2026-06-02*
*Author: Claude (Sonnet 4.6)*
*Project: HAIQ Bakery E-Commerce Platform*
