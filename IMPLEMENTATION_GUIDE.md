# HAIQ Implementation Guide

## Table of Contents
1. [Delivery Zones Implementation](#delivery-zones-implementation)
2. [Database Design](#database-design)
3. [Lucide React Integration](#lucide-react-integration)
4. [Security Considerations](#security-considerations)
5. [Testing Checklist](#testing-checklist)

---

## Delivery Zones Implementation

### Overview
The delivery zones feature replaces the previous free-text delivery address field with a structured zone-based system inspired by Mazing256's checkout experience. Customers select a predefined delivery zone (with price displayed inline), then provide a specific landmark or plot number.

### Key Design Decisions

**Why a Zone Dropdown?**
- **Single Selection:** One dropdown shows zone name + price inline — customer makes one choice and fee is immediately visible
- **Cleaner UX:** Far better than long radio lists or free-text fields that require post-order price negotiation
- **Admin Control:** Zones stored in database, prices editable from admin panel without code changes

**Two-Part Address Input**
1. **Zone Selection:** Dropdown that sets both selected zone and pre-fills `delivery_address` with zone name
2. **Specific Location:** Small field for landmark/plot number

This mirrors Mazing256's approach: pick the area first, then give precise location.

### Frontend Implementation

#### Checkout Page Structure
```jsx
// Checkout.jsx - Delivery Section
<div className="delivery-section">
  <label>Delivery Zone</label>
  <select 
    value={selectedZoneId} 
    onChange={(e) => handleZoneChange(e.target.value)}
  >
    <option value="">Select your zone</option>
    {zones.map(zone => (
      <option key={zone.id} value={zone.id}>
        {zone.name} — UGX {zone.price.toLocaleString()}
      </option>
    ))}
  </select>
  
  <label>Landmark / Plot Number</label>
  <input 
    type="text"
    value={landmark}
    onChange={(e) => setLandmark(e.target.value)}
    placeholder="e.g., Plot 42, Near Shoprite"
  />
</div>

// Order Summary - Updates Instantly
<div className="order-summary">
  <div className="line-item">
    <span>Subtotal</span>
    <span>UGX {subtotal.toLocaleString()}</span>
  </div>
  <div className="line-item">
    <span>Delivery Fee</span>
    <span>UGX {deliveryFee.toLocaleString()}</span>
  </div>
  <div className="line-item total">
    <span>Total</span>
    <span>UGX {total.toLocaleString()}</span>
  </div>
</div>
```

#### State Management
```jsx
const [selectedZoneId, setSelectedZoneId] = useState('')
const [landmark, setLandmark] = useState('')
const [zones, setZones] = useState([])

// Fetch zones on mount
useEffect(() => {
  fetch('/api/v1/delivery-zones')
    .then(res => res.json())
    .then(data => setZones(data.zones))
}, [])

// Calculate totals when zone changes
useEffect(() => {
  const zone = zones.find(z => z.id === selectedZoneId)
  const fee = zone ? zone.price : 0
  const total = subtotal + fee
  setDeliveryFee(fee)
  setTotal(total)
}, [selectedZoneId, subtotal, zones])
```

### Backend Implementation

#### API Endpoint
```javascript
// routes/delivery-zones.routes.js
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT id, name, price, is_active
      FROM delivery_zones
      WHERE is_active = true
      ORDER BY price ASC
    `)
    res.json({ success: true, zones: rows })
  } catch (err) {
    next(err)
  }
})
```

#### Order Submission with Zone
```javascript
// routes/orders.routes.js - POST /orders
const { zone_id, landmark, ...orderData } = req.body

// Look up zone and get authoritative price
const { rows: [zone] } = await query(
  `SELECT id, name, price FROM delivery_zones WHERE id = $1`,
  [zone_id]
)

if (!zone) {
  return res.status(400).json({ error: 'Invalid delivery zone' })
}

// Combine zone name + landmark for full address
const delivery_address = `${zone.name}${landmark ? ' - ' + landmark : ''}`

// Insert order with real delivery fee
const { rows: [order] } = await query(`
  INSERT INTO orders (
    user_id, subtotal, delivery_fee, total,
    delivery_zone_id, delivery_zone_name, delivery_address,
    ...
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, ...)
  RETURNING *
`, [
  orderData.user_id,
  orderData.subtotal,
  zone.price,  // Authoritative price from DB
  orderData.subtotal + zone.price,
  zone.id,
  zone.name,  // Snapshot for history
  delivery_address,
  ...
])
```

### Admin Panel Integration

#### Manage Delivery Zones
```jsx
// admin/src/pages/DeliveryZonesPage.jsx
function DeliveryZonesPage() {
  const [zones, setZones] = useState([])
  
  // Add/Edit Zone Modal
  const [editingZone, setEditingZone] = useState(null)
  
  const handleSave = async (zoneData) => {
    if (editingZone?.id) {
      await fetch(`/api/v1/admin/delivery-zones/${editingZone.id}`, {
        method: 'PUT',
        body: JSON.stringify(zoneData)
      })
    } else {
      await fetch('/api/v1/admin/delivery-zones', {
        method: 'POST',
        body: JSON.stringify(zoneData)
      })
    }
    fetchZones()
  }
  
  return (
    <div>
      <Button onClick={() => setEditingZone({})}>
        Add Zone
      </Button>
      
      <table>
        <thead>
          <tr>
            <th>Zone Name</th>
            <th>Price (UGX)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {zones.map(zone => (
            <tr key={zone.id}>
              <td>{zone.name}</td>
              <td>{zone.price.toLocaleString()}</td>
              <td>{zone.is_active ? 'Active' : 'Inactive'}</td>
              <td>
                <Button onClick={() => setEditingZone(zone)}>Edit</Button>
                <Button variant="danger" onClick={() => handleDelete(zone.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {editingZone && (
        <DeliveryZoneModal 
          zone={editingZone}
          onSave={handleSave}
          onClose={() => setEditingZone(null)}
        />
      )}
    </div>
  )
}
```

---

## Database Design

### New Table: `delivery_zones`

```sql
CREATE TABLE delivery_zones (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  price INTEGER NOT NULL CHECK (price >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_delivery_zones_active ON delivery_zones(is_active);

-- Initial zones (example)
INSERT INTO delivery_zones (name, price) VALUES
  ('Central Kampala', 15000),
  ('Nakawa - Mbuya', 12000),
  ('Makindye - Kansanga', 12000),
  ('Rubaga - Nateete', 15000),
  ('Kawempe - Kisaasi', 15000),
  ('Entebbe Road', 20000),
  ('Jinja Road', 20000),
  ('Northern Bypass', 25000);
```

### Modified Table: `orders`

```sql
ALTER TABLE orders 
ADD COLUMN delivery_zone_id INTEGER REFERENCES delivery_zones(id),
ADD COLUMN delivery_zone_name VARCHAR(100),
ADD COLUMN CONSTRAINT orders_delivery_fee_check 
  CHECK (delivery_fee >= 0);

-- Update existing orders (optional - sets to 0 for historical data)
UPDATE orders SET delivery_fee = 0 WHERE delivery_fee IS NULL;
ALTER TABLE orders ALTER COLUMN delivery_fee SET NOT NULL DEFAULT 0;
```

### Why These Design Choices?

**`delivery_zone_id` (Foreign Key)**
- Links to authoritative zone data
- Enables reporting by zone
- Allows zone name changes without breaking historical data

**`delivery_zone_name` (Snapshot)**
- Records what customer selected at purchase time
- Preserves history even if zone is renamed/deleted
- Important for dispute resolution

**`delivery_fee` Column (Finally Used)**
- Existed but was always 0 — now populated with real values
- Separates delivery cost from subtotal
- Enables accurate revenue reporting

**`is_active` Flag**
- Allows temporary zone deactivation without deletion
- Preserves historical order links
- Quick enable/disable for seasonal changes

---

## Lucide React Integration

### Why Lucide React?

**License & Cost**
- ISC licensed — free for commercial use
- No attribution required
- No usage restrictions

**Technical Advantages**
- **Tree-shaking:** Only imports icons you actually use
- **React Components:** Returns SVGs, no extra build steps
- **Consistent Rendering:** Identical across all OS/browsers
- **Scalable:** Single `strokeWidth` prop controls weight

**Aesthetic Fit for HAIQ**
- `strokeWidth={1.5}` gives refined, lightweight appearance
- Matches editorial aesthetic better than emoji/Unicode
- Professional, modern look

**Current Issues Solved**
- Inconsistent emoji rendering across platforms
- Unicode characters (`▦`, `→`) vary by OS
- Unpredictable sizing and alignment
- No clear visual hierarchy

### Migration Plan

#### Install Package
```bash
npm install lucide-react
```

#### Replace Sidebar Icons
```jsx
// Before - admin/src/components/layout/Sidebar.jsx
<span className="icon">▦</span> {/* Box character */}
<span className="icon">🃏</span> {/* Playing card emoji */}
<span>→</span> {/* Unicode arrow */}

// After
import { Box, LayoutDashboard, Package, Users, Settings, ChevronRight } from 'lucide-react'

<Box className="icon" strokeWidth={1.5} />
<LayoutDashboard className="icon" strokeWidth={1.5} />
<Package className="icon" strokeWidth={1.5} />
<Users className="icon" strokeWidth={1.5} />
<Settings className="icon" strokeWidth={1.5} />
<ChevronRight className="icon" strokeWidth={1.5} />
```

#### Common Icon Mappings
| Current | Lucide React |
|---------|--------------|
| ▦ (box) | `Box` |
| 🃏 (card) | `LayoutDashboard` |
| → (arrow) | `ChevronRight` |
| ✏️ (edit) | `Pencil` |
| 🗑️ (delete) | `Trash2` |
| 👤 (user) | `User` |
| 📦 (product) | `Package` |
| 📋 (orders) | `ClipboardList` |
| ⚙️ (settings) | `Settings` |
| 🔒 (lock) | `Lock` |
| 🔓 (unlock) | `Unlock` |
| 📧 (email) | `Mail` |
| 📞 (phone) | `Phone` |

#### Styling Guidelines
```css
.icon {
  width: 20px;
  height: 20px;
  stroke: currentColor;
}
```

---

## Security Considerations

### Zone Price Validation
**Never Trust Client-Submitted Prices**
```javascript
// ❌ WRONG - trusts client
const total = req.body.subtotal + req.body.delivery_fee

// ✅ CORRECT - looks up authoritative price
const zone = await getZoneById(req.body.zone_id)
const total = req.body.subtotal + zone.price
```

### Input Sanitization
```javascript
// Landmark input - allow basic characters only
const landmark = req.body.landmark
  .replace(/[<>]/g, '') // Remove HTML tags
  .trim()
  .substring(0, 200)     // Max length
```

### Zone Existence Check
```javascript
// Always verify zone exists before using
const { rowCount } = await query(
  'SELECT id FROM delivery_zones WHERE id = $1',
  [zone_id]
)
if (rowCount === 0) {
  return res.status(400).json({ error: 'Invalid zone' })
}
```

---

## Testing Checklist

### Frontend
- [ ] Zone dropdown loads and displays zones
- [ ] Price shows inline with zone name
- [ ] Selecting zone updates delivery fee in summary
- [ ] Total recalculates correctly
- [ ] Landmark field accepts input
- [ ] Form validation requires zone selection
- [ ] Mobile responsive design works

### Backend
- [ ] GET /delivery-zones returns active zones only
- [ ] POST /orders with valid zone_id succeeds
- [ ] POST /orders with invalid zone_id fails
- [ ] Delivery fee calculated from DB, not client
- [ ] delivery_address combines zone + landmark
- [ ] delivery_zone_name saved as snapshot

### Admin Panel
- [ ] Can add new zone
- [ ] Can edit zone name and price
- [ ] Can deactivate zone (is_active = false)
- [ ] Can delete zone (with warning if used in orders)
- [ ] Zone list sorted by price
- [ ] Active/inactive status visible

### Database
- [ ] delivery_zones table created
- [ ] Initial zones seeded
- [ ] orders table has new columns
- [ ] Foreign key constraint works
- [ ] Index on is_active exists

### Integration
- [ ] Order creation includes delivery fee
- [ ] Order total includes delivery
- [ ] Admin order view shows zone info
- [ ] Revenue reports separate delivery fees

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
   - Remove delivery zones API endpoint
   - Restore original order creation logic

3. **Data Recovery**
   - Orders created during deployment will have delivery_fee populated
   - Can set back to 0 with: `UPDATE orders SET delivery_fee = 0 WHERE created_at > 'rollback_timestamp'`

---

## Deployment Steps

1. **Database Migration**
   ```bash
   psql $DATABASE_URL -f migrations/add-delivery-zones.sql
   ```

2. **Backend Deployment**
   - Push to GitHub
   - Render auto-deploys

3. **Frontend Deployment**
   - Push to GitHub
   - Vercel auto-deploys

4. **Verification**
   - Test checkout with zone selection
   - Verify admin panel zone management
   - Check order creation in database

---

## Support & Maintenance

### Adding New Zones
1. Access Admin Panel → Delivery Zones
2. Click "Add Zone"
3. Enter name and price
4. Save — immediately available in checkout

### Updating Zone Prices
1. Access Admin Panel → Delivery Zones
2. Click "Edit" on zone
3. Update price
4. Save — affects future orders only

### Disabling Zones
1. Access Admin Panel → Delivery Zones
2. Click "Edit" on zone
3. Toggle "Active" off
4. Save — zone hidden from checkout, historical orders preserved

---

## Contact

For questions or issues with this implementation:
- Backend API: Render dashboard
- Frontend: Vercel dashboard
- Database: Neon dashboard
