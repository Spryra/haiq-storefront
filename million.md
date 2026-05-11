# HAIQ — Million-Dollar Implementation Master Document
## Version: April 29, 2026 | Prepared for AI-Assisted Implementation

> **Purpose:** This document is the single authoritative reference for completing, hardening, and legally protecting the HAIQ premium cookie e-commerce platform. It contains every discovered issue, every required fix, every legal document that must be created, and every security layer that must be implemented. An AI agent reading this file should be able to execute the full implementation without any other source of context.

> **Repository:** `https://github.com/Junior-Reactive-Solutions/HAIQ_web`
> **Stack:** React/Vite (frontend + admin) on Vercel · Node.js/Express (backend) on Render · PostgreSQL on Neon · Cloudinary · Resend

---

## TABLE OF CONTENTS

1. [Project Context and Current State](#1-project-context-and-current-state)
2. [Critical Bugs to Fix First](#2-critical-bugs-to-fix-first)
3. [Rate Limiting — Complete Implementation](#3-rate-limiting--complete-implementation)
4. [Input Validation and Sanitization — Full Layer](#4-input-validation-and-sanitization--full-layer)
5. [Authentication Architecture — Hardened Custom JWT (No Clerk)](#5-authentication-architecture--hardened-custom-jwt-no-clerk)
6. [Button Consistency Audit and Fix Plan](#6-button-consistency-audit-and-fix-plan)
7. [Privacy Policy — Termly + Custom Implementation](#7-privacy-policy--termly--custom-implementation)
8. [Terms of Use Page — Full Draft](#8-terms-of-use-page--full-draft)
9. [Data and Compliance Page — Full Draft and Implementation](#9-data-and-compliance-page--full-draft-and-implementation)
10. [Legal Pages — Frontend Routes and Components](#10-legal-pages--frontend-routes-and-components)
11. [Remaining Feature Work](#11-remaining-feature-work)
12. [Environment Variables — Complete Reference](#12-environment-variables--complete-reference)
13. [Deployment and Migration Checklist](#13-deployment-and-migration-checklist)

---

## 1. PROJECT CONTEXT AND CURRENT STATE

### What HAIQ Is

HAIQ is a full-stack premium cookie e-commerce platform for a Ugandan bakery based in Muyenga, Kampala. It sells exactly six cookie flavours (Venom, Coconut, Crimson Sin, Campfire After Dark, Blackout, and the "Box Office" build-your-own box of four). The design language is editorial and luxury — Bugatti typographic layout, Last Crumb interaction style. The HAIQ colour palette is: amber `#B8752A` (primary CTA), tan `#D4A574` (hover), cream `#F2EAD8` (light text), espresso `#1A0A00` (dominant dark bg), brown `#3D1A00` (card surfaces), mocha `#8C7355` (subdued/labels), gold `#E8C88A` (premium), sienna `#7A3B1E` (deep accent).

### Live URLs

| Service | URL |
|---|---|
| Customer Frontend | `https://haiqweb.vercel.app` |
| Admin Dashboard | `https://haiq-web-admin.vercel.app` |
| Backend API | `https://haiq-api.onrender.com` |

### Tech Stack Detail

- **Backend:** Node.js + Express, Zod validation, bcryptjs (cost 12), JWT (jsonwebtoken), express-rate-limit, helmet, compression, cookie-parser, cors, winston logger, Neon PostgreSQL (pg), Cloudinary, Resend email, multer for uploads
- **Frontend:** React 18 + Vite, React Router v6, Axios, Tailwind CSS, react-helmet-async, react-hot-toast, clsx, zustand
- **Admin:** Same stack as frontend, separate Vite app

### What Is Fully Working

- Four-status order lifecycle (pending → en_route → delivered | cancelled) with STATUS_TRANSITIONS enforcement in constants (but NOT yet enforced in the updateStatus controller — see Section 2)
- COD auto-payment when order reaches `delivered`
- Cart drawer with Build Your Box box expansion, creative box names, per-cookie breakdown collapsible
- Product catalog with hover cross-fade, add-to-cart checkmark animation, sold-out states
- Full checkout (4 steps: Cart Review → Details → Payment → Review + Submit) for COD, MTN MoMo simulation, Airtel simulation
- Admin: orders list + detail + status update, products CRUD with Cloudinary upload, loyalty card workflow (pending/approve/dispatch/deliver), newsletter management, special days toggle, messages inbox
- JWT dual-token auth (access in memory via `window.__haiq_access_token`, refresh in HTTP-only cookie), auto-refresh interceptor in Axios
- Password reset token flow (code correct, email delivery pending — env var fix only)
- `trust proxy` correctly set in app.js
- ScrollToTop component in App.jsx
- Home link in desktop and mobile navbar
- SEO: react-helmet-async, Open Graph, JSON-LD on key pages
- generalLimiter (100 req/min) on all /v1 routes

---

## 2. CRITICAL BUGS TO FIX FIRST

These must be resolved before any new features are added. They represent broken production functionality or live security gaps.

### BUG-01 — Special Days Three-Layer Schema Conflict (PRODUCTION BROKEN)

**Severity:** Critical. The Build Your Box special-day price switch is broken in production.

**Root cause:** Three components are inconsistent:

1. `backend/src/routes/admin/admin.special_days.routes.js` (the one actually mounted in `admin/routes/index.js`) writes a single `date` column and returns `{ success: true, special_days: rows }`.
2. `admin/src/pages/SpecialDaysPage.jsx` posts `{ date, label, is_active }` and reads `r.data.special_days` — matches the above, so admin UI works with this file.
3. `backend/src/routes/specialdays.routes.js` (public endpoint, used by frontend for pricing) queries `date_from` and `date_to` columns with `CURRENT_DATE` range check. If database has only a `date` column, this throws 500.

**There is also a dead duplicate:** `admin.specialdays.routes.js` (no underscore) uses `date_from`/`date_to` and returns `{ days: rows }`. It is imported nowhere. It is the correct new design but was never connected.

**Resolution — Choose the range schema (recommended):**

**Step A — Database migration (run on Neon console):**
```sql
-- Add range columns if they don't exist
ALTER TABLE special_days ADD COLUMN IF NOT EXISTS date_from DATE;
ALTER TABLE special_days ADD COLUMN IF NOT EXISTS date_to DATE;

-- Migrate any existing single-date rows
UPDATE special_days SET date_from = date, date_to = date WHERE date_from IS NULL AND date IS NOT NULL;

-- Optionally drop old single-date column after verifying migration
-- ALTER TABLE special_days DROP COLUMN IF EXISTS date;
```

**Step B — Replace the mounted admin route file:**
File: `backend/src/routes/admin/admin.special_days.routes.js`

Replace entire file contents with the logic from `admin.specialdays.routes.js` (the dead duplicate). The dead duplicate already has the correct `date_from`/`date_to` logic. After this replace, delete `admin.specialdays.routes.js`.

**Step C — Update SpecialDaysPage.jsx to use date range inputs:**
File: `admin/src/pages/SpecialDaysPage.jsx`

- Replace the single `<input type="date">` with two date inputs: `date_from` and `date_to`
- Change the POST payload from `{ date, label, is_active: true }` to `{ label, date_from, date_to }`
- Change `r.data.special_days` to `r.data.days` in the `load()` function
- Update the table rendering to show `d.date_from` and `d.date_to` instead of `d.date`
- Update the `isToday` and `isPast` logic to check if `CURRENT_DATE` falls within the range

**Step D — Verify the public endpoint still works:** `backend/src/routes/specialdays.routes.js` already queries `date_from`/`date_to` — no changes needed there.

---

### BUG-02 — Status Transition Not Enforced and Not Logged

**Severity:** High. Admin can move an order from `cancelled` back to `en_route`. Order events table exists but is never written to on status change.

**File:** `backend/src/controllers/admin/admin.orders.controller.js` — `updateStatus` function

**Resolution — Replace the `updateStatus` function with:**
```javascript
async function updateStatus(req, res, next) {
  const client = await getClient();
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = Object.values(ORDER_STATUSES);
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status provided' });
    }

    await client.query('BEGIN');

    // Lock the row for update
    const { rows: [order] } = await client.query(
      'SELECT id, status, payment_method FROM orders WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (!order) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Enforce transition rules
    const allowedTransitions = STATUS_TRANSITIONS[order.status] || [];
    if (!allowedTransitions.includes(status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: `Cannot move order from "${order.status}" to "${status}".`,
      });
    }

    // Update order status
    await client.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );

    // COD auto-payment
    if (order.payment_method === 'cash_on_delivery' && status === 'delivered') {
      await client.query(
        'UPDATE orders SET payment_status = $1, updated_at = NOW() WHERE id = $2',
        ['paid', id]
      );
    }

    // Log the event
    await client.query(
      `INSERT INTO order_events (order_id, event_type, old_value, new_value, actor_type, actor_id)
       VALUES ($1, 'status_change', $2, $3, 'admin', $4)`,
      [id, order.status, status, req.admin.id]
    );

    await client.query('COMMIT');

    // Broadcast to SSE clients if function available
    if (typeof broadcastStatusUpdate === 'function') {
      broadcastStatusUpdate(id, status);
    }

    return res.json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    logger.error('updateStatus error:', { error: error.message, orderId: req.params.id });
    return res.status(500).json({ success: false, error: 'Failed to update order status' });
  } finally {
    client.release();
  }
}
```

Also add `const { getClient } = require('../../config/db');` to the imports at the top of the file if not already present.

---

### BUG-03 — Password Reset Email Not Delivered

**Severity:** High. Functional code, broken environment configuration.

**Resolution:** On Render backend, set the following environment variables:
- `EMAIL_FROM=onboarding@resend.dev` (for immediate testing; use verified domain in production)
- `FRONTEND_URL=https://haiqweb.vercel.app`
- `RESEND_API_KEY=<valid key from Resend dashboard>`

Note: There are two implementations of forgot-password in the codebase. `auth.controller.js` uses `guest_token` column. `auth.routes.js` has an inline route using `password_reset_tokens` table. The inline route in `auth.routes.js` is correct (uses dedicated token table with expiry). The controller version is the legacy one. The inline routes (`/forgot-password` and `/reset-password` in `auth.routes.js`) take precedence because they are defined last in the router and Express processes them in order. **Verify which actually fires in production by checking the route order and consolidate to the `password_reset_tokens` implementation.**

---

### BUG-04 — `clean-old-products.sql` References Old Slug

**Severity:** Low. This file is not auto-run, but if executed it would preserve `the-unboxing` rows.

**Resolution:** In `backend/clean-old-products.sql`, replace all occurrences of `'the-unboxing'` with `'box-office'` in the NOT IN clauses.

---

## 3. RATE LIMITING — COMPLETE IMPLEMENTATION

### Current State

The rate limiter infrastructure in `backend/src/middleware/rateLimiter.js` is correctly built with five limiters. The `generalLimiter` is correctly applied to all `/v1` routes. The `authLimiter` is applied to admin login. `orderLimiter` and `paymentLimiter` are applied to their respective routes.

**Three critical gaps:**

1. Customer `POST /auth/login` — NO rate limiter (brute-force vulnerability on live production)
2. Customer `POST /auth/register` — NO rate limiter
3. `POST /auth/forgot-password` — NO rate limiter (email bombing vector)
4. `POST /newsletter/subscribe` — `newsletterLimiter` is defined but never applied

### Fix — auth.routes.js

At the top of `backend/src/routes/auth.routes.js`, add:
```javascript
const { authLimiter } = require('../middleware/rateLimiter');
```

Then on the route definitions, change:
```javascript
// BEFORE
router.post('/register', ctrl.register);
router.post('/login', ctrl.login);

// AFTER
router.post('/register', authLimiter, ctrl.register);
router.post('/login', authLimiter, ctrl.login);
```

And on the inline forgot-password route:
```javascript
// BEFORE
router.post('/forgot-password', async (req, res, next) => {

// AFTER
router.post('/forgot-password', authLimiter, async (req, res, next) => {
```

### Fix — newsletter.routes.js

At the top of `backend/src/routes/newsletter.routes.js`, add:
```javascript
const { newsletterLimiter } = require('../middleware/rateLimiter');
```

Then:
```javascript
// BEFORE
router.post('/subscribe', optionalAuth, async (req, res, next) => {

// AFTER
router.post('/subscribe', newsletterLimiter, optionalAuth, async (req, res, next) => {
```

### Recommended Additional Limiter: Reviews

Add to `rateLimiter.js`:
```javascript
const reviewLimiter = createLimiter(60 * 60 * 1000, 5, 'Too many review submissions. Try again in an hour.');
module.exports = { ..., reviewLimiter };
```

Apply in `reviews.routes.js`:
```javascript
const { reviewLimiter } = require('../middleware/rateLimiter');
router.post('/', reviewLimiter, async (req, res, next) => {
```

---

## 4. INPUT VALIDATION AND SANITIZATION — FULL LAYER

### Philosophy

The existing `validate()` middleware uses Zod and is well-designed. The problem is coverage: most routes do not use it. The secondary problem is that existing Zod schemas do not strip dangerous characters from free-text fields. This section defines the complete fix.

### 4.1 — Install DOMPurify equivalent for Node.js

Zod handles type and structure. For sanitizing free-text that will be displayed in HTML (names, addresses, review comments, gift notes), install a server-side sanitiser:

```bash
npm install sanitize-html
```

Add to `backend/src/utils/sanitize.js` (create this file):
```javascript
'use strict';
const sanitizeHtml = require('sanitize-html');

/**
 * Strip all HTML tags and attributes from a string.
 * Allows no tags at all — plain text output only.
 * Use this on any free-text field that will be rendered in a UI or email.
 */
function stripHtml(value) {
  if (typeof value !== 'string') return value;
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
}

/**
 * Strip script-injectable patterns from a string.
 * More aggressive than stripHtml — removes script patterns even in plain text.
 */
function sanitizeText(value) {
  if (typeof value !== 'string') return value;
  return stripHtml(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '');
}

module.exports = { stripHtml, sanitizeText };
```

### 4.2 — Validation Schemas — Complete Set

Create `backend/src/middleware/schemas.js` (new file):

```javascript
'use strict';
const { z } = require('zod');

// ── Reusable primitives ────────────────────────────────────────────────────────

// Safe text: strips leading/trailing whitespace, rejects HTML tags, limits length
const safeText = (min = 1, max = 500) =>
  z.string()
    .min(min, `Must be at least ${min} character(s)`)
    .max(max, `Must be at most ${max} characters`)
    .transform(v => v.trim())
    .refine(v => !/<[^>]*>/.test(v), { message: 'HTML tags are not allowed' })
    .refine(v => !/javascript:/i.test(v), { message: 'Invalid input' })
    .refine(v => !/on\w+\s*=/i.test(v), { message: 'Invalid input' });

const safeEmail = () =>
  z.string()
    .email('Invalid email address')
    .max(254)
    .transform(v => v.trim().toLowerCase());

const safePhone = () =>
  z.string()
    .regex(/^\+?[0-9\s\-]{7,20}$/, 'Invalid phone number')
    .transform(v => v.trim().replace(/\s+/g, ''));

const safeUUID = () => z.string().uuid('Invalid identifier');

const safeRating = () =>
  z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5');

const safePassword = () =>
  z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password cannot exceed 128 characters')
    .refine(v => /[!@#$%^&*()\-_=+\[\]{}|;:'",.<>?\/\\`~]/.test(v), {
      message: 'Password must include at least one special character',
    });

// ── Auth schemas ───────────────────────────────────────────────────────────────

const registerSchema = z.object({
  full_name: safeText(3, 100)
    .refine(v => v.trim().split(/\s+/).length >= 2, {
      message: 'Please provide your full name — first and last name required',
    }),
  email: safeEmail(),
  phone: safePhone(),
  password: safePassword(),
});

const loginSchema = z.object({
  email: safeEmail(),
  password: z.string().min(1).max(128),
});

const forgotPasswordSchema = z.object({
  email: safeEmail(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(20).max(200),
  new_password: safePassword(),
});

const updateProfileSchema = z.object({
  full_name: safeText(3, 100).optional(),
  first_name: safeText(1, 60).optional(),
  last_name: safeText(1, 60).optional(),
  phone: safePhone().optional(),
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1).max(128),
  new_password: safePassword(),
});

// ── Order schemas ──────────────────────────────────────────────────────────────

const createOrderSchema = z.object({
  first_name: safeText(1, 60),
  last_name: safeText(1, 60),
  email: safeEmail(),
  phone: safePhone(),
  delivery_address: safeText(5, 500),
  delivery_note: safeText(0, 300).optional().nullable(),
  gift_note: safeText(0, 300).optional().nullable(),
  items: z.array(z.object({
    product_id: safeUUID(),
    variant_id: safeUUID(),
    quantity: z.number().int().min(1).max(50),
  })).min(1).max(20),
  payment_method: z.enum(['mtn_momo', 'airtel', 'cash_on_delivery']),
  consent_given: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms to proceed' }),
  }),
});

const cancelOrderSchema = z.object({
  reason: safeText(5, 500),
});

// ── Review schema ──────────────────────────────────────────────────────────────

const createReviewSchema = z.object({
  name: safeText(2, 80),
  rating: safeRating(),
  comment: safeText(5, 1000),
  tracking_token: z.string().min(10).max(200).optional(),
});

// ── Loyalty schema ─────────────────────────────────────────────────────────────

const loyaltyApplySchema = z.object({
  delivery_address: safeText(5, 500),
  contact_phone: safePhone(),
});

// ── Newsletter schema ──────────────────────────────────────────────────────────

const newsletterSubscribeSchema = z.object({
  email: safeEmail(),
  name: safeText(2, 100),
});

// ── Message schema ─────────────────────────────────────────────────────────────

const createMessageSchema = z.object({
  order_id: safeUUID().optional(),
  body: safeText(1, 2000),
  email: safeEmail().optional(),
  name: safeText(1, 100).optional(),
  subject: safeText(1, 200).optional(),
});

// ── Admin schemas ──────────────────────────────────────────────────────────────

const adminLoginSchema = z.object({
  email: safeEmail(),
  password: z.string().min(1).max(128),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'en_route', 'delivered', 'cancelled']),
});

const adminCreateProductSchema = z.object({
  name: safeText(2, 100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  subtitle: safeText(0, 200).optional().nullable(),
  description: safeText(0, 2000).optional().nullable(),
  tasting_notes: safeText(0, 1000).optional().nullable(),
  base_price: z.number().min(0).max(10_000_000),
  is_featured: z.boolean().optional(),
  is_limited: z.boolean().optional(),
  variants: z.array(z.object({
    label: safeText(1, 100),
    price: z.number().min(0).max(10_000_000),
    stock_qty: z.number().int().min(0),
    is_default: z.boolean().optional(),
  })).optional(),
  items: z.array(safeText(1, 200)).optional(),
});

const specialDayCreateSchema = z.object({
  label: safeText(2, 100),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date_from must be YYYY-MM-DD'),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date_to must be YYYY-MM-DD'),
}).refine(data => new Date(data.date_to) >= new Date(data.date_from), {
  message: 'date_to must be on or after date_from',
});

const adminMessageReplySchema = z.object({
  body: safeText(1, 2000),
});

const adminReviewActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'delete']),
});

module.exports = {
  registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema,
  updateProfileSchema, changePasswordSchema,
  createOrderSchema, cancelOrderSchema,
  createReviewSchema,
  loyaltyApplySchema,
  newsletterSubscribeSchema,
  createMessageSchema,
  adminLoginSchema, updateOrderStatusSchema, adminCreateProductSchema,
  specialDayCreateSchema, adminMessageReplySchema, adminReviewActionSchema,
};
```

### 4.3 — Apply Schemas to All Routes

**auth.routes.js** — add at top:
```javascript
const { validate } = require('../middleware/validate');
const {
  registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema,
  updateProfileSchema, changePasswordSchema,
} = require('../middleware/schemas');
```
Then:
```javascript
router.post('/register', authLimiter, validate(registerSchema), ctrl.register);
router.post('/login', authLimiter, validate(loginSchema), ctrl.login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), async ...);
router.post('/reset-password', validate(resetPasswordSchema), async ...);
router.put('/profile', requireAuth, validate(updateProfileSchema), ctrl.updateProfile);
router.put('/password', requireAuth, validate(changePasswordSchema), ctrl.changePassword);
```

**orders.routes.js** — replace `createOrderSchema` import with the one from schemas.js, and add:
```javascript
const { cancelOrderSchema } = require('../middleware/schemas');
// On cancel route:
router.post('/:id/cancel', requireAuth, validate(cancelOrderSchema), async ...);
```

**reviews.routes.js** — add:
```javascript
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { createReviewSchema, reviewLimiter } = require('../middleware/schemas');
// Wait — reviewLimiter is from rateLimiter.js, not schemas.js. Correct import:
const { reviewLimiter } = require('../middleware/rateLimiter');
router.post('/', reviewLimiter, validate(createReviewSchema), async ...);
```

**newsletter.routes.js** — add:
```javascript
const { validate } = require('../middleware/validate');
const { newsletterSubscribeSchema } = require('../middleware/schemas');
const { newsletterLimiter } = require('../middleware/rateLimiter');
router.post('/subscribe', newsletterLimiter, optionalAuth, validate(newsletterSubscribeSchema), async ...);
```

**loyalty.routes.js** — add:
```javascript
const { validate } = require('../middleware/validate');
const { loyaltyApplySchema } = require('../middleware/schemas');
router.post('/apply', requireAuth, validate(loyaltyApplySchema), async ...);
```

**messages.routes.js** — update the existing schema import to use schemas.js or augment the inline schema with the `safeText` pattern for XSS protection.

**admin.auth.routes.js** — replace inline loginSchema with `adminLoginSchema` from schemas.js.

**admin.orders.routes.js** — add:
```javascript
const { validate } = require('../../middleware/validate');
const { updateOrderStatusSchema } = require('../../middleware/schemas');
// On the status update route:
router.patch('/:id/status', requireStaff, validate(updateOrderStatusSchema), adminOrdersCtrl.updateStatus);
```

**admin.special_days.routes.js** (after BUG-01 fix) — add:
```javascript
const { validate } = require('../../middleware/validate');
const { specialDayCreateSchema } = require('../../middleware/schemas');
router.post('/', requireSuperAdmin, validate(specialDayCreateSchema), async ...);
```

**admin.messages.routes.js** — add:
```javascript
const { validate } = require('../../middleware/validate');
const { adminMessageReplySchema } = require('../../middleware/schemas');
// On the reply route:
router.post('/:id/reply', requireStaff, validate(adminMessageReplySchema), async ...);
```

**admin.products.routes.js** — add:
```javascript
const { validate } = require('../../middleware/validate');
const { adminCreateProductSchema } = require('../../middleware/schemas');
router.post('/', requireSuperAdmin, upload.array('images', 5), validate(adminCreateProductSchema), adminProductsCtrl.create);
router.put('/:id', requireSuperAdmin, upload.array('images', 5), validate(adminCreateProductSchema.partial()), adminProductsCtrl.update);
```

### 4.4 — Frontend Input Validation

The frontend also validates before submission. The RegisterPage already has a `validate()` function. It needs to be extended to match the backend rules. Apply the following pattern consistently across all form pages:

**Pattern for all text inputs:**
```javascript
// Reject HTML/script content on the client side
const containsHtml = (value) => /<[^>]*>/.test(value) || /javascript:/i.test(value);

// In validate() function of any form:
if (containsHtml(form.fieldName)) {
  return 'This field contains invalid characters.';
}
```

**Apply to:** RegisterPage, LoginPage, CheckoutPage (all text fields), ContactPage, AccountPage (profile update, password change), BuildYourBoxPage (gift note if any), TrackOrderPage (cancellation reason), ProductDetailPage (review form).

### 4.5 — File Upload Security (Admin Products)

The admin product image upload uses Cloudinary via multer. The following restrictions must be enforced:

In `backend/src/config/cloudinary.js` or the multer configuration:
```javascript
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// Also set file size limit:
const upload = multer({
  storage: cloudinaryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});
```

Cloudinary itself transforms and re-encodes uploaded images, which provides an additional layer of protection against malicious file content disguised as images.

---

## 5. AUTHENTICATION ARCHITECTURE — HARDENED CUSTOM JWT (NO CLERK)

### Decision: Do Not Use Clerk — Use the Existing Custom JWT System

**Rationale:** Clerk's current free tier offers 50,000 monthly retained users, which is generous. However, migrating to Clerk would require:
1. Replacing the entire custom auth flow (login/register/JWT/refresh/password reset) with Clerk's hosted UI or embedded components
2. Removing the existing `users` table auth columns and deferring user identity to Clerk's platform
3. Mapping Clerk user IDs to the existing orders, loyalty, messages, and reviews foreign keys
4. Adding the Clerk React SDK to the frontend and replacing `AuthContext.jsx` entirely

This migration would take 2-3 days, would introduce a third-party dependency for a core function, and would cause existing user sessions and passwords to be invalidated. The current custom JWT system is already well-designed. The correct approach is to harden what exists, not replace it.

**The existing system already implements:**
- bcrypt password hashing at cost factor 12 (correct and strong)
- Access tokens in memory only (never localStorage) — resistant to XSS token theft
- Refresh tokens in HTTP-only cookies with `secure: true`, `sameSite: 'none'` — resistant to JavaScript access
- 15-minute access token expiry with auto-refresh interceptor
- 7-day refresh token expiry
- JWT `jti` claim for access token revocation on logout (stored in `revoked_tokens` table)
- Admin auth on a completely separate middleware stack

### Required Hardening (What the Existing System Is Missing)

**H-01 — Refresh token rotation:** Currently the same refresh token is reused for 7 days. It should be rotated on every use.

In `auth.controller.js`, in the `refresh` function, after verifying the old token, issue a new refresh token and set it in the cookie:
```javascript
async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ success: false, error: 'No refresh token' });

    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const { rows: [user] } = await query('SELECT id, email FROM users WHERE id = $1', [payload.sub]);
    if (!user) return res.status(401).json({ success: false, error: 'User not found' });

    // Issue new tokens (rotation)
    const access_token = signAccessToken(user.id, user.email);
    const new_refresh_token = signRefreshToken(user.id);

    // Set new refresh cookie
    res.cookie('refresh_token', new_refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, access_token });
  } catch {
    return res.status(401).json({ success: false, error: 'Refresh token invalid or expired' });
  }
}
```

**H-02 — Check revoked tokens on protected routes:**
In `backend/src/middleware/auth.js`, in the `requireAuth` middleware, after verifying the JWT, check the `revoked_tokens` table:

```javascript
// Add after jwt.verify():
const { rows: [revoked] } = await query(
  'SELECT jti FROM revoked_tokens WHERE jti = $1',
  [payload.jti]
);
if (revoked) {
  return res.status(401).json({ success: false, code: 'TOKEN_REVOKED', error: 'Token has been revoked' });
}
```

This ensures that when a user logs out and their `jti` is added to `revoked_tokens`, subsequent requests with the old access token are rejected even within the 15-minute window.

**H-03 — Add token expiry cleanup job:**
The `revoked_tokens` table will grow indefinitely. Add a cleanup in the server startup or as a scheduled task:

In `backend/src/server.js`, after the server starts:
```javascript
// Clean up expired revoked tokens every hour
setInterval(async () => {
  try {
    await query('DELETE FROM revoked_tokens WHERE expires_at < NOW()');
  } catch (err) {
    logger.error('Revoked token cleanup failed', { error: err.message });
  }
}, 60 * 60 * 1000);
```

**H-04 — Password complexity enforcement in the backend:**
The `auth.controller.js` register function does not validate password complexity — it only hashes whatever is sent. The validation is only on the frontend. Backend must also enforce:

In `auth.controller.js` register function, before hashing:
```javascript
if (!password || password.length < 6) {
  return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
}
if (!/[!@#$%^&*()\-_=+\[\]{}|;:'",.<>?\/\\`~]/.test(password)) {
  return res.status(400).json({ success: false, error: 'Password must include at least one special character.' });
}
```

Note: This is NOW redundant if `registerSchema` (from Section 4) is applied to the route first using Zod. The Zod validation fires before the controller. Keep the controller check as a defence-in-depth fallback.

**H-05 — HTTPS enforcement header:**
In `app.js`, after the helmet call, add:
```javascript
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});
```

**H-06 — Admin password strength:**
The `reset-admin-password.js` script creates the admin with `HAIQAdmin2024!`. Before going live with real operations, change the admin password to a 20+ character random string and store it securely. The admin dashboard should enforce password changes on first login. Add a `password_changed_at` column to `admin_users` and redirect to a change-password page if `password_changed_at` is null.

### Summary of Authentication Token Security

| Token | Storage | Expiry | Rotation | Revocable |
|---|---|---|---|---|
| Access token | `window.__haiq_access_token` (memory only) | 15 minutes | On every refresh (H-01) | Yes — `revoked_tokens` table (H-02) |
| Refresh token | HTTP-only cookie, Secure, SameSite=None | 7 days | On every use (H-01) | Cleared on logout |
| Admin JWT | Same pattern | 1 hour (verify in admin auth) | No rotation currently | No revocation table — add one |
| Password reset token | `password_reset_tokens` DB table | 1 hour | Single-use (`used = true`) | Yes — `used` flag |

---

## 6. BUTTON CONSISTENCY AUDIT AND FIX PLAN

### Current State

The shared `Button.jsx` component exists but is used only for `AddToCartButton` and the Cart Drawer checkout CTA. Every other interactive button across the frontend (approximately 35 raw `<button>` elements) and every button in the admin dashboard uses raw `<button>` tags with inline Tailwind classes and/or inline `style` props.

### Required Fix: Extend Button.jsx

Replace `frontend/src/components/shared/Button.jsx` with:

```jsx
import clsx from 'clsx';
import { Link } from 'react-router-dom';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  as = 'button',
  to,
  loading = false,
  ...props
}) {
  const isFullWidth = className?.includes('w-full');

  const base = clsx(
    isFullWidth ? 'flex' : 'inline-flex',
    'items-center justify-center font-bold uppercase tracking-wide transition-all duration-200',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    loading && 'cursor-wait'
  );

  const sizes = {
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-6 py-3 text-[11px]',
    lg: 'px-8 py-4 text-[11px]',
  };

  const variants = {
    primary: 'bg-primary text-dark hover:bg-secondary active:scale-[0.98]',
    secondary: 'border border-primary text-primary hover:bg-primary/10 active:scale-[0.98]',
    ghost: 'text-primary hover:underline',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]',
    muted: 'border border-mocha/40 text-mocha hover:border-primary hover:text-primary',
  };

  const mergedClass = clsx(base, sizes[size], variants[variant], className);

  if (as === 'link' && to) {
    return (
      <Link to={to} className={mergedClass} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={mergedClass} {...props}>
      {loading ? <span className="opacity-70">Loading…</span> : children}
    </button>
  );
}
```

**Add to Tailwind config** (`frontend/tailwind.config.js`) if not already present:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#B8752A',
      secondary: '#D4A574',
      dark: '#1A0A00',
      light: '#F2EAD8',
      mocha: '#8C7355',
      gold: '#E8C88A',
    }
  }
}
```

