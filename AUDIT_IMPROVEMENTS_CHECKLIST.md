# HAIQ — Complete Improvements & Bug Fixes Checklist

**Workspace:** HAIQ  
**Project:** Development  
**Owner:** Aaron Mugumya  
**Last Updated:** 2026-05-11

---

## 🔴 CRITICAL — Data Loss / Broken Workflows

### 1. Cart Cleared Before Order Confirmation
**Severity:** Critical — User loses cart state if network fails  
**File:** `frontend/src/pages/CheckoutPage.jsx`  
**Lines:** 292-293  
**Issue:** `clearCart()` runs immediately after request fires, not after confirmation. If network drops mid-request, order may exist on backend but cart is gone on frontend.

```js
// Current (WRONG):
const { data } = await api.post('/orders', body)  // line 292
clearCart()  // line 293 — runs BEFORE confirmation
navigate(...)

// Should be:
const { data } = await api.post('/orders', body)
clearCart()  // only AFTER response received
navigate(...)
```

**Impact:** Order created on backend, cart empty on frontend. User stranded with no order number.  
**Fix:** Move `clearCart()` to after successful response confirmation inside the try block after navigation is confirmed.

---

### 2. Password Reset Completely Broken — Field Name Mismatch
**Severity:** Critical — Password reset feature unusable  
**File:** `frontend/src/context/AuthContext.jsx:71` vs `backend/src/controllers/auth.controller.js:199`  
**Issue:** Frontend sends `new_password`, backend reads `password`.

```js
// Frontend AuthContext.jsx:71
const res = await api.post('/auth/reset-password', { token, new_password: newPassword })

// Backend auth.controller.js:199
const { token, password } = req.body  // password is undefined, bcrypt.hash() fails
```

**Impact:** All password reset requests fail silently. Users cannot recover lost passwords.  
**Fix:** Change `AuthContext.jsx` line 71: `new_password: newPassword` → `password: newPassword`

---

### 3. Register Auto-Login Broken — Missing Context Functions
**Severity:** Critical — Registration UX broken, users see "Create Account" then "Sign In" page  
**File:** `frontend/src/pages/RegisterPage.jsx:10,57-60`  
**Issue:** `setToken` and `setUser` are destructured from `useAuth()` but don't exist. Backend register returns no token.

```js
// RegisterPage.jsx:10 — These don't exist in context:
const { setUser, setToken } = useAuth()  // undefined!

// Backend register response: { success, message, user }
// No token returned
```

**Impact:** After successful registration, user is redirected to `/login` instead of being auto-logged in. Bad UX — they just created an account but have to log in again.  
**Fix:** After register succeeds, call `await login(email, password)` using the existing login function from context, OR have backend return an `access_token` on register and use it.

---

### 4. Payment Race Condition — Order Status Mismatch
**Severity:** Critical — Payment marked successful but order stuck in pending  
**File:** `backend/src/services/payments.service.js:49-51`  
**Issue:** Two database writes in sequence (not in transaction). If connection dies between them:

```js
// Step 1: Mark payment as 'paid'
await query('UPDATE payments SET status = $1 ...', ['paid'])

// Step 2: Mark order as 'delivered' or 'paid'
await query('UPDATE orders SET payment_status = $1 ...', ['paid'])
// ← If network fails HERE: payment is marked successful but order is still pending
```

**Impact:** Payment confirmed but order never marked as paid. Admin doesn't know order needs fulfillment. Customer never gets notification.  
**Fix:** Wrap both writes in a single PostgreSQL transaction:
```js
await query('BEGIN')
try {
  await query('UPDATE payments SET status = $1 ...', ['paid'])
  await query('UPDATE orders SET payment_status = $1 ...', ['paid'])
  await query('COMMIT')
} catch {
  await query('ROLLBACK')
  throw
}
```

---

### 5. No Request Timeout Anywhere — All Requests Can Hang Forever
**Severity:** Critical — Every API call can hang indefinitely with zero feedback  
**File:** `frontend/src/services/api.js`  
**Issue:** No timeout configured on axios instance. On Render free tier, backend cold-starts take 20–50 seconds.

```js
// Current: No timeout
const api = axios.create({
  baseURL: process.env.VITE_API_URL,
  withCredentials: true,
})

// Should add:
const api = axios.create({
  baseURL: process.env.VITE_API_URL,
  withCredentials: true,
  timeout: 15000,  // 15 seconds
})
```

**Impact:** ShopPage, BuildYourBoxPage, TrackOrderPage, AccountPage, OrderConfirmationPage all can hang forever with no user feedback.  
**Fix:** Add `timeout: 15000` to axios config in `frontend/src/services/api.js`

---

## 🟠 HIGH PRIORITY — Broken Features / Data Integrity

