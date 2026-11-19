// Turns the supplied logo (assets/images/aroma-logo.jpg, white background) into transparent PNG/WebP + brand icons.
// White is removed by flood-fill from the image edges, so white INSIDE the artwork is untouched. Edges are feathered.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'assets/images/aroma-logo.jpg');
const out = path.join(root, 'assets/img');
if (!fs.existsSync(src)) throw new Error('Put the logo at assets/images/aroma-logo.jpg');

// 1) work at 4x so the cut-out edge is smooth
const up = await sharp(src).resize(600, 600, { kernel: 'lanczos3' }).sharpen({ sigma: 0.7 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { data, info } = up; const W = info.width, H = info.height, C = info.channels;
const isBg = (i) => data[i] > 232 && data[i + 1] > 232 && data[i + 2] > 232;
const seen = new Uint8Array(W * H); const stack = [];
for (let x = 0; x < W; x++) { stack.push(x, (H - 1) * W + x); }
for (let y = 0; y < H; y++) { stack.push(y * W, y * W + W - 1); }
while (stack.length) {
  const p = stack.pop(); if (seen[p]) continue; const i = p * C; if (!isBg(i)) continue; seen[p] = 1;
  const x = p % W, y = (p / W) | 0;
  if (x > 0) stack.push(p - 1); if (x < W - 1) stack.push(p + 1); if (y > 0) stack.push(p - W); if (y < H - 1) stack.push(p + W);
}
for (let p = 0; p < W * H; p++) data[p * C + 3] = seen[p] ? 0 : 255;
// feather: blur the alpha channel slightly and keep the colour
const aRaw = Buffer.alloc(W * H); for (let p = 0; p < W * H; p++) aRaw[p] = data[p * C + 3];
const { data: aBlur, info: aInfo } = await sharp(aRaw, { raw: { width: W, height: H, channels: 1 } }).blur(1.1).raw().toBuffer({ resolveWithObject: true });
for (let p = 0; p < W * H; p++) data[p * C + 3] = aBlur[p * aInfo.channels];
const logo = await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().trim({ threshold: 1 }).toBuffer();   // crop to the artwork
const m = await sharp(logo).metadata();
const sq = Math.max(m.width, m.height);
const squared = await sharp(logo).resize(sq, sq, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();

await sharp(squared).resize(512).png({ compressionLevel: 9 }).toFile(path.join(out, 'logo.png'));
await sharp(squared).resize(256).webp({ quality: 90, alphaQuality: 95 }).toFile(path.join(out, 'logo.webp'));
await sharp(squared).resize(96).webp({ quality: 90, alphaQuality: 95 }).toFile(path.join(out, 'logo-96.webp'));

// 2) PWA / favicon / apple-touch: the logo centred on the brand ink
const onInk = async (size, pad, file) => {
  const inner = Math.round(size * (1 - pad * 2));
  const lg = await sharp(squared).resize(inner, inner).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: '#14110F' } }).composite([{ input: lg, gravity: 'centre' }]).png().toFile(path.join(out, file));
};
await onInk(512, 0.07, 'icon-512.png'); await onInk(192, 0.07, 'icon-192.png'); await onInk(512, 0.2, 'icon-maskable-512.png');
await onInk(180, 0.06, 'apple-touch-icon.png'); await onInk(32, 0.02, 'favicon-32.png');
fs.writeFileSync(path.join(out, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#14110F"/><image href="data:image/webp;base64,${fs.readFileSync(path.join(out, 'logo-96.webp')).toString('base64')}" x="6" y="6" width="88" height="88"/></svg>`);

// 3) share image: add the real logo to the existing OG composition
const og = path.join(out, 'og-image.jpg');
if (fs.existsSync(og)) {
  const base = await sharp(og).toBuffer();
  const lg = await sharp(squared).resize(150, 150).toBuffer();
  // the old SVG mark sits at (70,70) — cover it with the dark gradient edge, then place the real logo
  const patch = await sharp({ create: { width: 190, height: 190, channels: 4, background: { r: 20, g: 17, b: 15, alpha: 0.96 } } }).png().toBuffer();
  await sharp(base).composite([{ input: patch, left: 55, top: 55 }, { input: lg, left: 75, top: 75 }]).jpeg({ quality: 88, mozjpeg: true }).toFile(og + '.tmp');
  fs.renameSync(og + '.tmp', og);
}
console.log('logo ready:', fs.readdirSync(out).filter((f) => /logo|icon|favicon|apple/.test(f)).join(', '));
