# HAIQ Storefront Redesign — Master Plan (Phase 1 + Phase 2)

**Date:** 2026-09-04
**Status:** Approved-for-reference plan. Not yet built.
**Supersedes:** `phase-1-storefront-changes.md`

This is the single document we build against. Every change below has: **what**, **where** (files), **how**, and **expected outcome**. Stages are ordered so that no stage forces rework of an earlier one.

---

## Part A — Three findings that determine the build order

Before the item-by-item plan, three things came out of the code scan that change *when* things should be done. These are the reason the stages are ordered the way they are.

### Finding 1 — The accent colour is hardcoded 364 times, not themed

`tailwind.config.js` defines proper tokens (`primary`, `secondary`, `gold`), and `index.css` defines CSS variables (`--haiq-10`, etc.) — **but almost no component uses them.** Actual counts across `frontend/src`:

| Value | Occurrences |
|---|---|
| `#B8752A` (amber, inline) | 187 |
| `rgba(184,117,42,…)` (same amber, borders/glows) | 177 |
| `#E8C88A` (gold) | 32 |
| `#D4A574`, `#7A3B1E` | 5 |
| **Total** | **~364 across 28 files** |

**Consequence:** the Phase 2 palette change is *not* a config edit. Done naively it's a 364-occurrence find-and-replace with high regression risk. Done properly, we tokenize **once** (Stage 0), and then the palette change — and every future palette change — is a five-line edit in one file.

**This is why tokenization must happen before anything else.**

### Finding 2 — The palette change and font change invalidate the Phase 1 page work

Phase 1 asks us to dark-theme the Product Detail page and re-theme Featured Collections. Phase 2 then changes the accent colour and the entire font family. If we do Phase 1 first, we style those pages in amber + Playfair, then immediately restyle them in tan + Poppins — **every Phase 1 styling item gets built twice.**

**This is why the global layers (colour, type, spacing) move to the front, ahead of the Phase 1 page work.**

### Finding 3 — The home page already has two competing product sections

`HomePage.jsx` renders **both**:
- `FeaturedCollections.jsx` — a grid, fetching `/products/featured`, on a **light** background
- `CoreCollectionCarousel.jsx` — a horizontal carousel, fetching `/products?limit=12`, on a **light** background (`#F5F0EA`)

Phase 1 says "make Featured Collections black." Phase 2 says "Featured Collection becomes Core Collection, show all products, put it first." Those resolve to the same conclusion: **these two components merge into one section.** Re-theming `FeaturedCollections` in Phase 1 is throwaway work if the component is about to be replaced.

**This is why Phase 1's "Featured Collections black background" is folded into the Stage 4 home-page rebuild rather than done on its own.**

### Also worth knowing

- **Spacing has no system.** Horizontal padding at `md:` uses five different values (`px-16` ×20, `px-20` ×2, `px-24`, `px-12`, `px-8`). Vertical rhythm uses nine (`py-10` → `py-40`). `container mx-auto` is used in only 14 files — the rest are full-bleed with their own padding. This is the direct cause of both the inconsistent device-to-device spacing *and* a good share of the desktop negative space.
- **The OG image is the logo.** `og:image` points at `HAIQmain.png` — a logo on transparent/solid background, not a 1200×630 social card. Link previews currently look like a floating logo.
- **Events has zero backend.** No table, no route, no controller, no admin screen. It is a full-stack feature, not a page.
- **Product Detail page is still entirely on the old light theme** (`bg-light`, `text-gray-*`, `bg-gray-200` skeletons). It never received the dark pass the other pages got.
- **`hero-bakery.webp` and `cta-bg.webp` exist in `public/` but are 3-byte placeholder files** — empty. Any code referencing them is rendering nothing.

---

## Part B — The palette, derived from the logo

The client's brief: the current brown reads "brewery," we want a lighter brown that reads "bakery," and it must come from within the logo's own colour range, while keeping the dark backgrounds.

Colours extracted directly from `public/HAIQmain-accurate.svg` and `crown-accurate.svg`:

| Logo colour | Role in logo |
|---|---|
| `#D4C4A8` | light warm sand (most-used fill) |
| `#6B4423` | deep chocolate brown (the entire crown) |
| `#A67C52` | **medium warm tan** |
| `#F5EAD8` | cream |
| `#E8D9C3` | light cream |

