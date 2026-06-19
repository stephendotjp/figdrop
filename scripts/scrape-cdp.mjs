import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEL = ".product-miniature, article.product-miniature, .js-product-miniature";

// Attach to a Chrome you launched yourself (see instructions) and already
// solved the Cloudflare challenge in. We do NOT navigate — just read the DOM.
const browser = await chromium.connectOverCDP("http://localhost:9222");
const contexts = browser.contexts();
const pages = contexts.flatMap((c) => c.pages());
const page =
  pages.find((p) => p.url().includes("hobby-genki.com")) || pages[0];

if (!page) {
  console.error("No open tab found. Open the pre-order page in that Chrome first.");
  process.exit(1);
}
console.log("Attached to tab:", page.url());

await page.waitForSelector(SEL, { timeout: 30000 });

const products = await page.evaluate((sel) => {
  const tiles = [...document.querySelectorAll(sel)];
  const txt = (el) => (el ? el.textContent.trim().replace(/\s+/g, " ") : "");
  // Derive a clean full name from the URL slug, since the listing truncates it.
  const nameFromSlug = (url) => {
    const seg = (url.split("/").pop() || "").replace(/\.html$/, "");
    return seg
      .replace(/^\d+-/, "")          // drop leading product id
      .replace(/-\d{8,}$/, "")       // drop trailing EAN/barcode
      .replace(/-+$/, "")
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };
  return tiles.map((t) => {
    const nameEl = t.querySelector("h2.product-title a, .product-title a");
    const url = nameEl?.href || "";
    // The product photo is the img carrying data-full-size-image-url (stickers don't).
    const photo = t.querySelector("img[data-full-size-image-url]");
    return {
      name: nameFromSlug(url),
      url,
      price: txt(t.querySelector("span[itemprop='price'], .price")),
      regular_price: txt(t.querySelector(".regular-price")),
      discount: txt(t.querySelector(".discount-percentage, .discount-product")),
      category: decodeURIComponent((url.split("/en/")[1] || "").split("/")[0]).replace(/-/g, " "),
      availability: txt(t.querySelector(".product-flag")),
      image: photo?.src || "",
      image_large: photo?.getAttribute("data-full-size-image-url") || photo?.src || "",
    };
  });
}, SEL);

console.log(`Found ${products.length} products`);
writeFileSync(join(__dirname, "scraped.json"), JSON.stringify(products, null, 2));
console.log("Wrote scripts/scraped.json");

await browser.close(); // detaches; does not close your Chrome
