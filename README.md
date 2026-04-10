# HAIQ - Premium Cookie E-Commerce Platform

> Uganda's boldest cookie box. Build Your Box, order online, delivered fresh to your door.

**Status**: 🟢 Production Live | 🚧 Feature Development In Progress

---

## 📋 Project Overview

HAIQ is a full-stack e-commerce platform specializing in premium handcrafted cookies with:
- **Frontend**: React/Vite customer storefront (Vercel)
- **Admin Dashboard**: React/Vite admin interface (Vercel)
- **Backend**: Node.js Express API (Render)
- **Database**: PostgreSQL on Neon
- **Payment**: Multi-method integration (COD ✅, MTN Momo, Airtel Money, Bank Transfer)

### Key Features
- ✅ Premium product catalog with variants
- ✅ Build Your Box - custom 4-cookie selection
- ✅ Special day pricing (UGX 40,000 vs 80,000)
- ✅ Order management and tracking
- ✅ Cash on Delivery auto-payment workflow
- ✅ Admin dashboard with analytics
- ✅ Loyalty system
- ✅ Newsletter management

---

## 🎯 Current Status (April 10, 2026)

### ✅ Completed & Live
| Feature | Status | Notes |
|---------|--------|-------|
| Order Status System | ✅ | Reduced from 7→4 statuses: pending, en_route, delivered, cancelled |
| Product Catalog | ✅ | 6 premium cookies + Build Your Box option |
| "4 Of" Product Labels | ✅ | Category labels render correctly on product cards |
| Box Office Pricing | ✅ | Special day: UGX 40k, Regular: UGX 80k |
| Build Your Box Display | ✅ | Price dynamically reflects special day status |
| COD Payment Workflow | ✅ | Auto-marks as 'paid' when status → 'delivered' |
| Revenue Analytics | ✅ | Dashboard reflects paid orders |
| Button Consistency | ✅ | Checkout button using shared Button component |
| Legacy Wording Cleanup | ✅ | "The Unboxing" → "Build Your Box" throughout |

### 🚧 In Progress
- **Payment System Research**: MTN Momo & Airtel Money APIs documented
- **Bank Transfer Implementation**: Proof upload ready for development

### 🔄 Next Priorities
1. MTN Momo API integration (sandbox testing)
2. Airtel Money API integration
3. Bank Transfer proof upload UI
4. Payment reconciliation automation

---

## 🏗️ Architecture

### Frontend (Vercel)
```
frontend/
├── src/
│   ├── components/
│   │   ├── product/      (ProductCard, AddToCartButton, etc.)
│   │   ├── cart/         (CartDrawer, CartSummary)
│   │   ├── layout/       (Navigation, Footer)
│   │   └── shared/       (Button, Crown, SEO)
│   ├── pages/
│   │   ├── ShopPage.jsx
│   │   ├── BuildYourBoxPage.jsx      (✅ Fixed - dynamic pricing)
│   │   ├── CheckoutPage.jsx
│   │   ├── FAQPage.jsx               (✅ Updated - no "Unboxing")
│   │   └── ...
│   ├── context/          (CartContext, AuthContext)
│   ├── hooks/
│   ├── services/         (api.js)
│   └── utils/
└── vite.config.js
```

### Admin Dashboard (Vercel)
```
admin/
├── src/
│   ├── pages/
│   │   ├── OrdersPage.jsx            (✅ 4-status dropdown)
│   │   ├── SpecialDaysPage.jsx       (✅ Updated copy)
│   │   ├── NewsletterPage.jsx        (✅ Updated placeholder)
│   │   └── ...
│   └── components/
└── vite.config.js
```

