// Repair the pokemon-scale-world-sinnoh key collision:
//  - restore id4 (3-set) gallery from its real source URLs
//  - download Palkia into its own dir
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const detail = JSON.parse(readFileSync(join(__dirname, "detail.json"), "utf8"));
const batch = JSON.parse(readFileSync(join(__dirname, "detail-batch.json"), "utf8"));

const threeSet = detail.find((p) => p.key === "pokemon-scale-world-sinnoh");
const palkia = batch.find((p) => p.key === "pokemon-scale-world-sinnoh");

const jobs = [
  { dir: "pokemon-scale-world-sinnoh", url: threeSet.url, images: threeSet.images },        // restore id4
  { dir: "pokemon-scale-world-sinnoh-palkia", url: palkia.url, images: palkia.images.slice(0, 8) }, // new dir
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.connectOverCDP("http://localhost:9222");
const ctx = browser.contexts()[0];

for (const j of jobs) {
  const out = join(root, "public", "figures", j.dir);
  mkdirSync(out, { recursive: true });
  let n = 0;
  for (const url of j.images) {
    n += 1;
    const file = String(n).padStart(2, "0") + ".jpg";
    const res = await ctx.request.get(url, { headers: { referer: j.url } });
    if (!res.ok()) { console.log(`  FAIL ${res.status()} ${j.dir}/${file}`); continue; }
    writeFileSync(join(out, file), await res.body());
    await sleep(800);
  }
  console.log(`${j.dir}: ${n} images`);
}
await browser.close();
