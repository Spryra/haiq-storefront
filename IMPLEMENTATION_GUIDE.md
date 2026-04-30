# Delivery Zones + Icon Upgrade — Implementation Guide
Complete step-by-step for HAIQ · React/Vite frontend · Node/Express backend · PostgreSQL

---

## 1 — Database — create the delivery_zones table | Neon console

### Create migration file
Create `backend/src/db/migrations/011_delivery_zones.sql` 

```sql
CREATE TABLE IF NOT EXISTS delivery_zones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(150) NOT NULL,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add delivery_zone_id to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_zone_id UUID
    REFERENCES delivery_zones(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS delivery_zone_name VARCHAR(150);

-- Seed initial Kampala zones (based on Muyenga base location)
INSERT INTO delivery_zones (name, price, sort_order) VALUES
  ('Muyenga / Bukasa / Kabalagala',       3000,  1),
  ('Ggaba / Buziga / Munyonyo',           4000,  2),
  ('Makindye / Kibuye / Kansanga',        4000,  3),
  ('Kampala CBD / City Centre',           5000,  4),
  ('Kololo / Naguru / Ntinda',            5000,  5),
  ('Nakawa / Bugolobi / Luzira',          5000,  6),
  ('Naalya / Kyaliwajjala / Kira',        8000,  7),
  ('Namugongo / Kiwatule / Kireka',       8000,  8),
  ('Wakiso / Gayaza / Matugga',          10000,  9),
  ('Entebbe / Entebbe Road',            12000, 10),
  ('Outside Kampala (flat rate)',        15000, 11)
ON CONFLICT DO NOTHING;
```

The orders table already has a delivery_fee column — we are only adding a zone reference and a snapshot of the zone name (so the zone name is preserved even if zones are later edited).

### Run the migration
Either paste the SQL into the Neon console, or run locally:
```
cd backend
node src/db/migrate.js
```

---

## 2 — Backend — API endpoints for zones | 2 new files + 2 edits

### New file: public zones route
Create `backend/src/routes/deliveryzones.routes.js` 

```javascript
'use strict';
const router    = require('express').Router();
const { query } = require('../config/db');

// GET /v1/delivery-zones — public, no auth required
// Returns all active zones in sort order
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, name, price, sort_order
       FROM delivery_zones
       WHERE is_active = true
       ORDER BY sort_order ASC`
    );
    res.json({ success: true, zones: rows });
  } catch (err) { next(err); }
});

module.exports = router;
```

### New file: admin zones route
Create `backend/src/routes/admin/admin.deliveryzones.routes.js` 

```javascript
'use strict';
const router = require('express').Router();
const { query } = require('../../config/db');
const { requireStaff, requireSuperAdmin } = require('../../middleware/adminAuth');

// GET /v1/admin/delivery-zones
router.get('/', requireStaff, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT * FROM delivery_zones ORDER BY sort_order ASC` 
    );
    res.json({ success: true, zones: rows });
  } catch (err) { next(err); }
});

// POST /v1/admin/delivery-zones — create
router.post('/', requireSuperAdmin, async (req, res, next) => {
  try {
    const { name, price, sort_order } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: 'name and price are required.' });
    }
    const { rows: [zone] } = await query(
      `INSERT INTO delivery_zones (name, price, sort_order)
       VALUES ($1, $2, $3) RETURNING *`,
      [name.trim(), parseFloat(price), parseInt(sort_order) || 99]
    );
    res.status(201).json({ success: true, zone });
  } catch (err) { next(err); }
});

// PUT /v1/admin/delivery-zones/:id — update
router.put('/:id', requireSuperAdmin, async (req, res, next) => {
  try {
    const { name, price, sort_order, is_active } = req.body;
    const { rows: [zone] } = await query(
      `UPDATE delivery_zones
       SET name = COALESCE($1, name),
           price = COALESCE($2, price),
           sort_order = COALESCE($3, sort_order),
           is_active = COALESCE($4, is_active),
           updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [name?.trim(), price !== undefined ? parseFloat(price) : null,
       sort_order !== undefined ? parseInt(sort_order) : null,
       is_active, req.params.id]
    );
    if (!zone) return res.status(404).json({ success: false, error: 'Zone not found.' });
    res.json({ success: true, zone });
  } catch (err) { next(err); }
});