### Files Requiring Button Migration

**Priority 1 — Customer-facing CTAs (highest visibility):**

- `CheckoutPage.jsx` — All 5 navigation buttons (Back, Continue to Details, Continue to Payment, Review Order, Place Order) should use `<Button>` with `variant="primary"` or `variant="secondary"` for Back buttons
- `BuildYourBoxPage.jsx` — The two `handleAddToCart` buttons should use `<Button variant="primary">`
- `AccountPage.jsx` — Save Profile, Change Password, Apply for Loyalty Card, and Cancel should use `<Button>`
- `PasswordResetPages.jsx` — Submit buttons on both forms should use `<Button variant="primary" loading={loading}`
- `RegisterPage.jsx` and `LoginPage.jsx` — Submit buttons should use `<Button variant="primary" loading={loading}`

**Priority 2 — Product interaction:**
- `ProductCard.jsx` — The add-to-cart button should use `<Button>` rather than a raw `<button>` with ad hoc `rounded-xl` (which violates the squared-off CTA principle). Use `className="w-full"` and variant `"primary"`.
- `TrackOrderPage.jsx` — Cancel Order button should use `<Button variant="danger">`

**Keep as raw `<button>` (appropriate exceptions):**
- Close (✕) buttons on drawers and modals
- Quantity increment/decrement (+/−) controls
- Tab navigation selectors
- Cart item remove buttons
- Image thumbnail selectors in carousels

