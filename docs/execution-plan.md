# HAIQ — Execution Plan (Repo Migration + Storefront Redesign)

**Date:** 2026-09-08
**Status:** In progress
**Companion doc:** [`storefront-redesign-plan.md`](./storefront-redesign-plan.md) — this file sequences that plan's Stages 0–8 alongside the infrastructure move. Read that one for the *design* detail (palette, type, spacing, per-component changes); this one is the *operational* order of everything, including the repo/hosting migration.

---

## Why a Phase 0 exists at all

The client asked for a repo migration ("place the cloned repo into a new repo we'll use for these post-maintenance changes") ahead of the design work. That's the right call for one concrete reason: once code starts moving to `github.com/Spryra/haiq-storefront`, every hosting provider's auto-deploy (Vercel × 2, Render, and whatever pulls migrations against Neon) needs to point at the *new* remote before real work lands there, or commits either deploy nowhere or deploy to the old client-owned infra by accident. Sequencing infra first means Stage 0 of the redesign plan lands in the right place the first time.

---

## Phase 0 — Repository & infrastructure migration

### 0.1 Security pass on git history *(done — see finding below)*

**Finding:** a full history scan (`git log --all -p`, grepping for connection-string and key patterns) turned up a **live Neon Postgres credential** committed in an earlier commit:
```
postgresql://[user]:[REDACTED_ROTATED_PASSWORD]@[neon-pool-url]/neondb
```
Later commits correctly redacted this pattern to `[user]:[password]@[neon-pool-url]`, but the earlier commit stayed in history. Since the new repo is going public, that string would be permanently visible to anyone.

**Action taken:** the mirrored history is being rewritten (`git filter-branch --tree-filter`, redacting the password and host token across all 210 commits) before anything is pushed to the public repo.

**Action still required from you, independent of this migration:** rotate that Neon role's password now (Neon dashboard → the `neondb_owner` role, or the `reset_postgres_role_password` Neon tool) and update `DATABASE_URL` in Render's environment variables for the backend service. Scrubbing history hides the string; it does not invalidate it — only rotation does that. Treat this as done-today, not part of the redesign timeline.

### 0.2 Create the new repository
- `github.com/Spryra/haiq-storefront` — **public**.
- Full history pushed (post-scrub) so blame/PR history for future reference stays intact; only the leaked credential is altered, not squashed away.

### 0.3 Re-point local + hosting
| System | Current | Action |
|---|---|---|
| Local working copy (`D:\Junior Reactive Projects\HAIQ`) | `origin` → `haiq719/HAIQ-Website` | Add/switch `origin` to `Spryra/haiq-storefront` once pushed and verified, so future commits go to the right place. |
| Vercel (frontend) | deployed from `haiq719/HAIQ-Website` | Re-link the Vercel project's Git integration to the new repo (or create a fresh project pointed at it — cleaner, avoids carrying over old deploy history/env mismatches). |
| Vercel (admin) | same | Same treatment. |
| Render (backend API) | deployed from `haiq719/HAIQ-Website` | Re-point the Render service's repo, or recreate the service against the new repo. Re-enter `DATABASE_URL` (with the **rotated** password from 0.1), `JWT_SECRET`, Cloudinary, Resend, and payment keys — Render env vars don't migrate with a repo switch. |
| Neon (database) | independent of GitHub | Not migrated — it's the same database. Only the credential rotates (0.1). |
| Domain / DNS | n/a yet (no custom domain connected per the SEO doc) | No action until a domain is purchased. |

**Order within 0.3:** backend (Render) first, since the frontend/admin builds depend on `VITE_API_BASE_URL` pointing at a live API — verify the API responds before flipping the frontends over, so there's no window where the live site 404s.

### 0.4 Decommission the old repo's deploys
Once the new repo's three services (frontend, admin, backend) are confirmed live and serving correctly, disable auto-deploy on the old `haiq719/HAIQ-Website`-linked services (don't delete yet — keep as rollback for a week or two) so a stray push to the old remote can't silently redeploy stale code over the new setup.

**Expected outcome of Phase 0:** the exact same site, running from the new repo, on freshly-verified hosting, with no live credential sitting in public history.

---

