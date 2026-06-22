// Build TS Figure entries for the new batch (ids 26+), spliced into lib/data.ts.
// series  <- franchise category from URL (title-cased, light overrides)
// manufacturer <- parsed from real meta_description ("by X at Hobby Genki"),
//                 then product-line keyword fallback, then on-page tag, then "—"
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const detail = JSON.parse(readFileSync(join(__dirname, "detail-batch.json"), "utf8"));
const manifest = JSON.parse(readFileSync(join(__dirname, "gallery-manifest-batch.json"), "utf8"));

const START_ID = 25; // current max id; first new = 26

const clean = (s) => s.replace(/\s+/g, " ").trim();
const titleCase = (s) => clean(s).replace(/\b\w/g, (c) => c.toUpperCase());

// HG categories that are store SECTIONS (by format/maker), not a franchise.
const STORE_SECTION = /nendoroid|figma|scale figures|action figures|articulated|good smile company|pop up parade|portrait of pirates|figuarts|threezero|hot toys|sideshow|statues|merchandise|chibi|super deformed|\bsd\b|\bhobby\b|maker/i;
const SERIES_OVERRIDE = {
  "attack on titan shingeki no kyojin": "Attack on Titan",
  "fist of the north star hokuto no ken": "Fist of the North Star",
  "mega man rockman": "Mega Man",
  "gakuen idolmaster": "Gakuen iDOLM@STER",
};

// Hand overrides by figure key, where neither meta nor category yields a clean
// franchise (no-"from" meta, original characters, or maker-named categories).
const OVERRIDE_SERIES = {
  "portraitofpirates-soc-sanji-verr": "One Piece",
  "dlx-spider-man-symbiote": "Marvel's Spider-Man 2",
  "daiblos-core-maree-rouge": "Daiblos Core",
  "daiblos-core-maree-rouge-x": "Daiblos Core",
  "miko-shoujo-miko-race": "Miko Shoujo",
  "miko-shoujo-miko-race-x": "Miko Shoujo",
  "scream-greats-series-butterball": "Hellraiser",
  "scream-greats-series-chatterer": "Hellraiser",
  "scream-greats-series-female": "Hellraiser",
  "scream-greats-series-pinhead": "Hellraiser",
  "movie-maniacs-don-corleone": "The Godfather",
  "the-man-with-no": "The Good, the Bad and the Ugly",
  "doctor-doom-marvel-comics": "Marvel",
  "ffsc-kittyfire-mirrorman-completed": "Mirrorman",
  "pop-up-parade-sp": "Cutie Honey Nova",
  "honkai-star-rail-gift": "Honkai: Star Rail",
};
const OVERRIDE_MAKER = {
  "hy-040-flying-horse": "Fish Toys",
  "amk-pro-series-evangelion": "AMK",
};

// series from the real meta_description: "... from <Series> by/at/."
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

// Canonical maker names we recognise (longest/most-specific first).
const KNOWN_MAKERS = [
  "Good Smile Arts Shanghai", "Good Smile Company", "Max Factory", "Bandai Spirits",
  "Bandai MegaHouse", "MegaHouse", "Bandai Namco", "Bandai", "Kotobukiya", "Medicom Toy",
  "threezero", "CCP Japan", "Trick or Treat Studios", "McFarlane Toys", "Sideshow",
  "Hiya Toys", "Storm Collectibles", "52Toys", "Myethos", "Alter", "FuRyu", "Banpresto",
  "Bushiroad", "FREEing", "PLUM", "Hobby Sakura", "KAWA DESIGN", "Future Quest", "Plex",
  "Hot Toys", "Ques Q", "Capcom", "AMK", "Fish Toys",
];
const NORMALIZE = { gsc: "Good Smile Company", "good smile": "Good Smile Company", ccp: "CCP Japan" };

const makerFromMeta = (meta) => {
  if (!meta) return "";
  let m = meta.match(/\bby ([A-Z][\w.&'’\- ]+?)(?: at Hobby ?Genki| to your collection| today|[.,!])/);
  if (m) return clean(m[1]);
  m = meta.match(/\b([A-Z][\w.&'’\-]+(?:\s[A-Z][\w.&'’\-]+){0,2})'s\b/); // possessive "Kotobukiya's"
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
  // in-stock only
  if (!(p.quantity > 0) || p.availability === "unavailable") { skipped++; continue; }
  const imgs = manifest[p.key] || [];
  if (imgs.length === 0) { skipped++; continue; } // no images downloaded
  id += 1;
  const scale = scaleOf(p.sizeHints);
  const price_jpy = Math.round(parseFloat((p.price || "0").replace(/[^0-9.]/g, "")));
  out.push({
    id: String(id),
    name: cleanName(p.name),
    jan: p.reference || "",
    series: seriesOf(p),
    manufacturer: manufacturerOf(p),
    type: typeOf(p.name, scale),
    price_jpy,
    price_usd: Math.round(price_jpy / 147),
    quantity: p.quantity,
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

writeFileSync(join(__dirname, "new-figures-batch.ts.txt"), ts);
console.log(`[${out.length} figures, ids ${START_ID + 1}-${id}] | skipped ${skipped} (oos/no-img)`);
console.log("manufacturers:", JSON.stringify([...new Set(out.map((f) => f.manufacturer))]));
console.log("series:", JSON.stringify([...new Set(out.map((f) => f.series))]));