These are icon-only or micro-interaction controls where the uppercase tracking typography of the shared component would be inappropriate.

### Admin Dashboard Button Standardization

The admin has no shared Button component. Create `admin/src/components/shared/Button.jsx` with the same implementation as above. Then:

**LoyaltyPage.jsx — Most Critical:**
Replace the three action buttons (Review/Mark Dispatched/Mark Delivered) which currently use out-of-palette colours (`#60a5fa` blue and `#4ade80` green). Replace with:
- Review: `<Button size="sm" variant="secondary">Review</Button>`
- Mark Dispatched: `<Button size="sm" variant="primary">Mark Dispatched</Button>`
- Mark Delivered: `<Button size="sm" style={{ background: '#E8C88A', color: '#1A0A00' }}>Mark Delivered</Button>` (or create a `"gold"` variant)

**OrdersPage.jsx, ProductsPage.jsx, SpecialDaysPage.jsx, NewsletterPage.jsx:**
Replace all `<button onClick={...} style={{ background: '#B8752A', color: '#1A0A00' }}>` patterns with `<Button variant="primary">`.

---

## 7. PRIVACY POLICY — TERMLY + CUSTOM IMPLEMENTATION

### What Termly Is and Why It Is Recommended

<termly_rationale>
Termly is the leading free privacy policy generator for e-commerce websites. Its free tier generates a GDPR-compliant, CCPA-compliant policy covering 30 different data privacy laws globally, hosts it at a permanent URL, and auto-updates it when laws change. For HAIQ, which collects customer names, email addresses, phone numbers, delivery addresses, order history, payment method choices (not card details), and newsletter consent in Uganda, Termly's e-commerce template is the fastest path to a legally sound policy.

