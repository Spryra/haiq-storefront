# Analytics Page Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all emojis with Lucide icons, fix product image loading, upgrade every chart tooltip & interaction to be professional and theme-consistent, completely redesign the heatmap, and add a new Insights panel that surfaces actionable intelligence from the existing data.

**Architecture:** All changes live in a single file (`admin/src/pages/AnalyticsPage.jsx`) plus one backend SQL fix (`backend/src/routes/admin/admin.analytics.routes.js`). No new files needed. Each task is self-contained and independently deployable.

**Tech Stack:** React 18, Recharts 2.x, lucide-react 1.14, Tailwind CSS, PostgreSQL (via backend), Express.js backend

---

## File Map

| File | What Changes |
|------|-------------|
| `admin/src/pages/AnalyticsPage.jsx` | All 7 frontend tasks |
| `backend/src/routes/admin/admin.analytics.routes.js` | Task 3 — image SQL fix |

---

## Task 1 — Replace All Emojis with Lucide Icons

**File:** `admin/src/pages/AnalyticsPage.jsx`

The page has 11 emoji instances. All must go. The `KPICard` component currently accepts `icon` as a string rendered inside a `<p>`. Change it to accept and render a React node (a pre-sized Lucide component).

### Emoji → Icon mapping

| Location | Emoji | Lucide Icon | Props |
|----------|-------|-------------|-------|
| KPICard — Total Orders | 📦 | `Package` | `size={18} strokeWidth={1.5}` |
| KPICard — Product Revenue | 🍪 | `ShoppingBag` | `size={18} strokeWidth={1.5}` |
| KPICard — Active Orders | 🚚 | `Truck` | `size={18} strokeWidth={1.5}` |
| KPICard — Total Customers | 👥 | `Users` | `size={18} strokeWidth={1.5}` |
| Revenue Breakdown subtitle | 📊 | `BarChart2` | `size={13} strokeWidth={1.5}` |
| Zone Distribution subtitle | 📍 | `MapPin` | `size={13} strokeWidth={1.5}` |
| Orders by Status subtitle | 📈 | `TrendingUp` | `size={13} strokeWidth={1.5}` |
| Special Days subtitle | 🎉 | `CalendarDays` | `size={13} strokeWidth={1.5}` |
| Customer Growth subtitle | 👥 | `Users` | `size={13} strokeWidth={1.5}` |
| Best Seller badge | 🏆 | `Trophy` | `size={12} strokeWidth={1.5}` |
| Product card — units_sold | 📦 | `Package` | `size={11} strokeWidth={1.5}` |

- [ ] **Step 1: Add lucide-react imports at the top of `AnalyticsPage.jsx`**

Replace the existing import block (lines 1–7) with:

```jsx
// AnalyticsPage.jsx
import { useEffect, useState } from 'react'
import adminApi from '../services/adminApi'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts'
import {
  Package, ShoppingBag, Truck, Users, BarChart2, MapPin,
  TrendingUp, CalendarDays, Trophy,
} from 'lucide-react'
```

- [ ] **Step 2: Update `KPICard` to render `icon` as a React node (not a string)**

Replace the `KPICard` function (lines 28–44) with:

