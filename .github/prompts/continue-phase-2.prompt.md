---
name: continue-phase-2
description: Continue HAIQ implementation from the current stable backend state.
argument-hint: Focus on the next unfinished task, keep changes local-first, and avoid rebuilding working systems.
agent: agent
---

You are continuing the HAIQ implementation from the current workspace state.

## What you already know
- The project is live and deployed.
- The backend now starts successfully.
- Payment controller exports are present.
- The remaining work is validation, cleanup, and completion of the unfinished flows.

## Current priorities
1. Verify payment initiation and confirmation end to end.
2. Check for any remaining old imports such as `payment.service`.
3. Validate special-days pricing and schema alignment.
4. Confirm bank proof upload behavior.
5. Finish storefront polish:
   - button consistency
   - add-to-cart consistency
   - 4-cookie rule messaging
   - copy cleanup

## Rules
- Work locally first.
- Do not push commits until the local result is stable.
- Do not recreate existing database tables.
- Prefer the smallest possible patch.
- Keep backend code in JavaScript/CommonJS.
- Update only the files that are necessary.

## Expected response
When finished, return:
- what was changed
- why it changed
- how to verify it locally
- what remains next

## Helpful context
If needed, inspect:
- `backend/src/controllers/payments.controller.js`
- `backend/src/controllers/orders.controller.js`
- `backend/src/routes/payments.routes.js`
- `backend/src/routes/orders.routes.js`
- `backend/src/services/payments.service.js`
- `backend/src/db/migrations`
- `README.md`