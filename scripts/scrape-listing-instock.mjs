// Crawl the IN-STOCK pre-order listing, newest first, to gather product tiles.
// Gentle: 5-7s between pages, incremental save so a mid-run stop keeps progress.
//   node scripts/scrape-listing-instock.mjs
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "listing-instock.json");
const SEL = ".product-miniature, article.product-miniature, .js-product-miniature";
const BASE = "https://hobby-genki.com/en/10-pre-order?in-stock=1";
const MAX_PAGES = 100;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (min, max) => min + Math.floor(Math.random() * (max - min));

const browser = await chromium.connectOverCDP("http://localhost:9222");
const pages = browser.contexts().flatMap((c) => c.pages());
const page = pages.find((p) => p.url().includes("hobby-genki.com")) || pages[0];
if (!page) {
  console.error("No hobby-genki tab found.");
  process.exit(1);
}

const extract = () =>
  page.evaluate((sel) => {
    const tiles = [...document.querySelectorAll(sel)];
    const txt = (el) => (el ? el.textContent.trim().replace(/\s+/g, " ") : "");
    return tiles.map((t) => {
      const a = t.querySelector("h2.product-title a, .product-title a");
      const url = a?.href || "";
      const photo = t.querySelector("img[data-full-size-image-url]");
      return {
        name: txt(a),
        url,
        price: txt(t.querySelector("span[itemprop='price'], .price")),
        category: decodeURIComponent((url.split("/en/")[1] || "").split("/")[0]).replace(/-/g, " "),
        flag: txt(t.querySelector(".product-flag")),
        image_large: photo?.getAttribute("data-full-size-image-url") || photo?.src || "",
      };
    });
  }, SEL);

const all = [];
const seen = new Set();
for (let pno = 1; pno <= MAX_PAGES; pno++) {
  const url = pno === 1 ? BASE : `${BASE}&page=${pno}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(jitter(5000, 7000));
  try {
    await page.waitForSelector(SEL, { timeout: 20000 });
  } catch {
    console.log(`page ${pno}: no products — stopping.`);
    break;
  }
  const items = await extract();
  const fresh = items.filter((i) => i.url && !seen.has(i.url));
  fresh.forEach((i) => seen.add(i.url));
  all.push(...fresh);
  console.log(`page ${String(pno).padStart(3)}: ${items.length} tiles, ${fresh.length} new  (total ${all.length})`);
  if (pno > 1 && fresh.length === 0) {
    console.log("no new items — stopping.");
    break;
  }
  if (pno % 10 === 0) writeFileSync(OUT, JSON.stringify(all, null, 2)); // checkpoint
}

writeFileSync(OUT, JSON.stringify(all, null, 2));
console.log(`\nWrote ${OUT} (${all.length} unique products)`);
await browser.close();
