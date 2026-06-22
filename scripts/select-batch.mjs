// Filter the in-stock listing down to ~50 figures (current-style), skipping the
// 25 already in the app. Same POS/NEG logic as select.mjs.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const d = JSON.parse(readFileSync(join(__dirname, "listing-instock.json"), "utf8"));

const TARGET = 50;
const POS = /figure|figuarts|nendoroid|\bscale\b|statue|figma|pop up parade|fnex|moderoid|plastic m|prize|mafex|model kit/i;
// Only exclude genuine NON-figures (merch, accessories, model cars). Any actual
// figure is in-scope regardless of origin (Western OK) or content (adult OK).
const NEG = /sticker|wafer|\bcard\b|seal|acrylic|keychain|charm|\bplush\b|badge|tapestry|wallpaper|poster|light stick|candy|strap|pouch|\bbag\b|clear file|\bpin\b|magnet|towel|cushion|blanket|pack box|choco box|blokees|mascot|miniature car|super gt|\bamg\b|outfit set/i;
// Already in the app under a different listing id — skip near-dupes by name.
const SKIP_NAME = /megurine luka/i;
// Full name from the URL slug (listing tile text is truncated).
const nameFromSlug = (url) => {
  const seg = (url.split("/").pop() || "").replace(/\.html$/, "");
  return seg.replace(/^\d+-/, "").replace(/-\d{8,}$/, "").replace(/-+$/, "").replace(/-/g, " ").trim();
};
// Dedup on the whole slug core so true dupes collapse but variants survive.
const dedupKeyOf = (url) => nameFromSlug(url).toLowerCase().replace(/\s+/g, " ").trim();

// Skip everything already seeded (current 25, by product-id in URL).
const EXISTING = new Set(["91744","91739","91738","91728","91726","91722","91721","91720","91714","91713","91711","91709","91694","91693","91692","91690","91689","91688","91660","91657","91656","91622","91585","91584","91578"]);
const idOf = (url) => (url.match(/\/(\d{4,})-/) || [])[1] || "";

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
const seenDedup = new Set();
const picks = [];
for (const p of d) {
  if (!p.url || !p.image_large) continue;
  const fullName = nameFromSlug(p.url);
  if (!POS.test(fullName) || NEG.test(fullName)) continue;
  if (EXISTING.has(idOf(p.url)) || SKIP_NAME.test(fullName)) continue;
  const dedup = dedupKeyOf(p.url);
  if (seenDedup.has(dedup)) continue; // collapse true duplicate listings
  seenDedup.add(dedup);
  let key = keyOf(p.url);
  while (seenKey.has(key)) key += "-x";
  seenKey.add(key);
  picks.push({ key, url: p.url, name: fullName, price: p.price, category: p.category, image_large: p.image_large });
  if (picks.length >= TARGET) break;
}

writeFileSync(join(__dirname, "selected-batch.json"), JSON.stringify(picks, null, 2));
console.log(`Scanned ${d.length} listing items → ${picks.length} figures selected (target ${TARGET}):\n`);
picks.forEach((p, i) => console.log(`${String(i + 1).padStart(2)}. ${p.name}`));
