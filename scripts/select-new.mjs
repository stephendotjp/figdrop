// Select genuinely-new pre-order figures from listing-all.json, deduping against
// what's already in the app (by JAN and by existing public/figures/<key> dir).
// Same POS/NEG figure filter as select-batch.mjs (only excludes non-figures).
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const d = JSON.parse(readFileSync(join(__dirname, "listing-all.json"), "utf8"));
const existingJans = new Set(JSON.parse(readFileSync(join(__dirname, "existing-jans.json"), "utf8")));
const existingDirs = new Set(readdirSync(join(root, "public", "figures")));

const POS = /figure|figuarts|nendoroid|\bscale\b|statue|figma|pop up parade|fnex|moderoid|plastic m|prize|mafex|model kit/i;
const NEG = /sticker|wafer|\bcard\b|seal|acrylic|keychain|charm|\bplush\b|badge|tapestry|wallpaper|poster|light stick|candy|strap|pouch|\bbag\b|clear file|\bpin\b|magnet|towel|cushion|blanket|pack box|choco box|blokees|mascot|miniature car|super gt|\bamg\b|outfit set/i;
// Already in the app under a different (JAN-less) listing slug — skip by name.
const SKIP_NAME = /cats are liquid/i;

const janOf = (url) => {
  const seg = (url.split("/").pop() || "").replace(/\.html$/, "");
  return (seg.match(/-(\d{8,})$/) || [])[1] || "";
};
const nameFromSlug = (url) => {
  const seg = (url.split("/").pop() || "").replace(/\.html$/, "");
  return seg.replace(/^\d+-/, "").replace(/-\d{8,}$/, "").replace(/-+$/, "").replace(/-/g, " ").trim();
};
const keyOf = (url) => {
  const seg = (url.split("/").pop() || "").replace(/\.html$/, "");
  return seg.replace(/^\d+-/, "").replace(/-\d{8,}$/, "").replace(/-+$/, "").split("-").slice(0, 4).join("-").toLowerCase();
};

const seenKey = new Set();
const seenDedup = new Set();
const seenJan = new Set();
const picks = [];
const skipped = { nonfigure: 0, jandupe: 0, dirdupe: 0, listdupe: 0, skipname: 0 };

for (const p of d) {
  if (!p.url || !p.image_large) continue;
  const fullName = nameFromSlug(p.url);
  if (!POS.test(fullName) || NEG.test(fullName)) { skipped.nonfigure++; continue; }
  if (SKIP_NAME.test(fullName)) { skipped.skipname++; continue; }
  const jan = janOf(p.url);
  if (jan && existingJans.has(jan)) { skipped.jandupe++; continue; }
  if (jan && seenJan.has(jan)) { skipped.listdupe++; continue; } // same product, two listings
  if (jan) seenJan.add(jan);
  const dedup = fullName.toLowerCase().replace(/\s+/g, " ").trim();
  if (seenDedup.has(dedup)) { skipped.listdupe++; continue; }
  seenDedup.add(dedup);
  let key = keyOf(p.url);
  if (existingDirs.has(key)) { skipped.dirdupe++; continue; } // already in app under this folder
  while (seenKey.has(key)) key += "-x";
  seenKey.add(key);
  picks.push({ key, url: p.url, name: fullName, jan, price: p.price, category: p.category, image_large: p.image_large });
}

writeFileSync(join(__dirname, "selected-new.json"), JSON.stringify(picks, null, 2));
console.log(`Scanned ${d.length} listing items.`);
console.log(`Skipped: non-figure ${skipped.nonfigure}, JAN dupe ${skipped.jandupe}, dir dupe ${skipped.dirdupe}, list dupe ${skipped.listdupe}, by-name ${skipped.skipname}`);
console.log(`\n${picks.length} NEW figures:\n`);
picks.forEach((p, i) => console.log(`${String(i + 1).padStart(2)}. [${p.jan || "no-jan"}] ${p.name}  (${p.key})`));