**Proposed mapping — every value below is a real logo colour, nothing invented:**

| Token | Current | Proposed | Rationale |
|---|---|---|---|
| `primary` (CTAs, accents) | `#B8752A` | **`#A67C52`** | The brewery read comes from `#B8752A`'s high orange saturation. `#A67C52` is softer, lighter, less saturated — warm bakery tan. Straight from the logo. |
| `secondary` | `#D4A574` | **`#D4C4A8`** | Logo's sand tone. Reads as pastry/shortbread. |
| `gold` (highlights) | `#E8C88A` | **`#E8D9C3`** | Logo's light cream — a softer highlight than the current honey-gold. |
| `sienna` (pressed/deep) | `#7A3B1E` | **`#6B4423`** | The crown's chocolate. Gives a true "baked" deep tone. |
| `dark` / `dark2` (backgrounds) | `#1A0A00` / `#0E0600` | **unchanged** | Phase 1 explicitly keeps the dark grounds. |
| `light` (text) | `#F2EAD8` | **`#F5EAD8`** | Aligns to the logo's exact cream. Barely perceptible shift, but exact. |

**Contrast check (WCAG):** `#A67C52` on `#1A0A00` ≈ **4.8:1** — passes AA for normal text (needs 4.5:1), and comfortably passes for large text and UI. Dark text `#1A0A00` on an `#A67C52` button is the same ratio inverted, so buttons stay legible. **The palette change does not cost us accessibility.**

**Expected outcome:** the site reads as a warm bakery rather than a craft brewery, the accent finally matches the logo it sits next to, and dark backgrounds are untouched.

---

## Part C — The spacing system

Rather than "tidy the padding," we define a scale once and apply it through two primitives, so consistency is *structural* and can't drift again.

**Scale (Tailwind spacing units, mobile → tablet → desktop):**

| Token | Mobile | Tablet (`md`) | Desktop (`lg`+) | Used for |
|---|---|---|---|---|
| Gutter (horizontal page padding) | `px-5` | `px-10` | `px-16` | Every section's left/right edge |
| Section rhythm (vertical) | `py-14` | `py-20` | `py-28` | Space between major sections |
| Section rhythm — tight | `py-10` | `py-14` | `py-18` | Sub-sections, dense areas |
| Content max-width | — | — | `max-w-[1400px]` | Stops content sprawling on wide screens |
| Grid gap | `gap-3` | `gap-4` | `gap-5` | Product grids, image grids |

**How it's enforced:** two shared components in `frontend/src/components/shared/`:
- `<Container>` — applies gutter + max-width + centring. One place to change page width forever.
- `<Section>` — applies vertical rhythm + optional background token, wraps `<Container>`.

Every section component then becomes `<Section><…content…></Section>` instead of hand-written `container mx-auto px-6 md:px-16 py-20`.

**Expected outcome:** identical breathing room on every page at every breakpoint; the desktop negative-space problem is largely solved by the max-width + gutter pairing (content stops being stretched thin across 2560px monitors); and future sections are consistent by default rather than by discipline.

---

## Part D — The stages, in build order

Each stage is independently shippable and leaves the site in a working state.

---

### Stage 0 — Foundation: tokenize + quick wins
**Ships:** invisible refactor + two content fixes. No intended visual change.

| Task | Where | How | Expected outcome |
|---|---|---|---|
| 0.1 Tokenize colour | `index.css`, all 28 files with hardcoded hex | Define the full palette as CSS variables in `:root`. Mechanically replace `#B8752A` → `var(--c-primary)` and `rgba(184,117,42,X)` → `rgba(var(--c-primary-rgb), X)`. Keep both a hex and an `-rgb` triplet per token so alpha usage keeps working. Sync `tailwind.config.js` tokens to the same variables. | Zero visual change, verified by side-by-side screenshots. Colour becomes changeable from one file. |
| 0.2 Remove Coconut + Venom from Build Your Box | `BuildYourBoxPage.jsx` | Drop `'venom'`, `'coconut'` from `COOKIE_SLUGS`, leaving `['crimson-sin','campfire-after-dark','blackout']`. `BOX_SIZE` stays 4 (mixing/repeats still allowed). | Box picker shows only the three individually-buildable cookies. Venom and Coconut remain fully purchasable as packs on Shop/product pages. |
| 0.3 Fix the copy that counts flavours | `ShopPage.jsx:218`, `CTASection.jsx:54`, `HeroSection.jsx:7`, `SEO.jsx` (Shop + BuildYourBox descriptions) | "…from our 5 flavours" → "3 flavours". Audit the hero's `Flavours: 6` stat and the "Six cookies" copy against the live catalogue (currently 5 active slugs). | No stated number contradicts what the customer can actually see or pick. |
| 0.4 Delete dead assets | `public/`, `public/images/moments/` | Remove the 3-byte placeholder `hero-bakery.webp` / `cta-bg.webp`, and the unused legacy `moment_1…9.jpg` duplicates — **after** confirming nothing references them. | Cleaner asset dir; no broken image references. |

