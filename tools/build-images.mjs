// Aroma image pipeline.
//   • colour-grades every real photo into one warm, cinematic look
//   • (optionally) crops phone watermarks, up-scales small originals with Lanczos + gentle sharpening
//   • writes AVIF + WebP at several widths and a tiny blur-up placeholder
//   • converts the menu photos into /assets/menu/menu-0N.jpg (kept sharp, text readable)
//   • generates brand assets: logo mark, SVG sprite (spice line-art), PWA icons, OG share image
//
// Usage:  cd tools && npm install && npm run images
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const SRC = path.join(root, 'assest');                 // original uploads (kept untouched)
const OUT = path.join(root, 'assets', 'images');
const MENU_OUT = path.join(root, 'assets', 'menu');
const IMG_OUT = path.join(root, 'assets', 'img');
for (const d of [OUT, MENU_OUT, IMG_OUT]) fs.mkdirSync(d, { recursive: true });

const catalog = JSON.parse(fs.readFileSync(path.join(root, 'content', 'images.json'), 'utf8')).images;

// --- colour grade: warm highlights, deep shadows, rich saturation, soft vignette -----------------
function grade(pipeline) {
  return pipeline
    .modulate({ brightness: 1.03, saturation: 1.12 })
    .linear([1.10, 1.05, 0.96], [-9, -8, -4]); // contrast + warm cast (R up, B down)
}
function vignetteSvg(w, h) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><radialGradient id="v" cx="50%" cy="48%" r="75%">` +
      `<stop offset="55%" stop-color="#14110F" stop-opacity="0"/><stop offset="100%" stop-color="#14110F" stop-opacity="0.42"/>` +
      `</radialGradient></defs><rect width="100%" height="100%" fill="url(#v)"/></svg>`
  );
}

const manifest = {};

async function processPhoto(item) {
  const file = path.join(SRC, item.source);
  if (!fs.existsSync(file)) { console.warn('  ! missing source', item.source); return; }
  let base = sharp(file).rotate();
  let meta = await base.metadata();
  let buf = await base.toBuffer();
  if (item.crop?.bottomPct) {
    const h = Math.round(meta.height * (1 - item.crop.bottomPct / 100));
    buf = await sharp(buf).extract({ left: 0, top: 0, width: meta.width, height: h }).toBuffer();
    meta = await sharp(buf).metadata();
  }
  const w0 = meta.width, h0 = meta.height;
  const widths = [w0];
  if ((item.upscale || 1) > 1) widths.push(Math.round(w0 * item.upscale));

  const done = [];
  for (const w of widths) {
    const h = Math.round((h0 * w) / w0);
    let p = sharp(buf).resize(w, h, { kernel: 'lanczos3' });
    if (w > w0) p = p.sharpen({ sigma: 0.9, m1: 0.6, m2: 1.6 });          // restore crispness after upscaling
    p = grade(p);
    const graded = await p.toBuffer();
    const final = sharp(graded).composite([{ input: vignetteSvg(w, h), blend: 'over' }]);
    const finalBuf = await final.toBuffer();
    await sharp(finalBuf).avif({ quality: 52, effort: 4 }).toFile(path.join(OUT, `${item.id}-${w}.avif`));
    await sharp(finalBuf).webp({ quality: 78, effort: 5 }).toFile(path.join(OUT, `${item.id}-${w}.webp`));
    done.push(w);
  }
  const blurBuf = await sharp(buf).resize(18).modulate({ saturation: 1.1 }).webp({ quality: 40 }).toBuffer();
  manifest[item.id] = {
    w: w0, h: h0, widths: done,
    blur: 'data:image/webp;base64,' + blurBuf.toString('base64'),
    alt: item.alt, groups: item.groups || [], focal: item.focal || '50% 50%',
  };
  console.log('  ✓', item.id.padEnd(16), done.join(' / '));
}

// --- menu pages --------------------------------------------------------------------------------
const MENU_SOURCES = [
  ['nameplate.webp', 'menu-01.jpg'],
  ['menu11.webp', 'menu-02.jpg'],
  ['menu.webp', 'menu-03.jpg'],
  ['evening snak.webp', 'menu-04.jpg'],
  ['starter.webp', 'menu-05.jpg'],
];
async function processMenu() {
  for (const [src, dst] of MENU_SOURCES) {
    const file = path.join(SRC, src);
    if (!fs.existsSync(file)) { console.warn('  ! missing menu source', src); continue; }
    const meta = await sharp(file).metadata();
    const w = meta.width * 2, h = meta.height * 2; // 2x Lanczos + unsharp keeps small print readable
    await sharp(file).rotate()
      .resize(w, h, { kernel: 'lanczos3' })
      .linear(1.07, -4)
      .sharpen({ sigma: 1.1, m1: 0.9, m2: 2.2 })
      .jpeg({ quality: 80, mozjpeg: true, chromaSubsampling: '4:2:0' }) // dark text on light paper → chroma loss is invisible, file ~45% smaller
      .toFile(path.join(MENU_OUT, dst));
    const thumb = await sharp(file).resize(14).jpeg({ quality: 40 }).toBuffer();
    console.log('  ✓ menu', dst, `${w}x${h}`, (fs.statSync(path.join(MENU_OUT, dst)).size / 1024).toFixed(0) + ' KB', thumb.length + 'B lqip');
  }
}

// --- brand: logo mark + sprite -----------------------------------------------------------------
function markSymbolBody() {
  let s = '<circle cx="50" cy="50" r="47"/><circle cx="50" cy="50" r="43.2" stroke-width=".6"/>';
  for (let i = 0; i < 16; i++) s += `<path d="M50 11 C54.6 21 54.6 29 50 38 C45.4 29 45.4 21 50 11Z" transform="rotate(${i * 22.5} 50 50)"/>`;
  for (let i = 0; i < 16; i++) s += `<path d="M50 40 L52.4 45 L50 49 L47.6 45Z" transform="rotate(${i * 22.5 + 11.25} 50 50)" stroke-width=".9"/>`;
  for (let i = 0; i < 16; i++) s += `<circle cx="50" cy="6.4" r="1.2" fill="currentColor" stroke="none" transform="rotate(${i * 22.5 + 11.25} 50 50)"/>`;
  s += '<circle cx="50" cy="50" r="5.2"/><circle cx="50" cy="50" r="1.6" fill="currentColor"/>';
  return s;
}
function petals(n, rx, ry, cy, r0) {
  let s = '';
  for (let i = 0; i < n; i++) s += `<ellipse cx="32" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${i * (360 / n)} 32 32)"/>`;
  return s;
}
const SYMBOLS = {
  mark: ['0 0 100 100', markSymbolBody()],
  anise: ['0 0 64 64', petals(8, 4.4, 11, 18) + '<circle cx="32" cy="32" r="3.6"/>'],
  chilli: ['0 0 64 64', '<path d="M16 20C30 8 54 16 55 40 56 51 48 57 40 53 33 49 40 40 30 34 22 30 13 28 16 20Z"/><path d="M16 20C11 17 9 12 11 7M24 24C30 24 36 28 40 36"/>'],
  cardamom: ['0 0 64 64', '<path d="M32 5C47 16 47 48 32 59 17 48 17 16 32 5Z"/><path d="M32 5V59M32 5C39 18 39 46 32 59M32 5C25 18 25 46 32 59"/>'],
  cinnamon: ['0 0 64 64', '<g transform="rotate(-24 32 32)"><rect x="6" y="18" width="50" height="11" rx="5.5"/><rect x="10" y="35" width="48" height="11" rx="5.5"/><ellipse cx="56" cy="23.5" rx="2.4" ry="5.5"/><ellipse cx="58" cy="40.5" rx="2.4" ry="5.5"/><path d="M12 23.5H50M16 40.5H52"/></g>'],
  saffron: ['0 0 64 64', '<path d="M32 58C30 44 22 36 13 12M32 58C32 42 32 30 32 8M32 58C34 44 42 36 51 12"/><ellipse cx="12" cy="10" rx="2.6" ry="5" transform="rotate(-18 12 10)"/><ellipse cx="32" cy="6" rx="2.6" ry="5"/><ellipse cx="52" cy="10" rx="2.6" ry="5" transform="rotate(18 52 10)"/>'],
  leaf: ['0 0 64 64', '<path d="M32 59C9 44 11 17 32 5 53 17 55 44 32 59Z"/><path d="M32 59V10M32 46 20 36M32 36 44 26M32 28 22 19M32 46 44 36"/>'],
  pepper: ['0 0 64 64', '<circle cx="22" cy="22" r="9"/><circle cx="42" cy="26" r="9"/><circle cx="30" cy="43" r="9"/><circle cx="48" cy="46" r="6"/><path d="M18 19c2-2 4-2 6-1M38 23c2-2 4-2 6-1M26 40c2-2 4-2 6-1" stroke-width="1"/>'],
  flame: ['0 0 64 64', '<path d="M32 5C41 18 51 26 47 43 45 53 37 59 32 59 26 59 17 53 17 43 17 34 24 30 26 21 29 27 31 26 32 5Z"/><path d="M32 59C27 59 25 54 27 48 29 43 32 41 32 35 36 41 39 44 37 51 36 56 34 59 32 59Z"/>'],
  handi: ['0 0 64 64', '<path d="M10 28H54M14 28C10 44 18 57 32 57 46 57 54 44 50 28M25 20C25 14 30 16 30 9M35 20C35 14 40 16 40 9M20 20C20 16 24 17 24 12"/><path d="M8 28H56" stroke-width="2.4"/>'],
  kebab: ['0 0 64 64', '<path d="M6 58L58 6"/><rect x="14" y="30" width="14" height="10" rx="4" transform="rotate(-45 21 35)"/><rect x="26" y="24" width="14" height="10" rx="4" transform="rotate(-45 33 29)"/><rect x="36" y="14" width="14" height="10" rx="4" transform="rotate(-45 43 19)"/><circle cx="9" cy="55" r="2"/>'],
  corn: ['0 0 64 64', '<path d="M32 4C46 14 48 40 32 60 16 40 18 14 32 4Z"/><path d="M32 4V60M21 22H43M19 34H45M22 46H42M25 12 25 52M39 12 39 52" stroke-width="1"/>'],
  paneer: ['0 0 64 64', '<path d="M32 8 54 20V44L32 56 10 44V20Z"/><path d="M10 20 32 32 54 20M32 32V56"/><circle cx="20" cy="36" r="1.4"/><circle cx="44" cy="36" r="1.4"/><circle cx="32" cy="42" r="1.4"/>'],
  naan: ['0 0 64 64', '<path d="M32 6C48 6 58 18 58 32 58 47 46 58 32 58 17 58 6 47 6 32 6 17 17 6 32 6Z" transform="rotate(8 32 32)"/><path d="M18 24 24 20M36 16 42 20M44 34 50 30M24 42 30 46M40 46 46 42M30 30 34 34" stroke-width="2.4"/>'],
  drumstick: ['0 0 64 64', '<path d="M22 42C10 30 14 14 28 12 42 10 54 20 48 34 45 40 38 44 32 42M22 42 12 52M12 52 8 48M12 52 16 56M8 48 12 44M16 56 20 52"/>'],
  wok: ['0 0 64 64', '<path d="M8 30H56C56 46 46 56 32 56 18 56 8 46 8 30Z"/><path d="M16 22C18 18 22 20 24 16M30 22C32 18 36 20 38 16M20 8 50 28M26 6 54 24"/>'],
  cloche: ['0 0 64 64', '<path d="M6 46H58M10 46C10 30 20 20 32 20 44 20 54 30 54 46M32 20V14M28 14H36M10 52H54"/>'],
  arrow: ['0 0 24 24', '<path d="M4 12H20M14 6l6 6-6 6"/>'],
};

