import { chromium } from "playwright";
const browser = await chromium.connectOverCDP("http://localhost:9222");
const page = browser.contexts().flatMap((c) => c.pages()).find((p) => p.url().includes("hobby-genki.com"));
const html = await page.evaluate(() => {
  const t = document.querySelector(".product-miniature, article.product-miniature, .js-product-miniature");
  return t ? t.outerHTML : "NO TILE";
});
console.log(html);
await browser.close();
