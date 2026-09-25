# Production cutover checklist

Everything below was checked against the real systems on 2026-09-25 unless marked "verify".

## Where things stand

| | Live (production) | Staging |
|---|---|---|
| Repo | `Junior-Reactive-Solutions/HAIQ_web` (code from ~26 May) | `Spryra/haiq-storefront` |
| Neon branch | `production` (`ep-young-credit-amk5t6s0`) | `staging` (`ep-wild-brook-amr4nkzz`) |
| DB migrations applied | **001-011** (12 rows) | **001-018** |
| `events` table | missing | present |
| Backend | `haiq-api.onrender.com` (healthy, returns products) | `haiq-storefront-staging-api.onrender.com` |

Production is missing migrations **012-018**: drinks category, Janlin bottle, message columns,
newsletter tracking, logging tables, loyalty-tier backfill, events. New backend code expects them.

## Order of operations (do not reorder)

1. **Rehearse on a throwaway Neon branch.** Branch `production` -> run `node src/db/migrate.js`
   against it -> click through the storefront and admin against that branch -> delete it.
   `016` inserts a product and `017` updates loyalty rows, so check those on real data first.
2. **Back up production** (`npm run backup:neon` in `backend/`, or a Neon snapshot).
3. **Run migrations on the `production` branch** (`DATABASE_URL` pointing at it). Do this
   *before* deploying new backend code.
4. **Deploy the backend** (Render production service) from the new code.
5. **Deploy storefront and admin** (Vercel).
6. Smoke test: home, a product page, Build Your Box, guest checkout up to payment, admin login,
   Events page, `/sitemap.xml`.

## Values that still point at staging (change before cutover)

- `frontend/.env.production` -> `VITE_API_BASE_URL` is the **staging** API. `VITE_SITE_URL` is the
  live domain; set it per Vercel project (staging project gets its own URL).
- `admin/.env.production` -> same staging API URL.
- `frontend/vercel.json` -> the `/sitemap.xml` and `/llms.txt` rewrites target the **staging** API.
- Render production env: confirm `DATABASE_URL`, `CORS_ORIGINS` and `FRONTEND_URL` match the
  production domains (verify).

## Repo strategy

`prod-origin` is at an older, diverged history. Do **not** force-push to it. Either open a PR from
`haiq-storefront` into it, or repoint the Vercel/Render production projects at `haiq-storefront`.
The history there was rewritten to remove committed secrets, so the two histories do not share commits.

## Behaviour changes to tell the client about

- **Guest checkout** is now allowed (no forced login). Guests have no order history; their
  tracking link is the only way back to an order.
- Build Your Box no longer includes Coconut or Venom (fixed packs only).
- Tablets now use the hamburger menu; Events tab appears on phone/tablet, Events section on desktop home.

## Still to do by the account owners

- Revoke the original leaked Resend key (`HAIQ-Main` account) and the original Cloudinary
  cloud credentials. They remain active until revoked.
- Add `haiq-storefront` to the Vercel GitHub App at github.com/settings/installations, then create
  the two staging Vercel projects.
- Open question: what a Build Your Box contains and costs (UGX 80,000, or 40,000 on special days,
  vs a UGX 5,000 single-flavour pack on the shop).