function writeSprite() {
  let out = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">';
  for (const [id, [vb, body]] of Object.entries(SYMBOLS)) {
    out += `<symbol id="i-${id}" viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="${id === 'mark' ? 1.1 : 1.6}" stroke-linecap="round" stroke-linejoin="round">${body}</symbol>`;
  }
  out += '</svg>';
  fs.writeFileSync(path.join(IMG_OUT, 'sprite.svg'), out);
  // inline copy so it can be included once at the top of <body> with no extra request
  fs.writeFileSync(path.join(root, 'lib', 'sprite.inc.html'), out);
  const standalone = (color) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="${color}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" style="color:${color}">${markSymbolBody()}</svg>`;
  fs.writeFileSync(path.join(IMG_OUT, 'logo-mark.svg'), standalone('#E8A33D'));
  fs.writeFileSync(path.join(IMG_OUT, 'favicon.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#14110F"/><g transform="translate(14 14) scale(.72)" fill="none" stroke="#E8A33D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#E8A33D">${markSymbolBody()}</g></svg>`);
}

async function brandRaster() {
  const svg = (inner, bg, pad, size) =>
    Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100"><rect width="100" height="100" fill="${bg}"/><g transform="translate(${pad} ${pad}) scale(${(100 - pad * 2) / 100})" fill="none" stroke="#E8A33D" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="color:#E8A33D">${inner}</g></svg>`);
  const body = markSymbolBody();
  await sharp(svg(body, '#14110F', 14, 512)).png().toFile(path.join(IMG_OUT, 'icon-512.png'));
  await sharp(svg(body, '#14110F', 14, 192)).png().toFile(path.join(IMG_OUT, 'icon-192.png'));
  await sharp(svg(body, '#14110F', 24, 512)).png().toFile(path.join(IMG_OUT, 'icon-maskable-512.png')); // extra safe-zone
  await sharp(svg(body, '#14110F', 12, 180)).png().toFile(path.join(IMG_OUT, 'apple-touch-icon.png'));
  await sharp(svg(body, '#14110F', 8, 32)).png().toFile(path.join(IMG_OUT, 'favicon-32.png'));
  console.log('  ✓ brand icons');
}