### 6. Payment Confirmation Polling — Silent Failures, User Waits 5 Minutes for Dead API
**Severity:** High — User thinks payment is processing when API is down  
**File:** `frontend/src/pages/PaymentConfirmationPage.jsx:54,62-67`  
**Issue:** Polls every 3 seconds for 5 minutes. If all polls fail, failures are logged to console but never shown to user.

```js
// Line 54: Error logged but not shown
.catch(err => {
  logger.error('Poll failed', err)
  // User sees nothing — continues polling
})

// Line 62-67: Timeout at 5 minutes shown to user
setTimeout(() => { setStatus('timeout') }, 300000)
```

**Impact:** User waits full 5 minutes, sees 100+ failed network requests, finally gets "took too long" message. Confusing UX.  
**Fix:** 
- Add counter for consecutive poll failures
- Show "Having trouble connecting…" after 3 consecutive failures
- Suggest manual check: "Check your payment account directly or contact support"

---

### 7. Order Confirmation Page — No Error State, Spinner Forever
**Severity:** High — User cannot tell if page loaded or is hung  
**File:** `frontend/src/pages/OrderConfirmationPage.jsx:13-15`  
**Issue:** If order load fails, no error state. User sees spinner indefinitely.

```js
// Line 13: api.get() fails
const res = await api.get(`/orders/track/${token}`)
// Line 15: error silently caught
.catch(() => {})

// Loading state never resolves
```

**Impact:** User gets confirmation page but sees nothing but spinner. No way to know if order was actually created.  
**Fix:** Add error state:
```js
const [error, setError] = useState(null)
try {
  const res = await api.get(`/orders/track/${token}`)
  // set order
} catch (err) {
  setError('Could not load order confirmation. Your order was created — check your email.')
}
// In UI: show error message if error state is set
```

---

### 8. Shop Page — Silent Load Failure, Shows "Nothing Here Yet"
**Severity:** High — User cannot distinguish "no products" from "failed to load"  
**File:** `frontend/src/pages/ShopPage.jsx:144,150`  
**Issue:**

```js
api.get(`/products?${params}`)
  .catch(() => {})  // ← Silent failure

// User sees empty page with "Nothing here yet" instead of error
```

**Impact:** User doesn't know if API is down or if there really are no products.  
**Fix:** Add error state and message:
```js
const [error, setError] = useState(null)
try {
  const res = await api.get(`/products?${params}`)
  setProducts(res.data)
  setError(null)
} catch (err) {
  setError('Could not load products. Please try again.')
}
// Show error message above product grid
```

---

### 9. Track Order Page — Silent Failures Everywhere
**Severity:** High — Order details never load, user sees empty page  
**File:** `frontend/src/pages/TrackOrderPage.jsx:292,304-306`  
**Issue:** Multiple API calls with `catch(() => {})` (silent fail):

```js
// Line 292: Load orders
api.get('/orders/my?limit=50').catch(() => {})  // Silent fail

// Line 304-306: Track order by token
api.get(`/orders/track/${token}`).catch(() => {})  // Silent fail

// Line 148: Load messages
api.get(`/messages/${order.id}`).catch(() => {})  // Silent fail
```

**Impact:** User clicks "Track Order", page stays empty. No indication API failed.  
**Fix:** Add error states for each section:
- Orders list: "Failed to load orders. Try again."
- Tracked order: "Order not found or failed to load."
- Messages: "Could not load messages." (non-fatal)

---

### 10. Build Your Box — Silent Load Failure, Empty Page
**Severity:** High — User cannot select cookies or see price  
**File:** `frontend/src/pages/BuildYourBoxPage.jsx:35-57`  
**Issue:**

```js
Promise.all([
  api.get('/special-days/active-today'),
  api.get('/products?type=cookie'),
  api.get('/products?is_box_item=true'),
])
.catch(() => {})  // ← All failures silent
```

**Impact:** If any request fails, entire page is empty. No cookies shown, no price shown, user cannot proceed.  
**Fix:** Add error state and retry button:
```js
const [error, setError] = useState(null)
try {
  const [specialDays, cookies, box] = await Promise.all([...])
  // set state
  setError(null)
} catch (err) {
  setError('Failed to load options. Please refresh or try again.')
}
// Show error message with retry button
```

---

### 11. Delivery Zones Load Fails — Zone Dropdown Broken
**Severity:** High — User cannot select delivery zone, cannot proceed to payment  
**File:** `frontend/src/pages/CheckoutPage.jsx:230-237`  
**Issue:**

```js
api.get('/delivery-zones').catch(() => {})  // Silent fail
// Zone dropdown stays disabled
```

**Impact:** At checkout step 1, zone dropdown stays disabled/empty. User cannot select zone, cannot proceed.  
**Fix:** Add error message and allow manual entry or retry.

---

