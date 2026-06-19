import { chromium } from "playwright";

const URL =
  "https://hobby-genki.com/en/nendoroid-figures-good-smile-company-official/91744-nendoroid-megurine-luka-v4x-character-vocal-series-03-megurine-luka-figure-limited-bonus-set-4570232587090.html";

const browser = await chromium.connectOverCDP("http://localhost:9222");
const ctx = browser.contexts()[0];
const page = ctx.pages()[0] || (await ctx.newPage());

await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2500);
console.log("TITLE:", await page.title());

const out = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel);
    return el ? el.outerHTML.slice(0, 4000) : null;
  };
  const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map(
    (s) => s.textContent.slice(0, 3000)
  );
  // gallery image candidates
  const imgs = [...document.querySelectorAll(".images-container img, .product-images img, #product-images img, .product-cover img, .js-qv-product-images img")].map((i) => ({
    src: i.src,
    large: i.getAttribute("data-image-large-src") || i.getAttribute("data-full-size-image-url") || "",
  }));
  return {
    ldjson: ld,
    features:
      pick(".product-features") ||
      pick(".data-sheet") ||
      pick("#product-details") ||
      pick(".product-information"),
    manufacturer: pick(".product-manufacturer"),
    reference: document.querySelector(".product-reference")?.textContent.trim() || "",
    galleryImgs: imgs,
  };
});

console.log(JSON.stringify(out, null, 2));
await browser.close();