**Why first:** 0.1 unblocks Stages 1–2 and prevents the 364-occurrence problem from being paid twice. 0.2–0.4 are zero-dependency and can land the same day.

---

### Stage 1 — Palette + typography swap
**Ships:** the whole site changes colour and font at once.

| Task | Where | How | Expected outcome |
|---|---|---|---|
| 1.1 Apply the bakery palette | `index.css` (+ `tailwind.config.js`) | Change the token *values* to the Part B mapping. Because of Stage 0, this is a handful of lines. | Entire site shifts from brewery-amber to bakery-tan in one commit; backgrounds unchanged; instantly revertible. |
| 1.2 Swap the font to Poppins | `index.css` (Google Fonts `@import`, `body`, `h1–h6`), `tailwind.config.js` (`fontFamily.serif`, `fontFamily.sans`) | Point both theme keys at Poppins so all 34 files using `font-serif`/`font-sans` update with no per-file edits. Load weights 400/500/600/700/800 only (keeps the font payload small). | Whole site on Poppins from a two-file change. |
| 1.3 Set the weight ladder | same | Headings/labels/buttons at **700–800** (where Playfair Bold sits today); body copy at **400–500**. | "Poppins Bold" delivered where it carries the brand, without 700-weight paragraphs that are tiring to read. **⚠ Needs client sign-off — see Open Decisions.** |
| 1.4 Visual regression sweep | all pages | Walk every page at mobile/tablet/desktop after the swap. Poppins has different metrics to Playfair/Inter — expect line-height and letter-spacing touch-ups, especially on the big hero clamp sizes and the `tracking-[0.25em]` uppercase labels. | No broken layouts, no clipped headings, tuned tracking. |

**Why here:** doing this before any page-level restyling means every later stage is built once, in the final colours and final font.

---

### Stage 2 — Spacing & layout system
**Ships:** consistent rhythm everywhere; a chunk of the desktop negative space resolved.

| Task | Where | How | Expected outcome |
|---|---|---|---|
| 2.1 Build the primitives | new `components/shared/Container.jsx`, `Section.jsx` | Implement the Part C scale. | One source of truth for page width and rhythm. |
| 2.2 Migrate sections | all home sections, `ShopPage`, `BuildYourBoxPage`, `MomentsPage`, legal/FAQ/contact pages | Replace ad-hoc `container mx-auto px-6 md:px-16 py-20` with `<Section>`/`<Container>`. | The five horizontal and nine vertical spacing variants collapse to one scale. |
| 2.3 Cap content width | `Container` | `max-w-[1400px]` + centring. | On wide desktops content stops stretching into thin sparse rows — the biggest single contributor to the "too much negative space" complaint. |
| 2.4 Breakpoint audit | all pages | Check 360 / 390 / 768 / 1024 / 1440 / 1920 px. | Verified consistency device-to-device, which was an explicit client requirement. |

---

### Stage 3 — Navbar + hero fixes
**Ships:** the visible mobile bugs the client listed are gone.