## 🟡 MEDIUM PRIORITY — UX Issues, Inconsistencies

### 12. Payment Webhook Idempotency — Duplicate Processing Risk
**Severity:** Medium — Payment can be confirmed twice if webhook retried  
**File:** `backend/src/controllers/payments.controller.js`  
**Issue:** MTN/Airtel webhooks have no idempotency check. Providers retry webhooks on timeout. Same webhook can be processed twice.

**Impact:** Payment status updated twice, duplicate notifications, potential double-charging.  
**Fix:** Add idempotency guard:
```js
// In webhook handler: Check if this exact webhook was already processed
const existing = await query(
  'SELECT id FROM payments WHERE external_ref = $1 AND provider = $2',
  [webhookRef, provider]
)
if (existing.rowCount > 0) {
  return res.json({ success: true, message: 'Already processed' })
}
// Then process...
```

---

### 13. Checkout Payment Notes — Contradiction Between Cart and Checkout
**Severity:** Medium — User confused about delivery fee  
**File:** `frontend/src/context/CartContext.jsx` vs `frontend/src/pages/CheckoutPage.jsx`  
**Issue:**
- Cart drawer: "Delivery (UGX 5,000) added at checkout" — implies fixed fee
- Checkout: "Delivery pricing varies by location… Estimated from UGX 5,000" — implies variable

**Impact:** User expects fixed delivery fee but checkout says it varies.  
**Fix:** Pick one message. If variable, remove the fixed number from cart. If fixed, remove the "varies" language from checkout. Recommend: Show range in cart ("From UGX 5,000") and exact amount in checkout after zone is selected.

---

### 14. Account Page — Orders Load Fails, Shows "No Orders Yet"
**Severity:** Medium — User cannot tell if they have no orders or if load failed  
**File:** `frontend/src/pages/AccountPage.jsx:97`  
**Issue:**

```js
api.get('/orders/my').catch(() => {})  // Silent fail
// Shows "No orders yet" instead of error
```

**Impact:** If API is down, user thinks they never placed an order.  
**Fix:** Add error detection:
```js
if (error) {
  return <div>Could not load orders. Try refreshing.</div>
} else if (!orders.length) {
  return <div>No orders yet.</div>
}
```

---

### 15. Order Messages — Silent Send Failure
**Severity:** Medium — User thinks message was sent when it wasn't  
**File:** `frontend/src/pages/TrackOrderPage.jsx:157-161`  
**Issue:**

```js
api.post('/messages', { order_id, body })
  .catch(() => {})  // Silent fail
```

**Impact:** User types message, clicks Send, spinner stops (finally block), but message never sent. User assumes it went through.  
**Fix:** Show error state:
```js
const [msgError, setMsgError] = useState(null)
try {
  await api.post('/messages', { order_id, body })
  // add to UI
  setMsgError(null)
} catch (err) {
  setMsgError('Failed to send. Try again.')
}
// Show error if msgError is set
```

---

### 16. Product Detail Page — Silent Redirect on Load Fail
**Severity:** Medium — User doesn't know why page redirected  
**File:** `frontend/src/pages/ProductDetailPage.jsx:38`  
**Issue:**

```js
api.get(`/products/${slug}`).catch(() => navigate('/shop'))  // Silent redirect
```

**Impact:** User clicks product link, page redirects to shop with no error message.  
**Fix:** Add an error state and message before redirect, or show error toast.

---

### 17. Admin — Orders Load Fails, Shows Skeleton Rows
**Severity:** Medium — Admin has no idea orders failed to load  
**File:** `admin/src/pages/OrdersPage.jsx:142-145`  
**Issue:**

```js
api.get(`/admin/orders?...`).catch(() => {})  // Silent fail
// Skeleton rows show forever
```

**Impact:** Admin sees skeleton loading UI but nothing ever loads. No indication of failure.  
**Fix:** Add error state:
```js
if (error) {
  return <div className="alert alert-error">Failed to load orders. <button onClick={reload}>Retry</button></div>
}
```

---

### 18. Session Restore — Silent Failures (Acceptable, But Log In Debug Mode)
**Severity:** Low-Medium — Hard to debug auth issues  
**File:** `frontend/src/context/AuthContext.jsx:20,35`  
**Issue:**

```js
// Session restoration fails silently — acceptable in production
// But makes debugging auth issues very hard
```

**Impact:** If refresh token is broken, users stay logged out with no indication.  
**Fix:** In development, log to console. In production, keep silent:
```js
.catch(e => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Session restore failed:', e.message)
  }
})
```

---

## 🔵 LOW PRIORITY — Polish, Code Quality

### 19. README — Wrong Frontend URL
**Severity:** Low — Documentation outdated  
**File:** `README.md:173`  
**Issue:** States `https://haiq.vercel.app` — actual URL is `https://haiqweb.vercel.app`