```jsx
function KPICard({ label, value, change, icon }) {
  const isPositive = change > 0
  return (
    <div className="admin-card p-4">
      <div className="flex items-start justify-between mb-3">
        <p className="text-light/50 text-[10px] font-semibold uppercase tracking-widest">{label}</p>
        <span style={{ color: '#B8752A', opacity: 0.7 }}>{icon}</span>
      </div>
      <p className="font-serif font-bold text-light text-2xl mb-2">{fmt(value)}</p>
      {change !== null && (
        <p className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(change)}% vs last week
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Replace emoji props in the four KPICard usages (lines 149–173)**

```jsx
{summary && (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <KPICard label="Total Orders"    value={summary.total_orders}    change={null}                    icon={<Package   size={18} strokeWidth={1.5} />} />
    <KPICard label="Product Revenue" value={summary.product_revenue} change={null}                    icon={<ShoppingBag size={18} strokeWidth={1.5} />} />
    <KPICard label="Active Orders"   value={summary.active_orders}   change={null}                    icon={<Truck     size={18} strokeWidth={1.5} />} />
    <KPICard label="Total Customers" value={summary.total_customers} change={summary.weekly_change_pct} icon={<Users    size={18} strokeWidth={1.5} />} />
  </div>
)}
```

- [ ] **Step 4: Create a shared `IconLabel` helper to replace emoji-prefixed subtitles**

Add this function below `SectionHeader` (after line 26):

```jsx
function IconLabel({ icon, text }) {
  return (
    <div className="flex items-center gap-1.5 mb-3" style={{ color: '#8C7355' }}>
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <p className="text-[10px]">{text}</p>
    </div>
  )
}
```

- [ ] **Step 5: Replace the 5 emoji subtitle `<p>` tags with `<IconLabel />`**

| Old (remove) | New (insert in its place) |
|---|---|
| `<p className="text-[10px] mb-3" style=...>📊 Product vs Delivery revenue</p>` | `<IconLabel icon={<BarChart2 size={13} strokeWidth={1.5}/>} text="Product vs Delivery revenue" />` |
| `<p className="text-[10px] mb-3" style=...>📍 Zones with active orders</p>` | `<IconLabel icon={<MapPin size={13} strokeWidth={1.5}/>} text="Zones with active orders" />` |
| `<p className="text-[10px] mb-3" style=...>📈 Current order distribution</p>` | `<IconLabel icon={<TrendingUp size={13} strokeWidth={1.5}/>} text="Current order distribution" />` |
| `<p className="text-[10px] mb-3" style=...>🎉 vs Normal days performance</p>` | `<IconLabel icon={<CalendarDays size={13} strokeWidth={1.5}/>} text="vs Normal days performance" />` |
| `<p className="text-[10px] mb-3" style=...>👥 Cumulative new signups</p>` | `<IconLabel icon={<Users size={13} strokeWidth={1.5}/>} text="Cumulative new signups" />` |

- [ ] **Step 6: Replace emoji in the Best Seller badge and product stats (lines 418–432)**

```jsx
{/* Best Seller Badge */}
{i === 0 && (
  <div className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded mb-2 font-bold"
    style={{ background: '#B8752A', color: '#1A0A00' }}>
    <Trophy size={12} strokeWidth={1.5} />
    Best Seller
  </div>
)}

{/* Product name */}
<h4 className="font-bold mb-3 text-sm" style={{ color: '#F2EAD8' }}>{p.name}</h4>

{/* Stats */}
<div className="space-y-1">
  <p className="text-xs flex items-center gap-1" style={{ color: '#8C7355' }}>
    <Package size={11} strokeWidth={1.5} />
    {fmt(p.units_sold)} units
  </p>
  <p className="text-xs font-semibold" style={{ color: '#B8752A' }}>
    UGX {fmt(p.revenue)}
  </p>
</div>
```

- [ ] **Step 7: Commit**

```bash
git add admin/src/pages/AnalyticsPage.jsx
git commit -m "feat: replace all emojis with lucide-react icons in Analytics page"
```

---

## Task 2 — Remove "Hidden from Customers" Badge

**File:** `admin/src/pages/AnalyticsPage.jsx`

- [ ] **Step 1: Remove the badge span from the Top Customers section header (lines 485–490)**

Replace this block:
```jsx
<div className="flex items-start justify-between mb-4">
  <SectionHeader label="Internal — Admin Only" title="Top Customers" />
  <span className="text-[10px] bg-haiq-gold/10 text-haiq-gold border border-haiq-gold/30 px-2.5 py-1 rounded-full uppercase tracking-widest">
    👑 Hidden from customers
  </span>
