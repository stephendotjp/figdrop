import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const detail = JSON.parse(readFileSync(join(__dirname, "detail-new.json"), "utf8"));
const manifest = JSON.parse(readFileSync(join(__dirname, "gallery-manifest-new.json"), "utf8"));

// Curated, factual series/manufacturer per product line. Manufacturer is the
// real maker of the named product line (the detail pages carried no maker tag).
const MAP = {
  "b-robo-kabutack-re": { series: "B-Robo Kabutack", manufacturer: "Bandai" },
  "hg-135-zi-artemis": { series: "Code Geass", manufacturer: "Bandai Spirits" },
  "b-robo-kabutack-re-x": { series: "B-Robo Kabutack", manufacturer: "Bandai" },
  "moderoid-miniature-combining-transforming": { series: "Space Runaway Ideon", manufacturer: "Good Smile Company" },
  "moderoid-miniature-combining-transforming-x": { series: "Getter Robo G", manufacturer: "Good Smile Company" },
  "nendoroid-hakos-baelz-hololive": { series: "Hololive", manufacturer: "Good Smile Company" },
  "nendoroid-hatsune-miku-v4x": { series: "Vocaloid", manufacturer: "Good Smile Company" },
  "kaho-hinoshita-love-live": { series: "Love Live! Hasunosora", manufacturer: "Royce Entertainment" },
  "sayaka-murano-love-live": { series: "Love Live! Hasunosora", manufacturer: "Royce Entertainment" },
  "rurino-osawa-love-love": { series: "Love Live! Hasunosora", manufacturer: "Royce Entertainment" },
  "tenitol-tall-rikka-takarada": { series: "Gridman Universe", manufacturer: "FuRyu" },
  "tenitol-tall-akane-shinjo": { series: "Gridman Universe", manufacturer: "FuRyu" },
  "tenitol-tall-rikka-takarada-x": { series: "Gridman Universe", manufacturer: "FuRyu" },
  "palverse-pale-sonic-the": { series: "Sonic the Hedgehog", manufacturer: "Bushiroad" },
  "nendoroid-kamui-gintama-figure": { series: "Gintama", manufacturer: "Good Smile Company" },
  "nendoroid-shinsuke-takasugi-gintama": { series: "Gintama", manufacturer: "Good Smile Company" },
  "plafia-doala-visitor-ver": { series: "Doala", manufacturer: "PLUM" },
  "b-style-mirajane-strauss": { series: "Fairy Tail", manufacturer: "FREEing" },
  "hatsune-miku-music-fire": { series: "Vocaloid", manufacturer: "Good Smile Company" },
  "nendoroid-mahiru-shiina-the": { series: "The Angel Next Door", manufacturer: "Good Smile Company" },
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
  if (/plastic model|moderoid|^hg ?\d|model kit/i.test(name)) return "Model Kit";
  if (/^[0-9]+\/[0-9]+$/.test(scale)) return "Scale";
  return "Figure";
};
const cleanName = (n) =>
  n.replace(/\s+/g, " ").replace(/Love Love Live/gi, "Love Live").trim();
const minus45 = (d) => {
  const dt = new Date(d + "T00:00:00");
  dt.setDate(dt.getDate() - 45);
  return dt.toISOString().slice(0, 10);
};

let id = 5;
const out = detail.map((p) => {
  id += 1;
  const meta = MAP[p.key];
  const imgs = manifest[p.key] || [];
  const scale = scaleOf(p.sizeHints);
  const price_jpy = Math.round(parseFloat((p.price || "0").replace(/[^0-9.]/g, "")));
  return {
    id: String(id),
    name: cleanName(p.name),
    series: meta.series,
    manufacturer: meta.manufacturer,
    type: typeOf(p.name, scale),
    price_jpy,
    price_usd: Math.round(price_jpy / 147),
    retailer: "Hobby Genki",
    retailer_color: "blue",
    status: "preorder_open",
    preorder_closes: minus45(p.available_date),
    release_date: p.available_date,
    scale,
    height: heightOf(p.sizeHints),
    featured: false,
    image_url: imgs[0],
    images: imgs,
  };
});

// Emit as a TS array body (objects only, to splice into lib/data.ts).
const ts = out
  .map((f) => {
    const imgs = f.images.map((i) => `      "${i}",`).join("\n");
    return `  {
    id: "${f.id}",
    name: ${JSON.stringify(f.name)},
    series: ${JSON.stringify(f.series)},
    manufacturer: ${JSON.stringify(f.manufacturer)},
    type: ${JSON.stringify(f.type)},
    price_jpy: ${f.price_jpy},
    price_usd: ${f.price_usd},
    retailer: "Hobby Genki",
    retailer_color: "blue",
    status: "preorder_open",
    preorder_closes: "${f.preorder_closes}",
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

writeFileSync(join(__dirname, "new-figures.ts.txt"), ts);
console.log(ts);
console.error(`\n[${out.length} figures, ids 6-${id}]`);
