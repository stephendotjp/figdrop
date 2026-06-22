# Handover — FigDrop (SNKRS-style anime figure drop app)

Context for a fresh agent/session picking this up. Last updated 2026-06-21.

## What this is
Next.js 14 (App Router) + Tailwind app styled like Nike SNKRS, for anime
figure pre-order "drops". Deployed on Vercel (project `figdrop`, linked via
`.vercel/`), GitHub remote `github.com/stephendotjp/figdrop`, auto-deploys on
push to `master`. The dev hooks reference Vercel heavily but this is a plain
Next app — ignore the Vercel marketing noise unless relevant.

- Run locally: `npm run dev`
- Build: `npm run build` (passes as of last commit)
- Single source of product data: `lib/data.ts` (`figures: Figure[]`)
- **Theme is LIGHT** (white bg, dark text, red wordmark). See "Theme" below.

## Recent work (most recent first)
- `3c45e06` Onboarding iOS-viewport fix — gave `/welcome` its own layout
- `dc770de` / `2febac7` Added SNKRS-style onboarding splash at `/welcome`
- `faf89ea` Switched dark → **light theme** (image-consistency reasons)
- `bfef998` Normalized grid thumbnails (`thumb.jpg`) for consistent framing
- `be04319` Square image framing + curated cleanest thumbnail per product
- `be0d049` Added **20 more figures** scraped from hobby-genki (now 25 total)
- `b8b8fda` Converted to SNKRS dark theme — **later reverted by `faf89ea`**
- `04cca6a` and earlier: gallery carousel, first 5 real figures, mock-data app

## Theme (LIGHT — and why)
Started light, was flipped to a SNKRS-accurate **dark** theme (`b8b8fda`), then
flipped **back to light** (`faf89ea`). Reason: product photography is
overwhelmingly shot on white backgrounds. On dark, every white-bg image becomes
a harsh white tile and inconsistencies glare; on light they blend seamlessly.
Since the plan is to pull imagery from **multiple sites** (uncontrolled
backgrounds), light makes the common case free. We kept SNKRS's layout,
typography, and the red `FigDrop` wordmark — just on a light surface.
- Tailwind tokens (`tailwind.config.ts`): `ink` #111 (text), `dim` #666,
  `line` #E5E5E5, `card` #F5F5F5 (image surface), `accent` #FF1A1A (red wordmark).
- The onboarding splash (`/welcome`) is intentionally its own dark, full-bleed
  photo page regardless of app theme.

## Routing structure (route groups)
- `app/(main)/` — the app proper (`/`, `/drops`, `/calendar`, `/wishlist`,
  `/drop/[id]`). Its `layout.tsx` renders `TopNav` + `<main>` + `BottomNav`.
- `app/welcome/` — onboarding splash, OUTSIDE `(main)`, so it renders under the
  slim root `app/layout.tsx` with **no nav/chrome**. URLs are unchanged by the
  grouping. Root `layout.tsx` is now just `<html><body>{children}`.
