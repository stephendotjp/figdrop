// Capture HG's REAL stock/availability for all 25 figures from the PrestaShop
// data-product blob. Connects over CDP to an Edge window with Cloudflare solved.
//   node scripts/scrape-availability-all.mjs
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const a = JSON.parse(readFileSync(join(__dirname, "detail.json"), "utf8"));
const b = JSON.parse(readFileSync(join(__dirname, "detail-new.json"), "utf8"));
const items = [...a, ...b].map((x) => ({ key: x.key, url: x.url }));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (min, max) => min + Math.floor(Math.random() * (max - min));

const browser = await chromium.connectOverCDP("http://localhost:9222");
const ctx = browser.contexts()[0];
const page =
  ctx.pages().find((p) => p.url().includes("hobby-genki.com")) ||
  ctx.pages()[0] ||
  (await ctx.newPage());

const out = {};
for (const { key, url } of items) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(jitter(4000, 7000)); // gentle on Cloudflare

  const d = await page.evaluate(() => {
    const details = document.querySelector("#product-details");
    let p = {};
    try {
      p = JSON.parse(details?.dataset.product || "{}");
    } catch {}
    const qtyEl = document.querySelector("#product-availability");
    return {
      availability: p.availability ?? "",
      availability_message: p.availability_message ?? "",
      quantity: Number.parseInt(p.quantity, 10),
      available_for_order: p.available_for_order ?? "",
      availability_dom: qtyEl ? qtyEl.textContent.replace(/\s+/g, " ").trim() : "",
    };
  });

  out[key] = d;
  console.log(
    `${key.padEnd(34)} qty=${String(d.quantity).padStart(4)}  ${d.availability.padEnd(20)} ${d.availability_message || ""}`
  );
}

writeFileSync(join(__dirname, "availability.json"), JSON.stringify(out, null, 2));
console.log(`\nWrote scripts/availability.json (${Object.keys(out).length} products)`);
await browser.close();
