# scripts/

One-off dev tooling used to seed `lib/data.ts` with real products from
hobby-genki.com. **Not part of the app build** — Playwright is intentionally
not a project dependency (its postinstall downloads a browser).

To run these, install Playwright locally first:

```bash
npm i -D playwright
npx playwright install chromium
```

The site is behind a Cloudflare JS challenge that plain fetching (and
Playwright-launched browsers) can't pass — Cloudflare re-challenges automated
browsers in a loop. The working approach attaches to a real browser you've
already cleared the challenge in:

1. Launch Edge/Chrome with a debug port and a throwaway profile:
   ```
   msedge --remote-debugging-port=9222 --user-data-dir="%TEMP%\hg-scrape-profile" "https://hobby-genki.com/en/10-pre-order"
   ```
2. Solve the Cloudflare check in that window; wait for products to load.
3. Run a script — it attaches over CDP (`localhost:9222`) and only reads the DOM,
   so there's no automated navigation for Cloudflare to flag.

- `scrape-cdp.mjs` — extract products from the loaded page → `scraped.json`
- `download-images.mjs` — download product photos via the cleared session
  (carries the clearance cookie + Referer to avoid hotlink 403s) → `public/figures/`
- `inspect.mjs` — dump one product tile's HTML to check selectors
- `scrape.mjs` — initial direct-launch attempt (kept for reference; loops on Cloudflare)

## DAILY pre-order add — the routine (run from repo root)

We do this ~daily: pull the newest pre-orders off `hobby-genki.com/en/10-pre-order`,
keep only genuine **figures** not already in the app, and splice them into
`lib/data.ts`. The human's ONLY job is solving the Cloudflare check once (step 0).
**Speed is never the goal — be gentle; getting blocked/banned is the only real risk.**

**When unsure, ASK — don't guess.** If you hit a figure you can't identify, a
field you can't confidently fill (unknown series/maker, ambiguous whether an item
is even a figure), or anything that smells off, surface it to the user rather than
inventing a value. The user reviews and **confirms once the run is complete**, so
flag open questions before then. (Example: 2026-06-24's *Beautiful Chemistry
Metallic Odonata* had no maker on hobby-genki; the user supplied it manually —
maker **Underverse**. Leaving an honest `—` is fine; guessing a wrong value is not.)

**No-JAN is normal, not a gap.** Some products legitimately carry no JAN at source
(art toys, limited/one-off releases). As of 2026-06-24, 7 of 101 figures have a
blank `jan` and that's correct — the products have no barcode to scrape. Working
theory (unconfirmed): a SKU may only get assigned a JAN once enough pre-order
interest comes in. Don't fabricate JANs; `""` is the honest value.

Rules the pipeline enforces (don't undo these):
- **Newest-first / don't go deep.** `/10-pre-order` is the whole pre-order
  category (~900+ pages) but it lists newest-first. New items surface on the
  front pages; **stop once new figures dry up** (in practice the genuinely-new
  stream ends within the first ~8 pages a day after the last run). NEVER crawl
  the full category.
- **Dedup is by JAN + folder key + figure-check, derived live.** `select-new.mjs`
  reads existing JANs straight from `lib/data.ts` (so it can't go stale) and the
  existing `public/figures/<key>/` dirs; it keeps only names matching the figure
  POS regex and not the NEG regex (NEG now also drops option/swimsuit/parts/
  expansion *sets* — add-ons, not figures).
- **ids + droppedAt are automatic.** `build-data-pre.mjs` continues ids from the
  current max in `lib/data.ts` and stamps `droppedAt` = today (the Calendar key).
- **`OVERRIDE_SERIES`/`OVERRIDE_MAKER` in `build-data-pre.mjs` are per-run** —
  replace them each run for the stragglers where the source meta names a product
  line (not a franchise) as the series, or omits the maker.

Steps:
0. **Human:** launch Edge + solve Cloudflare on the pre-order page:
   `msedge --remote-debugging-port=9222 --user-data-dir="%TEMP%\hg-scrape-profile" "https://hobby-genki.com/en/10-pre-order"`
1. `node scripts/scrape-listing.mjs` — paginates `/10-pre-order` (gentle, 8 pages,
   4–6.5s/page) → `listing-all.json`. (Bump `MAX_PAGES` only if a day's new-figure
   stream is still going at page 8 — verify with the dedup in step 2 first.)
2. `node scripts/select-new.mjs` — figure-filter + JAN/folder dedup → `selected-new.json`
   (also rewrites `existing-jans.json` as a derived snapshot). **Eyeball the list.**
3. `node scripts/scrape-detail-pre.mjs` — per-product detail (qty/availability/
   meta/images), 4–7s each → `detail-pre.json`.
4. `node scripts/download-gallery-pre.mjs` — galleries → `public/figures/<key>/`
   + `gallery-manifest-pre.json`. (This file is overwritten each run — fine;
   prior runs' figures already have their thumbs + `image_url` set.)
5. Set this run's `OVERRIDE_SERIES`/`OVERRIDE_MAKER` in `build-data-pre.mjs`, then
   `node scripts/build-data-pre.mjs` → `new-figures-pre.ts.txt`. Audit the printed
   series/maker.
6. `node scripts/splice-pre.mjs` — inserts into `lib/data.ts`. Sanity:
   `ls public/figures | wc -l` should equal the figure count.
7. Thumbnails: `node scripts/pick-thumbnails.mjs` then `node scripts/normalize-thumbs.mjs`
   (offline; regenerates existing thumbs byte-identically — no churn), then repoint
   the new figures' `image_url` to their `thumb.jpg` (or chosen gallery shot for
   busy-bg ones). Availability is already real from step 3 — no separate pass.
8. `npm run build` to verify TS + SSG (and that every `image_url` file exists).