- `/welcome` is NOT wired as the entry point — it's a standalone page. All three
  actions (Log In / Join / Continue as guest) just `Link href="/"` (no real auth).
  Uses normal flow at `min-h-[100svh]` + safe-area bottom padding so iOS browser
  UI never clips the buttons (the earlier `fixed` version did — don't reintroduce).

## The data: 74 real figures from hobby-genki.com (`lib/data.ts`, ids 1–74)
- **ids 1–5**: the original seed (Megurine Luka V4X Nendoroid [featured], two
  Cats are Liquid art toys, Pokémon Scale World Sinnoh, Toshiya Miyata Nendoroid).
- **ids 6–25**: 20 more figures scraped from the rest of the pre-order listing
  (Hololive, Vocaloid, Love Live! Hasunosora x3, Gridman/TENITOL x3, Gintama x2,
  Fairy Tail bunny, Code Geass HG, MODEROID super robots, etc.).
- **ids 26–74**: 49 more from the **in-stock** pre-order listing
  (`?in-stock=1`, crawled newest-first). Inclusive scope — **any figure** counts,
  Western/movie/comic + adult OK (per owner); only genuine non-figures (model
  cars, plush, keychains, accessories) excluded. Mix of anime (Evangelion, One
  Piece, Berserk, Genshin/Honkai, Umamusume…) and Western (Hot Toys Alien, NECA
  Hellraiser, McFarlane Marvel Rivals, Sideshow…). All have real `jan`,
  `quantity`, `availability`. Pipeline below.
- **`jan` field**: JAN/EAN barcode (PrestaShop `reference`), `""` when none (art
  toys/some Western). It's the future cross-retailer join key. ids 1–25 backfilled.

### What's REAL vs DERIVED (important for honesty)
- **Real from source:** name, `price_jpy`, `release_date` (the product's
  `available_date`), gallery `images[]`, and (for ids 6–25) `scale`/`height`
  parsed from each product's description text.
- **Calculated:** `price_usd` = `price_jpy ÷ 147`.
- **DERIVED, ids 6–25 only:** the detail pages had **no manufacturer element**,
  so `series`/`manufacturer` are mapped from the (unambiguous) product line —
  Nendoroid→Good Smile Company, HG→Bandai Spirits, S.H.Figuarts→Bandai,
  MODEROID→Good Smile Company, B-Style→FREEing, PalVerse→Bushiroad, TENITOL→FuRyu,
  Plafia→PLUM, Love Live Hasunosora→Royce Entertainment. Factual brand
  attributions, not invented per-item. (ids 1–5 have real on-page manufacturers.)
- **REMOVED:** `preorder_closes` used to be a derived placeholder (~6 weeks
  before release). Verified against HG's live PrestaShop `data-product` blob that
  the shop has NO preorder-close date — only `available_date` (= `release_date`,
  which IS real). So the field was dropped from the type + data, and the detail
  countdown / calendar now target the real `release_date`. Don't reintroduce a
  fake close date. (See `scripts/verify-availability.mjs` + `.json`.)
- `status` is hardcoded `preorder_open` for all (unused for urgency now).
- **REAL stock (added):** `quantity` (int) + `availability` (`"available"` /
  `"last_remaining_items"` / `"unavailable"`) are scraped per figure from HG's
  PrestaShop blob. `scripts/scrape-availability-all.mjs` → `availability.json`;
  `scripts/merge-availability.mjs` splices them into `lib/data.ts`.
  `stockLevel(f)` in `lib/data.ts` maps these to `sold_out | last_items | low |
  in_stock` (sold_out = qty 0 / unavailable; last_items = ≤3 or last_remaining;
  low = ≤20). `components/StockBadge.tsx` renders the FOMO chip ("Only N left" /
  "Sold Out"); used on cards (grid/row + wishlist list) and the detail page
  (urgency line + SOLD OUT button/badge). 3 items are genuinely sold out
  (hg-135-zi-artemis, both Gintama Nendoroids); 2 at qty 1 (both Cats).

### Images (self-hosted, ~187 files)
Self-hosted in `public/figures/<key>/`. **Do NOT hotlink hobby-genki's CDN** —
Cloudflare hotlink-blocks on `Referer`. Two layers:
- `images[]` = full gallery (each `01..NN.jpg`), used by the detail-page carousel.
- `image_url` = the **card thumbnail**. For most products this points at a
  generated `thumb.jpg` (see below); for the few scenic ones it points at the
  cleanest gallery shot.
- `Figure.images: string[]` holds the full set; `image_url` is the single tile image.

### Thumbnail normalization (the "white border / uneven" fix)
Source photos vary wildly (white studio, scenic, black, even letterboxed promo
banners with logos). To make the grid consistent **without** ML:
1. `scripts/pick-thumbnails.mjs` scores every gallery image's background
   (brightness + corner uniformity + neutrality + subject coverage) and picks the
   cleanest per product → `scripts/thumbnails.json`.
2. `scripts/normalize-thumbs.mjs` takes clean studio shots, trims to the subject's
   bounding box, and re-pads to a consistent ~8% margin on a canvas filled with
   the image's **own** background colour → writes `public/figures/<key>/thumb.jpg`
   (22/25). `image_url` then points at `thumb.jpg`. → `scripts/thumb-normalized.json`.
Image containers are **square** (`aspect-square`) so the 800×800 sources aren't
crop-mangled (the old hero `16:9` / gallery `16:10` did that).
- **Known ceiling:** ~3 products (both Cats are Liquid, the HG mecha) have NO
  neutral-bg photo in any gallery image — they're scenic/black and can't truly
  match the grid without **background removal** (deferred ML pilot). On the light
  theme they blend acceptably as editorial cards.

## How the scraping worked (NON-OBVIOUS — read before re-scraping)
hobby-genki.com sits behind a **hard Cloudflare JS challenge**. What does NOT work:
- WebFetch / curl → 403 "Just a moment…"
- Playwright launching its own browser → Cloudflare re-challenges in a loop.

What DOES work (the method all scripts use):
1. Launch a **real** Edge with a debug port + throwaway profile:
   `msedge --remote-debugging-port=9222 --user-data-dir="%TEMP%\hg-scrape-profile" "<url>"`
   (Edge is at `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`.)
2. **A human solves the Cloudflare check once** in that window.
3. Playwright **attaches over CDP** (`chromium.connectOverCDP("http://localhost:9222")`)
   and reads the DOM. Same-domain navigation (detail pages, pagination) works
   because the clearance cookie persists; image fetches use
   `ctx.request.get(url, { headers: { referer } })`. **Go slow** (the new scripts
   add 4–8s delays between page loads) to stay gentle on Cloudflare.
4. **Clearance lapses** (~10–15 min, or after heavy crawling). When `quantity`
   comes back `NaN`/empty for every product, or images 403, it's a re-challenge —
   have the human re-solve in the Edge window and re-run. Don't crank delays down.

## scripts/ (dev-only tooling — Playwright intentionally NOT in package.json)
Its postinstall downloads a browser that would slow/break the Vercel build. To
run, install locally: `npm i -D playwright && npx playwright install chromium`.
- **First-seed (ids 1–5):** `scrape-cdp.mjs`, `inspect*.mjs`, `scrape-detail.mjs`,
  `download-images.mjs`, `download-gallery.mjs`; artifacts `scraped.json`,
  `detail.json`, `gallery-manifest.json`. `scrape.mjs` = dead direct-launch record.
- **+20 figures (ids 6–25):** `scrape-listing.mjs` (paginated listing, slow) →
  `listing-all.json`; `select.mjs` → `selected.json` (figure filter + curation);
  `scrape-detail-new.mjs` → `detail-new.json`; `download-gallery-new.mjs` →
  `gallery-manifest-new.json`; `build-data.mjs` → `new-figures.ts.txt` (spliced
  into `lib/data.ts`).
- **+49 figures (ids 26–74), in-stock batch:** `scrape-listing-instock.mjs`
  (100 pages of `?in-stock=1`, checkpoints every 10) → `listing-instock.json`;
  `select-batch.mjs` (POS/NEG figure filter — only excludes non-figures — + slug
  dedup, target 50) → `selected-batch.json`; `scrape-detail-batch.mjs` (adds
  `meta_description` + `quantity`/`availability`) → `detail-batch.json`;
  `dedup-batch.mjs` (drop OOS + JAN dupes vs existing/within-batch) →
  rewrites `detail-batch.json` (raw kept as `detail-batch.raw.json`);
  `download-gallery-batch.mjs` → `gallery-manifest-batch.json`;
  `build-data-batch.mjs` (series/maker parsed from `meta_description`, with
  `OVERRIDE_SERIES`/`OVERRIDE_MAKER`/`KNOWN_MAKERS` maps) → `new-figures-batch.ts.txt`;
  `splice-batch.mjs` inserts before the `figures` array's `];`. JAN backfill for
  ids 1–25 = `backfill-jan.mjs`. `verify-availability.mjs` = the PrestaShop probe.
- **Thumbnails:** `pick-thumbnails.mjs` → `thumbnails.json`;
  `normalize-thumbs.mjs` → `thumb-normalized.json` + `thumb.jpg` files.

## Key files
- `lib/data.ts` — types + 25 figures + helpers (`getFigure`, `getFeatured`,
  `relatedBySeries`, `parseDate`). Shared `series` cross-links related figures
  on the detail page. The `TYPES` filter chips include `Bunny Ver.` (now matches
  the B-Style Mirajane figure) and `Scale`/`Nendoroid` (populated); `Figma`,
  `SH Figuarts`, `Pop Up Parade` currently match nothing → "No drops in this
  category". Home filter: `Scale` matches `type.includes("Scale")`, `Nendoroid`
  matches `type === "Nendoroid"`, `Bunny Ver.` matches `name.includes("Bunny")`.
- `app/(main)/layout.tsx` — nav + main wrapper. `app/layout.tsx` — slim root.
- `app/welcome/page.tsx` — onboarding splash (hero, tagline, 3 actions).
- `app/(main)/page.tsx` — home (filter chips, New This Week, Coming Soon).
- `app/(main)/drop/[id]/page.tsx` — detail (Gallery, specs grid, countdown).
- `components/` — `TopNav`/`BottomNav` (red wordmark, light chrome),
  `FeaturedDrop` (hero), `FigureCard`/`FigureImage` (cards), `Gallery` (carousel),
  `FilterChips`, `StatusBadge`.

## Open / suggested next steps
- **Background-removal pilot** for the ~3 scenic holdouts (cats x2, HG mecha) for
  full grid uniformity — the deferred ML step.
- Now that the theme is light, `normalize-thumbs.mjs` could be **simplified** to
  just framing/scale (drop the background-colour matching — white-on-white no
  longer needs it) before pulling from the next source.
- Consider making `/welcome` the **entry point** (e.g. redirect `/` → `/welcome`
  on first visit via a cookie) — currently it's standalone.
- Listing **cards** could add hover-to-peek a second image.
- Surface real **product descriptions** (in `scripts/detail*.json`) on detail pages.
- Trim/relabel the dead `TYPES` chips (`Figma`, `SH Figuarts`, `Pop Up Parade`).

## Gotchas
- **Folder-key collisions (scraping):** `select-batch.mjs`'s slug `key` only
  dedupes *within* the batch, not against existing `public/figures/<key>/` dirs.
  The Palkia scrape collided with existing id4 `pokemon-scale-world-sinnoh` and
  overwrote its gallery; fixed via `fix-pokemon-collision.mjs` + a `-palkia` dir.
  When adding figures, check new keys don't equal existing dir names (a sanity
  count: `ls public/figures | wc -l` should equal the figure count).
- Platform is **Windows + PowerShell**; a Bash tool is also available. Git
  identity is set locally to `shaolinmonkuk@gmail.com` / `stephendotjp`.
- `git push` prints to stderr; PowerShell shows it red but the push succeeds
  (look for the `old..new master -> master` line).
- **Dev server CSS warmup:** `npm run dev` JIT-compiles Tailwind on first request;
  a screenshot taken too early can catch unstyled HTML. Warm with a `curl` first,
  or use `npm run build && npm run start` for reliable screenshots. Note `npm run
  start` needs a fresh `next build` (a prior `dev` run leaves `.next` without a
  prod build id).
- Source product photos carry hobby-genki/maker watermarks (e.g. `F:NEX`,
  `WineCat`) — visible on the `/welcome` hero and some galleries. Expected.
- `.vercel` is gitignored; `node_modules`, `.next` too. Untracked local files
  (`files.zip`, `screens/`, `white-issue.png`) are not part of the app.
