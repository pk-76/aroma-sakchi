// Static preview export for GitHub Pages (client previews). Output → /docs
//   npm run export                         → https://pk-76.github.io/aroma-sakchi/
//   node export-static.mjs <host> <base>   → custom host/base (e.g. staging.example.com /)
// The real site runs on PHP hosting. In this static preview the forms/AI/reviews APIs don't exist, so:
//   forms → show the confirmation screen with the pre-filled WhatsApp button · Ask Aroma → built-in rules engine · reviews → themes only.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const host = process.argv[2] || 'pk-76.github.io';
const base = (process.argv[3] || '/aroma-sakchi/').replace(/\/?$/, '/');
const out = path.join(root, 'docs');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const render = (file) => execFileSync('php', [path.join(here, 'render.php'), file, base, host], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
fs.writeFileSync(path.join(out, 'index.html'), render('index.php'));
fs.writeFileSync(path.join(out, 'sitemap.xml'), render('sitemap.php'));
fs.writeFileSync(path.join(out, 'robots.txt'), render('robots.php'));
fs.writeFileSync(path.join(out, '404.html'), fs.readFileSync(path.join(out, 'index.html'), 'utf8'));
fs.writeFileSync(path.join(out, '.nojekyll'), '');

for (const d of ['assets', 'css', 'js', 'content']) fs.cpSync(path.join(root, d), path.join(out, d), { recursive: true });
for (const f of ['manifest.webmanifest', 'sw.js', 'offline.html']) fs.copyFileSync(path.join(root, f), path.join(out, f));
// readable sources aren't needed for the preview — keep the bundles only
for (const f of ['main', 'core', 'motion', 'menu', 'ai', 'forms', 'content', 'zoom']) fs.rmSync(path.join(out, 'js', f + '.js'), { force: true });
for (const f of ['main.css', 'ui.css']) fs.rmSync(path.join(out, 'css', f), { force: true });

console.log(`static preview written to docs/  →  https://${host}${base}`);