## Phase 1 — Design system foundation
*(= Stages 0–2 of `storefront-redesign-plan.md`)*

Everything here happens **before** any page gets touched for its own sake, because it's the layer every later page-level change is built on top of.

1. **Stage 0 — Tokenize + quick wins.** Replace the 364 hardcoded colour occurrences with CSS-variable references; remove Coconut/Venom from Build Your Box; fix the flavour-count copy; clean up dead assets. Zero visual change — verified by screenshot diff.
2. **Stage 1 — Palette + Poppins.** Apply the logo-derived palette (approved via the mockup — `#A67C52` primary, etc.) and the Poppins type system (bold headings/buttons, regular body, per your confirmation on the mockup) site-wide from the now-tokenized files.
3. **Stage 2 — Spacing system.** Build the `Container`/`Section` primitives and migrate every page onto the one spacing scale. This is also where the "consistent spacing device-to-device" requirement gets solved structurally rather than page-by-page.

**Expected outcome:** the site is visually and structurally consistent everywhere, in the new brand colours and type, before a single Phase 2 layout change begins.

---

## Phase 2 — Page-level rebuild
*(= Stages 3–5 of `storefront-redesign-plan.md`)*

4. **Stage 3 — Navbar + hero fixes.** Logo size, the measured-not-guessed nav spacer (root cause of the text overlap *and* the low "Kampala · Uganda" *and* the mobile misalignment), the hero load animation, and the hero background image once supplied.
5. **Stage 4 — Home page restructure.** Merge `FeaturedCollections` + `CoreCollectionCarousel` into one "Core Collection" grid, shorten the hero so product is visible on load, reorder sections per the brief (Core Collection first), add the category anchor rail for the single-page browsing feel.
6. **Stage 5 — Speed-to-order.** Quick-add on every product card, a persistent mobile cart bar, and — the single biggest leftover from Phase 1 — the full dark-theme rewrite of the Product Detail page (deliberately built here, once, in the final palette/type/spacing rather than twice).

**Expected outcome:** a first-time visitor sees real product without a full scroll, can add to cart in one tap, and every page (including Product Detail) matches the same dark system.

---

## Phase 3 — Content, social, and Events
*(= Stages 6–8 of `storefront-redesign-plan.md`, plus their dependencies)*

7. **Stage 6 — Content & imagery.** Swapped in as client assets arrive (Moments photos, Process photos, new products); the hover-animation direction gets finalized here per the earlier open decision.
8. **Stage 7 — OG image + shareable order links.** A real 1200×630 social card (replacing the current logo-as-OG-image), title/description lengths brought within platform truncation limits, and direct-to-cart product share links.
9. **Stage 8 — Events (full-stack build).** Backend table + API + admin CRUD, then the public pages, the mobile/tablet-only nav tab, and the desktop home-page section. Sequenced last because it's genuinely new infrastructure, not a restyle — though its backend half has no dependency on Phases 1–2 and can be built in parallel by whoever isn't on the frontend work.

**Expected outcome:** the full Phase 2 (client's second message) brief is delivered — palette, type, spacing, navbar/hero fixes, home restructure, speed-to-order, OG/share links, and Events — on top of an infrastructure base that's fully under the new repo and verified-live hosting.

---

## Full order, top to bottom

```
Phase 0   Repo migration + infra re-point         ← this session
Phase 1   Stage 0  Tokenize + quick wins
          Stage 1  Palette + Poppins
          Stage 2  Spacing system
Phase 2   Stage 3  Navbar + hero fixes
          Stage 4  Home page restructure
          Stage 5  Speed-to-order (incl. Product Detail rewrite)
Phase 3   Stage 6  Content & imagery              (gated on client assets)
          Stage 7  OG image + share links
          Stage 8  Events (full stack)             (backend can run in parallel)
```

## Immediate to-dos (yours)
- [ ] Rotate the Neon `neondb_owner` password and update it in Render. **Do this regardless of migration timing.**
- [ ] Confirm you're happy with Vercel/Render being recreated as fresh projects against the new repo (recommended) vs. re-linked in place.
- [ ] Keep sending hero/Moments/Process/product images as they're ready — Stage 6 is gated on them, not on us.