The primary applicable law for HAIQ is Uganda's **Data Protection and Privacy Act, 2019 (DPPA)**, which commenced 1 March 2019. The DPPA is structurally similar to the GDPR and imposes obligations on any entity collecting, processing, holding, or using personal data within Uganda, as well as any entity outside Uganda collecting data on Ugandan citizens. The DPPA is administered by the Personal Data Protection Office (PDPO), an independent office under NITA-Uganda, operationalised August 2021.
</termly_rationale>

### Step-by-Step: Generate the Policy via Termly

1. Go to `https://termly.io/products/privacy-policy-generator/`
2. Select **E-commerce** as the website type
3. Enter the following business details:
   - Business name: **HAIQ**
   - Website URL: `https://haiqweb.vercel.app`
   - Country: **Uganda**
   - Business address: **Muyenga, Kampala, Uganda**
   - Contact email: `haiqafrica@gmail.com`
4. Select the following data collected:
   - Full name
   - Email address
   - Phone number
   - Delivery/shipping address
   - Order history and transaction data
   - IP address (collected automatically)
   - Cookies and session data
5. Select the following purposes:
   - Processing orders and payments
   - Delivering products
   - Customer account management
   - Sending order confirmations and updates (transactional email via Resend)
   - Newsletter and marketing communications (with consent)
   - Analytics and platform improvement
