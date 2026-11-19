// Copies the front-end libraries + fonts from node_modules into the site folders,
// so the production site is fully self-hosted (no CDN, works offline, no build step for the owner).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const nm = (p) => path.join(here, 'node_modules', p);

const jobs = [
  // [from, to]
  ['gsap/dist/gsap.min.js', 'js/vendor/gsap.min.js'],
  ['gsap/dist/ScrollTrigger.min.js', 'js/vendor/ScrollTrigger.min.js'],
  ['lenis/dist/lenis.min.js', 'js/vendor/lenis.min.js'],
  ['page-flip/dist/js/page-flip.browser.js', 'js/vendor/page-flip.browser.js'],
  ['swiper/swiper-bundle.min.js', 'js/vendor/swiper-bundle.min.js'],
  ['swiper/swiper-bundle.min.css', 'css/vendor/swiper-bundle.min.css'],
  ['jspdf/dist/jspdf.umd.min.js', 'js/vendor/jspdf.umd.min.js'],
  ['@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2', 'assets/fonts/fraunces-latin-wght-normal.woff2'],
  ['@fontsource-variable/fraunces/files/fraunces-latin-wght-italic.woff2', 'assets/fonts/fraunces-latin-wght-italic.woff2'],
  ['@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2', 'assets/fonts/manrope-latin-wght-normal.woff2'],
  ['@fontsource-variable/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-wght-normal.woff2', 'assets/fonts/noto-sans-devanagari-wght-normal.woff2'],
  ['@fontsource/noto-serif-devanagari/files/noto-serif-devanagari-devanagari-600-normal.woff2', 'assets/fonts/noto-serif-devanagari-600-normal.woff2'],
];

for (const [from, to] of jobs) {
  const src = nm(from);
  const dst = path.join(root, to);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  console.log('copied', to, (fs.statSync(dst).size / 1024).toFixed(1) + ' KB');
}
