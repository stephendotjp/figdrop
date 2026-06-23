import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
// Whole-grid curation: ids 6–25 (new), 26–74 (batch), 75–85 (pre).
const manifest = {
  ...JSON.parse(readFileSync(join(__dirname, "gallery-manifest-new.json"), "utf8")),
  ...JSON.parse(readFileSync(join(__dirname, "gallery-manifest-batch.json"), "utf8")),
  ...JSON.parse(readFileSync(join(__dirname, "gallery-manifest-pre.json"), "utf8")),
};
// Include the original 5 too, so the whole grid gets curated.
const ORIGINALS = {
  "luka-v4x": 7, "cats-silver-moon": 13, "cats-scarlet-night": 13,
  "pokemon-scale-world-sinnoh": 6, "toshiya-miyata": 8,
};
for (const [k, n] of Object.entries(ORIGINALS)) {
  if (!manifest[k]) manifest[k] = Array.from({ length: n }, (_, i) => `/figures/${k}/${String(i + 1).padStart(2, "0")}.jpg`);
}

// Tiny static server over public/.
const server = createServer((req, res) => {
  try {
    const buf = readFileSync(join(root, "public", decodeURIComponent(req.url)));
    res.writeHead(200, { "content-type": "image/jpeg", "access-control-allow-origin": "*" });
    res.end(buf);
  } catch {
    res.writeHead(404); res.end();
  }
});
await new Promise((r) => server.listen(4599, r));

const browser = await chromium.launch();
const page = await browser.newPage();

// Score one image: returns {bright, unif, coverage}. bright/unif describe the
// background (corners); coverage = fraction of frame occupied by the subject.
const scoreImg = (url) =>
  page.evaluate(async (url) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    await img.decode();
    const S = 90;
    const c = document.createElement("canvas");
    c.width = S; c.height = S;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0, S, S);
    const d = ctx.getImageData(0, 0, S, S).data;
    const at = (x, y) => { const i = (y * S + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
    // Sample 4 corner patches.
    const patch = [];
    const P = 12;
    for (const [ox, oy] of [[0, 0], [S - P, 0], [0, S - P], [S - P, S - P]])
      for (let y = 0; y < P; y++) for (let x = 0; x < P; x++) patch.push(at(ox + x, oy + y));
    const mean = [0, 1, 2].map((k) => patch.reduce((s, p) => s + p[k], 0) / patch.length);
    const bright = (mean[0] + mean[1] + mean[2]) / 3;
    const varr = patch.reduce((s, p) => s + [0, 1, 2].reduce((a, k) => a + (p[k] - mean[k]) ** 2, 0), 0) / patch.length;
    const unif = Math.sqrt(varr); // lower = more uniform background
    const neutral = Math.max(...mean) - Math.min(...mean); // 0 = perfect grey/white
    // Coverage: pixels far from the background colour.
    let subj = 0, tot = 0;
    for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2) {
      const [r, g, b] = at(x, y);
      const dist = Math.abs(r - mean[0]) + Math.abs(g - mean[1]) + Math.abs(b - mean[2]);
      if (dist > 45) subj++;
      tot++;
    }
    return { bright: Math.round(bright), unif: Math.round(unif), neutral: Math.round(neutral), coverage: +(subj / tot).toFixed(3) };
  }, url);

const result = {};
for (const [key, imgs] of Object.entries(manifest)) {
  const scored = [];
  for (const path of imgs) {
    const s = await scoreImg(`http://localhost:4599${path}`);
    // Clean = bright, uniform background, with the subject filling a sane share.
    const cleanBg = s.bright >= 232 && s.unif <= 28 && s.neutral <= 16;
    const goodCov = s.coverage >= 0.10 && s.coverage <= 0.80;
    s.clean = cleanBg && goodCov;
    s.score = (cleanBg ? 1000 : 0) + s.bright - s.unif * 2 - s.neutral * 4 + (goodCov ? 60 : 0);
    s.path = path;
    scored.push(s);
  }
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  // Only override the default 01 when we actually found a clean shot.
  const chosen = best.clean ? best.path : imgs[0];
  result[key] = { chosen, chosenClean: best.clean, ranked: scored.map((s) => ({ p: s.path.split("/").pop(), bright: s.bright, unif: s.unif, cov: s.coverage, clean: s.clean })) };
  console.log(`${chosen.split("/").pop()} ${best.clean ? "✓clean" : "—keep01"}  ${key}`);
}

writeFileSync(join(__dirname, "thumbnails.json"), JSON.stringify(result, null, 2));
console.log("\nWrote scripts/thumbnails.json");
await browser.close();
server.close();