6. Third-party services to disclose:
   - **Neon (PostgreSQL)** — database hosting, EU/US region
   - **Cloudinary** — image storage and delivery
   - **Resend** — transactional and newsletter email
   - **Vercel** — frontend hosting (logs IP addresses)
   - **Render** — backend API hosting (logs IP addresses)
7. Enable GDPR section (select EU as one of the regions even though HAIQ is Ugandan — this ensures GDPR-equivalent disclosures which also satisfy the DPPA)
8. Generate and host the policy on Termly. Copy the hosted URL (e.g. `https://app.termly.io/document/privacy-policy/[your-id]`)

### Custom Privacy Policy Supplement (DPPA-Specific Additions)

The Termly-generated policy should be supplemented with the following additions specific to Uganda law. Add these as custom sections in the Termly editor:

```
SECTION: YOUR RIGHTS UNDER UGANDAN LAW

Under Uganda's Data Protection and Privacy Act 2019, you have the right to:
- Know whether we hold personal data about you
- Access any personal data we hold about you
- Request correction of inaccurate personal data
- Object to processing of your personal data
- Request deletion of personal data (subject to our legal obligations)
- Lodge a complaint with the Personal Data Protection Office (PDPO) at NITA-Uganda

To exercise any of these rights, contact us at haiqafrica@gmail.com. We will respond within 14 days.

SECTION: DATA STORAGE LOCATION

Your personal data is stored on servers located in the United States (Neon database, Vercel, Render). We have ensured that our service providers maintain adequate data protection standards equivalent to those required under the DPPA. By using our platform, you consent to this transfer.

SECTION: DATA RETENTION

We retain your personal data for as long as your account is active or as needed to fulfil orders, comply with legal obligations, and resolve disputes. Inactive accounts with no order history for 3 years may have their personal data anonymised. Order records are retained for 7 years for accounting purposes.

SECTION: MINORS

HAIQ's platform is not directed at persons under 18 years of age. We do not knowingly collect personal data from minors. If you believe a minor has submitted personal data to us, contact us immediately.
```

### Code Implementation: Privacy Policy Route

Add to `frontend/src/App.jsx`:
```jsx
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
// ...
<Route path="/privacy-policy" element={withLayout(PrivacyPolicyPage)} />
```

Create `frontend/src/pages/PrivacyPolicyPage.jsx`:
```jsx
import SEO from '../components/shared/SEO';

export default function PrivacyPolicyPage() {
  return (
    <>
      <SEO title="Privacy Policy | HAIQ" description="How HAIQ collects, uses, and protects your personal data." />
      <div style={{ background: '#1A0A00', minHeight: '80vh' }} className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-2" style={{ color: '#B8752A' }}>
            Legal
          </p>
          <h1 className="font-serif font-bold text-4xl mb-2" style={{ color: '#F2EAD8' }}>Privacy Policy</h1>
          <div className="w-8 h-px mb-8" style={{ background: '#B8752A' }} />
          <p className="text-sm mb-8" style={{ color: '#8C7355' }}>
            Last updated: {new Date().toLocaleDateString('en-UG', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          {/* Termly hosted policy embed */}
          <div
            name="termly-embed"
            data-id="YOUR_TERMLY_POLICY_ID"
            data-type="iframe"
            style={{ color: '#F2EAD8' }}
          />
          <script type="text/javascript">
            {`(function(d, s, id) {
              var js, tjs = d.getElementsByTagName(s)[0];
              if (d.getElementById(id)) return;
              js = d.createElement(s); js.id = id;
              js.src = "https://app.termly.io/embed-policy.min.js";
              tjs.parentNode.insertBefore(js, tjs);
            }(document, 'script', 'termly-jssdk'));`}
          </script>
          <p className="text-sm mt-12" style={{ color: '#8C7355' }}>
            Questions about this policy? Email us at{' '}
            <a href="mailto:haiqafrica@gmail.com" style={{ color: '#B8752A' }}>haiqafrica@gmail.com</a>
          </p>
        </div>
      </div>
    </>
  );
}
```

**Replace `YOUR_TERMLY_POLICY_ID` with the actual ID from the Termly hosted policy URL.**

Also add Privacy Policy link to `frontend/src/components/layout/Footer.jsx`:
```jsx
<Link to="/privacy-policy" className="text-xs hover:opacity-70 transition" style={{ color: '#8C7355' }}>
  Privacy Policy
</Link>
```

---

## 8. TERMS OF USE PAGE — FULL DRAFT

### Instructions for AI Executing This Section

Create `frontend/src/pages/TermsOfUsePage.jsx` with the following content rendered inside the HAIQ design system (dark `#1A0A00` background, cream `#F2EAD8` text, amber `#B8752A` headings/accent). Register the route at `/terms` in `App.jsx`.

### Full Terms of Use Draft

