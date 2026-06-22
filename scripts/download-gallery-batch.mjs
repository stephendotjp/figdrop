// Download galleries for the new batch into public/figures/<key>/. Gentle.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const detail = JSON.parse(readFileSync(join(__dirname, "detail-batch.json"), "utf8"));

const CAP = 8;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (min, max) => min + Math.floor(Math.random() * (max - min));

const browser = await chromium.connectOverCDP("http://localhost:9222");
const ctx = browser.contexts()[0];

const manifest = {};
for (const p of detail) {
  const dir = join(root, "public", "figures", p.key);
  mkdirSync(dir, { recursive: true });
  const local = [];
  let n = 0;
  for (const url of (p.images || []).slice(0, CAP)) {
    n += 1;
    const file = String(n).padStart(2, "0") + ".jpg";
    try {
      const res = await ctx.request.get(url, { headers: { referer: p.url } });
      if (!res.ok()) { console.log(`  FAIL ${res.status()} ${p.key}/${file}`); continue; }
      writeFileSync(join(dir, file), await res.body());
      local.push(`/figures/${p.key}/${file}`);
    } catch (e) {
      console.log(`  ERR ${p.key}/${file}: ${e.message}`);
    }
    await sleep(jitter(600, 1300));
  }
  manifest[p.key] = local;
  console.log(`${p.key}: ${local.length} images`);
  await sleep(jitter(1500, 3000));
}

writeFileSync(join(__dirname, "gallery-manifest-batch.json"), JSON.stringify(manifest, null, 2));
console.log("\nWrote scripts/gallery-manifest-batch.json");
await browser.close();
