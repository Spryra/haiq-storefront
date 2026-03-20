# HAIQ Bakery — Full Project Specification (Phase 0)
**Reference:** lastcrumb.com | **Target:** `D:\Junior Reactive Projects\HAIQ` | **Locale:** Uganda (EAT, UTC+3)

---

## TABLE OF CONTENTS
1. [Reference Site Breakdown](#1-reference-site-breakdown)
2. [Project Scaffold](#2-project-scaffold)
3. [Database Schema (PostgreSQL)](#3-database-schema)
4. [API Design](#4-api-design)
5. [Auth & Security Plan](#5-auth--security-plan)
6. [Payment Integration Plan](#6-payment-integration-plan)
7. [Order Lifecycle & UX](#7-order-lifecycle--ux)
8. [Admin Dashboard Design](#8-admin-dashboard-design)
9. [Frontend UX Specifics](#9-frontend-ux-specifics)
10. [Persistence & Image Handling](#10-persistence--image-handling)
11. [Free Hosting Map](#11-free-hosting-map)
12. [CI/CD & Repo Setup](#12-cicd--repo-setup)
13. [Data Privacy & Compliance](#13-data-privacy--compliance)
14. [Testing & Quality Plan](#14-testing--quality-plan)
15. [PowerShell Scaffold Command](#15-powershell-scaffold-command)
16. [Implementation Phases & Timeline](#16-implementation-phases--timeline)
17. [Master Checklist](#17-master-checklist)

---

## 1. REFERENCE SITE BREAKDOWN

### 1.1 Overall Aesthetic
| Attribute | Last Crumb | HAIQ Adaptation |
|---|---|---|
| Color palette | Black (#0a0a0a), Off-white (#f5f0eb), Red accent (#c0392b) | Keep dark base; swap red → Ugandan gold/amber (#D4A017) |
| Typography | Serif display (editorial) + clean sans-serif body | Playfair Display (headings) + Inter (body) |
| Tone | Provocative, luxury, copywriter-heavy | Warm, bold, Ugandan pride with editorial flair |
| Layout | Full-bleed sections, horizontal carousels, sticky nav | Same layout model, mobile-first |
| Motion | Subtle scroll-triggered fades, image carousels | CSS transitions + Framer Motion lite |

### 1.2 Page Inventory
| Page | URL Pattern | Key Elements |
|---|---|---|
| Home | `/` | Promo banner, nav, hero video/image, Featured Collections (3 product cards), Brand Story (3-step), Core Collection carousel, CTA section, Newsletter, Footer |
| Shop / Collections | `/shop` | Product grid with filters (category, size, price), skeleton loading |
| Product Detail | `/products/:slug` | Image carousel, size selector, quantity, Add to Cart, cookie/item list accordion, tasting notes, related products |
| Build Your Own Box | `/build-your-own` | Step-by-step item picker, quantity selector, dynamic pricing |
| Cart (Drawer) | Slide-in panel | Line items, quantity edit, remove, subtotal, checkout CTA |
| Checkout | `/checkout` | Contact info, delivery address, payment method (MoMo / Airtel / Bank), order summary, gift note |
| Order Tracking | `/track/:token` | Public, tokenized; status timeline with themed names |
| Account | `/account` | Login / Register / Forgot Password |
| Account Dashboard | `/account/orders` | Order history list |
| Contact | `/contact` | Form + WhatsApp CTA |
| FAQ | `/faq` | Accordion component |
| Admin (separate origin) | `/admin/*` | Full dashboard (see §8) |

### 1.3 Component Inventory
```
Layout
  ├── PromoBanner          – dismissible top bar with offer text
  ├── Navbar               – logo + nav links + cart icon + account icon
  ├── MobileMenu           – full-screen slide-in menu
  └── Footer               – links, newsletter, copyright

Home
  ├── HeroSection          – full-bleed media + headline + CTA
  ├── FeaturedCollections  – horizontal scroll of 3 ProductCards (with image carousel)
  ├── BrandStory           – 3-column grid: Unboxing / Tasting / Enlightenment
  ├── CoreCollectionCarousel – horizontal drag-scroll of up to 12 ProductTeaser cards
  ├── TastingNotesDrawer   – slide-up panel triggered per product
  ├── CTASection           – full-bleed background image + headline + 2 buttons
  └── NewsletterSignup     – email input + submit

Product
  ├── ProductImageCarousel – main image + thumbnails strip
  ├── SizeSelector         – pill buttons
  ├── QuantityPicker       – +/- stepper
  ├── AddToCartButton      – with loading state
  ├── ItemListAccordion    – "What's in the box" expandable
  └── RelatedProducts      – 3-card row

Cart
  ├── CartDrawer           – slide-in panel
  ├── CartLineItem         – image + name + qty + price
  └── CartSummary          – subtotal + checkout CTA

Checkout
  ├── ContactForm          – name, email, phone
  ├── DeliveryForm         – address fields + delivery note
  ├── PaymentSelector      – MoMo / Airtel / Bank tabs
  ├── MoMoWidget           – phone number input + "Pay Now" + polling status
  ├── BankTransferWidget   – bank details + reference copy + upload proof
  └── OrderSummaryPanel    – readonly cart recap

Skeletons (CSS pulse animation, no JS)
  ├── ProductCardSkeleton
  ├── ProductDetailSkeleton
  ├── OrderListSkeleton
  └── TrackingTimelineSkeleton

Shared
  ├── Button               – variants: primary / ghost / danger
  ├── Badge                – variants: status colors
  ├── Modal
  ├── Toast / Snackbar
  ├── Spinner
  └── Accordion
```

### 1.4 Assets to Produce / Replace
- Logo SVG — placeholder `haiq-logo.svg`
- Hero image — `hero-bakery.webp` (1920×1080 placeholder)
- Product images — `product-[slug].webp` (800×800 per product, 12 minimum)
- Brand story images — 3× `story-[n].webp`
- OG image — `og-haiq.jpg` (1200×630)
- Favicon — `favicon.svg`

---

## 2. PROJECT SCAFFOLD

```
D:\Junior Reactive Projects\HAIQ\
├── .gitignore
├── .env.example                   ← root-level convenience copy
├── README.md
├── SPEC.md                        ← this document
│
├── frontend/                      ← React (Vite) customer-facing app
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── public/
│   │   ├── favicon.svg
│   │   └── og-haiq.jpg
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── assets/
│       │   ├── images/            ← static placeholder images
│       │   └── fonts/
│       ├── components/
│       │   ├── layout/
│       │   │   ├── PromoBanner.jsx
│       │   │   ├── Navbar.jsx
│       │   │   ├── MobileMenu.jsx
│       │   │   └── Footer.jsx
│       │   ├── home/
│       │   │   ├── HeroSection.jsx
│       │   │   ├── FeaturedCollections.jsx
│       │   │   ├── BrandStory.jsx
│       │   │   ├── CoreCollectionCarousel.jsx
│       │   │   ├── TastingNotesDrawer.jsx
│       │   │   └── CTASection.jsx
│       │   ├── product/
│       │   │   ├── ProductCard.jsx
│       │   │   ├── ProductCardSkeleton.jsx
│       │   │   ├── ProductImageCarousel.jsx
│       │   │   ├── SizeSelector.jsx
│       │   │   ├── QuantityPicker.jsx
│       │   │   ├── AddToCartButton.jsx
│       │   │   ├── ItemListAccordion.jsx
│       │   │   └── RelatedProducts.jsx
│       │   ├── cart/
│       │   │   ├── CartDrawer.jsx
│       │   │   ├── CartLineItem.jsx
│       │   │   └── CartSummary.jsx
│       │   ├── checkout/
│       │   │   ├── ContactForm.jsx
│       │   │   ├── DeliveryForm.jsx
│       │   │   ├── PaymentSelector.jsx
│       │   │   ├── MoMoWidget.jsx
│       │   │   ├── AirtelWidget.jsx
│       │   │   ├── BankTransferWidget.jsx
│       │   │   └── OrderSummaryPanel.jsx
│       │   ├── tracking/
│       │   │   ├── TrackingTimeline.jsx
│       │   │   └── TrackingTimelineSkeleton.jsx
│       │   └── shared/
│       │       ├── Button.jsx
│       │       ├── Badge.jsx
│       │       ├── Modal.jsx
│       │       ├── Toast.jsx
│       │       ├── Spinner.jsx
│       │       ├── Accordion.jsx
│       │       └── NewsletterSignup.jsx
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── ShopPage.jsx
│       │   ├── ProductDetailPage.jsx
│       │   ├── BuildYourBoxPage.jsx
│       │   ├── CartPage.jsx
│       │   ├── CheckoutPage.jsx
│       │   ├── OrderConfirmationPage.jsx
│       │   ├── TrackOrderPage.jsx
│       │   ├── AccountPage.jsx
│       │   ├── AccountOrdersPage.jsx
│       │   ├── ContactPage.jsx
│       │   └── FAQPage.jsx
│       ├── hooks/
│       │   ├── useCart.js
│       │   ├── useAuth.js
│       │   ├── useProducts.js
│       │   ├── useOrder.js
│       │   └── usePaymentPoller.js
│       ├── context/
│       │   ├── CartContext.jsx
│       │   └── AuthContext.jsx
│       ├── services/
│       │   └── api.js             ← Axios instance + interceptors
│       ├── store/
│       │   └── cartStore.js       ← Zustand store
│       └── utils/
│           ├── formatCurrency.js  ← UGX formatter
│           ├── formatDate.js      ← EAT-aware date
│           └── validators.js
│
├── backend/                       ← Node.js + Express API
│   ├── .env.example
│   ├── package.json
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
│       ├── server.js              ← entry point
│       ├── app.js                 ← Express app factory
│       ├── config/
│       │   ├── db.js              ← pg Pool setup
│       │   ├── logger.js          ← winston logger
│       │   └── constants.js
│       ├── middleware/
│       │   ├── auth.js            ← JWT verify
│       │   ├── adminAuth.js       ← JWT + role check
│       │   ├── rateLimiter.js     ← express-rate-limit
│       │   ├── validate.js        ← Zod schema validator
│       │   ├── errorHandler.js
│       │   └── requestLogger.js
│       ├── routes/
│       │   ├── index.js
│       │   ├── auth.routes.js
│       │   ├── products.routes.js
│       │   ├── orders.routes.js
│       │   ├── payments.routes.js
│       │   ├── tracking.routes.js
│       │   ├── messages.routes.js
│       │   ├── newsletter.routes.js
│       │   └── admin/
│       │       ├── admin.orders.routes.js
│       │       ├── admin.products.routes.js
│       │       ├── admin.messages.routes.js
│       │       ├── admin.analytics.routes.js
│       │       └── admin.auth.routes.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── products.controller.js
│       │   ├── orders.controller.js
│       │   ├── payments.controller.js
│       │   ├── tracking.controller.js
│       │   ├── messages.controller.js
│       │   └── admin/
│       │       ├── admin.orders.controller.js
│       │       ├── admin.products.controller.js
│       │       ├── admin.messages.controller.js
│       │       └── admin.analytics.controller.js
│       ├── services/
│       │   ├── mtn.service.js     ← MTN MoMo API wrapper
│       │   ├── airtel.service.js  ← Airtel Money API wrapper
│       │   ├── email.service.js   ← Nodemailer / Resend
│       │   └── payment.service.js ← orchestrator
│       ├── db/
│       │   ├── migrations/        ← numbered SQL files
│       │   │   ├── 001_initial_schema.sql
│       │   │   ├── 002_indexes.sql
│       │   │   └── 003_seed_products.sql
│       │   └── queries/           ← raw SQL query files
│       │       ├── products.sql
│       │       ├── orders.sql
│       │       └── payments.sql
│       └── utils/
│           ├── crypto.js          ← HMAC signing helpers
│           ├── idempotency.js
│           ├── tokenGenerator.js
│           └── ugxFormat.js
│
└── admin/                         ← Separate React (Vite) admin dashboard
    ├── .env.example
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── components/
        │   ├── layout/
        │   │   ├── AdminSidebar.jsx
        │   │   ├── AdminTopbar.jsx
        │   │   └── AdminLayout.jsx
        │   ├── orders/
        │   │   ├── OrdersTable.jsx
        │   │   ├── OrderRow.jsx
        │   │   ├── OrderDetailPanel.jsx
        │   │   ├── StatusUpdateModal.jsx
        │   │   └── OrderListSkeleton.jsx
        │   ├── products/
        │   │   ├── ProductsTable.jsx
        │   │   └── ProductForm.jsx
        │   ├── messages/
        │   │   ├── MessageThread.jsx
        │   │   └── MessageInput.jsx
        │   ├── analytics/
        │   │   ├── RevenueChart.jsx
        │   │   ├── OrderCountCard.jsx
        │   │   └── TopProductsTable.jsx
        │   └── shared/
        │       ├── Button.jsx
        │       ├── Badge.jsx
        │       ├── Modal.jsx
        │       └── Toast.jsx
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── OrdersPage.jsx
        │   ├── OrderDetailPage.jsx
        │   ├── ProductsPage.jsx
        │   ├── MessagesPage.jsx
        │   └── AnalyticsPage.jsx
        ├── hooks/
        │   ├── useAdminAuth.js
        │   ├── useOrders.js
        │   └── useMessages.js
        └── services/
            └── adminApi.js        ← Axios with admin JWT
```

---

## 3. DATABASE SCHEMA

### 3.1 Tables

#### `users`
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(320) UNIQUE NOT NULL,
  phone         VARCHAR(20),
  first_name    VARCHAR(100),
  last_name     VARCHAR(100),
  password_hash VARCHAR(255),            -- NULL for guest accounts
  is_guest      BOOLEAN DEFAULT false,
  guest_token   VARCHAR(64) UNIQUE,      -- link-to-account token
  email_verified BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_guest_token ON users(guest_token);
```

#### `admin_users`
```sql
CREATE TABLE admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(320) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(200),
  role          VARCHAR(50) DEFAULT 'staff', -- 'superadmin' | 'staff'
  is_active     BOOLEAN DEFAULT true,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

#### `categories`
```sql
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  sort_order  INT DEFAULT 0
);
```

#### `products`
```sql
CREATE TABLE products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           VARCHAR(200) UNIQUE NOT NULL,
  name           VARCHAR(200) NOT NULL,
  subtitle       VARCHAR(200),            -- e.g., "(Chocolate Chip)"
  description    TEXT,
  tasting_notes  TEXT,
  category_id    INT REFERENCES categories(id),
  base_price     NUMERIC(12,2) NOT NULL,  -- UGX
  is_active      BOOLEAN DEFAULT true,
  is_featured    BOOLEAN DEFAULT false,
  is_limited     BOOLEAN DEFAULT false,
  sort_order     INT DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active);
```

#### `product_variants`
```sql
CREATE TABLE product_variants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  label       VARCHAR(100) NOT NULL,      -- e.g., "6", "12", "Gift Box"
  price       NUMERIC(12,2) NOT NULL,     -- UGX
  stock_qty   INT DEFAULT 0,
  sku         VARCHAR(100) UNIQUE
);
```

#### `product_images`
```sql
CREATE TABLE product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,              -- Cloudinary / Supabase Storage URL
  alt_text    VARCHAR(300),
  sort_order  INT DEFAULT 0
);
```

#### `product_items`
```sql
-- "What's in the box" list items
CREATE TABLE product_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  label       VARCHAR(300) NOT NULL,      -- e.g., "5x Better Than S*x"
  sort_order  INT DEFAULT 0
);
```

#### `orders`
```sql
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    VARCHAR(20) UNIQUE NOT NULL,  -- HAIQ-YYYYMMDD-XXXX
  tracking_token  VARCHAR(64) UNIQUE NOT NULL,  -- public tracking token
  user_id         UUID REFERENCES users(id),    -- NULL for pure guest
  guest_email     VARCHAR(320),
  guest_phone     VARCHAR(20),
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  email           VARCHAR(320) NOT NULL,
  phone           VARCHAR(20) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_note   TEXT,
  gift_note       TEXT,
  subtotal        NUMERIC(12,2) NOT NULL,
  delivery_fee    NUMERIC(12,2) DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL,
  status          VARCHAR(50) DEFAULT 'pending',
  -- themed statuses (see §7):
  -- pending | freshly_kneaded | ovenbound | on_the_cart | en_route | delivered | cancelled
  payment_method  VARCHAR(50),   -- 'mtn_momo' | 'airtel' | 'bank_transfer'
  payment_status  VARCHAR(50) DEFAULT 'unpaid', -- 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded'
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_orders_tracking ON orders(tracking_token);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
```

#### `order_items`
```sql
CREATE TABLE order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id),
  variant_id      UUID REFERENCES product_variants(id),
  product_name    VARCHAR(200) NOT NULL,  -- snapshot at order time
  variant_label   VARCHAR(100),
  unit_price      NUMERIC(12,2) NOT NULL,
  quantity        INT NOT NULL,
  line_total      NUMERIC(12,2) NOT NULL
);
```

#### `payments`
```sql
CREATE TABLE payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID REFERENCES orders(id),
  payment_method    VARCHAR(50) NOT NULL,
  provider_ref      VARCHAR(255),    -- MTN/Airtel transaction ID
  internal_ref      VARCHAR(100) UNIQUE NOT NULL,  -- our idempotency key
  amount            NUMERIC(12,2) NOT NULL,
  currency          VARCHAR(10) DEFAULT 'UGX',
  status            VARCHAR(50) DEFAULT 'initiated',
  -- 'initiated' | 'pending' | 'successful' | 'failed' | 'cancelled'
  webhook_payload   JSONB,           -- raw provider callback stored verbatim
  signature_valid   BOOLEAN,
  payer_phone       VARCHAR(20),
  bank_proof_url    TEXT,            -- for bank transfers
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_internal_ref ON payments(internal_ref);
CREATE INDEX idx_payments_provider_ref ON payments(provider_ref);
```

#### `order_events`
```sql
CREATE TABLE order_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID REFERENCES orders(id) ON DELETE CASCADE,
  event_type   VARCHAR(100) NOT NULL,  -- 'status_change' | 'payment_received' | 'note_added' | etc.
  old_value    VARCHAR(200),
  new_value    VARCHAR(200),
  actor_type   VARCHAR(50),            -- 'customer' | 'admin' | 'system' | 'webhook'
  actor_id     UUID,
  note         TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_order_events_order ON order_events(order_id);
```

#### `messages`
```sql
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
  sender_type VARCHAR(50) NOT NULL,   -- 'customer' | 'admin'
  sender_id   UUID,
  body        TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_messages_order ON messages(order_id);
```

#### `newsletter_subscribers`
```sql
CREATE TABLE newsletter_subscribers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(320) UNIQUE NOT NULL,
  subscribed  BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### `request_logs`
```sql
CREATE TABLE request_logs (
  id           BIGSERIAL PRIMARY KEY,
  method       VARCHAR(10),
  path         VARCHAR(500),
  status_code  INT,
  duration_ms  INT,
  ip           VARCHAR(50),
  user_agent   VARCHAR(500),
  user_id      UUID,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_logs_created ON request_logs(created_at DESC);
```

#### `idempotency_keys`
```sql
CREATE TABLE idempotency_keys (
  key         VARCHAR(255) PRIMARY KEY,
  response    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. API DESIGN

**Base URL:** `https://api.haiq.ug/v1`  
**Content-Type:** `application/json`  
**Auth Header:** `Authorization: Bearer <jwt>`

### 4.1 Auth Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | None | Create customer account |
| POST | `/auth/login` | None | Login, returns JWT |
| POST | `/auth/logout` | Customer | Invalidate token (blacklist) |
| POST | `/auth/forgot-password` | None | Send reset email |
| POST | `/auth/reset-password` | None | Apply new password with token |
| POST | `/auth/verify-email` | None | Email verification token |
| POST | `/auth/guest-link` | None | Link guest order to account |

**POST /auth/register**
```json
// Request
{ "email": "jane@example.com", "password": "secure123", "first_name": "Jane", "last_name": "Doe", "phone": "+256701234567" }

// Response 201
{ "message": "Account created. Check email to verify.", "user": { "id": "uuid", "email": "jane@example.com" } }
```

### 4.2 Products Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products` | None | List all active products (with variants) |
| GET | `/products/:slug` | None | Single product detail |
| GET | `/products/featured` | None | Featured products (max 3) |
| GET | `/categories` | None | Category list |

**GET /products** — Query params: `?category=cakes&sort=price_asc&page=1&limit=12`
```json
// Response 200
{
  "products": [
    {
      "id": "uuid",
      "slug": "the-kampala-classic",
      "name": "The Kampala Classic",
      "subtitle": "(Chocolate Chip)",
      "base_price": 35000,
      "is_limited": false,
      "images": [{ "url": "https://cdn.../img.webp", "alt_text": "..." }],
      "variants": [
        { "id": "uuid", "label": "6-Pack", "price": 35000 },
        { "id": "uuid", "label": "12-Pack", "price": 65000 }
      ]
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 12
}
```

### 4.3 Orders Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/orders` | None (guest ok) | Create order |
| GET | `/orders/track/:token` | None | Public order tracking |
| GET | `/orders/:id` | Customer (owner) | Order detail |
| GET | `/orders` | Customer | Customer's order history |

**POST /orders**
```json
// Request
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "phone": "+256701234567",
  "delivery_address": "Plot 12, Kampala Road, Kampala",
  "delivery_note": "Call on arrival",
  "gift_note": "Happy Birthday!",
  "items": [
    { "product_id": "uuid", "variant_id": "uuid", "quantity": 1 }
  ],
  "payment_method": "mtn_momo"
}

// Response 201
{
  "order_id": "uuid",
  "order_number": "HAIQ-20240315-0042",
  "tracking_token": "tok_abc123xyz789",
  "total": 70000,
  "payment_intent": {
    "type": "mtn_momo",
    "internal_ref": "pay_uuid",
    "instructions": "A payment request has been sent to +256701234567"
  }
}
```

**GET /orders/track/:token**
```json
// Response 200
{
  "order_number": "HAIQ-20240315-0042",
  "status": "ovenbound",
  "status_label": "Ovenbound 🔥",
  "timeline": [
    { "status": "pending", "label": "Order Received", "timestamp": "2024-03-15T10:00:00Z", "done": true },
    { "status": "freshly_kneaded", "label": "Freshly Kneaded", "timestamp": "2024-03-15T10:05:00Z", "done": true },
    { "status": "ovenbound", "label": "Ovenbound 🔥", "timestamp": "2024-03-15T11:00:00Z", "done": true },
    { "status": "on_the_cart", "label": "On The Cart 🛒", "timestamp": null, "done": false },
    { "status": "en_route", "label": "En Route 🚴", "timestamp": null, "done": false },
    { "status": "delivered", "label": "Delivered Delight 🎉", "timestamp": null, "done": false }
  ],
  "estimated_delivery": "2024-03-15T16:00:00Z",
  "items_count": 2
}
```

### 4.4 Payments Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/payments/mtn/initiate` | None | Start MTN MoMo request-to-pay |
| GET | `/payments/mtn/status/:ref` | None | Poll payment status |
| POST | `/payments/mtn/webhook` | Signed | MTN callback |
| POST | `/payments/airtel/initiate` | None | Start Airtel Money payment |
| GET | `/payments/airtel/status/:ref` | None | Poll status |
| POST | `/payments/airtel/webhook` | Signed | Airtel callback |
| POST | `/payments/bank/upload-proof` | None | Upload bank transfer proof |
| POST | `/payments/bank/confirm` | Admin | Admin confirms bank payment |

### 4.5 Messages Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/messages` | None | Customer sends message (linked to order) |
| GET | `/messages/:order_id` | Customer (owner) | Get message thread |

### 4.6 Admin Routes (prefix `/admin`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/admin/auth/login` | None | Admin login |
| GET | `/admin/orders` | Admin | List orders with filters |
| GET | `/admin/orders/:id` | Admin | Order + items + payments + messages |
| PATCH | `/admin/orders/:id/status` | Admin | Update order status |
| POST | `/admin/orders/:id/messages` | Admin | Reply to customer |
| GET | `/admin/products` | Admin | All products |
| POST | `/admin/products` | Superadmin | Create product |
| PUT | `/admin/products/:id` | Superadmin | Update product |
| DELETE | `/admin/products/:id` | Superadmin | Soft-delete |
| GET | `/admin/analytics/summary` | Admin | Revenue, order counts, top products |
| PATCH | `/admin/payments/:id/confirm` | Admin | Confirm bank transfer |

**PATCH /admin/orders/:id/status**
```json
// Request
{ "status": "on_the_cart", "note": "Driver assigned: Okello Moses" }

// Response 200
{ "order_id": "uuid", "status": "on_the_cart", "updated_at": "2024-03-15T13:00:00Z" }
```

---

## 5. AUTH & SECURITY PLAN

### 5.1 Customer Auth
- **JWT** (HS256 minimum, RS256 preferred): `access_token` 15min TTL + `refresh_token` 7-day HttpOnly cookie
- Refresh endpoint: `POST /auth/refresh`
- Token blacklist: store invalidated JTIs in Redis (or PostgreSQL `revoked_tokens` table with TTL cleanup)
- **Guest ordering**: create a `users` row with `is_guest=true`, generate a unique `guest_token`, email it to the customer with a "claim your account" link
- Password: bcrypt with cost factor 12 minimum

### 5.2 Admin Auth
- Separate JWT secret (`ADMIN_JWT_SECRET`)
- Role field in payload: `{ "role": "staff" | "superadmin" }`
- Middleware `adminAuth.js`: verify signature → check `is_active` in DB → check role for sensitive operations
- Admin tokens: 8h TTL, no refresh — force re-login

### 5.3 Input Validation
- All request bodies validated with **Zod** schemas before reaching controllers
- SQL injection prevention: use parameterized queries (`pg` library `$1, $2` placeholders) — never string-interpolate user data
- File uploads: validate MIME type (magic bytes, not just extension), max 5MB, accept only `image/jpeg`, `image/png`, `image/webp`

### 5.4 Rate Limiting
| Endpoint category | Limit |
|---|---|
| Auth (login/register) | 10 req / 15 min per IP |
| Order creation | 5 req / 10 min per IP |
| Payment initiation | 3 req / 5 min per IP |
| General API | 100 req / min per IP |
| Webhook endpoints | IP allowlist only (provider IPs) |

### 5.5 Secrets & .env
- Never commit `.env` files — only `.env.example` with placeholder values
- Use `dotenv` in Node.js, loaded at startup only
- Secrets never sent to frontend: payment API keys, DB credentials, JWT secrets — backend-only
- CORS: whitelist only known frontend origins

---

## 6. PAYMENT INTEGRATION PLAN

### 6.1 MTN MoMo (Collections API)
**Flow (server-side):**
1. Frontend collects phone number → sends to `POST /payments/mtn/initiate`
2. Backend calls MTN MoMo Collections `POST /collection/v1_0/requesttopay` with:
   - `externalId` = our `internal_ref` (UUID, idempotency key)
   - `amount`, `currency: "UGX"`, `payer.partyIdType: "MSISDN"`, `payer.partyId`
   - Header: `X-Reference-Id` = same UUID
   - Header: `Authorization: Bearer <access_token>` — obtained via `POST /token/` with API user + key
3. Backend stores `payment` row with status `initiated`
4. Frontend polls `GET /payments/mtn/status/:ref` every 3s for up to 5 minutes
5. MTN sends webhook to `POST /payments/mtn/webhook`:
   - Verify `X-Callback-Signature` header (HMAC-SHA256 of body with callback secret)
   - Check `externalId` matches our `internal_ref` — prevent replay
   - Check timestamp within 5-minute window
   - Mark payment + order as paid
   - Emit SSE/WebSocket event to frontend

**Credentials flow (never to client):**
```
MTN_MOMO_BASE_URL       = https://sandbox.momodeveloper.mtn.com (dev) | https://proxy.momoapi.mtn.com (prod)
MTN_MOMO_SUBSCRIPTION_KEY
MTN_MOMO_API_USER       (provisioned via API)
MTN_MOMO_API_KEY
MTN_MOMO_CALLBACK_SECRET  (for webhook HMAC)
MTN_MOMO_ENVIRONMENT    = sandbox | production
```

### 6.2 Airtel Money (Uganda)
**Flow:**
1. Backend calls Airtel `POST /merchant/v2/payments/` with merchant ID, transaction ref, amount, subscriber MSISDN
2. Airtel sends OTP to customer's phone → customer approves
3. Airtel webhook → `POST /payments/airtel/webhook`
   - Verify RSA signature or HMAC depending on Airtel sandbox version
4. Backend updates payment/order status

**Credentials:**
```
AIRTEL_BASE_URL
AIRTEL_CLIENT_ID
AIRTEL_CLIENT_SECRET
AIRTEL_MERCHANT_ID
AIRTEL_PIN             (server-side only)
AIRTEL_WEBHOOK_SECRET
```

### 6.3 Bank Transfer (Manual Reconciliation)
1. Customer selects "Bank Transfer" at checkout
2. Backend returns bank details (account name, number, bank name) + unique reference code (`HAIQ-REF-XXXXX`)
3. Customer makes transfer, uploads proof image (JPEG/PNG ≤5MB)
4. `POST /payments/bank/upload-proof` stores image to Cloudinary, saves URL in `payments.bank_proof_url`
5. Admin reviews in dashboard → clicks "Confirm Payment" → `PATCH /admin/payments/:id/confirm`
6. Backend marks payment `successful`, order moves to `freshly_kneaded`

### 6.4 Anti-Fraud & Integrity
- **Idempotency**: store `internal_ref` in `idempotency_keys` table; if webhook arrives twice with same ref, return 200 but skip processing
- **Timestamp check**: reject webhooks with `created_at` outside ±5 minutes of server time
- **HMAC verification**: compute `HMAC-SHA256(rawBody, secret)`, compare with provider signature header — use `crypto.timingSafeEqual`
- **Amount verification**: compare webhook amount against stored `payments.amount` — reject if mismatch
- **IP allowlisting**: only accept webhook POSTs from known MTN/Airtel IP ranges (middleware check)
- **Audit trail**: all webhook payloads stored verbatim in `payments.webhook_payload` for dispute resolution

---

## 7. ORDER LIFECYCLE & UX

### 7.1 Themed Status Names
| Internal Status | Display Label | Emoji | Description |
|---|---|---|---|
| `pending` | Order Received | 📋 | Order created, payment not yet confirmed |
| `freshly_kneaded` | Freshly Kneaded | 🤲 | Payment confirmed, prep started |
| `ovenbound` | Ovenbound | 🔥 | Currently baking / being prepared |
| `on_the_cart` | On The Cart | 🛒 | Packaged, awaiting pickup/dispatch |
| `en_route` | En Route | 🚴 | Out for delivery |
| `delivered` | Delivered Delight | 🎉 | Delivered successfully |
| `cancelled` | Order Cancelled | ❌ | Cancelled by customer or admin |

### 7.2 Status Transition Rules
```
pending → freshly_kneaded   (triggered by: payment confirmed)
freshly_kneaded → ovenbound (triggered by: admin action)
ovenbound → on_the_cart     (triggered by: admin action)
on_the_cart → en_route      (triggered by: admin action)
en_route → delivered        (triggered by: admin action)
any → cancelled             (triggered by: admin or customer within 5 min of order)
```

### 7.3 Real-Time Updates
- **Strategy**: Server-Sent Events (SSE) — simpler than WebSocket, sufficient for one-way status push
- Endpoint: `GET /orders/stream/:tracking_token` — keeps connection open, sends `data:` events on status change
- Fallback: client polls `GET /orders/track/:token` every 30s if SSE fails
- SSE event format:
  ```
  event: status_update
  data: {"status":"en_route","label":"En Route 🚴","timestamp":"2024-03-15T14:00:00Z"}
  ```

### 7.4 Notifications
- **Email**: send on: order created, payment confirmed, each status change, delivered — via Resend (free tier: 3,000/month)
- **SMS**: optional future integration with Africa's Talking (Uganda) for delivery notifications

---

## 8. ADMIN DASHBOARD DESIGN

### 8.1 Deployment
- Separate Vite React app, deployed independently to Vercel (different subdomain: `admin.haiq.ug`)
- Calls the same backend API under `/admin/*` routes
- Protected by admin JWT stored in memory (not localStorage) + short TTL

### 8.2 Dashboard Pages

**Login** (`/`)
- Email + password form, no "create account" link
- On success: store JWT in memory + sessionStorage (cleared on tab close)

**Dashboard Overview** (`/dashboard`)
- Cards: Today's Revenue (UGX), New Orders Today, Pending Orders, Delivered Today
- Line chart: Revenue last 30 days (Recharts)
- Table: 5 most recent orders

**Orders** (`/orders`)
- Filterable table: status | payment_method | date range | search by name/email/order_number
- Columns: Order #, Customer, Items, Total, Payment, Status, Date, Actions
- Row click → Order Detail Panel (slide-in)
- Bulk status update (select multiple → change status)

**Order Detail Panel**
- Full order info: items, pricing, delivery address
- Status update dropdown + confirm button
- Payment section: payment method, status, provider ref, "Confirm Bank Payment" button
- Message thread (scrollable) + compose input
- Order event timeline (audit log)

**Products** (`/products`)
- Grid of all products with active/inactive toggle
- "Add Product" modal: name, slug, subtitle, description, tasting notes, category, variants, images (Cloudinary upload)
- Edit / Soft-delete

**Messages** (`/messages`)
- List of open message threads (grouped by order)
- Unread count badge
- Threaded view on click

**Analytics** (`/analytics`)
- Revenue by day/week/month
- Top 5 products by units sold
- Payment method breakdown (pie chart)
- Orders by status (bar chart)

### 8.3 RBAC
| Action | `staff` | `superadmin` |
|---|---|---|
| View orders | ✅ | ✅ |
| Update order status | ✅ | ✅ |
| Reply to messages | ✅ | ✅ |
| Confirm bank payment | ✅ | ✅ |
| Create/edit products | ❌ | ✅ |
| Delete products | ❌ | ✅ |
| View analytics | ✅ | ✅ |
| Manage admin users | ❌ | ✅ |

---

## 9. FRONTEND UX SPECIFICS

### 9.1 Routing (React Router v6)
```
/                        → HomePage
/shop                    → ShopPage
/shop/:category          → ShopPage (filtered)
/products/:slug          → ProductDetailPage
/build-your-own          → BuildYourBoxPage
/checkout                → CheckoutPage
/order-confirmation/:id  → OrderConfirmationPage
/track/:token            → TrackOrderPage
/account                 → AccountPage (login/register tabs)
/account/orders          → AccountOrdersPage
/contact                 → ContactPage
/faq                     → FAQPage
```

### 9.2 State Management
- **Cart**: Zustand store persisted to `sessionStorage` (not `localStorage` — clears on session end)
- **Auth**: React Context with JWT in memory variable + HttpOnly cookie for refresh token
- **UI state**: local component state (no Redux)

### 9.3 Skeleton Strategy
Every data-dependent component has a paired Skeleton:
- CSS animation: `@keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }`
- Background: `linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)`
- ProductCardSkeleton: 260×400px placeholder card
- TrackingTimelineSkeleton: 6 circle + line shimmer rows
- Show skeletons while `isLoading=true` from React Query

### 9.4 Image Strategy
- All product images loaded via `<img loading="lazy" decoding="async">`
- Low-quality placeholder (LQIP): 20px blurred inline base64 while full image loads
- Cloudinary URL transforms: `?w=800&f=webp&q=80` for product grids
- Fallback: `onerror` replaces with `/assets/images/placeholder-product.webp`

### 9.5 Responsive Breakpoints (Tailwind)
- `sm`: 640px — single-column product grid
- `md`: 768px — 2-column grid, cart drawer replaces cart page
- `lg`: 1024px — 3-column grid, side-by-side checkout
- `xl`: 1280px — 4-column grid, full nav visible

### 9.6 Mobile Money UX Flow
1. Checkout page: customer selects "MTN MoMo" or "Airtel Money"
2. Phone number pre-filled from contact form, editable
3. "Pay UGX XX,XXX" button → triggers `POST /payments/mtn/initiate`
4. Button transitions to spinner + "Waiting for approval on your phone..."
5. `usePaymentPoller` hook polls every 3s
6. On success: confetti animation + redirect to `/order-confirmation/:id`
7. On failure after 5 min: show retry button + bank transfer fallback option

---

## 10. PERSISTENCE & IMAGE HANDLING

### 10.1 Image Storage
**Recommended: Cloudinary (free tier)**
- Free: 25 credits/month (~25,000 transformations)
- Upload from admin dashboard via Cloudinary Upload Widget or signed upload API
- Store only the Cloudinary `public_id` in DB; construct full URLs at render time
- Transformation example: `https://res.cloudinary.com/haiq/image/upload/w_800,f_webp,q_80/products/kampala-classic.jpg`

**Alternative: Supabase Storage (free 1GB)**
- Use if already on Supabase for PostgreSQL (combined free tier)
- Public bucket for product images, private bucket for payment proofs

### 10.2 No Git LFS for Images
- Do NOT store binary assets in Git — use Cloudinary or Supabase Storage
- Seed product images use publicly accessible placeholder URLs in development

---

## 11. FREE HOSTING MAP

| Service | Platform | Free Tier Limits | Notes |
|---|---|---|---|
| **Frontend** (customer) | Vercel | Unlimited static deploys, 100GB bandwidth/month | Connect GitHub, auto-deploy on push |
| **Admin Frontend** | Vercel | Same | Separate Vercel project |
| **Backend API** | Render (free) | 750h/month, **spins down after 15min inactivity** | Add `/health` endpoint; frontend can pre-warm |
| **PostgreSQL** | Supabase (free) | 500MB storage, 2 projects, **paused after 1 week inactivity** | Or Railway: 1GB, $5 credit/month |
| **Image Storage** | Cloudinary (free) | 25 credits/month | Sufficient for early stage |
| **Email** | Resend (free) | 3,000 emails/month, 100/day | Best free transactional option |
| **Redis (optional)** | Upstash (free) | 10,000 req/day | For token blacklist; can use PG table instead |

### 11.1 Cold Start Mitigation
- Render free tier sleeps after inactivity. Solutions:
  1. Add a health-check ping from the frontend on app load: `fetch('/health')`
  2. Use a free cron service (cron-job.org) to ping `GET /health` every 10 minutes
  3. Show a "Waking up the bakery... 🥐" loading message if first response takes >3s

### 11.2 Connection Pooling
- Supabase free tier: max 60 direct connections
- Use **PgBouncer** (built into Supabase via the pooler connection string) — transaction mode
- Backend: max `pool.max = 10` in `db.js`

---

## 12. CI/CD & REPO SETUP

### 12.1 Repository Structure
```
GitHub repo: haiq-bakery (monorepo)
Branches:
  main         ← production-ready, protected
  develop      ← integration branch
  feat/*       ← feature branches
  fix/*        ← bugfix branches
```

### 12.2 .gitignore
```gitignore
# Environment
.env
.env.local
.env.*.local

# Dependencies
node_modules/
**/node_modules/

# Build outputs
dist/
build/
.vite/

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Test coverage
coverage/

# Uploads (use cloud storage)
uploads/
public/uploads/
```

### 12.3 .env.example (Backend)
```env
# Server
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@host:5432/haiq_db
DB_POOL_MAX=10

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_secret_here
ADMIN_JWT_SECRET=your_admin_jwt_secret_here
ADMIN_JWT_EXPIRES_IN=8h

# MTN MoMo
MTN_MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
MTN_MOMO_SUBSCRIPTION_KEY=
MTN_MOMO_API_USER=
MTN_MOMO_API_KEY=
MTN_MOMO_CALLBACK_URL=https://api.haiq.ug/v1/payments/mtn/webhook
MTN_MOMO_CALLBACK_SECRET=
MTN_MOMO_ENVIRONMENT=sandbox

# Airtel Money
AIRTEL_BASE_URL=https://openapi.airtel.africa
AIRTEL_CLIENT_ID=
AIRTEL_CLIENT_SECRET=
AIRTEL_MERCHANT_ID=
AIRTEL_WEBHOOK_SECRET=

# Bank Transfer
BANK_ACCOUNT_NAME=HAIQ Bakery Ltd
BANK_ACCOUNT_NUMBER=1234567890
BANK_NAME=Stanbic Bank Uganda
BANK_BRANCH=Kampala Branch

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=orders@haiq.ug

# Frontend
FRONTEND_URL=https://haiq.ug
ADMIN_URL=https://admin.haiq.ug

# Logging
LOG_LEVEL=info
LOG_TO_DB=true

# Timezone
TZ=Africa/Kampala
```

### 12.4 .env.example (Frontend)
```env
VITE_API_BASE_URL=http://localhost:3001/v1
VITE_APP_NAME=HAIQ Bakery
VITE_CLOUDINARY_CLOUD_NAME=
```

### 12.5 GitHub Actions (CI)
```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: '20' }
      - run: cd backend && npm ci && npm test
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd frontend && npm ci && npm run build
```

---

## 13. DATA PRIVACY & COMPLIANCE

### 13.1 Data Collected
- Customer PII: name, email, phone, delivery address
- Payment references: MTN/Airtel transaction IDs, bank proof images
- No full card numbers ever stored (not card-based)

### 13.2 Consent
- Checkout page: checkbox "I agree to HAIQ's Privacy Policy and consent to storing my data to fulfill this order" — required
- Newsletter: separate opt-in checkbox (unchecked by default)

### 13.3 Retention
- Order data: retained 5 years (Ugandan tax compliance)
- Payment webhook payloads: retained 2 years, then archived
- Request logs: retained 90 days, then purged (DB scheduled job)
- Guest accounts: purge after 12 months inactivity if email unverified

### 13.4 Security
- HTTPS only (enforced via hosting platforms)
- Bank proof images: stored in private Cloudinary/Supabase bucket, never publicly accessible by URL
- PII masked in logs: `logger.js` redacts `password`, `phone`, `email` fields

---

## 14. TESTING & QUALITY PLAN

### 14.1 Backend Testing (Jest + Supertest)
- **Unit tests**: service functions (payment HMAC verification, idempotency check, status transition validator)
- **Integration tests**: API endpoints with test DB (Docker Compose pg container)
  - `POST /orders` — happy path + validation errors
  - `POST /payments/mtn/webhook` — valid HMAC, invalid HMAC, replay attack, amount mismatch
  - `PATCH /admin/orders/:id/status` — valid transition, invalid transition, unauthorized
- **Contract tests**: Zod schemas validated against example payloads

### 14.2 Frontend Testing (Vitest + React Testing Library)
- **Component tests**: CartDrawer, MoMoWidget, TrackingTimeline, ProductCard
- **Hook tests**: `usePaymentPoller`, `useCart`
- **E2E** (Playwright — free): full order flow on staging

### 14.3 Tools
| Tool | Purpose |
|---|---|
| Jest | Backend unit + integration |
| Supertest | HTTP endpoint testing |
| Vitest | Frontend unit tests |
| React Testing Library | Component tests |
| Playwright | E2E browser tests |
| MSW (Mock Service Worker) | Frontend API mocking |

---

## 15. POWERSHELL SCAFFOLD COMMAND

Run this in PowerShell from any directory. It creates the full folder structure inside `D:\Junior Reactive Projects\HAIQ`. **No files are written yet** — only directories and empty placeholder files as specified. Code will be generated in later phases.

```powershell
# HAIQ Project Scaffold Creator
# Run from PowerShell as: .\scaffold-haiq.ps1

$root = "D:\Junior Reactive Projects\HAIQ"

$dirs = @(
  # Root
  "$root",
  # Frontend
  "$root\frontend\public",
  "$root\frontend\src\assets\images",
  "$root\frontend\src\assets\fonts",
  "$root\frontend\src\components\layout",
  "$root\frontend\src\components\home",
  "$root\frontend\src\components\product",
  "$root\frontend\src\components\cart",
  "$root\frontend\src\components\checkout",
  "$root\frontend\src\components\tracking",
  "$root\frontend\src\components\shared",
  "$root\frontend\src\pages",
  "$root\frontend\src\hooks",
  "$root\frontend\src\context",
  "$root\frontend\src\services",
  "$root\frontend\src\store",
  "$root\frontend\src\utils",
  # Backend
  "$root\backend\src\config",
  "$root\backend\src\middleware",
  "$root\backend\src\routes\admin",
  "$root\backend\src\controllers\admin",
  "$root\backend\src\services",
  "$root\backend\src\db\migrations",
  "$root\backend\src\db\queries",
  "$root\backend\src\utils",
  # Admin
  "$root\admin\src\components\layout",
  "$root\admin\src\components\orders",
  "$root\admin\src\components\products",
  "$root\admin\src\components\messages",
  "$root\admin\src\components\analytics",
  "$root\admin\src\components\shared",
  "$root\admin\src\pages",
  "$root\admin\src\hooks",
  "$root\admin\src\services",
  # GitHub Actions
  "$root\.github\workflows"
)

foreach ($d in $dirs) {
  New-Item -ItemType Directory -Force -Path $d | Out-Null
}

# Create placeholder files
$files = @(
  "$root\.gitignore",
  "$root\.env.example",
  "$root\README.md",
  "$root\SPEC.md",
  "$root\frontend\.env.example",
  "$root\frontend\index.html",
  "$root\frontend\vite.config.js",
  "$root\frontend\tailwind.config.js",
  "$root\frontend\postcss.config.js",
  "$root\frontend\package.json",
  "$root\frontend\src\main.jsx",
  "$root\frontend\src\App.jsx",
  "$root\frontend\src\index.css",
  "$root\backend\.env.example",
  "$root\backend\package.json",
  "$root\backend\Dockerfile",
  "$root\backend\.dockerignore",
  "$root\backend\src\server.js",
  "$root\backend\src\app.js",
  "$root\backend\src\db\migrations\001_initial_schema.sql",
  "$root\backend\src\db\migrations\002_indexes.sql",
  "$root\backend\src\db\migrations\003_seed_products.sql",
  "$root\admin\.env.example",
  "$root\admin\package.json",
  "$root\admin\index.html",
  "$root\admin\vite.config.js",
  "$root\admin\tailwind.config.js",
  "$root\admin\src\main.jsx",
  "$root\admin\src\App.jsx",
  "$root\admin\src\index.css",
  "$root\.github\workflows\ci.yml"
)

foreach ($f in $files) {
  if (-not (Test-Path $f)) {
    New-Item -ItemType File -Force -Path $f | Out-Null
  }
}

Write-Host "✅ HAIQ scaffold created at $root" -ForegroundColor Green
Write-Host "📁 $(($dirs).Count) directories created" -ForegroundColor Cyan
Write-Host "📄 $(($files).Count) placeholder files created" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. cd '$root'"
Write-Host "  2. Copy .env.example -> .env in each package"
Write-Host "  3. Say 'go' to Claude to generate all source code"
```

**Save as** `scaffold-haiq.ps1` anywhere, then run:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scaffold-haiq.ps1
```

---

## 16. IMPLEMENTATION PHASES & TIMELINE

| Phase | Deliverable | Est. Duration |
|---|---|---|
| **Phase 0** | This spec document | ✅ Done |
| **Phase 1** | Repo scaffold + DB migrations + .env templates | 1 day |
| **Phase 2** | Frontend: all pages + components + skeletons + Tailwind | 3–4 days |
| **Phase 3** | Backend: all API endpoints + pg integration + auth | 3–4 days |
| **Phase 4** | Payment integration (MTN + Airtel + Bank) + security hardening | 2–3 days |
| **Phase 5** | Admin dashboard (full CRUD + messages + analytics) | 2–3 days |
| **Phase 6** | Testing, docs, deployment config, CI/CD | 1–2 days |

---

## 17. MASTER CHECKLIST

### Phase 0 — Spec
- [x] Reference site analyzed
- [x] Component inventory documented
- [x] Page flow mapped
- [x] DB schema designed
- [x] API endpoints specified
- [x] Auth & security plan written
- [x] Payment flow designed
- [x] Order lifecycle defined
- [x] Admin dashboard designed
- [x] Free hosting map created
- [x] PowerShell scaffold script written

### Phase 1 — Scaffold
- [ ] `frontend/` initialized with Vite + React + Tailwind
- [ ] `backend/` initialized with Express + pg + winston
- [ ] `admin/` initialized with Vite + React + Tailwind
- [ ] `.gitignore` written
- [ ] `.env.example` files written (frontend + backend + admin)
- [ ] DB migration files written (001, 002, 003)
- [ ] `README.md` written
- [ ] GitHub Actions CI workflow written

### Phase 2 — Frontend
- [ ] Tailwind theme configured (dark palette + Ugandan gold)
- [ ] Google Fonts (Playfair Display + Inter) integrated
- [ ] PromoBanner + Navbar + Footer
- [ ] HeroSection
- [ ] FeaturedCollections (3 product cards with carousel)
- [ ] BrandStory section
- [ ] CoreCollectionCarousel (horizontal scroll)
- [ ] TastingNotesDrawer
- [ ] CTASection
- [ ] NewsletterSignup
- [ ] ShopPage with product grid + filters
- [ ] ProductCard + ProductCardSkeleton
- [ ] ProductDetailPage with image carousel
- [ ] BuildYourBoxPage
- [ ] CartDrawer (Zustand-powered)
- [ ] CheckoutPage
- [ ] MoMoWidget + AirtelWidget + BankTransferWidget
- [ ] usePaymentPoller hook (3s polling + SSE)
- [ ] OrderConfirmationPage
- [ ] TrackOrderPage + TrackingTimeline + Skeleton
- [ ] AccountPage (login/register/forgot)
- [ ] AccountOrdersPage
- [ ] ContactPage + FAQPage
- [ ] UGX currency formatter
- [ ] EAT date formatter
- [ ] Responsive breakpoints tested (320px → 1440px)
- [ ] Lazy image loading + LQIP
- [ ] Skeleton loading on all async components

### Phase 3 — Backend
- [ ] Express app factory with CORS + Helmet + compression
- [ ] Request logger middleware
- [ ] Rate limiter configured
- [ ] Zod validation middleware
- [ ] Error handler middleware
- [ ] PostgreSQL connection pool
- [ ] Auth routes (register, login, logout, refresh, reset)
- [ ] Products routes + controllers
- [ ] Orders routes + controllers
- [ ] Tracking route (public, tokenized)
- [ ] Messages routes
- [ ] Newsletter route
- [ ] SSE endpoint for order status stream
- [ ] Admin auth routes + RBAC middleware
- [ ] Admin orders CRUD
- [ ] Admin products CRUD
- [ ] Admin messages
- [ ] Admin analytics queries
- [ ] Email service (Resend)
- [ ] Idempotency key middleware for payments

### Phase 4 — Payments
- [ ] MTN MoMo service (initiate + token refresh + status poll)
- [ ] MTN webhook handler (HMAC verify + idempotency + amount check)
- [ ] Airtel Money service (initiate + status poll)
- [ ] Airtel webhook handler
- [ ] Bank transfer flow (proof upload + admin confirm)
- [ ] HMAC helper with timing-safe compare
- [ ] Webhook IP allowlist middleware
- [ ] Payment event audit log
- [ ] `payments` DB table writes on every state change

### Phase 5 — Admin Dashboard
- [ ] Admin login page + JWT in memory
- [ ] Admin route guard (redirect to login if no token)
- [ ] Dashboard overview page (stats + recent orders)
- [ ] Orders table with filters
- [ ] Order detail panel (status update + messages + timeline)
- [ ] Bank payment confirm button
- [ ] Products management (create + edit + toggle)
- [ ] Cloudinary image upload in product form
- [ ] Messages inbox
- [ ] Analytics charts (Recharts)
- [ ] RBAC: superadmin-only actions hidden from staff

### Phase 6 — Testing & Deploy
- [ ] Jest unit tests: payment HMAC, idempotency, status transitions
- [ ] Supertest integration tests: order creation, webhook handling, admin auth
- [ ] Vitest component tests: CartDrawer, MoMoWidget, TrackingTimeline
- [ ] Playwright E2E: full checkout flow (sandbox)
- [ ] `Dockerfile` for backend (Render deploy)
- [ ] Vercel `vercel.json` for frontend routing
- [ ] Supabase DB provisioned + migrations run
- [ ] Cloudinary account + unsigned upload preset
- [ ] Resend account + domain verified
- [ ] MTN MoMo sandbox credentials provisioned
- [ ] Airtel sandbox credentials provisioned
- [ ] Production `.env` populated
- [ ] Health check endpoint (`GET /health`)
- [ ] Cron ping configured (cron-job.org → `/health` every 10min)
- [ ] Final README with setup instructions

---

*HAIQ Spec v1.0 — Generated March 2026*  
*Reference: lastcrumb.com | Target: D:\Junior Reactive Projects\HAIQ | Locale: Uganda EAT (UTC+3)*
