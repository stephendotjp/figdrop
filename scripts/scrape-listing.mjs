import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEL = ".product-miniature, article.product-miniature, .js-product-miniature";
const BASE = "https://hobby-genki.com/en/10-pre-order";
const MAX_PAGES = 8;

// Gentle, randomised pauses so we don't hammer Cloudflare / the origin.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (min, max) => min + Math.floor(Math.random() * (max - min));

const browser = await chromium.connectOverCDP("http://localhost:9222");
const pages = browser.contexts().flatMap((c) => c.pages());
const page =
  pages.find((p) => p.url().includes("hobby-genki.com")) || pages[0];
if (!page) {
  console.error("No hobby-genki tab found. Open the pre-order page first.");
  process.exit(1);
}
console.log("Attached to tab:", page.url());

const extract = (sel) =>
  page.evaluate((sel) => {
    const tiles = [...document.querySelectorAll(sel)];
    const txt = (el) => (el ? el.textContent.trim().replace(/\s+/g, " ") : "");
    const nameFromSlug = (url) => {
      const seg = (url.split("/").pop() || "").replace(/\.html$/, "");
      return seg
        .replace(/^\d+-/, "")
        .replace(/-\d{8,}$/, "")
        .replace(/-+$/, "")
        .replace(/-/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
    };
    return tiles.map((t) => {
      const nameEl = t.querySelector("h2.product-title a, .product-title a");
      const url = nameEl?.href || "";
      const photo = t.querySelector("img[data-full-size-image-url]");
      return {
        name: nameFromSlug(url),
        url,
        price: txt(t.querySelector("span[itemprop='price'], .price")),
        category: decodeURIComponent((url.split("/en/")[1] || "").split("/")[0]).replace(/-/g, " "),
        availability: txt(t.querySelector(".product-flag")),
        image_large: photo?.getAttribute("data-full-size-image-url") || photo?.src || "",
      };
    });
  }, sel);

const all = [];
const seenUrls = new Set();

for (let pno = 1; pno <= MAX_PAGES; pno++) {
  if (pno > 1) {
    const url = `${BASE}?page=${pno}`;
    console.log(`\n→ navigating to page ${pno} (slow)…`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    // Let the page settle; Cloudflare clearance cookie carries over.
    await sleep(jitter(4000, 6500));
  }
  try {
    await page.waitForSelector(SEL, { timeout: 20000 });
  } catch {
    console.log(`Page ${pno}: no products — stopping.`);
    break;
  }
  const items = await extract(SEL);
  const fresh = items.filter((i) => i.url && !seenUrls.has(i.url));
  fresh.forEach((i) => seenUrls.add(i.url));
  console.log(`Page ${pno}: ${items.length} tiles, ${fresh.length} new`);
  all.push(...fresh);
  // No new items means we've run past the last real page.
  if (pno > 1 && fresh.length === 0) {
    console.log("No new items — stopping.");
    break;
  }
}

writeFileSync(join(__dirname, "listing-all.json"), JSON.stringify(all, null, 2));
console.log(`\nWrote scripts/listing-all.json (${all.length} unique products)`);
await browser.close(); // detaches; leaves your Edge open
