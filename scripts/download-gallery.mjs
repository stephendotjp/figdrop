import { chromium } from "playwright";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const detail = JSON.parse(readFileSync(join(__dirname, "detail.json"), "utf8"));

const browser = await chromium.connectOverCDP("http://localhost:9222");
const ctx = browser.contexts()[0];

const manifest = {};
for (const p of detail) {
  const dir = join(root, "public", "figures", p.key);
  mkdirSync(dir, { recursive: true });
  const local = [];
  let n = 0;
  for (const url of p.images) {
    n += 1;
    const file = String(n).padStart(2, "0") + ".jpg";
    const res = await ctx.request.get(url, {
      headers: { referer: p.url },
    });
    if (!res.ok()) {
      console.log(`  FAIL ${res.status()} ${p.key}/${file}`);
      continue;
    }
    writeFileSync(join(dir, file), await res.body());
    local.push(`/figures/${p.key}/${file}`);
  }
  manifest[p.key] = local;
  console.log(`${p.key}: ${local.length}/${p.images.length} images`);
}

writeFileSync(join(__dirname, "gallery-manifest.json"), JSON.stringify(manifest, null, 2));
console.log("Wrote scripts/gallery-manifest.json");
await browser.close();
