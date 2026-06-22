// Screenshot local pages via the already-open Edge (CDP). Dev-only.
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const shots = [
  ["home", "http://localhost:3000/"],
  ["detail-lowstock", "http://localhost:3000/drop/2"], // cats: qty 1
  ["detail-soldout", "http://localhost:3000/drop/7"], // HG mecha: qty 0
  ["wishlist", "http://localhost:3000/wishlist"],
];

const browser = await chromium.connectOverCDP("http://localhost:9222");
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.setViewportSize({ width: 420, height: 900 });

for (const [name, url] of shots) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(600);
  const path = join(__dirname, "..", "screens", `fomo-${name}.png`);
  await page.screenshot({ path, fullPage: name.startsWith("detail") });
  console.log("shot:", path);
}
await page.close();
await browser.close();
