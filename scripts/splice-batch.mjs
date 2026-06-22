// Splice the generated batch entries into lib/data.ts, just before the `];`
// that closes the `figures` array.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const entries = readFileSync(join(__dirname, "new-figures-batch.ts.txt"), "utf8").replace(/\s+$/, "");
const dataPath = join(__dirname, "..", "lib", "data.ts");
let src = readFileSync(dataPath, "utf8");

const marker = "\n];\n\nexport function getFigure";
const idx = src.indexOf(marker);
if (idx === -1) {
  console.error("Could not find the figures-array close marker. Aborting.");
  process.exit(1);
}
const before = src.slice(0, idx); // ends at the last "  },"
const after = src.slice(idx);
src = `${before}\n${entries}${after}`;
writeFileSync(dataPath, src);

const count = (src.match(/^\s{4}id: "/gm) || []).length;
console.log(`spliced; lib/data.ts now has ${count} figures`);
