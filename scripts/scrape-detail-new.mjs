import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sel = JSON.parse(readFileSync(join(__dirname, "selected.json"), "utf8"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (min, max) => min + Math.floor(Math.random() * (max - min));

const browser = await chromium.connectOverCDP("http://localhost:9222");
const ctx = browser.contexts()[0];
const page = ctx.pages().find((p) => p.url().includes("hobby-genki.com")) || ctx.pages()[0] || (await ctx.newPage());

const results = [];
for (const item of sel) {
  await page.goto(item.url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(jitter(5000, 8000)); // gentle: 5-8s per product

  const data = await page.evaluate(() => {
    const details = document.querySelector("#product-details");
    let p = {};
    try { p = JSON.parse(details?.dataset.product || "{}"); } catch {}

    const descText = (p.description || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    const seen = new Set();
    const images = [];
    document
      .querySelectorAll(".images-container img, .product-images img, #product-images img, .js-qv-product-images img, .product-cover img")
      .forEach((i) => {
        let s = i.getAttribute("data-image-large-src") || i.src || "";
        s = s.replace(/-home_default\//, "-large_default/");
        if (!s || s.includes("/img/stickers/")) return;
        if (!seen.has(s)) { seen.add(s); images.push(s); }
      });

    const man = document.querySelector(".product-manufacturer img, .product-manufacturer a");

    const sizeHints = [];
    for (const re of [
      /([0-9]+\s*\/\s*[0-9]+)\s*scale/gi,
      /non[- ]?scale/gi,
      /(approx(?:imately)?\.?\s*)?[0-9]+(?:\.[0-9]+)?\s*(?:cm|mm)\b[^.]*/gi,
    ]) {
      const m = descText.match(re);
      if (m) sizeHints.push(...m.map((x) => x.trim()));
    }

    return {
      name: p.name || "",
      reference: p.reference || "",
      price: p.price || "",
      available_date: p.available_date || "",
      manufacturer: man?.getAttribute("alt") || man?.textContent?.trim() || "",
      sizeHints: [...new Set(sizeHints)].slice(0, 8),
      description_text: descText.slice(0, 1200),
      images,
    };
  });

  console.log(`${item.key}: "${data.name.slice(0, 45)}" | ${data.images.length} imgs | ${data.available_date || "—"} | ${data.sizeHints.join(" / ") || "no hints"}`);
  results.push({ key: item.key, url: item.url, category: item.category, ...data });
}

writeFileSync(join(__dirname, "detail-new.json"), JSON.stringify(results, null, 2));
console.log(`\nWrote scripts/detail-new.json (${results.length})`);
await browser.close();
