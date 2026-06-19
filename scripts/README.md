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
