// Dedup the scraped batch by JAN before downloading images:
//  - drop items whose JAN matches an existing figure (cross-dupe)
//  - drop intra-batch JAN duplicates (keep first)
//  - drop out-of-stock (qty<=0 / unavailable)
// Rewrites detail-batch.json in place (raw kept as detail-batch.raw.json).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const a = JSON.parse(readFileSync(join(__dirname, "detail.json"), "utf8"));
const b = JSON.parse(readFileSync(join(__dirname, "detail-new.json"), "utf8"));
const existingJans = new Set([...a, ...b].map((x) => (x.reference || "").trim()).filter(Boolean));

const batch = JSON.parse(readFileSync(join(__dirname, "detail-batch.json"), "utf8"));
if (!existsSync(join(__dirname, "detail-batch.raw.json")))
  writeFileSync(join(__dirname, "detail-batch.raw.json"), JSON.stringify(batch, null, 2));

const seenJan = new Set();
const kept = [];
const dropped = [];
for (const p of batch) {
  const jan = (p.reference || "").trim();
  if (!(p.quantity > 0) || p.availability === "unavailable") { dropped.push([p.key, "oos"]); continue; }
  if (jan && existingJans.has(jan)) { dropped.push([p.key, `dupe-of-existing (${jan})`]); continue; }
  if (jan && seenJan.has(jan)) { dropped.push([p.key, `intra-batch dupe (${jan})`]); continue; }
  if (jan) seenJan.add(jan);
  kept.push(p);
}

writeFileSync(join(__dirname, "detail-batch.json"), JSON.stringify(kept, null, 2));
console.log(`kept ${kept.length} / ${batch.length}`);
if (dropped.length) {
  console.log(`dropped ${dropped.length}:`);
  dropped.forEach(([k, why]) => console.log(`  - ${k.padEnd(40)} ${why}`));
}
const noJan = kept.filter((p) => !(p.reference || "").trim()).length;
console.log(`(${kept.length - noJan} have JAN, ${noJan} no JAN — kept, can't JAN-dedup those)`);