```
HAIQ — TERMS OF USE

Effective Date: [DATE OF FIRST PUBLICATION]
Last Updated: [DATE]

IMPORTANT: PLEASE READ THESE TERMS CAREFULLY BEFORE USING THE HAIQ PLATFORM.
BY ACCESSING OR USING OUR WEBSITE AT haiqweb.vercel.app, PLACING AN ORDER,
OR CREATING AN ACCOUNT, YOU AGREE TO BE BOUND BY THESE TERMS.

---

1. WHO WE ARE

HAIQ is a premium handcrafted cookie brand operated from Muyenga, Kampala, Uganda.
We sell cookies and cookie boxes online for delivery within our service areas.
Contact us at haiqafrica@gmail.com for any queries.

---

2. ACCEPTANCE OF TERMS

By using this website or placing an order, you confirm that:
(a) you are at least 18 years of age, or have the consent of a parent or guardian;
(b) you have read and agree to these Terms of Use;
(c) you have read and agree to our Privacy Policy, available at /privacy-policy;
(d) you have the legal capacity to enter into a binding contract under Ugandan law.

If you do not agree with any part of these terms, do not use our platform.

---

3. PRODUCTS AND PRICING

3.1 HAIQ sells handcrafted cookies only. All cookies are made in small batches.
Product descriptions, ingredients, and images are for guidance only. Minor
variations in appearance may occur between batches.

3.2 Prices are quoted in Ugandan Shillings (UGX) inclusive of any applicable
taxes. Prices are subject to change without notice.

3.3 The "Box Office" (Build Your Box) price varies based on whether the purchase
date is designated as a special day by HAIQ. The applicable price is displayed
at checkout and confirmed in your order confirmation. This variation is not a
discount — it is the standard price for that day type.

3.4 We reserve the right to limit quantities, decline orders, and discontinue
products without prior notice.

---

4. ORDERS AND CONTRACT FORMATION

4.1 Placing an order constitutes an offer to purchase. No binding contract is
formed until we send you an order confirmation email.

4.2 We reserve the right to refuse or cancel any order at our discretion,
including where: (a) a product is out of stock; (b) there is an error in pricing
or description; (c) payment cannot be verified; or (d) we suspect fraudulent
activity.

4.3 If we cancel your order after payment, we will issue a full refund via the
original payment method within 5 business days.

---

5. DELIVERY

5.1 We currently deliver within Kampala and selected surrounding areas. Delivery
zones and fees are displayed at checkout.

5.2 Estimated delivery times are provided for guidance only. We are not liable
for delays caused by circumstances outside our control, including weather, traffic,
or third-party courier issues.

5.3 You are responsible for providing a correct and accessible delivery address.
We are not liable for non-delivery caused by incorrect address information.

5.4 Risk in the products passes to you upon delivery to the address you provided.

---

6. PAYMENT

6.1 We accept Cash on Delivery (COD), MTN Mobile Money, Airtel Money, and Bank
Transfer. Payment instructions are provided at checkout.

6.2 For COD orders, payment is due in full upon delivery. If payment is refused
at delivery without valid cause, we may suspend your account.

6.3 We do not store credit card or mobile money PIN information. Payment
processing is handled through third-party providers. See our Privacy Policy
for details.

6.4 All prices are in UGX. We do not accept foreign currency.

---

7. CANCELLATIONS AND REFUNDS

7.1 You may cancel an order through your account or by contacting us before
the order status changes to "En Route." Once an order is dispatched, cancellation
is not available.

7.2 If your order is cancelled before dispatch, any payment made will be refunded
within 5 business days.

7.3 If you receive a product that is damaged, incorrect, or of significantly
inferior quality, contact us at haiqafrica@gmail.com within 24 hours of delivery
with photographic evidence. We will assess the claim and, at our discretion,
offer a replacement or refund.

7.4 We do not accept returns of food products for reasons other than damage or
quality failure, in accordance with applicable food safety regulations.

7.5 Refunds are processed via the original payment method or by agreement with
the customer. We aim to process refunds within 5 business days of approving
a claim.

---

8. ACCOUNTS

8.1 Creating an account is optional but required for order tracking, the loyalty
programme, and direct messaging.

8.2 You are responsible for maintaining the confidentiality of your login
credentials and for all activity on your account.

8.3 You must provide accurate and complete information when creating your account.
You may update your information at any time in your account settings.

8.4 We may suspend or terminate your account if we reasonably suspect fraudulent
activity, abuse of the platform, or violation of these Terms.

---

9. LOYALTY PROGRAMME

9.1 The HAIQ loyalty programme is offered at our discretion and may be modified
or discontinued at any time without notice.

9.2 Loyalty card applications are reviewed and approved or rejected by HAIQ at
our sole discretion.

9.3 Loyalty benefits have no monetary value and cannot be redeemed for cash.
They are not transferable.

---

10. INTELLECTUAL PROPERTY

10.1 All content on this platform — including the HAIQ brand name, logo, crown
mark, product names, photographs, copy, and code — is the intellectual property
of HAIQ and is protected under applicable Ugandan and international intellectual
property law.

10.2 You may not copy, reproduce, distribute, or create derivative works from
any content on this platform without our express written permission.

10.3 You may share links to our platform and use our content for personal,
non-commercial reference purposes.

---

11. PROHIBITED CONDUCT

You must not:
(a) use the platform for any unlawful purpose;
(b) submit false, fraudulent, or misleading information;
(c) impersonate any person or entity;
(d) attempt to gain unauthorised access to any part of the platform or our systems;
(e) use automated tools to scrape, crawl, or mass-download content;
(f) submit content (reviews, messages) that is defamatory, obscene, threatening,
or infringes third-party rights;
(g) engage in any activity that disrupts or impairs the normal operation of
the platform.

We reserve the right to take action against prohibited conduct, including
suspending accounts and reporting to law enforcement.

---

12. PRODUCT REVIEWS

12.1 By submitting a review, you grant HAIQ a non-exclusive, royalty-free,
perpetual licence to display your review on our platform and in marketing
materials.

12.2 Reviews must be honest, relevant, and based on your actual experience with
the product. We reserve the right to reject or remove reviews that violate
these requirements or our community standards.

12.3 We do not endorse or take responsibility for the content of approved reviews,
which represent the opinions of individual customers.

---

13. DISCLAIMER OF WARRANTIES

13.1 The platform and all products are provided "as is." To the maximum extent
permitted by law, HAIQ makes no warranties, express or implied, including
warranties of merchantability, fitness for a particular purpose, or
non-infringement.

13.2 We do not warrant that the platform will be uninterrupted, error-free, or
free from viruses or other harmful components.

---

14. LIMITATION OF LIABILITY

14.1 To the maximum extent permitted by applicable Ugandan law, HAIQ's total
liability to you for any claim arising out of or in connection with your use
of the platform or your purchase of products shall not exceed the amount paid
by you for the specific order that gave rise to the claim.

14.2 We are not liable for: (a) indirect, consequential, special, or incidental
loss or damage; (b) loss of data, profits, or business opportunity; (c) loss or
damage caused by events outside our reasonable control (force majeure), including
electricity outages, network failures, natural disasters, civil unrest, or
pandemics.

14.3 Nothing in these Terms limits liability for death or personal injury caused
by our negligence, or for fraud or fraudulent misrepresentation.

---

15. FOOD SAFETY AND ALLERGENS

15.1 Our cookies are produced in a kitchen that handles the following allergens:
wheat (gluten), dairy (milk), eggs, and nuts. Cross-contamination is possible.

15.2 Full ingredient information for each product is available on the product
detail page. You are responsible for ensuring that any product you order is
suitable for your dietary requirements and those of any person you purchase
for.

15.3 HAIQ is not liable for any allergic reaction or adverse health event
arising from consumption of our products where full allergen information
was made available and you proceeded to purchase.

---

16. GOVERNING LAW AND DISPUTE RESOLUTION

16.1 These Terms are governed by and construed in accordance with the laws of
Uganda, including the Sale of Goods Act (Cap. 82), the Contract Act (Cap. 73),
and the Consumer Protection Guidelines issued by the Uganda National Bureau
of Standards.

16.2 In the event of a dispute, you agree to first attempt to resolve it by
contacting us at haiqafrica@gmail.com. We will respond within 5 business days.

16.3 If a dispute cannot be resolved amicably within 30 days, it shall be
referred to arbitration in Kampala under the Arbitration Rules of the Centre
for Arbitration and Dispute Resolution (CADER). The language of arbitration
shall be English. The decision of the arbitrator shall be final and binding.

16.4 Nothing in this clause prevents either party from seeking urgent
injunctive or other equitable relief from a court of competent jurisdiction
in Uganda.

---

17. CHANGES TO THESE TERMS

We may update these Terms from time to time. Material changes will be notified
via a notice on the platform or by email where we hold your address. Your
continued use of the platform after the effective date of updated Terms constitutes
acceptance of those changes. If you do not agree, you must stop using the platform.

---

18. SEVERABILITY AND ENTIRE AGREEMENT

If any provision of these Terms is found to be invalid or unenforceable, the
remaining provisions shall continue in full force and effect. These Terms,
together with our Privacy Policy, constitute the entire agreement between you
and HAIQ regarding your use of the platform.

---

19. CONTACT

HAIQ
Muyenga, Kampala, Uganda
Email: haiqafrica@gmail.com
Website: haiqweb.vercel.app
```

### Frontend Component Instructions

Create `frontend/src/pages/TermsOfUsePage.jsx` with the HAIQ design system styling (same structure as PrivacyPolicyPage). Register at `/terms` in `App.jsx`. Add a link in `Footer.jsx` alongside the Privacy Policy link:

```jsx
<Link to="/terms" className="text-xs hover:opacity-70 transition" style={{ color: '#8C7355' }}>
  Terms of Use
</Link>
```

---

## 9. DATA AND COMPLIANCE PAGE — FULL DRAFT AND IMPLEMENTATION

### Purpose

The Data and Compliance page is a combined resource serving three audiences:
1. **Customers** who want to understand their data rights under the DPPA
2. **Regulators** who may inspect the platform for compliance
3. **Business partners and auditors** who need to understand HAIQ's data practices

It is separate from the Privacy Policy (which is the legally required disclosure) and serves as a more readable, practical guide.

### Page Route

`/data-compliance` in `App.jsx`.

### What Must Be Disclosed (Under Uganda DPPA, ss. 11–18)

The DPPA requires that before or at the time of data collection, the data collector must inform the data subject of:
- The name and address of the data collector
- The purpose of the collection
- Whether the supply of data is voluntary or mandatory
- The consequences of non-supply
- Any third parties to whom data may be transferred
- The data subject's rights

### Full Data and Compliance Page Content

