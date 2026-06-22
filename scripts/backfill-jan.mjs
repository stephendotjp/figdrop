// One-off: backfill `jan` (PrestaShop `reference`) into the existing 25 entries
// in lib/data.ts, keyed by the figure's image_url slug.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const a = JSON.parse(readFileSync(join(__dirname, "detail.json"), "utf8"));
const b = JSON.parse(readFileSync(join(__dirname, "detail-new.json"), "utf8"));

// key -> JAN. detail.json keys are the full slug-ish keys; data.ts keys come from
// image_url. Map by the same key used in those files.
const janByKey = {};
for (const p of [...a, ...b]) janByKey[p.key] = p.reference || "";

const dataPath = join(__dirname, "..", "lib", "data.ts");
let src = readFileSync(dataPath, "utf8");
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

let n = 0;
const missing = [];
for (const [key, jan] of Object.entries(janByKey)) {
  const re = new RegExp(`^([ \\t]*)image_url: "/figures/${esc(key)}/.*$`, "m");
  if (!re.test(src)) { missing.push(key); continue; }
  src = src.replace(re, (line, indent) => `${indent}jan: ${JSON.stringify(jan)},\n${line}`);
  n++;
}

writeFileSync(dataPath, src);
const janLines = (src.match(/^\s*jan:/gm) || []).length;
console.log(`backfilled jan into ${n} figures | jan lines now: ${janLines} (incl. type decl)`);
if (missing.length) console.log("NO MATCH for keys:", missing);
const withJan = Object.values(janByKey).filter(Boolean).length;
console.log(`of ${Object.keys(janByKey).length}: ${withJan} have a JAN, ${Object.keys(janByKey).length - withJan} empty`);
