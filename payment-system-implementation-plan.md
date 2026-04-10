# Payment System Implementation Plan for HAIQ

## Current Status

### ✅ Already Implemented (Simulation Mode)
- **Database Schema**: Complete payments table with all needed fields
- **Payment Routes**: POST `/v1/payments/initiate` and `/v1/payments/confirm`
- **Simulation Service**: `payments.service.js` handles simulation payment flow
- **COD Workflow**: ✅ Fully working (payment auto-marks as 'paid' when order status → 'delivered')
- **Order Integration**: Payment status correctly syncs to orders table

### 🎯 Current Methods Supported
1. **Cash on Delivery (COD)** - ✅ LIVE & WORKING
2. **MTN Mobile Money** - 🚧 Routes defined, API integration needed
3. **Airtel Money** - 🚧 Routes defined, API integration needed
4. **Bank Transfer** - 🚧 Routes defined, proof upload needed
5. **Card Payments** - 🚫 NOT YET IMPLEMENTED

---

## Payment Methods Implementation Roadmap

### 1️⃣ Cash on Delivery (COD) - PRIORITY ⭐ DONE
**Status**: ✅ FULLY IMPLEMENTED & TESTED
- **Flow**: 
  1. Customer selects COD at checkout
  2. Order created with payment_method = 'cash_on_delivery'
  3. Admin marks order status → 'delivered'
  4. Backend auto-triggers: UPDATE orders SET payment_status = 'paid'
  5. Revenue dashboard reflects as paid
- **Test Order**: HAIQ-20260410-7155 (UGX 40,000) ✅ CONFIRMED WORKING

**Implementation Code Location**:
- Controller: `backend/src/controllers/admin/admin.orders.controller.js` (lines 119-121)
- Logic: Triggers when `payment_method = 'cash_on_delivery' AND status = 'delivered'`

---

### 2️⃣ MTN Mobile Money - PRIORITY 🟡 MEDIUM
**Status**: 🚧 Implementation needed (routes exist, API integration needed)

#### MTN Momo API Overview

**Provider**: MTN Mobile Money Uganda
- **Service**: Peer-to-Peer (P2P) and Merchant payment collection
- **Currency**: UGX (Ugandan Shillings)
- **API Type**: REST JSON
- **Authentication**: OAuth 2.0 with X-Reference-Id headers

#### Required API Endpoints

##### 1. **Request to Pay (Payment Initiation)**
```http
POST https://api.sandbox.mtn.com/v1_0/payment
X-Reference-Id: <UUID>
X-Target-Environment: sandbox|production
Ocp-Apim-Subscription-Key: <subscription-key>
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "amount": "40000",
  "currency": "UGX",
  "externalId": "HAIQ-20260410-7155",
  "payer": {
    "partyIdType": "MSISDN",
    "partyId": "256764524816"    // Phone number with country code
  },
  "payerMessage": "Payment for HAIQ order",
  "payeeNote": "HAIQ - Premium Cookies"
}
```
**Response**:
```json
{
  "transactionId": "12345678",
  "status": "PENDING"
}
```

##### 2. **Check Payment Status**
```http
GET https://api.sandbox.mtn.com/v1_0/payment/{transactionId}
X-Reference-Id: <UUID>
X-Target-Environment: sandbox|production
Ocp-Apim-Subscription-Key: <subscription-key>
Authorization: Bearer <access_token>
```
**Response**:
```json
{
  "transactionId": "12345678",
  "status": "SUCCESSFUL",
  "amount": "40000",
  "currency": "UGX",
  "externalId": "HAIQ-20260410-7155",
  "payer": {
    "partyIdType": "MSISDN",
    "partyId": "256764524816"
  }
}
```

##### 3. **Webhook Callback** (Async Notification)
Endpoint: `POST /v1/payments/webhook/mtn` (needs implementation)
```json
{
  "transactionId": "12345678",
  "externalId": "HAIQ-20260410-7155",
  "status": "SUCCESSFUL",
  "amount": "40000",
  "currency": "UGX",
  "timestamp": "2024-10-10T12:30:45Z"
}
```

#### Environment Setup
- **Sandbox**: https://api.sandbox.mtn.com
- **Production**: https://api.mtn.com
- **Required Env Variables**:
  ```env
  MTN_MOMO_API_KEY=<your-api-key>
  MTN_MOMO_SUBSCRIPTION_KEY=<your-subscription-key>
  MTN_MOMO_CALLBACK_SECRET=<secret-for-webhook-verification>
  MTN_MOMO_CALLBACK_URL=https://haiq-api.onrender.com/v1/payments/webhook/mtn
  ```