```
DATA AND COMPLIANCE

HAIQ is committed to responsible data stewardship in full compliance with
Uganda's Data Protection and Privacy Act, 2019 (DPPA) and its 2021 Regulations,
administered by the Personal Data Protection Office (PDPO) at NITA-Uganda.

---

SECTION 1: DATA WE COLLECT AND WHY

1.1 Account Data
When you create an account, we collect: full name, email address, phone number,
and password (stored in hashed form using industry-standard bcrypt encryption).
Purpose: Account management, authentication, and order attribution.
Lawful basis (DPPA s.15): Performance of a contract (your order).

1.2 Order Data
When you place an order, we collect: first and last name, email address, phone
number, delivery address, delivery notes, gift notes, items ordered, and
payment method chosen (not payment credentials).
Purpose: Order fulfilment, delivery, and customer support.
Lawful basis: Performance of a contract.

1.3 Payment Data
HAIQ does not store credit card numbers, mobile money PINs, or bank account
details. For COD orders, payment is received in cash upon delivery. For mobile
money and bank transfer, we store only the transaction reference number for
reconciliation purposes.
Purpose: Payment verification and financial record-keeping.

1.4 Communications Data
When you contact us or use the in-app messaging feature, we retain the content
of your messages and the associated order information.
Purpose: Customer support and dispute resolution.

1.5 Loyalty Programme Data
If you apply for a loyalty card, we collect: delivery address for card dispatch,
contact phone number, and loyalty card status history.
Purpose: Loyalty programme administration.

1.6 Newsletter Data
If you subscribe to our newsletter, we collect your name and email address.
Purpose: Marketing communications (with your consent).
You may unsubscribe at any time by clicking the unsubscribe link in any email
or by contacting us directly.

1.7 Technical Data
We automatically collect: IP address, browser type, and general location data
via server logs. This data is retained by our hosting providers (Vercel, Render)
for up to 30 days and is used for security monitoring and debugging.
Purpose: Platform security and performance.

1.8 Cookie Data
We use technically necessary session cookies to maintain your login state and
shopping cart. We do not use advertising or tracking cookies. A full cookie
policy is available at /privacy-policy.

---

SECTION 2: HOW LONG WE KEEP YOUR DATA

| Data Type | Retention Period | Reason |
|---|---|---|
| Account data | Until account deletion + 1 year | Dispute resolution |
| Order data | 7 years from order date | Accounting law (Uganda Income Tax Act) |
| Payment references | 7 years | Accounting law |
| Messages | 3 years from last interaction | Customer support |
| Newsletter data | Until unsubscribe + 6 months | Suppression list |
| Technical logs | Up to 30 days | Security monitoring |
| Loyalty card data | Duration of programme participation + 2 years | Programme admin |

---

SECTION 3: WHO WE SHARE YOUR DATA WITH

We do not sell personal data. We share data only with service providers
who process it on our behalf, under contractual obligations to protect it:

| Service Provider | Purpose | Data Shared | Location |
|---|---|---|---|
| Neon (neon.tech) | Database hosting | All platform data | US (East) |
| Vercel (vercel.com) | Frontend hosting | IP addresses, request logs | US/Global |
| Render (render.com) | API hosting | IP addresses, request logs | US |
| Cloudinary (cloudinary.com) | Product image storage | Image files only | US/Global |
| Resend (resend.com) | Transactional email | Name, email address, order details | US |

All providers are subject to contractual data processing agreements and maintain
security standards equivalent to those required under the DPPA.

---

SECTION 4: YOUR RIGHTS

Under the DPPA, you have the right to:

Access: Request a copy of all personal data we hold about you.
Correction: Request that inaccurate data be corrected.
Objection: Object to processing that you believe is unjustified.
Deletion: Request erasure of personal data (subject to our legal obligations).
Complaint: Lodge a complaint with the PDPO at NITA-Uganda.

To exercise any right, email haiqafrica@gmail.com with the subject line
"Data Rights Request." We will respond within 14 working days.

---

SECTION 5: SECURITY MEASURES

We implement the following technical and organisational measures in accordance
with DPPA s.20 (security measures):

Technical:
- All passwords stored using bcrypt with cost factor 12 (one-way hash; we cannot recover your password)
- Authentication tokens stored in secure HTTP-only cookies (not accessible to browser JavaScript)
- All API communications over HTTPS/TLS
- Rate limiting on all API endpoints to prevent automated attacks
- Input validation on all data fields to prevent injection attacks
- Parameterised database queries throughout (SQL injection prevention)
- Access tokens expire after 15 minutes and require automatic refresh

Organisational:
- Admin access is on a separate authentication system
- Superadmin actions (product deletion, special days management) require elevated privilege
- All admin actions are logged
- Backend source code is not publicly accessible

---

SECTION 6: DATA BREACH NOTIFICATION

In the event of a personal data breach, we will:
- Notify affected users by email within 72 hours of becoming aware of the breach
- Notify the PDPO at NITA-Uganda as required by the DPPA
- Take immediate steps to contain the breach and prevent recurrence
- Document the breach and our response

If you believe your account has been compromised, contact us immediately at
haiqafrica@gmail.com or change your password via /forgot-password.

---

SECTION 7: CROSS-BORDER DATA TRANSFERS

HAIQ's data is hosted on servers in the United States. The DPPA (s.19) requires
that data transferred outside Uganda be processed in a country with adequate
data protection measures. By using our platform, you consent to this transfer.
Our US-based providers (Neon, Vercel, Render, Cloudinary, Resend) maintain
security standards consistent with international best practice.

---

SECTION 8: CONTACT AND REGULATORY INFORMATION

Data Controller: HAIQ
Address: Muyenga, Kampala, Uganda
Email: haiqafrica@gmail.com

Regulatory Authority:
Personal Data Protection Office (PDPO)
National Information Technology Authority — Uganda (NITA-Uganda)
Palm Courts, Plot 7A, Rotary Avenue, Kololo, Kampala
Email: info@nita.go.ug | Website: nita.go.ug

---

SECTION 9: UPDATES TO THIS PAGE

This page is reviewed and updated whenever our data practices change.
The current version is always available at haiqweb.vercel.app/data-compliance.
Material changes will be notified by a banner on the platform.
```

### Frontend Component Instructions

Create `frontend/src/pages/DataCompliancePage.jsx` using the HAIQ dark design system. The table elements should use a simple dark-bordered table with cream text and amber header text. Register the route at `/data-compliance` in `App.jsx`. Add a link in the Footer:

```jsx
<Link to="/data-compliance" className="text-xs hover:opacity-70 transition" style={{ color: '#8C7355' }}>
  Data & Compliance
</Link>
```

---

## 10. LEGAL PAGES — FRONTEND ROUTES AND COMPONENTS

### App.jsx Additions

Add the following three import lines and three Route elements:

```jsx
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfUsePage from './pages/TermsOfUsePage';
import DataCompliancePage from './pages/DataCompliancePage';

// Add inside <Routes>:
<Route path="/privacy-policy"   element={withLayout(PrivacyPolicyPage)} />
<Route path="/terms"            element={withLayout(TermsOfUsePage)} />
<Route path="/data-compliance"  element={withLayout(DataCompliancePage)} />
```

### Footer.jsx Additions

In the footer's bottom bar or links section, add:

```jsx
<div className="flex gap-6 flex-wrap">
  <Link to="/privacy-policy" style={{ color: '#8C7355' }} className="text-xs hover:opacity-70 transition">
    Privacy Policy
  </Link>
  <Link to="/terms" style={{ color: '#8C7355' }} className="text-xs hover:opacity-70 transition">
    Terms of Use
  </Link>
  <Link to="/data-compliance" style={{ color: '#8C7355' }} className="text-xs hover:opacity-70 transition">
    Data & Compliance
  </Link>
</div>
```

### SEO for Legal Pages

Each legal page should include an SEO component:
```jsx
// PrivacyPolicyPage
<SEO title="Privacy Policy | HAIQ" description="How HAIQ handles your personal data under Uganda's Data Protection and Privacy Act." />

// TermsOfUsePage
<SEO title="Terms of Use | HAIQ" description="The terms and conditions governing your use of the HAIQ platform." />

// DataCompliancePage
<SEO title="Data & Compliance | HAIQ" description="Our data practices, retention policies, and your rights under Ugandan law." />
```

### Checkout Consent Checkbox Update

The existing `consent_given: true` requirement in the order schema is correct. The checkout page already has a consent checkbox. Update the label text to:

```jsx
<label>
  I agree to HAIQ's{' '}
  <a href="/terms" target="_blank" style={{ color: '#B8752A' }}>Terms of Use</a>
  {' '}and{' '}
  <a href="/privacy-policy" target="_blank" style={{ color: '#B8752A' }}>Privacy Policy</a>
  , and I consent to my personal data being processed for order fulfilment.
</label>
```

### Register Page Consent Update

Add below the submit button on the Register page:
```jsx
<p className="text-[10px] text-center mt-3" style={{ color: '#8C7355' }}>
  By creating an account, you agree to our{' '}
  <Link to="/terms" style={{ color: '#B8752A' }}>Terms of Use</Link>
  {' '}and{' '}
  <Link to="/privacy-policy" style={{ color: '#B8752A' }}>Privacy Policy</Link>.
</p>
```

---

## 11. REMAINING FEATURE WORK

### Priority 1 — Commercial Blockers

**MTN MoMo Integration:**
- Register at `momodeveloper.mtn.com`
- Create sandbox environment
- Get `MTN_MOMO_API_KEY`, `MTN_MOMO_SUBSCRIPTION_KEY`, `MTN_MOMO_CALLBACK_SECRET`
- Set `MTN_MOMO_CALLBACK_URL=https://haiq-api.onrender.com/v1/payments/webhook/mtn`
- Implement the payment provider abstraction layer described in `final_implementation.md` Phase 2
- Build MTN MoMo adapter: POST to `/collection/v1_0/requesttopay`, poll status, handle webhook
- Test full simulation → live sandbox flow before enabling in production

**Airtel Money Integration:**
- Register at `developers.airtel.africa`
- Get `AIRTEL_API_KEY`, `AIRTEL_MERCHANT_ID`, `AIRTEL_CALLBACK_SECRET`
- Same adapter pattern as MTN MoMo

**Bank Transfer Frontend:**
- Backend endpoint `POST /v1/payments/{ref}/bank-proof` is ready
- Build the upload UI on CheckoutPage (file input, upload progress, confirmation message)

### Priority 2 — Admin Hardening

**Admin Password Change on First Login:**
- Add `password_changed_at TIMESTAMP` column to `admin_users` table via migration
- In `admin.auth.controller.js` login response, include `must_change_password: !admin.password_changed_at`
- In Admin `App.jsx`, redirect to a ChangePasswordPage if `must_change_password` is true

**Admin Audit Log:**
- Already partially in place via `order_events` table
- Extend to log: product changes, special day changes, loyalty card approvals, newsletter sends

