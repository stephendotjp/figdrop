import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const picks = JSON.parse(readFileSync(join(__dirname, "thumbnails.json"), "utf8"));

// Card background (Tailwind `card`). Trimmed subjects sit on this so the tile
// looks seamless and every thumbnail shares the same neutral surround.
const BG = [242, 242, 242];
const TARGET = 800;
const FIT = 0.84; // subject's long side fills 84% of the canvas -> ~8% margin

const server = createServer((req, res) => {
  try {
    const b = readFileSync(join(root, "public", decodeURIComponent(req.url)));
    res.writeHead(200, { "content-type": "image/jpeg", "access-control-allow-origin": "*" });
    res.end(b);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(4602, r));

const browser = await chromium.launch();
const page = await browser.newPage();

const normalize = (url) =>
  page.evaluate(async ({ url, BG, TARGET, FIT }) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    await img.decode();
    const W = img.naturalWidth, H = img.naturalHeight;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, W, H).data;
    const at = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };

    // Background colour + uniformity from the 4 corners.
    const P = Math.round(Math.min(W, H) * 0.06);
    const corner = [];
    for (const [ox, oy] of [[0, 0], [W - P, 0], [0, H - P], [W - P, H - P]])
      for (let y = 0; y < P; y++) for (let x = 0; x < P; x++) corner.push(at(ox + x, oy + y));
    const mean = [0, 1, 2].map((k) => corner.reduce((s, p) => s + p[k], 0) / corner.length);
    const sd = Math.sqrt(corner.reduce((s, p) => s + [0, 1, 2].reduce((a, k) => a + (p[k] - mean[k]) ** 2, 0), 0) / corner.length);
    // Only normalize clean studio shots: uniform, neutral (un-tinted), and
    // bright. Scenic / dark / coloured backdrops are left on their original
    // full image (trimming those looks worse, not better).
    const bright = (mean[0] + mean[1] + mean[2]) / 3;
    const neutral = Math.max(...mean) - Math.min(...mean);
    const ok = sd < 24 && neutral < 16 && bright > 218;

    if (!ok) return { normalized: false };

    // Bounding box of pixels that differ from the background colour.
    const TH = 38;
    let minX = W, minY = H, maxX = -1, maxY = -1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const [r, g, b] = at(x, y);
      if (Math.abs(r - mean[0]) + Math.abs(g - mean[1]) + Math.abs(b - mean[2]) > TH) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    const bw = maxX - minX, bh = maxY - minY;
    const area = (bw * bh) / (W * H);
    if (maxX < 0 || area < 0.04 || area > 0.985) return { normalized: false };

    // Recomposite: subject centred on a neutral square at consistent scale.
    const out = document.createElement("canvas");
    out.width = TARGET; out.height = TARGET;
    const o = out.getContext("2d");
    // Pad with the image's OWN background colour so the crop blends seamlessly
    // (no white-on-grey inner rectangle).
    o.fillStyle = `rgb(${Math.round(mean[0])},${Math.round(mean[1])},${Math.round(mean[2])})`;
    o.fillRect(0, 0, TARGET, TARGET);
    const scale = (TARGET * FIT) / Math.max(bw, bh);
    const dw = bw * scale, dh = bh * scale;
    o.drawImage(c, minX, minY, bw, bh, (TARGET - dw) / 2, (TARGET - dh) / 2, dw, dh);
    return { normalized: true, dataUrl: out.toDataURL("image/jpeg", 0.9), cover: +area.toFixed(2) };
  }, { url, BG, TARGET, FIT });

const applied = {};
for (const [key, v] of Object.entries(picks)) {
  const r = await normalize(`http://localhost:4602${v.chosen}`);
  if (r.normalized) {
    const b64 = r.dataUrl.split(",")[1];
    writeFileSync(join(root, "public", "figures", key, "thumb.jpg"), Buffer.from(b64, "base64"));
    applied[key] = `/figures/${key}/thumb.jpg`;
    console.log(`✓ normalized  ${key}  (subject ${Math.round(r.cover * 100)}% of source)`);
  } else {
    console.log(`— skipped (busy bg)  ${key}`);
  }
}

writeFileSync(join(__dirname, "thumb-normalized.json"), JSON.stringify(applied, null, 2));
console.log(`\nNormalized ${Object.keys(applied).length}/${Object.keys(picks).length}. Wrote scripts/thumb-normalized.json`);
await browser.close();
server.close();
