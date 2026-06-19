import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "figures");
mkdirSync(outDir, { recursive: true });

const images = [
  ["luka-v4x.jpg", "https://hobby-genki.com/502880-large_default/nendoroid-megurine-luka-v4x-character-vocal-series-03-megurine-luka-figure-limited-bonus-set.jpg"],
  ["cats-silver-moon.jpg", "https://hobby-genki.com/502863-large_default/cats-are-liquid-illustration-by-karaage-toufu-silver-moon-figure.jpg"],
  ["cats-scarlet-night.jpg", "https://hobby-genki.com/502849-large_default/cats-are-liquid-illustration-by-karaage-toufu-scarlet-night-figure.jpg"],
  ["pokemon-scale-world-sinnoh.jpg", "https://hobby-genki.com/502798-large_default/pokemon-scale-world-sinnoh-region-3-set.jpg"],
  ["toshiya-miyata.jpg", "https://hobby-genki.com/502789-large_default/nendoroid-toshiya-miyata-figure-limited-edition.jpg"],
];

// Reuse the already-open Edge session (cleared Cloudflare) so the request
// carries the cf_clearance cookie; set Referer to defeat hotlink protection.
const browser = await chromium.connectOverCDP("http://localhost:9222");
const ctx = browser.contexts()[0];

for (const [file, url] of images) {
  const res = await ctx.request.get(url, {
    headers: { referer: "https://hobby-genki.com/en/10-pre-order" },
  });
  if (!res.ok()) {
    console.log(`FAIL ${res.status()} ${file}`);
    continue;
  }
  const buf = await res.body();
  writeFileSync(join(outDir, file), buf);
  console.log(`OK ${file} (${(buf.length / 1024).toFixed(0)} KB)`);
}

await browser.close();
