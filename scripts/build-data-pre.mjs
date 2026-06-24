// Build TS Figure entries for the new pre-order run (ids 75+), spliced into
// lib/data.ts. Same parsing as build-data-batch.mjs (series from meta_description,
// maker from meta, type from name). Unlike the in-stock batch this KEEPS sold-out
// pre-orders (the app shows them honestly via StockBadge); only no-image items skip.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const detail = JSON.parse(readFileSync(join(__dirname, "detail-pre.json"), "utf8"));
const manifest = JSON.parse(readFileSync(join(__dirname, "gallery-manifest-pre.json"), "utf8"));

// Continue ids from the current max in lib/data.ts (don't hardcode — the app has
// grown since the last run, and a stale START_ID would reuse existing ids).
const dataTs = readFileSync(join(__dirname, "..", "lib", "data.ts"), "utf8");
const START_ID = Math.max(...[...dataTs.matchAll(/id:\s*"(\d+)"/g)].map((m) => Number(m[1])));
// droppedAt = this scrape session's date (today) — the Calendar drop-history key.
const DROPPED_AT = new Date().toISOString().slice(0, 10);

const clean = (s) => s.replace(/\s+/g, " ").trim();
const titleCase = (s) => clean(s).replace(/\b\w/g, (c) => c.toUpperCase());

const STORE_SECTION = /nendoroid|figma|scale figures|action figures|articulated|good smile company|pop up parade|portrait of pirates|figuarts|threezero|hot toys|sideshow|statues|merchandise|chibi|super deformed|\bsd\b|\bhobby\b|maker/i;
const SERIES_OVERRIDE = {
  "attack on titan shingeki no kyojin": "Attack on Titan",
  "fist of the north star hokuto no ken": "Fist of the North Star",
  "mega man rockman": "Mega Man",
  "gakuen idolmaster": "Gakuen iDOLM@STER",
};

// Hand overrides where neither meta "from X" nor category yields a clean franchise
// (no-"from" metas, maker-named store sections, or franchise-less categories).
// Per-run overrides for stragglers where the source meta names a product line
// (not a franchise) as the series, or omits the maker. Keyed by folder key —
// REPLACE these each run; entries only apply to the current detail-pre.json.
const OVERRIDE_SERIES = {
  "shmonsterarts-biollante-wakasa-bay": "Godzilla",
  "mafex-wonder-woman-superman": "DC Comics",
  "mafex-superman-superman-for": "DC Comics",
  "ultra-detail-figure-no962": "Fujiko F. Fujio Works",
  "ultra-detail-figure-no961": "Fujiko F. Fujio Works",
  "ultra-detail-figure-no960": "Fujiko F. Fujio Works",
  "ultra-detail-figure-no959": "Fujiko F. Fujio Works",
  "ultra-detail-figure-no958": "Fujiko F. Fujio Works",
  "ultra-detail-figure-no957": "Fujiko F. Fujio Works",
};
const OVERRIDE_MAKER = {
  "inart-the-terminator-t": "InArt",
  "pocket-art-pa013-girls-x": "HASUKI",
};