</div>
```

With just:
```jsx
<SectionHeader label="Internal — Admin Only" title="Top Customers" />
```

- [ ] **Step 2: Commit**

```bash
git add admin/src/pages/AnalyticsPage.jsx
git commit -m "fix: remove 'Hidden from customers' badge from Top Customers section"
```

---

## Task 3 — Fix Product Image Loading

**Problem:** The SQL join `LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.sort_order = 0` misses any product whose first uploaded image got a different sort_order value. Also `GROUP BY p.id, p.name, pi.url` can produce duplicates if multiple images match.

**Fix:** Use a `LATERAL` subquery to always get the image with the lowest sort_order, one per product, regardless of the actual value.

**File:** `backend/src/routes/admin/admin.analytics.routes.js` (lines 131–150)

- [ ] **Step 1: Replace the top-products SQL query**

Find the `/top-products` route and change the query from:
```sql
SELECT
  p.id,
  p.name,
  COALESCE(pi.url, '') AS image_url,
  SUM(oi.quantity)   AS units_sold,
  SUM(oi.line_total) AS revenue
FROM   order_items oi
JOIN   products p ON p.id = oi.product_id
LEFT   JOIN product_images pi ON pi.product_id = p.id AND pi.sort_order = 0
JOIN   orders o ON o.id = oi.order_id
WHERE  o.payment_status = 'paid'
GROUP  BY p.id, p.name, pi.url
ORDER  BY units_sold DESC
LIMIT  6
```

To:
```sql
SELECT
  p.id,
  p.name,
  COALESCE(first_img.url, '') AS image_url,
  SUM(oi.quantity)::int        AS units_sold,
  SUM(oi.line_total)           AS revenue
FROM   order_items oi
JOIN   products p ON p.id = oi.product_id
JOIN   orders o   ON o.id = oi.order_id AND o.payment_status = 'paid'
LEFT   JOIN LATERAL (
  SELECT url FROM product_images
  WHERE  product_id = p.id
  ORDER  BY sort_order ASC
  LIMIT  1
) first_img ON true
GROUP  BY p.id, p.name, first_img.url
ORDER  BY units_sold DESC
LIMIT  6
```

- [ ] **Step 2: Commit and push**

```bash
git add backend/src/routes/admin/admin.analytics.routes.js
git commit -m "fix: use LATERAL join for product images to handle any sort_order value"
git push origin main
```

---

## Task 4 — Custom Tooltips for All Charts

**File:** `admin/src/pages/AnalyticsPage.jsx`

The generic `customTooltip` is used for all 5 charts, showing raw field names and unformatted dates. Each chart gets a purpose-built tooltip.

**Helper — date formatter for tooltip headers:**

```js
const fmtTooltipDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  // → "13 May 2026"
}
```

Add this near `fmtDay` (line 13).

### 4A — Revenue Breakdown tooltip

Shows: formatted date + Product Revenue + Delivery Revenue

- [ ] **Step 1: Add `revenueTooltip` function after `customTooltip` (after line 108)**

```jsx
const revenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1A0A00', border: '1px solid rgba(184,117,42,0.3)',
      borderRadius: 6, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: '#8C7355', marginBottom: 6, fontSize: 10, letterSpacing: '0.08em' }}>
        {fmtTooltipDate(label)}
      </p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, marginBottom: i < payload.length - 1 ? 3 : 0 }}>
          {p.name === 'product_revenue' ? 'Product Revenue' : 'Delivery Revenue'}
          {': '}
          <span style={{ fontWeight: 700 }}>UGX {fmt(p.value)}</span>
        </p>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Swap `customTooltip` → `revenueTooltip` in the Revenue LineChart (line 228)**

```jsx
<Tooltip content={revenueTooltip} />
```

### 4B — Customer Growth tooltip

Shows: formatted date + "Total customers at this point: N"

- [ ] **Step 3: Add `growthTooltip` function**

