// One-off: merge real quantity/availability from availability.json into lib/data.ts.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const av = JSON.parse(readFileSync(join(__dirname, "availability.json"), "utf8"));
const dataPath = join(__dirname, "..", "lib", "data.ts");
let src = readFileSync(dataPath, "utf8");

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

let n = 0;
for (const [key, d] of Object.entries(av)) {
  const re = new RegExp(`^([ \\t]*)image_url: "/figures/${esc(key)}/.*$`, "m");
  if (!re.test(src)) {
    console.error("NO MATCH", key);
    continue;
  }
  src = src.replace(
    re,
    (line, indent) =>
      `${indent}quantity: ${d.quantity},\n${indent}availability: ${JSON.stringify(d.availability)},\n${line}`
  );
  n++;
}

writeFileSync(dataPath, src);
const q = (src.match(/^\s*quantity:/gm) || []).length;
const a = (src.match(/^\s*availability:/gm) || []).length;
console.log(`merged into ${n} figures | quantity lines: ${q} | availability lines: ${a}`);