// DELETE /v1/admin/delivery-zones/:id
router.delete('/:id', requireSuperAdmin, async (req, res, next) => {
  try {
    await query('DELETE FROM delivery_zones WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
```

### Edit: public routes index
In `backend/src/routes/index.js`, add one line after the special-days line:
```javascript
router.use('/delivery-zones', require('./deliveryzones.routes'));
```

### Edit: admin routes index
In `backend/src/routes/admin/index.js`, add one line:
```javascript
router.use('/delivery-zones', require('./admin.deliveryzones.routes'));
```

### Edit: orders controller — accept zone and fee from client
In `backend/src/controllers/orders.controller.js`, the `create` function already has a `DELIVERY_FEE = 0` constant at the top. Replace it and update the destructuring:

```javascript
// Remove the old constant:
// const DELIVERY_FEE = 0

// In the destructuring of req.body, add:
const {
  first_name, last_name, email, phone,
  delivery_address, delivery_note, gift_note,
  items, payment_method, consent_given,
  delivery_zone_id,   // UUID from the zones table
} = req.body

// After the items loop, resolve the zone fee:
let delivery_fee = 0;
let delivery_zone_name = null;

if (delivery_zone_id) {
  const { rows: [zone] } = await client.query(
    `SELECT id, name, price FROM delivery_zones
     WHERE id = $1 AND is_active = true`,
    [delivery_zone_id]
  );
  if (zone) {
    delivery_fee = parseFloat(zone.price);
    delivery_zone_name = zone.name;
  }
}

const total = subtotal + delivery_fee;

// In the INSERT INTO orders statement, add the new columns:
subtotal, delivery_fee, total,
delivery_zone_id, delivery_zone_name,
...
```

Important: the orders INSERT SQL must also include delivery_zone_id and delivery_zone_name in both the column list and the VALUES placeholders. The delivery_fee column already exists — you are just now populating it with a real value instead of 0.

### Edit: order creation Zod schema
In the order creation schema (either in `orders.routes.js` or the new `schemas.js` from million.md), add the optional zone field:
```javascript
delivery_zone_id: z.string().uuid().optional(),
```

---

## 3 — Frontend — checkout dropdown + live fee display | CheckoutPage.jsx

### Add state for zones at the top of CheckoutPage
```javascript
// Add these state declarations alongside the existing ones:
const [zones,         setZones]         = useState([])
const [selectedZone,  setSelectedZone]  = useState(null)  // full zone object
const [zonesLoading,  setZonesLoading]  = useState(true)

// Add this useEffect to load zones on mount (alongside the existing auth check):
useEffect(() => {
  api.get('/delivery-zones')
    .then(res => setZones(res.data.zones || []))
    .catch(() => {})
    .finally(() => setZonesLoading(false))
}, [])
```

### Replace the delivery address block in Step 2 (Details)
Find the block containing the `delivery_address` textarea and replace it with this zone dropdown + specific address input combination:

```jsx
{/* Zone dropdown */}
{lbl('Delivery Zone', true)}
<div className="relative">
  <select
    value={selectedZone?.id || ''}
    onChange={e => {
      const zone = zones.find(z => z.id === e.target.value) || null
      setSelectedZone(zone)
      setDetails(d => ({
        ...d,
        delivery_address: zone ? zone.name : ''
      }))
    }}
    className={inputCls}
    style={{
      ...inputSty,
      appearance: 'none',
      WebkitAppearance: 'none',
      cursor: 'pointer',
      paddingRight: '36px',
    }}
  >
    <option value="">
      {zonesLoading ? 'Loading zones...' : '— Select your area —'}
    </option>
    {zones.map(z => (
      <option key={z.id} value={z.id}>
        {z.name} — UGX {Number(z.price).toLocaleString()}
      </option>
    ))}
  </select>
  {/* Custom dropdown arrow */}
  <div
    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
    style={{ color: '#B8752A' }}
  >
    ▾
  </div>
</div>

{/* Live delivery fee badge — shown when zone is selected */}
{selectedZone && (
  <div className="flex items-center justify-between px-3 py-2 mt-1"
    style={{ background: 'rgba(184,117,42,0.08)', border: '1px solid rgba(184,117,42,0.25)' }}>
    <p className="text-[11px]" style={{ color: '#8C7355' }}>Delivery to {selectedZone.name}</p>
    <p className="text-[11px] font-bold" style={{ color: '#B8752A' }}>
      UGX {Number(selectedZone.price).toLocaleString()}
    </p>
  </div>
)}

{/* Specific address — shown after zone is selected */}
{selectedZone && (
  <div className="mt-3">
    {lbl('Specific Address / Landmark', true)}
    <textarea
      rows={2}
      className={`${inputCls} resize-none`}
      style={inputSty}
      value={details.delivery_address === selectedZone.name ? '' : details.delivery_address}
      onChange={upd('delivery_address')}
      placeholder="Plot number, estate name, nearest landmark..."
    />
  </div>
)}
```

### Update detailsValid to require a zone
```javascript
// Replace the existing detailsValid constant:
const detailsValid =
  details.first_name.trim() && details.last_name.trim() &&
  details.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email) &&
  details.phone.trim() &&
  selectedZone !== null &&           // zone must be chosen
  details.delivery_address.trim().length >= 3   // specific address/landmark
```

### Update OrderSummary to show delivery fee
The `OrderSummary` component currently shows a static notice. Pass the zone down as a prop and update it:

```jsx
// Change the component signature:
function OrderSummary({ items, subtotal, selectedZone }) {

  const deliveryFee = selectedZone ? Number(selectedZone.price) : 0
  const total = subtotal + deliveryFee

  return (
    <div ...>
      ...existing items list...
      <div className="pt-3 mt-2" style={{ borderTop: '1px solid rgba(184,117,42,0.2)' }}>
        <div className="flex justify-between text-sm font-bold mb-1">
          <span style={{ color: '#F2EAD8' }}>Subtotal</span>
          <span style={{ color: '#E8C88A' }}>UGX {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color: '#8C7355' }}>Delivery</span>
          <span style={{ color: selectedZone ? '#B8752A' : '#8C7355' }}>
            {selectedZone
              ? `UGX ${deliveryFee.toLocaleString()}` 
              : 'Select zone'}
          </span>
        </div>
        <div className="flex justify-between text-sm font-bold pt-2"
          style={{ borderTop: '1px solid rgba(184,117,42,0.2)' }}>
          <span style={{ color: '#F2EAD8' }}>Total</span>
          <span style={{ color: '#E8C88A' }}>UGX {total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

// When rendering OrderSummary, pass the selectedZone:
<OrderSummary items={items} subtotal={subtotal} selectedZone={selectedZone} />
```

### Add delivery_zone_id to handleSubmit
```javascript
// In the handleSubmit body object, add:
const body = {
  first_name: ...,
  ...
  delivery_address: details.delivery_address.trim(),
  delivery_note:    ...,
  delivery_zone_id: selectedZone?.id || undefined,
  items:            toOrderItems(),
  payment_method:   payMethod,
  consent_given:    true,
}
```

### Update Place Order button to show total with fee
```javascript
// The button currently shows subtotal — update to total:
const total = subtotal + (selectedZone ? Number(selectedZone.price) : 0)

{submitting ? 'Placing Order...' : `Place Order — UGX ${total.toLocaleString()}`}
```

---

## 4 — Admin — DeliveryZonesPage + sidebar entry | 1 new file + 2 edits

### Zones pricing table in the current SpecialDaysPage layout (Mazing256 style)
Create `admin/src/pages/DeliveryZonesPage.jsx`. This follows the exact same pattern as SpecialDaysPage so it will fit naturally into the admin:

```javascript
import { useState, useEffect } from 'react'
import adminApi from '../services/adminApi'

export default function DeliveryZonesPage() {
  const [zones,   setZones]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)   // null | 'new' | zone-object
  const [form,    setForm]    = useState({ name: '', price: '', sort_order: '' })
  const [saving,  setSaving]  = useState(false)
  const [err,     setErr]     = useState(null)

  const load = () => {
    setLoading(true)
    adminApi.get('/admin/delivery-zones')
      .then(r => setZones(r.data.zones || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openNew = () => {
    setForm({ name: '', price: '', sort_order: zones.length + 1 })
    setErr(null)
    setModal('new')
  }
  const openEdit = (z) => {
    setForm({ name: z.name, price: z.price, sort_order: z.sort_order })
    setErr(null)
    setModal(z)
  }

  const save = async () => {
    if (!form.name.trim() || !form.price) { setErr('Name and price are required.'); return }
    setSaving(true); setErr(null)
    try {
      if (modal === 'new') {
        await adminApi.post('/admin/delivery-zones', {
          name: form.name.trim(),
          price: parseFloat(form.price),
          sort_order: parseInt(form.sort_order) || 99,
        })
      } else {
        await adminApi.put(`/admin/delivery-zones/${modal.id}`, {
          name: form.name.trim(),
          price: parseFloat(form.price),
          sort_order: parseInt(form.sort_order) || modal.sort_order,
        })
      }
      load(); setModal(null)
    } catch (e) { setErr(e.response?.data?.error || 'Failed.') }
    finally { setSaving(false) }
  }

  const toggle = async (z) => {
    try {
      await adminApi.put(`/admin/delivery-zones/${z.id}`, { is_active: !z.is_active })
      load()
    } catch {}
  }

  const del = async (z) => {
    if (!confirm(`Delete zone "${z.name}"? This cannot be undone.`)) return
    try { await adminApi.delete(`/admin/delivery-zones/${z.id}`); load() } catch {}
  }

  const inputSty = {
    background: '#1A0A00', border: '1px solid rgba(184,117,42,0.2)',
    color: '#F2EAD8', fontSize: '13px', padding: '9px 13px',
    width: '100%', outline: 'none',
  }

  return (
    <div className="space-y-5 max-w-[760px]">
      <div className="flex items-center justify-between">
        <p className="text-sm leading-relaxed" style={{ color: '#8C7355' }}>
          Set delivery fees per area. Customers select their zone at checkout —
          the fee is added to their order total automatically.
        </p>
        <button onClick={openNew}
          className="px-4 py-2 font-bold text-[11px] tracking-wider uppercase ml-4 flex-shrink-0"
          style={{ background: '#B8752A', color: '#1A0A00' }}>
          + Add Zone
        </button>
      </div>

      <div style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.2)', overflow: 'hidden' }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-10 rounded" style={{ background: '#3D2000' }} />
            ))}
          </div>
        ) : zones.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm" style={{ color: '#8C7355' }}>No zones configured.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(61,32,0,0.8)' }}>
                {['#', 'Zone Name', 'Delivery Fee (UGX)', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[9px] font-semibold uppercase
                    tracking-wider" style={{ color: '#8C7355' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zones.map(z => (
                <tr key={z.id} style={{ borderBottom: '1px solid rgba(61,32,0,0.4)' }}>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: '#8C7355' }}>
                    {z.sort_order}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#F2EAD8' }}>{z.name}</td>
                  <td className="px-4 py-3 text-xs font-bold" style={{ color: '#B8752A' }}>
                    {Number(z.price).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(z)}
                      className="text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider"
                      style={z.is_active
                        ? { color: '#4ade80', background: 'rgba(74,222,128,0.1)' }
                        : { color: '#8C7355', background: 'rgba(140,115,85,0.1)' }}>
                      {z.is_active ? '● Active' : '○ Off'}
                    </button>
                  </td>
                  <td className="px-4 py-3 flex gap-3">
                    <button onClick={() => openEdit(z)}
                      className="text-[10px] hover:underline" style={{ color: '#B8752A' }}>Edit</button>
                    <button onClick={() => del(z)}
                      className="text-[10px] hover:underline" style={{ color: '#f87171' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm mx-4 p-6"
            style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.3)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-5"
              style={{ color: '#8C7355' }}>
              {modal === 'new' ? 'Add Zone' : 'Edit Zone'}
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5"
                  style={{ color: '#8C7355' }}>Zone Name</p>
                <input style={inputSty} value={form.name}
                  onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  placeholder="e.g. Kololo / Naguru / Ntinda" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5"
                  style={{ color: '#8C7355' }}>Delivery Fee (UGX)</p>
                <input type="number" style={inputSty} value={form.price}
                  onChange={e => setForm(f => ({...f, price: e.target.value}))}
                  placeholder="5000" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5"
                  style={{ color: '#8C7355' }}>Sort Order (display position)</p>
                <input type="number" style={inputSty} value={form.sort_order}
                  onChange={e => setForm(f => ({...f, sort_order: e.target.value}))}
                  placeholder="1" />
              </div>
            </div>
            {err && <p className="text-red-400 text-xs mt-3">{err}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)}
                className="text-sm hover:opacity-60" style={{ color: '#8C7355' }}>Cancel</button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 font-bold text-[11px] tracking-wider uppercase disabled:opacity-50"
                style={{ background: '#B8752A', color: '#1A0A00' }}>
                {saving ? 'Saving…' : 'Save Zone'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

### Add to admin App.jsx
```jsx
import DeliveryZonesPage from './pages/DeliveryZonesPage'

<Route path="/delivery-zones" element={<DeliveryZonesPage />} />
```

### Add to admin Sidebar NAV array
In `admin/src/components/layout/Sidebar.jsx`, add one entry to the NAV array:
```javascript
{ to: '/delivery-zones', label: 'Delivery Zones', icon: '🗺' },
```

After the icon upgrade in Phase 5, this will use a proper Lucide icon instead.

---

## 5 — Icons — upgrade to Lucide React | Both admin + frontend

### Why Lucide React
Lucide is open source (ISC license), ships 1,600+ crisp SVG icons, has zero runtime dependencies, supports any size/colour via props, tree-shakes perfectly (only the icons you import are bundled), and is the standard in React ecosystems — used by shadcn/ui, Vercel, Linear, and many others. Each icon is a React component returning an SVG. Version 1.14 is current as of April 2026.

### Install in both apps
```
# In admin folder:
cd admin && npm install lucide-react

# In frontend folder:
cd ../frontend && npm install lucide-react
```

### Icon mapping — current vs new

| Old | New Component | Label |
|---|---|---|
| ▦ | LayoutDashboard | Dashboard |
| 📦 | ShoppingBag | Orders |
| 🍪 | Package | Products |
| 💬 | MessageSquare | Messages |
| 🃏 | CreditCard | Loyalty Cards |
| ✉ | Mail | Newsletter |
| ⭐ | CalendarHeart | Special Days |
| 🗺 | MapPin | Delivery Zones |
| 🚪 | LogOut | Sign Out |
| ✕ x | X | Close |
| ★ | Star | Rating / default |
| ☰ | Menu | Hamburger |

Other icons needed in the admin: `LogOut` for sign out, `X` for close buttons, `BarChart3` for Analytics, `Star` for Reviews.

### Replace Sidebar.jsx — full updated NAV array
```javascript
import {
  LayoutDashboard, ShoppingBag, Package, MessageSquare,
  CreditCard, Mail, CalendarHeart, MapPin, LogOut, X, BarChart3, Star
} from 'lucide-react'

// Replace the NAV array:
const NAV = [
  { to: '/dashboard',      label: 'Dashboard',      Icon: LayoutDashboard },
  { to: '/orders',         label: 'Orders',          Icon: ShoppingBag     },
  { to: '/products',       label: 'Products',        Icon: Package         },
  { to: '/messages',       label: 'Messages',        Icon: MessageSquare   },
  { to: '/loyalty',        label: 'Loyalty Cards',   Icon: CreditCard      },
  { to: '/newsletter',     label: 'Newsletter',      Icon: Mail            },
  { to: '/special-days',   label: 'Special Days',    Icon: CalendarHeart   },
  { to: '/delivery-zones', label: 'Delivery Zones',  Icon: MapPin          },
]
```

### Update icon rendering inside Sidebar NavLink
The current sidebar renders `{item.icon}` as a string. Replace the NavLink body with:
```jsx
// In the NavLink return, replace the icon span:
<NavLink ...>
  <item.Icon size={16} strokeWidth={1.5} className="flex-shrink-0" />
  <span className="flex-1 truncate">{item.label}</span>
  {badge && (
    <span ...>{badge > 9 ? '9+' : badge}</span>
  )}
</NavLink>
```

### Replace close (✕) and logout buttons in AdminLayout.jsx and Sidebar.jsx
```javascript
import { LogOut, X } from 'lucide-react'

// Close button (mobile drawer):
<button onClick={onClose} className="ml-auto lg:hidden" ...>
  <X size={18} strokeWidth={1.5} />
</button>

// Logout button:
<button onClick={handleLogout} ...>
  <LogOut size={15} strokeWidth={1.5} />
  <span>Sign Out</span>
</button>
```

### Lucide usage pattern — size and colour
```javascript
// Size is set via the size prop (number = px):
<LayoutDashboard size={16} />

// Colour follows the current text colour by default (currentColor).
// To override, pass a style or className:
<MapPin size={16} style={{ color: '#B8752A' }} />
<Mail    size={16} className="text-primary" />

// Stroke weight (default is 2 — slightly heavier than the HAIQ aesthetic):
// Use strokeWidth={1.5} throughout the admin for a refined look.
<ShoppingBag size={16} strokeWidth={1.5} />
```

---

## 6 — Zones reference table — default seed values | Changeable anytime in admin

| # | Zone name | Fee (UGX) | Basis |
|---|---|---|---|
| 1 | Muyenga / Bukasa / Kabalagala | 3,000 | HAIQ home base |
| 2 | Ggaba / Buziga / Munyonyo | 4,000 | Adjacent |
| 3 | Makindye / Kibuye / Kansanga | 4,000 | Adjacent |
| 4 | Kampala CBD / City Centre | 5,000 | Central Kampala |
| 5 | Kololo / Naguru / Ntinda | 5,000 | Central Kampala |
| 6 | Nakawa / Bugolobi / Luzira | 5,000 | East Kampala |
| 7 | Naalya / Kyaliwajjala / Kira | 8,000 | North-east |
| 8 | Namugongo / Kiwatule / Kireka | 8,000 | North-east |
| 9 | Wakiso / Gayaza / Matugga | 10,000 | Greater Kampala |
| 10 | Entebbe / Entebbe Road | 12,000 | South |
| 11 | Outside Kampala (flat rate) | 15,000 | Nationwide |

All prices editable at any time via Admin → Delivery Zones. No code changes needed.

---

## Summary of Changes

**Total changes:** 2 new backend files · 2 backend route edits · 1 controller edit · 1 schema edit · 1 migration · CheckoutPage.jsx · 1 new admin page · Sidebar.jsx · npm install lucide-react ×2

### Files Created
- `backend/src/db/migrations/011_delivery_zones.sql`
- `backend/src/routes/deliveryzones.routes.js`
- `backend/src/routes/admin/admin.deliveryzones.routes.js`
- `admin/src/pages/DeliveryZonesPage.jsx`

### Files Modified
- `backend/src/routes/index.js` — add public delivery-zones route
- `backend/src/routes/admin/index.js` — add admin delivery-zones route
- `backend/src/controllers/orders.controller.js` — accept delivery_zone_id, resolve fee
- `frontend/src/pages/CheckoutPage.jsx` — zone dropdown + live fee display
- `admin/src/App.jsx` — add DeliveryZonesPage route
- `admin/src/components/layout/Sidebar.jsx` — add nav entry + Lucide icons
- `admin/src/components/layout/AdminLayout.jsx` — Lucide icons for close/logout

### Packages Installed
- `lucide-react` in admin/
- `lucide-react` in frontend/

---

## Testing Checklist

### Frontend
- [ ] Zone dropdown loads and displays zones
- [ ] Price shows inline with zone name
- [ ] Selecting zone updates delivery fee in summary
- [ ] Total recalculates correctly
- [ ] Specific address field appears after zone selection
- [ ] Form validation requires zone selection
- [ ] Mobile responsive design works

### Backend
- [ ] GET /delivery-zones returns active zones only
- [ ] POST /orders with valid zone_id succeeds
- [ ] POST /orders with invalid zone_id fails
- [ ] Delivery fee calculated from DB, not client
- [ ] delivery_address combines zone + specific address
- [ ] delivery_zone_name saved as snapshot

### Admin Panel
- [ ] Can add new zone
- [ ] Can edit zone name, price, sort_order
- [ ] Can toggle zone active status
- [ ] Can delete zone (with confirmation)
- [ ] Zone list sorted by sort_order
- [ ] Active/inactive status visible

### Database
- [ ] delivery_zones table created
- [ ] Initial zones seeded (11 Kampala zones)
- [ ] orders table has new columns
- [ ] Foreign key constraint works
- [ ] Index on is_active exists

### Integration
- [ ] Order creation includes delivery fee
- [ ] Order total includes delivery
- [ ] Admin order view shows zone info
- [ ] Revenue reports separate delivery fees

### Icons
- [ ] Sidebar renders Lucide icons correctly
- [ ] No [object Object] text visible
- [ ] Close button shows X icon
- [ ] Logout button shows LogOut icon
- [ ] Icons render consistently across browsers

---

## Rollback Plan

If issues arise after deployment:

1. **Database Rollback**
   ```sql
   ALTER TABLE orders DROP COLUMN delivery_zone_id;
   ALTER TABLE orders DROP COLUMN delivery_zone_name;
   DROP TABLE delivery_zones;
   ```

2. **Code Rollback**
   - Revert frontend to previous checkout UI
   - Remove delivery zones API endpoints
   - Restore original order creation logic
   - Remove DeliveryZonesPage from admin
   - Revert Sidebar.jsx to emoji icons

3. **Package Rollback**
   ```bash
   cd admin && npm uninstall lucide-react
   cd ../frontend && npm uninstall lucide-react
   ```

4. **Data Recovery**
   - Orders created during deployment will have delivery_fee populated
   - Can set back to 0 with: `UPDATE orders SET delivery_fee = 0 WHERE created_at > 'rollback_timestamp'`

---

## Deployment Steps

1. **Database Migration**
   ```bash
   # Option A: Run via Neon console
   # Paste migration SQL into Neon SQL editor
   
   # Option B: Run locally
   cd backend
   node src/db/migrate.js
   ```

2. **Backend Deployment**
   ```bash
   git add backend/
   git commit -m "add delivery zones API"
   git push origin main
   # Render auto-deploys
   ```

3. **Frontend Deployment**
   ```bash
   git add frontend/
   git commit -m "add delivery zones checkout UI"
   git push origin main
   # Vercel auto-deploys
   ```

4. **Admin Deployment**
   ```bash
   git add admin/
   git commit -m "add DeliveryZonesPage + Lucide icons"
   git push origin main
   # Vercel auto-deploys
   ```

5. **Verification**
   - Test checkout with zone selection
   - Verify admin panel zone management
   - Check order creation in database
   - Verify Lucide icons render correctly