| Task | Where | How | Expected outcome |
|---|---|---|---|
| 3.1 Enlarge the logo | `Navbar.jsx:150` | Logo is `h-9 md:h-11` (36/44px) inside a fixed `68px` row. Raise to roughly `h-12 md:h-14` (48/56px) and lift the bar to ~`84px` so the logo isn't cramped. Note the logo is absolutely centred (`absolute left-1/2`) — confirm it doesn't collide with the left nav group at ~768–900px. | Logo reads at a confident size on both mobile and desktop without the bar feeling tight. |
| 3.2 Fix hero text overlap | `Navbar.jsx:253`, `HeroSection.jsx:56` | Root cause found: the nav spacer `{!isHomePage && <div style={{height: spacerH}} />}` is **skipped on the home page**, so the fixed navbar (promo banner + 68px bar) floats over hero content, while the hero compensates with a hardcoded `pt-28 md:pt-32`. That guess breaks whenever the promo banner is shown/dismissed or text wraps. Replace the fixed padding with the measured `spacerH` value (already computed in `Navbar`), shared via context or a CSS variable. | Overlap gone at every width, and it stays fixed when the banner is dismissed. |
| 3.3 Re-align "Kampala · Uganda" | `HeroSection.jsx:56–59` | Same root cause as 3.2. Once padding is measured rather than guessed, position it deliberately against the headline's optical top. | Sits correctly under the nav instead of pushed low. |
| 3.4 Fix mobile headline alignment | `HeroSection.jsx:78–88` | `fontSize: clamp(3rem, min(9.5vw,13vh), 8.5rem)` — the `13vh` cap makes the headline shrink on short landscape phones and misalign against the fixed `px-8` gutter. Rework to the Stage 2 gutter scale and a mobile-first clamp. | "Made For You." aligned to the same gutter as everything else, at every mobile size. |
| 3.5 Rework the load animation | `HeroSection.jsx:13–26` | Currently a `setTimeout(80ms)` then opacity+transform transitions — on mobile these run while the page is still painting and fetching, which is the friction the client feels. Move to a proper load-in: trigger on `load`/first paint rather than an arbitrary timer, animate `opacity`/`transform` on compositor-friendly properties only, stagger the lines, and add a `prefers-reduced-motion` guard. | "Made For You" animates in smoothly as the site loads instead of stuttering after it. |
| 3.6 Hero background image | `HeroSection.jsx` | Add an image layer beneath the noise/content, `object-cover`, with a dark gradient scrim (`linear-gradient(to top, #1A0A00, rgba(26,10,0,.45) 55%, rgba(26,10,0,.75))`) for text legibility. Ship as WebP/AVIF with explicit dimensions to avoid layout shift. | Hero has a real backdrop; headline and CTA stay fully legible. **⚠ Blocked on client asset.** |

---

### Stage 4 — Home page restructure
**Ships:** the home page becomes the store. This is the largest structural stage.

**The new section order:**

```
1. Hero                      (compact — shorter than today's full h-screen)
2. Core Collection           ← all products, immediately, first thing after hero
3. Build Your Box strip      (inline CTA, not a separate trip)
4. How We Make It            (Process — images always visible)
5. Made For Real People      (Moments)
6. Events                    (desktop only — see Stage 8)
7. Brand Story
8. CTA / Footer
```

| Task | Where | How | Expected outcome |
|---|---|---|---|
| 4.1 Merge Featured + Carousel into Core Collection | new `components/home/CoreCollection.jsx`; delete `FeaturedCollections.jsx` and `CoreCollectionCarousel.jsx` | One responsive **grid** (not a carousel — carousels hide inventory behind interaction, which fights "how fast can I get what I'm looking for"). Fetch all active products. Dark background per Phase 1, using Stage 1 tokens. | Every product visible on arrival. Resolves Phase 1 item 2 and Phase 2's "Core Collection first" in one build. |
| 4.2 Shorten the hero | `HeroSection.jsx:34` | `h-screen min-h-[640px]` currently means products are entirely below the fold. Reduce to roughly `min(88vh, 720px)` so the first row of Core Collection peeks above the fold. | Customers see product within the first scroll — the single highest-impact conversion change on the page. |
| 4.3 Add the category anchor rail | `CoreCollection.jsx` | Sticky in-page rail (Cookies / Drinks / Build Your Box) that scroll-anchors within the home page instead of navigating away. | The "single page feel" the client asked for — browse the whole menu without a page load. |
| 4.4 Fill desktop negative space | all home sections | Combined effect of Stage 2's max-width cap, the denser product grid (4 columns at `xl`), and the asymmetric Moments grid already in place. Where gaps remain, prefer *content* (product rows, an events row) over decorative filler. | Desktop reads full and intentional rather than sparse. |
| 4.5 Remove duplicate nav trips | `Navbar.jsx` | With the full menu on the home page, reassess whether "Shop" and "Build Your Box" both need top-level nav slots on desktop, or whether they become anchors. | Fewer clicks to the same destination. |