const seriesFromMeta = (meta) => {
  if (!meta) return "";
  const m = meta.match(/\bfrom ([A-Z][\w.:'’!&\- ]+?)(?: by | at Hobby ?Genki|[.,!])/);
  return m ? clean(m[1]) : "";
};
const seriesOf = (p) => {
  if (OVERRIDE_SERIES[p.key]) return OVERRIDE_SERIES[p.key];
  const fromMeta = seriesFromMeta(p.meta_description);
  if (fromMeta) return fromMeta;
  const c = (p.category || "").toLowerCase().trim();
  if (c && !STORE_SECTION.test(c)) return SERIES_OVERRIDE[c] || titleCase(c);
  return "—";
};

const KNOWN_MAKERS = [
  "Good Smile Arts Shanghai", "Good Smile Company", "Max Factory", "Bandai Spirits",
  "Bandai MegaHouse", "MegaHouse", "Bandai Namco", "Bandai", "Kotobukiya", "Medicom Toy",
  "threezero", "CCP Japan", "Trick or Treat Studios", "McFarlane Toys", "Sideshow",
  "Hiya Toys", "Storm Collectibles", "52Toys", "Myethos", "Alter", "FuRyu", "Banpresto",
  "Bushiroad", "FREEing", "PLUM", "Hobby Sakura", "KAWA DESIGN", "Future Quest", "Plex",
  "Hot Toys", "Ques Q", "Capcom", "AMK", "Fish Toys", "Medicos Entertainment", "Neonmax",
];
const NORMALIZE = { gsc: "Good Smile Company", "good smile": "Good Smile Company", ccp: "CCP Japan" };

const makerFromMeta = (meta) => {
  if (!meta) return "";
  let m = meta.match(/\bby ([A-Z][\w.&'’\- ]+?)(?: at Hobby ?Genki| to your collection| today|[.,!])/);
  if (m) return clean(m[1]);
  m = meta.match(/\b([A-Z][\w.&'’\-]+(?:\s[A-Z][\w.&'’\-]+){0,2})'s\b/);
  return m ? clean(m[1]) : "";
};
const canonicalMaker = (raw, hay) => {
  const hit = KNOWN_MAKERS.find((k) => hay.toLowerCase().includes(k.toLowerCase()));
  if (hit) return hit;
  const n = NORMALIZE[(raw || "").toLowerCase()];
  return n || raw || "";
};
const manufacturerOf = (p) => {
  if (OVERRIDE_MAKER[p.key]) return OVERRIDE_MAKER[p.key];
  const hay = `${p.meta_description || ""} ${p.name || ""}`;
  const parsed = makerFromMeta(p.meta_description);
  const maker = canonicalMaker(parsed, parsed ? `${parsed} ${hay}` : hay);
  return maker || "—";
};

const scaleOf = (h) => {
  for (const x of h) { const m = x.match(/([0-9]+\s*\/\s*[0-9]+)\s*scale/i); if (m) return m[1].replace(/\s/g, ""); }
  return h.some((x) => /non[- ]?scale/i.test(x)) ? "Non-scale" : "—";
};
const heightOf = (h) => {
  for (const x of h) {
    const m = x.match(/([0-9]+(?:\.[0-9]+)?)\s*mm/i); if (m) return Math.round(parseFloat(m[1]) / 10) + "cm";
    const c = x.match(/([0-9]+(?:\.[0-9]+)?)\s*cm/i); if (c) return c[1] + "cm";
  }
  return "—";
};
const typeOf = (name, scale) => {
  if (/nendoroid/i.test(name)) return "Nendoroid";
  if (/\bfigma\b/i.test(name)) return "Figma";
  if (/figuarts/i.test(name)) return "SH Figuarts";
  if (/pop up parade/i.test(name)) return "Pop Up Parade";
  if (/revoltech/i.test(name)) return "Revoltech";
  if (/mafex/i.test(name)) return "MAFEX";
  if (/plastic model|moderoid|^hg ?\d|\brg\b|\bmg\b|model kit|gunpla|figure-rise/i.test(name)) return "Model Kit";
  if (/^[0-9]+\/[0-9]+$/.test(scale)) return "Scale";
  return "Figure";
};
const cleanName = (n) => n.replace(/\s+/g, " ").trim();

let id = START_ID;
let skipped = 0;
const out = [];
for (const p of detail) {
  const imgs = manifest[p.key] || [];
  if (imgs.length === 0) { skipped++; continue; } // no images downloaded
  id += 1;
  const scale = scaleOf(p.sizeHints);
  const price_jpy = Math.round(parseFloat((p.price || "0").replace(/[^0-9.]/g, "")));
  const qty = Number.isFinite(p.quantity) ? p.quantity : 0;
  out.push({
    id: String(id),
    name: cleanName(p.name),
    jan: p.reference || "",
    series: seriesOf(p),
    manufacturer: manufacturerOf(p),
    type: typeOf(p.name, scale),
    price_jpy,
    price_usd: Math.round(price_jpy / 147),
    quantity: qty,
    availability: p.availability,
    release_date: p.available_date,
    scale,
    height: heightOf(p.sizeHints),
    image_url: imgs[0],
    images: imgs,
  });
}

const ts = out
  .map((f) => {
    const imgs = f.images.map((i) => `      "${i}",`).join("\n");
    return `  {
    id: "${f.id}",
    name: ${JSON.stringify(f.name)},
    jan: ${JSON.stringify(f.jan)},
    series: ${JSON.stringify(f.series)},
    manufacturer: ${JSON.stringify(f.manufacturer)},
    type: ${JSON.stringify(f.type)},
    price_jpy: ${f.price_jpy},
    price_usd: ${f.price_usd},
    retailer: "Hobby Genki",
    retailer_color: "blue",
    status: "preorder_open",
    quantity: ${f.quantity},
    availability: ${JSON.stringify(f.availability)},
    release_date: "${f.release_date}",
    droppedAt: "${DROPPED_AT}",
    scale: ${JSON.stringify(f.scale)},
    height: ${JSON.stringify(f.height)},
    featured: false,
    image_url: ${JSON.stringify(f.image_url)},
    images: [
${imgs}
    ],
  },`;
  })
  .join("\n");

writeFileSync(join(__dirname, "new-figures-pre.ts.txt"), ts);
console.log(`[${out.length} figures, ids ${START_ID + 1}-${id}, droppedAt ${DROPPED_AT}] | skipped ${skipped} (no-img)`);
console.log("manufacturers:", JSON.stringify([...new Set(out.map((f) => f.manufacturer))]));
console.log("series:", JSON.stringify([...new Set(out.map((f) => f.series))]));
