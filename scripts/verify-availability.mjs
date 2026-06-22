// One-off verification: dump EVERYTHING hobby-genki exposes that could relate
// to preorder timing/status, so we can confirm what is real.
// Connects over CDP to an Edge window where the Cloudflare check is already solved.
//   1) msedge --remote-debugging-port=9222 --user-data-dir="%TEMP%\hg-scrape-profile" "https://hobby-genki.com/en/"
//   2) solve the Cloudflare "Just a moment..." once
//   3) node scripts/verify-availability.mjs
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// A few products across different categories.
const URLS = [
  "https://hobby-genki.com/en/nendoroid-figures-good-smile-company-official/91744-nendoroid-megurine-luka-v4x-character-vocal-series-03-megurine-luka-figure-limited-bonus-set-4570232587090.html",
  "https://hobby-genki.com/en/scale-figures-statues/91739-cats-are-liquid-illustration-by-karaage-toufu-silver-moon-figure.html",
  "https://hobby-genki.com/en/pokemon/91728-pokemon-scale-world-sinnoh-region-3-set-4570117928949.html",
];

const browser = await chromium.connectOverCDP("http://localhost:9222");
const ctx = browser.contexts()[0];
const page =
  ctx.pages().find((p) => p.url().includes("hobby-genki.com")) ||
  ctx.pages()[0] ||
  (await ctx.newPage());

const results = [];
for (const url of URLS) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(4000);

  const data = await page.evaluate(() => {
    // 1) The full PrestaShop product blob (every key, untruncated).
    const details = document.querySelector("#product-details");
    let product = null;
    try {
      product = JSON.parse(details?.dataset.product || "null");
    } catch (e) {
      product = { __parse_error: String(e) };
    }

    // 2) All schema.org structured data (offers.availability, priceValidUntil, etc.)
    const ldjson = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((s) => {
        try {
          return JSON.parse(s.textContent);
        } catch {
          return { __raw: s.textContent.slice(0, 2000) };
        }
      });

    // 3) Visible availability / delivery / preorder text on the page.
    const text = (sel) => {
      const el = document.querySelector(sel);
      return el ? el.textContent.replace(/\s+/g, " ").trim() : null;
    };
    const availabilityDom = {
      product_availability: text("#product-availability"),
      product_quantities: text(".product-quantities"),
      product_minimal_quantity: text(".product-minimal-quantity"),
      delivery_information: text(".delivery-information"),
      product_reference: text(".product-reference"),
      // anything mentioning pre-order / deadline / order period in the page body
      preorder_mentions: [...document.querySelectorAll("body *")]
        .map((el) => el.childNodes)
        .flatMap((nodes) => [...nodes])
        .filter((n) => n.nodeType === 3) // text nodes only
        .map((n) => n.textContent.replace(/\s+/g, " ").trim())
        .filter((t) =>
          /pre[- ]?order|order period|deadline|order by|order before|closes|cut[- ]?off/i.test(t)
        )
        .slice(0, 20),
    };

    return { product, ldjson, availabilityDom };
  });

  // Keep a compact summary of the product blob's KEYS so we can see at a glance
  // whether any close-date-like field exists.
  const productKeys = data.product && typeof data.product === "object"
    ? Object.keys(data.product).sort()
    : [];

  console.log(`\n=== ${url.split("/").pop()} ===`);
  console.log("product keys:", productKeys.join(", "));
  console.log("availability DOM:", JSON.stringify(data.availabilityDom));

  results.push({ url, productKeys, ...data });
}

writeFileSync(join(__dirname, "verify-availability.json"), JSON.stringify(results, null, 2));
console.log(`\nWrote scripts/verify-availability.json (${results.length} products)`);
await browser.close();