### Backend (Render)
```
backend/
├── src/
│   ├── controllers/
│   │   ├── payments.controller.js      (Request routing)
│   │   ├── admin/
│   │   │   ├── admin.orders.controller.js  (✅ COD auto-payment logic)
│   │   │   └── ...
│   │   └── ...
│   ├── services/
│   │   └── payments.service.js       (Simulation mode - ready for provider integration)
│   ├── routes/
│   │   └── payments.routes.js        (POST /initiate, /confirm)
│   ├── db/
│   │   └── migrations/               (11 migrations, latest: order status update)
│   ├── utils/
│   │   ├── crypto.js                 (Webhook signature verification)
│   │   └── tokenGenerator.js
│   └── config/
│       ├── logger.js
│       ├── constants.js              (ORDER_STATUSES - 4 values)
│       └── db.js
├── Dockerfile                         (Multi-stage build)
├── package.json
└── server.js                          (Main entrypoint)
```

### Database (PostgreSQL/Neon)
**Tables**: 20+ tables including orders, payments, products, admin_users, loyalty, newsletter, etc.

---

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://[user]:[pass]@[host]/[dbname]
JWT_SECRET=[your-jwt-secret]
ADMIN_JWT_SECRET=[your-admin-jwt-secret]
JWT_REFRESH_SECRET=[your-refresh-secret]

# MTN Momo (Not yet live)
MTN_MOMO_API_KEY=
MTN_MOMO_SUBSCRIPTION_KEY=
MTN_MOMO_CALLBACK_SECRET=
MTN_MOMO_CALLBACK_URL=https://haiq-api.onrender.com/v1/payments/webhook/mtn

# Airtel Money (Not yet live)
AIRTEL_API_KEY=
AIRTEL_MERCHANT_ID=
AIRTEL_CALLBACK_SECRET=
AIRTEL_CALLBACK_URL=https://haiq-api.onrender.com/v1/payments/webhook/airtel

# Cloudinary (for image upload)
CLOUDINARY_cloud_name=
CLOUDINARY_api_key=
CLOUDINARY_api_secret=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

NODE_ENV=production
LOG_LEVEL=info
```

### Frontend (.env)
```env
VITE_API_URL=https://haiq-api.onrender.com
```

---

## 🚀 Deployment

### Frontend (Vercel)
- **URL**: https://haiq.vercel.app (customer)
- **Admin URL**: https://haiq-admin.vercel.app
- **Build Command**: `npm run build`
- **Deploy Trigger**: Push to `main` branch

### Backend (Render)
- **URL**: https://haiq-api.onrender.com
- **Health Check**: GET `/health`
- **Dockerfile**: Multi-stage build, runs on Node 18
- **Deploy Trigger**: Push to `main` branch or manual redeploy

### Database (Neon)
- **Connections**: SSL required
- **Backups**: Neon handles automatically
- **Connection Pooling**: PgBouncer enabled

---

## 💰 Payment Methods

### 1. Cash on Delivery (COD) ✅ LIVE
- **Flow**: Order → Status updated to delivered → Auto-paid
- **Test**: Order HAIQ-20260410-7155 verified working (UGX 40,000)
- **Integration**: Backend only (no API needed)

### 2. MTN Mobile Money 🚧 IN PROGRESS
- **API**: MTN Momo Uganda
- **Status**: Sandbox testing needed
- **Documentation**: See `payment-system-implementation-plan.md`
- **Next Step**: Register for developer account

### 3. Airtel Money 🚧 IN PROGRESS
- **API**: Airtel Uganda
- **Status**: Sandbox testing needed
- **Documentation**: See `payment-system-implementation-plan.md`
- **Next Step**: Register for developer account

### 4. Bank Transfer 🟡 READY FOR DEV
- **Flow**: Manual transfer + proof upload → Admin verification → Auto-paid
- **Proof Upload**: Via `/v1/payments/{ref}/bank-proof` endpoint
- **Status**: Backend ready, frontend form needed

### 5. Card Payments 🔴 FUTURE
- **Note**: Requires PCI-DSS compliance
- **Recommended**: Stripe or Flutterwave
- **Timeline**: After mobile money stabilized

---

## 📊 Recent Commits

```
6911eb4 - docs: add comprehensive payment system implementation plan
8c100a3 - refactor: enhance Button component and standardize checkout button styling
af74326 - refactor: replace legacy 'The Unboxing' wording with 'Build Your Box' throughout codebase
ab5b867 - Fix: Update Build Your Box price display to use dynamic boxPrice instead of hardcoded values
45acb70 - Fix: Check first variant label instead of product.variant_label for '4 Pack' display
```

---

## 🧪 Testing

### Local Testing
```bash
# Backend
cd backend
npm install
cp .env.example .env
npm start              # Runs on http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev            # Runs on http://localhost:5173