```jsx
const growthTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const value = payload.find(p => p.dataKey === 'cumulative')?.value ?? 0
  return (
    <div style={{
      background: '#1A0A00', border: '1px solid rgba(184,117,42,0.3)',
      borderRadius: 6, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: '#8C7355', marginBottom: 6, fontSize: 10 }}>
        {fmtTooltipDate(label)}
      </p>
      <p style={{ color: '#F2EAD8' }}>
        Total customers: <span style={{ color: '#B8752A', fontWeight: 700 }}>{value}</span>
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Swap `customTooltip` → `growthTooltip` in the Customer Growth AreaChart (line 376)**

```jsx
<Tooltip content={growthTooltip} />
```

### 4C — Orders by Status tooltip

Shows: clean status label + order count

- [ ] **Step 5: Add `statusTooltip` function**

```jsx
const fmtStatus = s => (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const statusTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const count = payload[0]?.value ?? 0
  return (
    <div style={{
      background: '#1A0A00', border: '1px solid rgba(184,117,42,0.3)',
      borderRadius: 6, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: '#8C7355', marginBottom: 4, fontSize: 10 }}>{fmtStatus(label)}</p>
      <p style={{ color: '#F2EAD8' }}>
        Orders: <span style={{ color: '#B8752A', fontWeight: 700 }}>{count}</span>
      </p>
    </div>
  )
}
```

- [ ] **Step 6: Swap `customTooltip` → `statusTooltip` in the Orders by Status BarChart (line 276)**

Also add `cursor={{ fill: 'rgba(184,117,42,0.08)' }}` to the `<Bar>` component to improve hover feel:

```jsx
<Tooltip content={statusTooltip} />
...
<Bar dataKey="count" fill="#B8752A" radius={[3, 3, 0, 0]} name="orders"
  cursor={{ fill: 'rgba(184,117,42,0.08)' }} />
