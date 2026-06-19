import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TARGET = "https://hobby-genki.com/en/10-pre-order";

const browser = await chromium.launch({
  headless: false,
  args: ["--disable-blink-features=AutomationControlled"],
});
const ctx = await browser.newContext({
  locale: "en-US",
  viewport: { width: 1366, height: 900 },
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
});
// Hide the obvious navigator.webdriver automation flag.
await ctx.addInitScript(() => {
  Object.defineProperty(navigator, "webdriver", { get: () => undefined });
});
const page = await ctx.newPage();

console.log("Loading once:", TARGET);
await page.goto(TARGET, { waitUntil: "domcontentloaded", timeout: 60000 });

const SEL = ".product-miniature, article.product-miniature, .js-product-miniature";

// Poll up to 90s. If a Cloudflare checkbox appears in the visible window, click it manually.
console.log("Waiting for products (solve the Cloudflare checkbox in the window if one appears)...");
let ok = false;
for (let i = 0; i < 45; i++) {
  if (await page.$(SEL)) { ok = true; break; }
  await page.waitForTimeout(2000);
}
console.log("Page title:", await page.title(), "| products visible:", ok);

const products = await page.evaluate((sel) => {
  const tiles = [...document.querySelectorAll(sel)];
  const txt = (el) => (el ? el.textContent.trim().replace(/\s+/g, " ") : "");
  return tiles.map((t) => {
    const nameEl = t.querySelector(".product-title a, h2 a, h3 a, .product-name a, a.product-name");
    const priceEl = t.querySelector(".price, .product-price, span[itemprop='price']");
    const img = t.querySelector("img");
    return {
      name: txt(nameEl),
      url: nameEl?.href || "",
      price: txt(priceEl),
      brand: txt(t.querySelector(".product-manufacturer, .manufacturer")),
      reference: txt(t.querySelector(".product-reference")),
      availability: txt(t.querySelector(".product-availability, .product-flag")),
      image:
        img?.getAttribute("data-full-size-image-url") ||
        img?.getAttribute("data-src") ||
        img?.src ||
        "",
    };
  });
}, SEL);

console.log(`Found ${products.length} products`);
writeFileSync(join(__dirname, "scraped.json"), JSON.stringify(products, null, 2));
console.log("Wrote scripts/scraped.json");

await browser.close();