async function ogImage() {
  const src = path.join(OUT, 'hall-1360.webp');
  if (!fs.existsSync(src)) return;
  const W = 1200, H = 630;
  const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#14110F" stop-opacity=".92"/><stop offset=".62" stop-color="#14110F" stop-opacity=".55"/><stop offset="1" stop-color="#14110F" stop-opacity=".2"/></linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <g transform="translate(70 70) scale(1.05)" fill="none" stroke="#E8A33D" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="color:#E8A33D">${markSymbolBody()}</g>
    <text x="70" y="330" font-family="Georgia, 'Times New Roman', serif" font-size="92" fill="#F5EDE0" font-weight="700">Aroma</text>
    <text x="72" y="388" font-family="Georgia, serif" font-size="34" fill="#E8A33D" letter-spacing="8">MULTICUISINE · SAKCHI</text>
    <text x="72" y="470" font-family="Georgia, serif" font-size="30" fill="#F5EDE0" opacity=".92">Where every meal becomes a celebration.</text>
    <text x="72" y="520" font-family="Arial, sans-serif" font-size="24" fill="#F5EDE0" opacity=".75">4.6★ on Google · 1,000+ reviews · Veg &amp; Non-Veg · Family dining</text>
    <text x="72" y="566" font-family="Arial, sans-serif" font-size="22" fill="#E8A33D">3rd Floor, Basant Central, Sakchi, Jamshedpur</text>
  </svg>`);
  await sharp(src).resize(W, H, { fit: 'cover', position: 'centre' }).composite([{ input: overlay }])
    .jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(root, 'assets', 'img', 'og-image.jpg'));
  console.log('  ✓ og-image.jpg');
}

console.log('Photos');
fs.mkdirSync(path.join(root, 'lib'), { recursive: true });
for (const item of catalog) {
  if (item.enabled === false) continue;
  await processPhoto(item);
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest));
console.log('Menu pages');
await processMenu();
console.log('Brand');
writeSprite();
await brandRaster();
await ogImage();
console.log('Done.');