### Priority 3 — UX Polish

**Pickup Option at Checkout:**
- Add `pickup` as a delivery type option in CheckoutPage
- Backend: add `delivery_type` enum column to orders table (migration required)
- Admin: show pickup orders distinctly in the orders list

**Closure Banner:**
- Add `is_closed BOOLEAN DEFAULT false` to a new `platform_settings` table
- Admin: add a toggle on SpecialDaysPage or DashboardPage
- Frontend: on app load, check settings endpoint; if closed, show a dismissable banner and disable add-to-cart / checkout

**Variant Sold-Out Display:**
- ProductCard currently shows sold-out at product level
- Show per-variant sold-out state in VariantPickerModal before modal opens

### Priority 4 — Infrastructure

**GitHub Actions CI:**
The `.github/workflows/ci.yml` exists but is empty. Add:
```yaml
name: CI
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: cd backend && npm ci
      - run: cd backend && npm test
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
```

---

## 12. ENVIRONMENT VARIABLES — COMPLETE REFERENCE

### Backend (Render)

```env
# Database
DATABASE_URL=postgresql://[user]:[password]@[neon-pool-url]/[dbname]?sslmode=require&channel_binding=require

# JWT
JWT_SECRET=[32+ character random string]
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=[separate 32+ character random string]
REFRESH_TOKEN_EXPIRES_IN=7d
ADMIN_JWT_SECRET=[separate 32+ character random string]

# CORS
CORS_ORIGINS=https://haiqweb.vercel.app,https://haiq-web-admin.vercel.app

# Email (Resend)
RESEND_API_KEY=[from Resend dashboard]
EMAIL_FROM=onboarding@resend.dev     # Use until custom domain verified
FRONTEND_URL=https://haiqweb.vercel.app

# Cloudinary
CLOUDINARY_cloud_name=[cloud_name]
CLOUDINARY_api_key=[from Cloudinary dashboard]
CLOUDINARY_api_secret=[from Cloudinary dashboard]

# Rate limiting (optional overrides)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# MTN MoMo (when ready)
MTN_MOMO_API_KEY=
MTN_MOMO_SUBSCRIPTION_KEY=
MTN_MOMO_CALLBACK_SECRET=
MTN_MOMO_CALLBACK_URL=https://haiq-api.onrender.com/v1/payments/webhook/mtn

# Airtel Money (when ready)
AIRTEL_API_KEY=
AIRTEL_MERCHANT_ID=
AIRTEL_CALLBACK_SECRET=
AIRTEL_CALLBACK_URL=https://haiq-api.onrender.com/v1/payments/webhook/airtel

NODE_ENV=production
LOG_LEVEL=info
```

### Frontend (Vercel)

```env
VITE_API_BASE_URL=https://haiq-api.onrender.com/v1
```

### Admin (Vercel)

```env
VITE_API_BASE_URL=https://haiq-api.onrender.com/v1
```

---

## 13. DEPLOYMENT AND MIGRATION CHECKLIST

Run these steps in order when deploying this full implementation:

### Backend

- [ ] **BUG-01:** Run the special_days SQL migration on Neon console
- [ ] **BUG-01:** Swap `admin.special_days.routes.js` contents to use date_from/date_to schema; delete `admin.specialdays.routes.js`
- [ ] **BUG-02:** Replace `updateStatus` in `admin.orders.controller.js`
- [ ] **SEC-01:** Add `authLimiter` to customer login, register, forgot-password
- [ ] **SEC-02:** Add `newsletterLimiter` to newsletter subscribe route
- [ ] **SEC-03:** Add `reviewLimiter` to reviews POST route
- [ ] **VAL-01:** Create `backend/src/middleware/schemas.js` with all Zod schemas
- [ ] **VAL-02:** Install `sanitize-html`: `npm install sanitize-html`
- [ ] **VAL-03:** Create `backend/src/utils/sanitize.js`
- [ ] **VAL-04:** Apply schemas to all routes (auth, orders, reviews, loyalty, newsletter, messages, admin routes)
- [ ] **AUTH-01:** Add refresh token rotation to `auth.controller.js`
- [ ] **AUTH-02:** Add revoked token check to `auth.js` middleware
- [ ] **AUTH-03:** Add cleanup interval in `server.js`
- [ ] **AUTH-04:** Add backend password complexity check in `register` controller
- [ ] **AUTH-05:** Add HTTPS redirect in `app.js`
- [ ] **ENV-01:** Set `RESEND_API_KEY`, `EMAIL_FROM`, `FRONTEND_URL` on Render
- [ ] **ENV-02:** Verify `CORS_ORIGINS` includes both Vercel frontend URLs
- [ ] Push to GitHub → Render auto-deploys

### Frontend

- [ ] **LEGAL-01:** Create `PrivacyPolicyPage.jsx` (embed Termly hosted policy)
- [ ] **LEGAL-02:** Create `TermsOfUsePage.jsx` (full draft above)
- [ ] **LEGAL-03:** Create `DataCompliancePage.jsx` (full draft above)
- [ ] **LEGAL-04:** Register all three routes in `App.jsx`
- [ ] **LEGAL-05:** Add links to all three pages in `Footer.jsx`
- [ ] **LEGAL-06:** Update checkout consent checkbox label with terms/privacy links
- [ ] **LEGAL-07:** Add consent notice on RegisterPage
- [ ] **TERMLY-01:** Generate policy on termly.io and replace `YOUR_TERMLY_POLICY_ID` with actual ID
- [ ] **BTN-01:** Extend `Button.jsx` with size prop and muted variant
- [ ] **BTN-02:** Migrate CheckoutPage navigation buttons to `<Button>`
- [ ] **BTN-03:** Migrate BuildYourBoxPage CTA buttons to `<Button>`
- [ ] **BTN-04:** Migrate AccountPage action buttons to `<Button>`
- [ ] **BTN-05:** Migrate LoginPage and RegisterPage submit buttons to `<Button loading>`
- [ ] **BTN-06:** Migrate PasswordResetPages submit buttons to `<Button loading>`
- [ ] **VAL-FE-01:** Add HTML/script strip validation to all text inputs
- [ ] Push to GitHub → Vercel auto-deploys

### Admin

- [ ] **ADMIN-BTN-01:** Create `admin/src/components/shared/Button.jsx`
- [ ] **ADMIN-BTN-02:** Fix LoyaltyPage out-of-palette colours
- [ ] **ADMIN-BTN-03:** Migrate ProductsPage, OrdersPage, SpecialDaysPage, NewsletterPage buttons
- [ ] **SPECIAL-DAYS-UI:** Update SpecialDaysPage form to collect date_from/date_to; update table render; fix response key from `special_days` to `days`
- [ ] Push to GitHub → Vercel auto-deploys

---

## APPENDIX: COLOUR CONSTANTS REFERENCE

Always use these exact values when coding new components:

| Token | Hex | Usage |
|---|---|---|
| `#B8752A` | Amber/primary | All primary CTAs, active states, headings, links |
| `#D4A574` | Tan/secondary | Hover states, secondary accents |
| `#F2EAD8` | Cream/light | Body text on dark, light backgrounds |
| `#1A0A00` | Espresso/dark | Primary background (dominant — 60%) |
| `#3D1A00` | Brown/dark2 | Card surfaces, modal backgrounds |
| `#8C7355` | Mocha/muted | Labels, subdued text, borders |
| `#E8C88A` | Gold | Premium elements, loyalty, achieved states |
| `#7A3B1E` | Sienna | Deep hover darks |

Do NOT use blue (`#60a5fa`), green (`#4ade80`), or generic greys in customer-facing components. The only exception is red (`#f87171`, `#ef4444`) for destructive/delete actions.

---

## APPENDIX: FILE STRUCTURE OF NEW FILES TO CREATE

```
backend/
├── src/
│   ├── middleware/
│   │   └── schemas.js              ← NEW: all Zod validation schemas
│   └── utils/
│       └── sanitize.js             ← NEW: HTML stripping utility

frontend/
└── src/
    └── pages/
        ├── PrivacyPolicyPage.jsx   ← NEW: Termly embed page
        ├── TermsOfUsePage.jsx      ← NEW: Full terms document
        └── DataCompliancePage.jsx  ← NEW: DPPA compliance resource

admin/
└── src/
    └── components/
        └── shared/
            └── Button.jsx          ← NEW: Shared admin button component
```

---

*End of million.md — Version 1.0 — April 29, 2026*

*This document was produced from direct static analysis of the HAIQ_web GitHub repository (Junior-Reactive-Solutions/HAIQ_web), cross-referenced against three uploaded project documents (README.md, progress.md, final_implementation.md), a competitive review of Mazing256 Uganda, and research into Uganda's Data Protection and Privacy Act 2019, Termly's compliance tooling, Clerk's free tier pricing, and current authentication best practice. All code examples are specific to the HAIQ codebase and reference actual file paths, function names, and variable names found in the repository.*