#### Implementation Steps
1. ✅ Register with MTN Developer Portal (sandbox first)
2. ✅ Obtain API credentials (Subscription Key, Primary Key)
3. ✅ Set environment variables
4. ✅ Implement request-to-pay endpoint
5. ✅ Implement status polling
6. ✅ Implement webhook receiver
7. ✅ Implement webhook signature verification
8. ✅ Test end-to-end flow
9. ✅ Move to production

---

### 3️⃣ Airtel Money - PRIORITY 🟡 MEDIUM
**Status**: 🚧 Implementation needed (routes exist, API integration needed)

#### Airtel Money API Overview

**Provider**: Airtel Uganda
- **Service**: Merchant payment collection
- **Currency**: UGX
- **API Type**: REST JSON
- **Authentication**: API Key + X-Country-Code headers

#### Required API Endpoints

##### 1. **Initiate Payment**
```http
POST https://apigateway.airtel.ug/ag/v1/payments/pay
X-Country-Code: UG
X-Timestamp: <ISO8601-timestamp>
Authorization: Bearer <api-key>
Content-Type: application/json

{
  "reference": "HAIQ-20260410-7155",
  "subscriber": {
    "phone": "+256764524816"
  },
  "transaction": {
    "amount": "40000",
    "currency": "UGX",
    "id": "HAIQ-20260410-7155"
  },
  "merchant": {
    "name": "HAIQ",
    "country": "UG"
  }
}
```
**Response**:
```json
{
  "transactionId": "TXN123456",
  "status": "PENDING",
  "reference": "HAIQ-20260410-7155"
}
```

##### 2. **Check Transaction Status**
```http
GET https://apigateway.airtel.ug/ag/v1/payments/{transactionId}
X-Country-Code: UG
Authorization: Bearer <api-key>
```

##### 3. **Webhook Notification** (Async)
Endpoint: `POST /v1/payments/webhook/airtel` (needs implementation)

#### Environment Setup
- **Sandbox**: https://api.sandbox.airtel.ug
- **Production**: https://apigateway.airtel.ug
- **Required Env Variables**:
  ```env
  AIRTEL_API_KEY=<your-api-key>
  AIRTEL_MERCHANT_ID=<your-merchant-id>
  AIRTEL_CALLBACK_SECRET=<secret-for-webhook>
  AIRTEL_CALLBACK_URL=https://haiq-api.onrender.com/v1/payments/webhook/airtel
  ```

---

### 4️⃣ Bank Transfer - PRIORITY 🟢 LOW
**Status**: 🚧 Partial (proof upload needed)

#### Flow
1. Customer selects Bank Transfer at checkout
2. Order created with payment_method = 'bank_transfer'
3. Customer sees bank details and reference number
4. Customer uploads proof of transfer via:
   ```http
   POST /v1/payments/{internal_ref}/bank-proof
   Content-Type: multipart/form-data
   
   proof: <image-file>
   ```
5. Admin verifies proof in dashboard
6. Admin marks order status → delivered (which auto-marks payment as 'paid')

**Bank Details to Display**:
```
Bank: Stanbic Bank Uganda
Account Name: HAIQ Limited
Account Number: [To be added]
Swift Code: SBICUGKA
Reference: [Generate from order_number]
Amount: UGX [order total]
```

#### Implementation Steps
1. Add bank-proof upload endpoint
2. Store proof in Cloudinary (already configured for images)
3. Create admin UI to verify proofs
4. Auto-mark as paid when status → delivered

---

### 5️⃣ Card Payments - PRIORITY 🔴 FUTURE
**Status**: 🚫 Not yet implemented (requires PCI-DSS compliance)

#### Considerations
- **PCI-DSS Compliance**: Required for taking card payments
- **Tokenization**: Never store card data directly
- **Recommended Providers**:
  - **Stripe** (Global, supports Uganda via Mastercard Foundation)
  - **PaymentGateway.co.ug** (Uganda-specific)
  - **Flutterwave** (Africa-wide, supports Uganda)

#### Recommended Approach
- Use **hosted payment form** (Stripe Checkout, Flutterwave)
- Never transmit raw card details to your server
- Store only tokenized card reference if needed for recurring payments

---

## Implementation Priority & Timeline

### Phase 1: Stabilization (NOW) ⭐
- [x] Cash on Delivery - DONE
- [ ] Bank Transfer - Low effort, high value
- [ ] Documentation - Create implementation guides

### Phase 2: Core Mobile Money (NEXT)
- [ ] MTN Momo API integration
- [ ] Airtel Money API integration
- [ ] Webhook signature verification
- [ ] End-to-end testing with sandbox credentials

### Phase 3: Polish & Security
- [ ] Rate limiting on payment endpoints
- [ ] Idempotency for payment requests
- [ ] Comprehensive error handling
- [ ] Payment reconciliation job

