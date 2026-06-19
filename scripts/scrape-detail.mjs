import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// key = local image folder/name; matches the primary files already downloaded.
const products = [
  ["luka-v4x", "https://hobby-genki.com/en/nendoroid-figures-good-smile-company-official/91744-nendoroid-megurine-luka-v4x-character-vocal-series-03-megurine-luka-figure-limited-bonus-set-4570232587090.html"],
  ["cats-silver-moon", "https://hobby-genki.com/en/scale-figures-statues/91739-cats-are-liquid-illustration-by-karaage-toufu-silver-moon-figure.html"],
  ["cats-scarlet-night", "https://hobby-genki.com/en/scale-figures-statues/91738-cats-are-liquid-illustration-by-karaage-toufu-scarlet-night-figure.html"],
  ["pokemon-scale-world-sinnoh", "https://hobby-genki.com/en/pokemon/91728-pokemon-scale-world-sinnoh-region-3-set-4570117928949.html"],
  ["toshiya-miyata", "https://hobby-genki.com/en/nendoroid-figures-good-smile-company-official/91726-nendoroid-toshiya-miyata-figure-limited-edition-4570232587076.html"],
];

const browser = await chromium.connectOverCDP("http://localhost:9222");
const ctx = browser.contexts()[0];
const page = ctx.pages()[0] || (await ctx.newPage());

const results = [];
for (const [key, url] of products) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2000);
  const title = await page.title();

  const data = await page.evaluate(() => {
    const details = document.querySelector("#product-details");
    let p = {};
    try { p = JSON.parse(details?.dataset.product || "{}"); } catch {}

    // Strip HTML from the description for plain-text size/scale mining.
    const descHtml = p.description || "";
    const descText = descHtml
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Unique gallery images: normalise to large_default, drop sticker svgs.
    const seen = new Set();
    const images = [];
    document
      .querySelectorAll(".images-container img, .product-images img, #product-images img, .js-qv-product-images img, .product-cover img")
      .forEach((i) => {
        let s = i.getAttribute("data-image-large-src") || i.src || "";
        s = s.replace(/-home_default\//, "-large_default/");
        if (!s || s.includes("/img/stickers/")) return;
        if (!seen.has(s)) { seen.add(s); images.push(s); }
      });

    const man = document.querySelector(".product-manufacturer img, .product-manufacturer a");

    // Pull any "scale" / size phrases from the description for later use.
    const sizeHints = [];
    for (const re of [
      /([0-9]+\s*\/\s*[0-9]+)\s*scale/gi,
      /non[- ]?scale/gi,
      /(approx(?:imately)?\.?\s*)?[0-9]+(?:\.[0-9]+)?\s*(?:cm|mm)\b[^.]*/gi,
    ]) {
      const m = descText.match(re);
      if (m) sizeHints.push(...m.map((x) => x.trim()));
    }

    return {
      name: p.name || "",
      reference: p.reference || "",
      price: p.price || "",
      available_date: p.available_date || "",
      condition: p.condition || "",
      id_manufacturer: p.id_manufacturer || "",
      manufacturer: man?.getAttribute("alt") || man?.textContent?.trim() || "",
      meta_description: p.meta_description || "",
      sizeHints: [...new Set(sizeHints)].slice(0, 8),
      description_text: descText.slice(0, 1200),
      images,
    };
  });

  console.log(`${key}: "${data.name.slice(0, 50)}..." | ${data.images.length} imgs | release ${data.available_date || "—"} | hints: ${data.sizeHints.join(" / ") || "none"}`);
  results.push({ key, url, title, ...data });
}

writeFileSync(join(__dirname, "detail.json"), JSON.stringify(results, null, 2));
console.log("Wrote scripts/detail.json");
await browser.close();