```

### 4D — Special Days Impact tooltip

Shows: category name + Avg Revenue + Avg Orders clearly labelled

- [ ] **Step 7: Add `specialDaysTooltip` function**

```jsx
const specialDaysTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const rev    = payload.find(p => p.dataKey === 'revenue')?.value ?? 0
  const orders = payload.find(p => p.dataKey === 'orders')?.value ?? 0
  return (
    <div style={{
      background: '#1A0A00', border: '1px solid rgba(184,117,42,0.3)',
      borderRadius: 6, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: '#8C7355', marginBottom: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>
        {label?.toUpperCase()}
      </p>
      <p style={{ color: '#F2EAD8', marginBottom: 3 }}>
        Avg Revenue: <span style={{ color: '#B8752A', fontWeight: 700 }}>UGX {fmt(Math.round(rev))}</span>
      </p>
      <p style={{ color: '#F2EAD8' }}>
        Avg Orders: <span style={{ color: '#D4A574', fontWeight: 700 }}>{Number(orders).toFixed(1)}</span>
      </p>
    </div>
  )
}
```

- [ ] **Step 8: Swap in Special Days BarChart (line 348) and add cursor styling**

```jsx
<Tooltip content={specialDaysTooltip} cursor={{ fill: 'rgba(184,117,42,0.08)' }} />
...
<Bar yAxisId="left"  dataKey="revenue" fill="#B8752A" radius={[3,3,0,0]} name="Avg Revenue (UGX)" cursor={{ fill: 'rgba(184,117,42,0.08)' }} />
<Bar yAxisId="right" dataKey="orders"  fill="#D4A574" radius={[3,3,0,0]} name="Avg Orders"        cursor={{ fill: 'rgba(184,117,42,0.08)' }} />
```

- [ ] **Step 9: Remove the stale `customTooltip` function (it's now unused)**

Delete lines 96–108 (the old `customTooltip` function).

- [ ] **Step 10: Commit**

```bash
git add admin/src/pages/AnalyticsPage.jsx
git commit -m "feat: replace generic tooltip with purpose-built tooltips on all 4 charts"
```

---

## Task 5 — Order Activity Heatmap Redesign

**File:** `admin/src/pages/AnalyticsPage.jsx`

**Problems:** tiny cells, clashing cream-on-cream color at low values, `—` glyph looks broken, no scale legend, CSS table padding is cramped.

**Design direction:**
- Cells become rounded div blocks (`40px × 36px`) instead of td padding
- Color scale: `#2A1200` (0 orders, dark) → `#7A3B1E` (1-2) → `#B8752A` (3-4) → `#E8C88A` (5+ orders, bright)
- Empty cells: very subtle `rgba(255,255,255,0.03)` background, no number
- Active cells: show count in dark text (`#1A0A00`) on the warm highlight
- Custom HTML tooltip (via `title` attribute is fine here; for a styled one, use a `useState` hover state)
- Color legend bar at the bottom
- Day labels full width, aligned above columns

- [ ] **Step 1: Replace the `HEATMAP_COLORS` constant (line 11) and add the new color function**

Replace line 11:
```js
const HEATMAP_COLORS = ['#F2EAD8', '#E8C88A', '#D4A574', '#B8752A', '#8C7355', '#5A4A3A', '#3D2000']
```

With:
```js
// Heatmap — 5-stop scale from void-dark → bright gold
const HEAT_STOPS = [
  { threshold: 0,  bg: 'rgba(255,255,255,0.03)', text: 'transparent' },
  { threshold: 1,  bg: '#3D2000',                text: '#8C7355'     },
  { threshold: 2,  bg: '#7A3B1E',                text: '#D4A574'     },
  { threshold: 3,  bg: '#B8752A',                text: '#1A0A00'     },
  { threshold: 5,  bg: '#D4A574',                text: '#1A0A00'     },
  { threshold: 8,  bg: '#E8C88A',                text: '#1A0A00'     },
]
const getHeatStop = (count) => {
  let stop = HEAT_STOPS[0]
  for (const s of HEAT_STOPS) {
    if (count >= s.threshold) stop = s
  }
  return stop
}
```

- [ ] **Step 2: Replace `getHeatmapColor` (lines 110–113) with the new `getHeatStop`**

Delete `getHeatmapColor` — it's replaced by `getHeatStop` above.

- [ ] **Step 3: Add a `heatmapHover` state below the other states (around line 58)**

```jsx
const [heatmapHover, setHeatmapHover] = useState(null)
// { day, hour, count } — drives the hover tooltip
```

- [ ] **Step 4: Replace the entire Heatmap JSX section (lines 284–330) with the redesigned version**

```jsx
{/* Order Activity Heatmap */}
<div className="admin-card">
  <SectionHeader label="Time Patterns" title="Order Activity Heatmap" />
  <IconLabel icon={<CalendarDays size={13} strokeWidth={1.5}/>} text="Order density by day and hour — last 90 days" />
  {heatmapData.length === 0 ? (
    <p className="text-light/30 text-sm py-4">No heatmap data yet.</p>
  ) : (
    <div className="overflow-x-auto">
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '52px repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        <div />
        {heatmapGrid.days.map(day => (
          <div key={day} style={{ textAlign: 'center', color: '#8C7355', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {day}
          </div>
        ))}
      </div>

      {/* Grid rows */}
      {heatmapGrid.hours.map((hour, hourIdx) => (
        <div key={hour} style={{ display: 'grid', gridTemplateColumns: '52px repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {/* Time label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, color: '#8C7355', fontSize: 9, fontWeight: 600, letterSpacing: '0.05em' }}>
            {hour}
          </div>
          {/* Cells */}
          {heatmapGrid.days.map((day, dayIdx) => {
            const key   = `${dayIdx}-${hourIdx}`
            const count = heatmapGrid.grid[key] || 0
            const stop  = getHeatStop(count)
            const isHovered = heatmapHover?.key === key
            return (
              <div
                key={key}
                onMouseEnter={() => setHeatmapHover({ key, day, hour, count })}
                onMouseLeave={() => setHeatmapHover(null)}
                style={{
                  height: 34,
                  borderRadius: 4,
                  backgroundColor: stop.bg,
                  border: isHovered
                    ? '1px solid rgba(184,117,42,0.7)'
                    : '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: count > 0 ? 'default' : 'default',
                  transition: 'border-color 150ms, transform 100ms',
                  transform: isHovered && count > 0 ? 'scale(1.08)' : 'scale(1)',
                  position: 'relative',
                }}
              >
                {count > 0 && (
                  <span style={{ color: stop.text, fontSize: 11, fontWeight: 700 }}>{count}</span>
                )}
              </div>
            )
          })}
        </div>
      ))}

      {/* Hover tooltip */}
      {heatmapHover && heatmapHover.count > 0 && (
        <div style={{
          marginTop: 12, padding: '8px 14px',
          background: '#1A0A00', border: '1px solid rgba(184,117,42,0.3)',
          borderRadius: 6, display: 'inline-block',
        }}>
          <span style={{ color: '#8C7355', fontSize: 10 }}>
            {heatmapHover.day} · {heatmapHover.hour}
          </span>
          <span style={{ color: '#F2EAD8', fontSize: 12, marginLeft: 10, fontWeight: 700 }}>
            {heatmapHover.count} order{heatmapHover.count !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Color scale legend */}
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#8C7355', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Low</span>
        {HEAT_STOPS.map((s, i) => (
          <div key={i} style={{
            width: 20, height: 10, borderRadius: 2,
            backgroundColor: s.bg === 'rgba(255,255,255,0.03)' ? '#2A1200' : s.bg,
            border: '1px solid rgba(255,255,255,0.06)',
          }} />
        ))}
        <span style={{ color: '#8C7355', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }}>High</span>
      </div>
    </div>
  )}
</div>
```

**Note:** `IconLabel` is already imported from Task 1. `CalendarDays` is already imported.

- [ ] **Step 5: Commit**

```bash
git add admin/src/pages/AnalyticsPage.jsx
git commit -m "feat: redesign Order Activity Heatmap — new color scale, spacing, hover tooltip, legend"
```

---

## Task 6 — Major Enhancement: Auto-Generated Insights Panel

**Goal:** Surface the most actionable intelligence automatically from the data that's already being fetched. No new API calls needed.

**Position:** Insert the Insights panel immediately after the Page Header and before the KPI Cards.

**What it surfaces (auto-calculated from existing state):**

| Insight | Source data | How calculated |
|---------|------------|----------------|
| Best-selling cookie | `topProducts[0]` | First item in sorted list |
| Peak day + time | `heatmapData` | Find cell with max `order_count` |
| Special Days revenue boost | `specialDaysData` | `((special_avg - normal_avg) / normal_avg) * 100` |
| Top customer tier | `customerTiers` | Tier with most members |
| Customer growth rate | `customerGrowthData` | Last value / first value as % gain |

- [ ] **Step 1: Add the Insights calculation block (computed values, not state) inside the return, after `loading` guard**

Add this block just before `return (` (around line 136):

```jsx
// ── Insights — auto-surface from fetched data ─────────────────────────────
const insights = (() => {
  const list = []

  // Best-selling cookie
  if (topProducts.length > 0) {
    const p = topProducts[0]
    list.push({
      label: 'Best-Selling Cookie',
      value: p.name,
      sub:   `${fmt(p.units_sold)} units · UGX ${fmt(p.revenue)}`,
      color: '#B8752A',
    })
  }

  // Peak day + time from heatmap
  if (heatmapData.length > 0) {
    const peak = heatmapData.reduce((best, d) =>
      d.order_count > best.order_count ? d : best, heatmapData[0])
    const dayNames  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    const hourStart = peak.hour_of_day
    const hourLabel = `${String(hourStart).padStart(2,'0')}:00–${String(hourStart + 1).padStart(2,'0')}:00`
    list.push({
      label: 'Busiest Time',
      value: `${dayNames[peak.day_of_week]}s at ${hourLabel}`,
      sub:   `${peak.order_count} orders on average`,
      color: '#E8C88A',
    })
  }

  // Special days revenue boost
  if (specialDaysData?.special_days?.avg_revenue && specialDaysData?.normal_days?.avg_revenue) {
    const sp  = specialDaysData.special_days.avg_revenue
    const nm  = specialDaysData.normal_days.avg_revenue
    if (nm > 0) {
      const pct = Math.round(((sp - nm) / nm) * 100)
      list.push({
        label: 'Special Days Boost',
        value: `${pct > 0 ? '+' : ''}${pct}% revenue`,
        sub:   `UGX ${fmt(Math.round(sp))} avg vs UGX ${fmt(Math.round(nm))} normal`,
        color: pct >= 0 ? '#4ade80' : '#f87171',
      })
    }
  }

  // Dominant loyalty tier
  if (customerTiers.length > 0) {
    const top = customerTiers.reduce((a, b) => a.tier_count > b.tier_count ? a : b)
    list.push({
      label: 'Most Common Tier',
      value: top.loyalty_tier,
      sub:   `${top.tier_count} customers · Avg UGX ${fmt(top.avg_spent)}`,
      color: TIER_COLOR[top.loyalty_tier] || '#8C7355',
    })
  }

  return list
})()
```

- [ ] **Step 2: Add the Insights panel JSX after the Page Header section (after line 144)**

```jsx
{/* ── Insights Panel ───────────────────────────────────────────────────── */}
{insights.length > 0 && (
  <div className="admin-card">
    <SectionHeader label="Auto-detected" title="Key Insights" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {insights.map((ins, i) => (
        <div key={i} style={{
          background: '#1A0A00',
          border: '1px solid rgba(255,255,255,0.05)',
          borderLeft: `3px solid ${ins.color}`,
          borderRadius: 6,
          padding: '12px 14px',
        }}>
          <p style={{ color: '#8C7355', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>
            {ins.label}
          </p>
          <p style={{ color: ins.color, fontFamily: 'serif', fontSize: 16, fontWeight: 700, marginBottom: 3 }}>
            {ins.value}
          </p>
          <p style={{ color: '#8C7355', fontSize: 10 }}>{ins.sub}</p>
        </div>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add admin/src/pages/AnalyticsPage.jsx
git commit -m "feat: add auto-generated Key Insights panel to Analytics page"
```

---

## Task 7 — Add Average Order Value to Revenue Chart

**Goal:** Make the Revenue Breakdown chart more insightful by overlaying AOV (Average Order Value) as a dashed line on a right-side Y axis. This turns a vanity chart into an operational chart — managers can see if they're selling more but at lower AOV (discounting too much).

**Data:** The `/revenue` endpoint already returns `order_count` and `revenue` per day. AOV = `revenue / order_count`.

**File:** `admin/src/pages/AnalyticsPage.jsx`

- [ ] **Step 1: Compute AOV client-side after `setRevenue` (inside the `.then()` block)**

In the `setRevenue` line, replace:
```js
setRevenue(rev.data.data || [])
```
With:
```js
setRevenue((rev.data.data || []).map(r => ({
  ...r,
  aov: r.order_count > 0 ? Math.round(r.revenue / r.order_count) : 0,
})))
```

- [ ] **Step 2: Add a right YAxis and the AOV line to the Revenue LineChart (lines 223–235)**

Replace the existing `<LineChart>` block with:

```jsx
<LineChart data={revenue} margin={{ left: 0, right: 36 }}>
  <XAxis dataKey="date" tickFormatter={fmtDay}
    tick={{ fill: '#8C7355', fontSize: 10 }} tickLine={false} axisLine={false} />
  <YAxis yAxisId="left" tick={{ fill: '#8C7355', fontSize: 10 }}
    tickLine={false} axisLine={false}
    tickFormatter={v => `${(v/1000).toFixed(0)}k`} width={36} />
  <YAxis yAxisId="right" orientation="right"
    tick={{ fill: '#5A4A3A', fontSize: 10 }}
    tickLine={false} axisLine={false}
    tickFormatter={v => `${(v/1000).toFixed(0)}k`} width={36} />
  <Tooltip content={revenueTooltip} />
  <Line yAxisId="left" type="monotone" dataKey="product_revenue"
    stroke="#B8752A" strokeWidth={2.5}
    dot={false} activeDot={{ r: 5, fill: '#B8752A' }} name="product_revenue" />
  <Line yAxisId="left" type="monotone" dataKey="delivery_revenue"
    stroke="#8C7355" strokeWidth={2} strokeDasharray="5 5"
    dot={false} activeDot={{ r: 5, fill: '#8C7355' }} name="delivery_revenue" />
  <Line yAxisId="right" type="monotone" dataKey="aov"
    stroke="#E8C88A" strokeWidth={1.5} strokeDasharray="3 3"
    dot={false} activeDot={{ r: 4, fill: '#E8C88A' }} name="aov" />
  <Legend />
</LineChart>
```

- [ ] **Step 3: Update `revenueTooltip` to also show AOV**

In Task 4's `revenueTooltip` (already written), extend the payload mapping:

```jsx
const revenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const getName = key => ({
    product_revenue: 'Product Revenue',
    delivery_revenue: 'Delivery Revenue',
    aov: 'Avg Order Value',
  })[key] || key
  const isRevenue = key => ['product_revenue', 'delivery_revenue', 'aov'].includes(key)
  return (
    <div style={{
      background: '#1A0A00', border: '1px solid rgba(184,117,42,0.3)',
      borderRadius: 6, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: '#8C7355', marginBottom: 6, fontSize: 10, letterSpacing: '0.08em' }}>
        {fmtTooltipDate(label)}
      </p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, marginBottom: i < payload.length - 1 ? 3 : 0 }}>
          {getName(p.dataKey)}
          {': '}
          <span style={{ fontWeight: 700 }}>
            {isRevenue(p.dataKey) ? `UGX ${fmt(p.value)}` : p.value}
          </span>
        </p>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Commit and push**

```bash
git add admin/src/pages/AnalyticsPage.jsx
git commit -m "feat: add Average Order Value line to Revenue Breakdown chart"
git push origin main
```

---

## Self-Review Checklist

**Spec coverage:**

| User request | Task |
|---|---|
| Remove emojis, replace with icons | Task 1 ✅ |
| Remove "👑 Hidden from customers" | Task 2 ✅ |
| Fix product image loading | Task 3 ✅ |
| Customer Growth tooltip confusing | Task 4B ✅ |
| Special Days hover janky | Task 4D + cursor fix ✅ |
| Orders by Status hover janky | Task 4C + cursor fix ✅ |
| Heatmap major upgrade | Task 5 ✅ |
| Revenue Breakdown time display | Task 4A ✅ |
| Major analytics improvement using existing data | Tasks 6 + 7 ✅ |

**No placeholders found** — all code is complete and concrete.

**Type consistency** — `getHeatStop` replaces `getHeatmapColor` throughout. `revenueTooltip` is written in full in both Task 4 and Task 7 (Task 7's version supersedes — use the Task 7 version which handles the AOV field too). `IconLabel` is used in Tasks 1, 5 — it's defined in Task 1 and is available for Task 5 because they're in the same file.

---

## Execution Handoff

Plan saved. Two options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between each, fast iteration using `superpowers:subagent-driven-development`

**2. Inline Execution** — execute all tasks in this session with `superpowers:executing-plans`

Which approach?