**Fix:** Update README line 173: `haiq.vercel.app` → `haiqweb.vercel.app`

---

### 20. Cart Checkout Button Shows Subtotal Not Total
**Severity:** Low — Misleading, but user sees correct total at checkout  
**File:** `frontend/src/context/CartContext.jsx`  
**Issue:** Button shows "CHECKOUT — UGX 5,000" (subtotal) but actual checkout total will be UGX 10,000 (with delivery).

**Fix:** Either show "CHECKOUT" without amount, or show total including estimated delivery.

---

### 21. Checkout Checkbox Not Semantic
**Severity:** Low — Not keyboard-accessible, not screen-reader-readable  
**File:** `frontend/src/pages/CheckoutPage.jsx:503-508`  
**Issue:** Consent box is `<div onClick>` not `<input type="checkbox">`. Checkmark is letter "v" not "✓".

**Fix:** Replace with native checkbox:
```js
<input 
  type="checkbox" 
  checked={consent} 
  onChange={e => setConsent(e.target.checked)}
/>
```

---

### 22. Step Progress — "v" Character Instead of Checkmark
**Severity:** Low — Visually inconsistent  
**File:** `frontend/src/pages/CheckoutPage.jsx:56`  
**Issue:** Step indicator shows "v" for completed steps.

**Fix:** Replace "v" with "✓"

---

### 23. Moments Page Not in Navbar
**Severity:** Low — Navigation incomplete  
**File:** `frontend/src/components/layout/Navbar.jsx`  
**Issue:** Moments page exists and is in footer but not in navbar.

**Fix:** Add to navbar menu.

---

### 24. "Loyalty Card" Footer Link Just Goes to /account
**Severity:** Low — Misleading label  
**File:** `frontend/src/components/layout/Footer.jsx:83`  
**Issue:** Label says "Loyalty Card" but links to account page.

**Fix:** Rename to "My Account" or create dedicated loyalty page.

---

### 25. Date Formatting Inconsistent — Utils Not Used
**Severity:** Low — Code quality  
**File:** `frontend/src/utils/formatDate.js` and throughout codebase  
**Issue:** `formatDate` utility exists but is never imported. Dates formatted with scattered `.toLocaleString()` calls.

**Fix:** Import and use `formatEAT()` everywhere instead of `.toLocaleString()`.

---

### 26. Unused Components — Dead Code
**Severity:** Low — Code cleanliness  
**Issue:** 
- `frontend/src/components/product/AddToCartButton.jsx` — never used
- `frontend/src/hooks/usePayments.js` — never used
- `frontend/src/hooks/useRealtimeMessages.js` — never used

**Fix:** Remove or implement.

---

### 27. Backend — No Per-Query Timeout
**Severity:** Low — Database operations can hang indefinitely  
**File:** `backend/src/config/db.js`  
**Issue:** Connection has 30s timeout but individual queries don't. A slow query can hang indefinitely.

**Fix:** Wrap query function with timeout:
```js
function queryWithTimeout(sql, params, timeout = 10000) {
  return Promise.race([
    pool.query(sql, params),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), timeout)
    ),
  ])
}
```

---

### 28. No 404 Page
**Severity:** Low — Unknown URLs silently redirect to home  
**File:** `frontend/src/App.jsx:65`  
**Issue:**

```js
<Route path="*" element={<Navigate to="/" replace />} />
```

**Fix:** Create `NotFoundPage.jsx` and show proper 404.

---

## Summary by Priority

| Tier | Count | Issues |
|---|---|---|
| 🔴 **Critical** | 5 | Cart cleared early, password reset broken, register auto-login broken, payment race condition, no request timeouts |
| 🟠 **High** | 6 | Payment polling UX, order confirmation, shop load, track order, build box, delivery zones |
| 🟡 **Medium** | 6 | Webhook idempotency, delivery messaging, account orders, messages send, product detail, admin orders |
| 🔵 **Low** | 11 | README, button text, checkbox semantic, step indicator, moments nav, loyalty label, date utils, unused code, no 404, etc. |

---

## Implementation Timeline Recommendation

**Week 1 (Critical):**
- Fix cart clearing order (5 min)
- Add axios timeout (1 min)
- Fix password reset field (1 min)
- Fix register auto-login (30 min)
- Fix payment race condition (30 min)

**Week 2 (High):**
- Add error states to 6 pages (3 hours)
- Fix payment polling UX (1 hour)
- Fix delivery zone load handling (30 min)

**Week 3+ (Medium & Low):**
- Add webhook idempotency (1 hour)
- Messaging UX fixes (2 hours)
- Polish and code cleanup (4 hours)

---

**Total estimated effort: ~20–24 hours to fix critical + high-priority issues**