# Admin
cd admin
npm install
npm run dev            # Runs on http://localhost:5174
```

### API Testing
```bash
# Check backend health
curl https://haiq-api.onrender.com/health

# Login as admin
curl -X POST https://haiq-api.onrender.com/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@haiq.ug","password":"HAIQAdmin2024!"}'

# List orders
curl -X GET https://haiq-api.onrender.com/v1/admin/orders \
  -H "Authorization: Bearer [TOKEN]"
```

---

## 📝 Database Migrations

**Applied Migrations** (11 total):
1. ✅ 001_initial_schema.sql - Base tables (users, products, orders, payments)
2. ✅ 002_indexes.sql - Performance indexes
3. ✅ 003_seed_products.sql - Initial product data
4. ✅ 004_reviews.sql - Product review system
5. ✅ 005_loyalty_newsletter_specialdays.sql - Loyalty, newsletter, special pricing
6. ✅ 005b_addendum.sql - Additional fields
7. ✅ 006_updates.sql - Schema updates
8. ✅ 007_password_reset.sql - Password reset tokens
9. ✅ 008_fix_loyalty_cards.sql - Loyalty card fixes
10. ✅ 009_products_updates.sql - Remove "The Unboxing", configure Box Office
11. ✅ 010_update_order_statuses.sql - Migrate from 7→4 statuses

**To Apply New Migrations**:
```bash
cd backend
npm run migrate
```

---

## 🐛 Troubleshooting

### Backend Won't Start
1. Check DATABASE_URL is set correctly
2. Verify Neon connection (SSL required)
3. Run migrations: `npm run migrate`
4. Check logs: `npm start` (look for error messages)

### Frontend Build Fails
1. Clear cache: `rm -rf node_modules package-lock.json`
2. Reinstall: `npm install`
3. Build: `npm run build`

### Payments Not Working
1. Check payment_method is one of: `['mtn_momo', 'airtel', 'bank_transfer', 'cash_on_delivery']`
2. Verify order exists with correct order_id
3. For COD: Ensure admin can update order status

### Images Not Loading
1. Check Cloudinary credentials in .env
2. Verify image URLs are accessible
3. Check CORS settings if external image source

---

## 📚 Documentation

- **Payment System Plan**: [payment-system-implementation-plan.md](./payment-system-implementation-plan.md)
- **API Docs**: Backend includes Swagger UI at `/api-docs`
- **Database Schema**: See migrations in `backend/src/db/migrations/`
- **Copilot Instructions**: [.github/copilot-instructions.md](.github/copilot-instructions.md)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes (keep to smallest safe change)
3. Commit with clear message: `git commit -m "type: description"`
4. Push: `git push origin feature/your-feature`
5. Create PR and request review

### Commit Types
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactor
- `docs:` Documentation
- `test:` Test additions
- `chore:` Dependencies/tooling

---

## 📞 Support

**Issues**: Create issues in GitHub repository
**Questions**: Check documentation first, then contact team
**Urgent**: Reach out via Slack/WhatsApp

---

## 📄 License

HAIQ © 2026 - All Rights Reserved

---

**Last Updated**: April 10, 2026
**Deployment Status**: ✅ Production Live
**Next Review**: After payment provider integration
