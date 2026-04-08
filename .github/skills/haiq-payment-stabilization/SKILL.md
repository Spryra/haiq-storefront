---
name: haiq-payment-stabilization
description: Use for payment-flow debugging, Render boot failures, controller/service import mismatches, payment simulation validation, and order-payment synchronization.
---

# HAIQ Payment Stabilization Skill

## When to use this skill
Use this skill when the task involves:
- payment route crashes
- `MODULE_NOT_FOUND` errors
- undefined Express handlers
- payment simulation
- order payment-status updates
- bank proof upload
- special payment-case debugging

## Goal
Stabilize the payment system without rebuilding the project.

## Required checks
1. Confirm the exact filename on disk.
2. Confirm the exact import path in every controller and route.
3. Confirm the service exports match the controller calls.
4. Confirm the route handler names exist.
5. Confirm the backend boots before doing any further feature work.

## Payment workflow rules
- Initiate payment first.
- Record the payment row.
- Update the order row when needed.
- Confirm the payment with a separate step.
- Keep success and failure paths explicit.
- Preserve idempotency.

## Common failure patterns
- A file was renamed locally but not committed.
- The controller imports `payment.service` while the repository now uses `payments.service`.
- A route points to `paymentsCtrl.initiate` but the controller only exports `initiateMTN`.
- A service file exists locally but was not added to Git.
- A file deletion was committed without the replacement file being tracked.

## Recovery procedure
- Read the current logs.
- Inspect the require stack.
- Open the controller and service files.
- Compare the route handler names to exported functions.
- Fix the smallest broken link in the chain.
- Re-run local verification.
- Stop once the server boots cleanly.

## References
Relevant files typically include:
- `backend/src/controllers/orders.controller.js`
- `backend/src/controllers/payments.controller.js`
- `backend/src/routes/orders.routes.js`
- `backend/src/routes/payments.routes.js`
- `backend/src/services/payments.service.js`
- `backend/src/utils/tokenGenerator.js`

## Output format
When this skill is used, respond with:
1. the exact cause
2. the file(s) to change
3. the exact code or patch
4. the verification command
5. the next remaining task