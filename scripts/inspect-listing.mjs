// One gentle page load to understand the in-stock pre-order listing structure.
import { chromium } from "playwright";

const URL = "https://hobby-genki.com/en/10-pre-order?in-stock=1";
const browser = await chromium.connectOverCDP("http://localhost:9222");
const pages = browser.contexts().flatMap((c) => c.pages());
const page = pages.find((p) => p.url().includes("hobby-genki.com")) || pages[0];
console.log("attached:", page.url());

await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(3500);

const info = await page.evaluate(() => {
  const txt = (sel) => {
    const el = document.querySelector(sel);
    return el ? el.textContent.replace(/\s+/g, " ").trim() : null;
  };
  const tiles = [...document.querySelectorAll(".product-miniature, article.product-miniature, .js-product-miniature")];
  // pagination page numbers
  const pageLinks = [...document.querySelectorAll(".pagination a, nav.pagination a")]
    .map((a) => ({ text: a.textContent.replace(/\s+/g, " ").trim(), href: a.href }))
    .filter((x) => x.text);
  // items-per-page selector options (PrestaShop "show N")
  const perPageOpts = [...document.querySelectorAll(".products-selection select option, select#nb_item option, .nbr-product-page option")]
    .map((o) => ({ text: o.textContent.trim(), value: o.value }));
  // sort options
  const sortOpts = [...document.querySelectorAll(".products-sort-order option, #sortby option, .product-sort option")]
    .map((o) => ({ text: o.textContent.trim(), value: o.value }));
  // sample tiles: name + flag + category-from-url
  const sample = tiles.slice(0, 6).map((t) => {
    const a = t.querySelector("h2.product-title a, .product-title a");
    const url = a?.href || "";
    return {
      name: a?.textContent.replace(/\s+/g, " ").trim() || "",
      flag: t.querySelector(".product-flag")?.textContent.replace(/\s+/g, " ").trim() || "",
      category: (url.split("/en/")[1] || "").split("/")[0],
    };
  });
  return {
    total_count_text: txt(".total-products, .products-selection .total-products, #js-product-list-header"),
    tiles_on_page: tiles.length,
    pagination: pageLinks,
    perPageOpts,
    sortOpts,
    sample,
    current_url: location.href,
  };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