---

### Stage 5 — Speed-to-order (the "how fast can I get what I'm looking for" priority)

Grounded in current food-ordering UX convention: photo-led menus convert materially better than text-only when images are real and sit *next to* the ordering action; every additional tap between menu and checkout measurably increases drop-off; and the primary CTA should move the user toward cart with minimal distraction.

| Task | Where | How | Expected outcome |
|---|---|---|---|
| 5.1 Quick-add everywhere | `CoreCollection.jsx`, `ShopPage.jsx`, `ProductCard.jsx` | Add-to-cart directly on the card (Shop's card already does this). For multi-variant products use the existing `VariantPickerModal.jsx` in place rather than routing to the detail page. | Menu → cart in **one tap**, no page load. |
| 5.2 Persistent cart / order bar | `Layout.jsx` or `Navbar.jsx` | Sticky bar on mobile showing item count + total + "Checkout", visible while browsing. | Cart state always visible; checkout always one tap away. |
| 5.3 Product Detail dark rewrite | `ProductDetailPage.jsx` | Full pass to the dark theme (background, breadcrumb, badges, price, description, tasting-notes card, trust signals, and the `bg-gray-200` skeletons). Built in Stage 1's palette/font and Stage 2's spacing — **which is exactly why it's sequenced here and not in Phase 1.** | Phase 1 item 8 delivered, matching the rest of the site, built once. |
| 5.4 Reduce checkout friction | `CheckoutPage.jsx` | Audit the current flow for redundant steps; ensure guest checkout is unobstructed and fields autofill. | Fewer abandonment points at the last mile. |

---

### Stage 6 — Content & imagery
**Ships:** Phase 1's remaining content items. Sequenced here because it depends on client assets, not on us.

| Task | Where | How | Expected outcome |
|---|---|---|---|
| 6.1 "Made For Real People" images | `public/images/moments/` | Home (`MomentsSection.jsx`) and `/moments` (`MomentsPage.jsx`) read the **same filenames**, so dropping new files in as `moment_01…10.jpg` updates both with **zero code changes**. Captions need rewriting only if the new photos don't match the existing ones. | Both surfaces refreshed from a file drop. **⚠ Blocked on client assets.** |
| 6.2 "How We Make It" — images always visible | `ProcessSection.jsx` | Currently the photo only renders inside a `maxHeight: 0 → scrollHeight` panel opened by clicking a step. Restructure so each step's photo renders inline and permanently; keep the click-to-expand for the *longer detail copy* only (or drop the accordion entirely — see Open Decisions). Replace `process_01/02/03/05.jpg`; note `process_04.jpg` already exists unused and could seed a 5th step. | Process is legible at a glance with no interaction required. |
| 6.3 Featured/Core hover animation | `CoreCollection.jsx` | **Design still to be agreed.** Options: caption slide-up (matches the existing Moments cards, so it's already on-brand), zoom + warm tint, or crossfade to a second product photo. Whatever we pick gets a `prefers-reduced-motion` guard and compositor-only properties. | Consistent, deliberate hover language. **⚠ Blocked on client direction.** |
| 6.4 New product images | `public/images/products/`, admin | As products arrive, add images and confirm the admin product flow covers them. Note `ShopPage`/`BuildYourBox` currently map slugs to local images via a **hardcoded `localImgMap`** — new products will need either an entry there or (better) a switch to the DB `images[]` the API already returns. | New products drop in without code edits. **⚠ Blocked on client assets.** |

---

### Stage 7 — Social presence: OG image + shareable order links

| Task | Where | How | Expected outcome |
|---|---|---|---|
| 7.1 Real OG image | new `public/og/og-default.jpg`, `SEO.jsx:23`, `index.html:26,34` | Today `og:image` is `HAIQmain.png` — the logo, not a social card. Create a proper **1200×630** card (product photography + logo + "Made For You", under 1MB, safe margins so nothing is cropped by platform-specific ratios). Set as `DEFAULT_IMAGE`, add `og:image:width`/`height`. | Link previews show an intentional branded card instead of a floating logo. |
| 7.2 Per-product OG images | `SEO.jsx` `ProductSEO` | Already falls back to `product.images[0]` — verify those images are ≥1200×630 and correctly cropped, or generate product-specific cards. | Sharing a product link previews *that* product. |
| 7.3 Industry-standard title/description lengths | `SEO.jsx` (all named exports) | Enforce and document the limits: **`og:title` ≤ 60 chars** (Google truncates ~60; Facebook ~88), **`og:description` ≤ 155 chars** (Google ~155–160; Facebook truncates ~200 but shows ~110 on mobile). Note `pageTitle` appends `" \| HAIQ Bakery"` (14 chars) — that overhead must be counted, and several current titles already exceed 60 once it's added (e.g. Home's is ~72). Rewrite each to fit front-loaded with the value proposition. | Nothing truncates mid-sentence on any platform; the important words land before the cut. |
| 7.4 Shareable direct-order links | `SEO.jsx`, routing, `CoreCollection.jsx` | Recommended approach — **deep links to a product with the cart pre-primed**: `/products/<slug>?add=1` opens the product with the item already in cart and the drawer open, so a social click is one tap from checkout. Pair each with its own OG card, and add a "Share" affordance on product pages that copies the link. A shortlink (`/p/<slug>`) can front it for bio/story use where characters matter. | A link shared to Instagram/WhatsApp/TikTok drops the customer at *ordering*, not at a homepage they must navigate. |
| 7.5 Keep dynamic SEO in sync | `backend/src/controllers/seo.controller.js` | The dynamic `sitemap.xml` / `llms.txt` already build from the live catalogue. Add the Events routes (Stage 8) to the sitemap. | Sitemap stays accurate as Events content grows. |

---

### Stage 8 — Events (full-stack build)

**Scope reality check:** there is **no events/posts infrastructure at all** in the backend — no table, no route, no controller, no admin screen. This is a feature build, not a page, and is correctly sequenced last.

**Proposed data model** — `events` table:

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `title` | text | |
| `slug` | text unique | for `/events/:slug` |
| `excerpt` | text | card + OG description |
| `body` | text | long-form post content |
| `cover_image_url` | text | Cloudinary, consistent with products |
| `event_date` | timestamptz | null for non-dated posts |
| `location` | text | nullable |
| `status` | enum(`draft`,`published`) | |
| `is_featured` | boolean | for the desktop home strip |
| `published_at`, `created_at`, `updated_at` | timestamptz | |

**Build order within the stage:**

| Step | Where | What |
|---|---|---|
| 8.1 | `backend/src/db/` migration | Create the table + indexes (`status`, `published_at`, `slug`). |
| 8.2 | `backend/src/controllers/events.controller.js`, `routes/events.routes.js` | Public: `GET /events` (published, paginated), `GET /events/:slug`. |
| 8.3 | `backend/src/controllers/admin/admin.events.controller.js`, `routes/admin/admin.events.routes.js` | Admin CRUD + publish/unpublish + image upload, following the existing `admin.products` pattern and its auth middleware. |
| 8.4 | `admin/src/pages/EventsPage.jsx` + nav entry | Management UI matching the existing admin style. |
| 8.5 | `frontend/src/pages/EventsPage.jsx`, `EventDetailPage.jsx`, routes in `App.jsx` | Public listing + detail, dark theme, Stage 1/2 tokens. |
| 8.6 | `Navbar.jsx` | Add "Events" to the **mobile/tablet** nav only — `md:hidden` on the desktop nav array, present in the mobile menu array. Desktop deliberately has no Events tab, per brief. |
| 8.7 | `components/home/EventsSection.jsx`, `HomePage.jsx` | Desktop-only home section (`hidden lg:block`) showing featured/recent events as a horizontal card row, placed after Moments. Doubles as a genuine filler for desktop negative space. |
| 8.8 | `SEO.jsx`, `seo.controller.js` | `EventsSEO` + per-event OG cards; add events to the dynamic sitemap. |

**Expected outcome:** events are managed from the admin like products; mobile/tablet users get a dedicated tab; desktop users get them woven into the home page with no extra nav slot.

---

## Part E — Dependency map (why this order)

```
Stage 0  Tokenize ─────────────┐
         (+ quick wins)        │
                               ▼
Stage 1  Palette + Poppins ────┐   ← would rework 28 files if done later
                               ▼
Stage 2  Spacing system ───────┐   ← would rework every section if done later
                               ▼
Stage 3  Navbar + Hero ────────┤
Stage 4  Home restructure ─────┤   ← replaces FeaturedCollections entirely
Stage 5  Speed-to-order ───────┘   ← ProductDetail rewrite lands here, built once
                               │
Stage 6  Content/imagery ──────┤   (gated on client assets, can run in parallel)
Stage 7  OG + share links ─────┤
Stage 8  Events (full stack) ──┘   (independent; can start backend any time)
```

**Parallelisable:** Stage 8's backend (8.1–8.4) has no dependency on the frontend stages and can be built alongside Stages 1–5. Stage 6 is gated purely on client assets arriving.

---

## Part F — Open decisions (needed before the relevant stage)

| # | Decision | Needed by | Recommendation |
|---|---|---|---|
| 1 | **Poppins Bold everywhere, or bold headings + regular body?** | Stage 1 | Bold headings/buttons, 400–500 body. Bold paragraphs are tiring to read and will hurt the long-form pages (FAQ, legal, product descriptions). |
| 2 | **Confirm the palette mapping in Part B** | Stage 1 | Approve `#A67C52` as the new primary. We can mock the home page in it before committing site-wide — it's a one-file revert either way. |
| 3 | **"How We Make It" — keep click-to-expand for detail copy, or show everything?** | Stage 6.2 | Keep the expand for the *long* detail text; images and headline copy always visible. Preserves scannability without a wall of text. |
| 4 | **Core Collection hover animation direction** | Stage 6.3 | Caption slide-up + subtle zoom, matching the Moments cards already on the site — consistent language, no new vocabulary. |
| 5 | **Direct-order share links: pre-add to cart, or land on product page?** | Stage 7.4 | Pre-add (`?add=1`) for campaign links, plain product links for organic sharing. Gives the fastest path without surprising organic visitors. |
| 6 | **Events content structure — dated events only, or general posts too?** | Stage 8.1 | Support both via nullable `event_date`; costs nothing now and avoids a migration later. |
| 7 | **Hero: keep the spec strip (Flavours/Per Pack/Price/City)?** | Stage 4.2 | It occupies bottom real estate that a shorter hero needs. Suggest folding those facts into the Core Collection header instead. |

---

## Part G — Assets needed from the client

| Asset | For | Spec |
|---|---|---|
| Hero background image | Stage 3.6 | Landscape, high-res (≥2400px wide), with a compositionally quiet left/centre area for the headline. |
| "Made For Real People" photos | Stage 6.1 | Up to 10, portrait or square, named `moment_01.jpg` … `moment_10.jpg`. |
| "How We Make It" photos | Stage 6.2 | 4–5 process shots, landscape 4:3. |
| New product images | Stage 6.4 | Square, consistent lighting/background with the existing five. |
| OG card source | Stage 7.1 | A hero product shot we can compose the 1200×630 card from (we can produce the card). |
| Event photos | Stage 8 | As events are created, via the admin. |

---

## Part H — Definition of done

The plan is complete when:

- Colour and font are changeable from **one file** each, and the site reads as a bakery in the logo's own palette.
- Spacing is identical in rhythm at 360 / 390 / 768 / 1024 / 1440 / 1920 px.
- No text overlaps the navbar on any device; the logo reads at a confident size.
- A first-time visitor sees **product** without scrolling past a full viewport, and can go from landing to cart in **one tap**.
- Every page and every product page is on the dark theme — no light-theme leftovers.
- A shared link on Instagram/WhatsApp shows a real branded preview card with untruncated title and description, and lands the visitor on something orderable.
- Events are manageable from the admin, appear as a tab on mobile/tablet, and as a home-page section on desktop.

**Sources consulted for Stage 5's ordering-UX rationale:**
- [Food Delivery Conversion Pages in 2026 — Unicorn Platform](https://unicornplatform.com/blog/food-delivery-conversion-pages-in-2026/)
- [Restaurant Online Ordering UX: What Diners Expect in 2026 — Beyond Menu](https://get.beyondmenu.com/blog/restaurant-online-ordering-ux/)
- [Restaurant Website Design: 7 Must-Have Elements — Chowly](https://chowly.com/resources/blogs/restaurant-website-design-7-elements-of-a-high-converting-restaurant-website/)
- [UX/UI for Food Delivery Platforms — SennaLabs](https://sennalabs.com/blog/ux-ui-for-food-delivery-platforms-improving-order-efficiency-and-retention)
