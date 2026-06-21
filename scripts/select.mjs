import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const d = JSON.parse(readFileSync(join(__dirname, "listing-all.json"), "utf8"));

const POS = /figure|figuarts|nendoroid|\bscale\b|statue|figma|pop up parade|fnex|moderoid|plastic m|prize/i;
const NEG = /sticker|wafer|\bcard\b|seal|acrylic|keychain|charm|plush|badge|tapestry|wallpaper|poster|light stick|candy|strap|pouch|\bbag\b|clear file|\bpin\b|magnet|towel|cushion|blanket|pack box|choco box|blokees/i;

// Already seeded (by product-id in the URL) — skip these.
const EXISTING = new Set(["91744", "91739", "91738", "91728", "91726"]);
const idOf = (url) => (url.match(/\/(\d{4,})-/) || [])[1] || "";
// Megurine Luka is already the featured figure — avoid a near-duplicate.
const SKIP_NAME = /megurine luka/i;

// Build a short, unique folder key from the URL slug.
const keyOf = (url) => {
  const seg = (url.split("/").pop() || "").replace(/\.html$/, "");
  return seg
    .replace(/^\d+-/, "")
    .replace(/-\d{8,}$/, "")
    .replace(/-+$/, "")
    .split("-")
    .slice(0, 4)
    .join("-")
    .toLowerCase();
};

const seenKey = new Set();
const picks = [];
for (const p of d) {
  if (!p.image_large) continue;
  if (!POS.test(p.name) || NEG.test(p.name)) continue;
  if (EXISTING.has(idOf(p.url)) || SKIP_NAME.test(p.name)) continue;
  let key = keyOf(p.url);
  while (seenKey.has(key)) key += "-x";
  seenKey.add(key);
  picks.push({ key, url: p.url, name: p.name, price: p.price, category: p.category, image_large: p.image_large });
  if (picks.length >= 20) break;
}

writeFileSync(join(__dirname, "selected.json"), JSON.stringify(picks, null, 2));
console.log(`Selected ${picks.length}:`);
picks.forEach((p, i) => console.log(`${String(i + 1).padStart(2)}. ${p.key}  —  ${p.name.slice(0, 50)}`));
