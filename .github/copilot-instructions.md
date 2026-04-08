# HAIQ Repository Instructions

## Project identity
HAIQ is a premium cookie e-commerce platform with:
- a fixed 4-cookie “Build Your Box” flow
- customer storefront
- admin dashboard
- backend API
- PostgreSQL on Neon
- Render backend deployment
- Vercel frontend deployments

## Current state
The app is already deployed and running. The current task is stabilization and feature completion, not a rebuild.

## Tech stack rules
- Backend code is JavaScript/CommonJS.
- Use `require(...)` and `module.exports`.
- Keep existing naming and folder conventions unless a rename is necessary to fix an import mismatch.
- Do not introduce TypeScript unless the surrounding folder already uses it.
- Keep frontend/admin code consistent with the current JavaScript stack.

## File and import rules
- Before renaming any file, search all imports that depend on it.
- If a filename changes, update every require/import path in the repository.
- Prefer one canonical service name and use it everywhere.
- Avoid duplicate services/controllers for the same responsibility.

## Database rules
- Do not recreate tables that already exist.
- Use idempotent migrations.
- Prefer:
  - `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...`
  - `CREATE TABLE IF NOT EXISTS ...`
  - `CREATE INDEX IF NOT EXISTS ...`
- Never drop production tables unless explicitly instructed.

## Payment rules
- Payment flows must be testable locally and safely.
- Support simulation-first behavior before real provider integration.
- Payment confirmation must update both the payment record and the order record when successful.
- Keep bank proof upload, MTN, Airtel, and COD flows separate but consistent.

## Stability rules
- Treat Render and Neon as production systems.
- Fix startup blockers before feature work.
- If the app crashes on boot, trace the import chain from the entrypoint downward.
- Check controller exports, route registrations, and service filenames first.

## UI and storefront rules
- Keep the premium feel consistent.
- Standardize buttons and cart interactions.
- Enforce the 4-cookie rule everywhere the user sees product selection or checkout.
- Replace old “The Unboxing” wording with the box system language.

## Documentation rules
- Keep `README.md`, progress docs, and implementation notes aligned with the actual codebase.
- Any time the architecture changes, update the docs in the same change set.

## Working style
- Make the smallest safe change that fixes the problem.
- Prefer local verification before committing.
- Report the exact file path when something is missing.
- If a file is already present, do not recreate it.