### Phase 4: Advanced (LATER)
- [ ] Card payment integration (Stripe/Flutterwave)
- [ ] Subscription/recurring payments
- [ ] Payment analytics dashboard
- [ ] Chargeback handling

---

## Database Readiness Check

### Current Payments Table Fields ✅
```sql
CREATE TABLE payments (
  id               UUID PRIMARY KEY,
  order_id         UUID NOT NULL FOREIGN KEY,
  payment_method   VARCHAR(50),           -- 'mtn_momo' | 'airtel' | 'bank_transfer' | 'cash_on_delivery'
  provider_ref     VARCHAR(255),          -- Transaction ID from MTN/Airtel
  internal_ref     VARCHAR(100) UNIQUE,   -- Our internal reference
  amount           NUMERIC(12,2),
  currency         VARCHAR(10),           -- 'UGX'
  status           VARCHAR(50),           -- 'initiated' | 'pending' | 'successful' | 'failed' | 'cancelled' | 'refunded'
  webhook_payload  JSONB,                 -- Store full webhook response
  signature_valid  BOOLEAN,               -- Webhook signature verification result
  payer_phone      VARCHAR(20),           -- For mobile money
  bank_proof_url   TEXT,                  -- For bank transfer
  bank_proof_public_id VARCHAR(300),      -- Cloudinary ID for proof
  notes            TEXT,
  created_at       TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ
);
```

**Needed Migrations**: None - table is ready

---

## Code Structure for Implementation

### Files to Create/Update

```
backend/src/
├── controllers/
│   ├── payments/
│   │   ├── mtn-momo.controller.js        (NEW)
│   │   ├── airtel-money.controller.js    (NEW)
│   │   └── bank-transfer.controller.js   (NEW)
│   └── payments.controller.js            (UPDATE - route to specific handlers)
│
├── services/
│   ├── payments/
│   │   ├── mtn-momo.service.js           (NEW)
│   │   ├── airtel-money.service.js       (NEW)
│   │   ├── bank-transfer.service.js      (NEW)
│   │   └── webhook.handler.js            (NEW - verify signatures)
│   └── payments.service.js               (UPDATE - orchestrate methods)
│
├── utils/
│   ├── mtn-momo-api.js                   (NEW - HTTP client)
│   ├── airtel-api.js                     (NEW - HTTP client)
│   └── signature-verification.js         (UPDATE - add MTN/Airtel verification)
│
└── routes/
    └── payments.routes.js                (UPDATE - add webhook routes)
```

---

## Testing Strategy

### Sandbox Testing Checklist
- [ ] MTN Momo: Request-to-pay initiates successfully
- [ ] MTN Momo: Status polling returns correct status
- [ ] MTN Momo: Webhook received and signature verified
- [ ] Airtel: Payment initiation works
- [ ] Airtel: Status checking works
- [ ] Airtel: Webhook handling works
- [ ] Bank Transfer: Proof upload stores correctly
- [ ] Idempotency: Duplicate requests handled
- [ ] Error handling: Invalid phone numbers, amounts, etc.

### Production Checklist
- [ ] All credentials properly set in env vars on Render
- [ ] Webhook endpoints accessible from internet
- [ ] SSL certificate valid (HTTPS)
- [ ] Rate limiting enabled
- [ ] Logging captures all payment events
- [ ] Monitoring alerts for failed payments
- [ ] Backup plan if provider API is down

---

## Next Immediate Step

**Action**: Research and register for MTN Momo and Airtel Money developer accounts
- **MTN Developer Portal**: https://developer.mtn.com
- **Airtel Developer**: https://developer.airtel.ug
- Priority: Get sandbox credentials and test endpoints
- Timeline: Before implementing actual API calls

---

## References & Resources

### MTN Momo API
- **Docs**: https://mtn-api-documentation.gitbook.io/mtn-momo-api
- **Sandbox URL**: https://api.sandbox.mtn.com
- **Key Endpoints**: `/v1_0/payment`, `/v1_0/account/balance`

### Airtel Money APIs
- **Developer Site**: https://developer.airtel.ug
- **Documentation**: Check developer portal for latest API specs
- **Support**: developer-support@airtel.ug

### Uganda Payment Standards
- **Bank Codes**: Central Bank of Uganda
- **Mobile Money Providers**: MTN, Airtel, Uganda Telecom (UTL)
- **Regulatory Body**: Uganda Communications Commission (UCC)

### Security Standards
- **PCI-DSS**: Payment Card Industry Data Security Standard
- **OWASP**: Web Application Security Project
- **JWT**: JSON Web Tokens for authentication

---

**Created**: April 10, 2026
**Last Updated**: April 10, 2026
**Next Review**: After first payment provider integration
