// Bundles + minifies the site's own JS and CSS for production.
//   js/main.js (+ its modules)  →  js/app.min.js
//   css/main.css + css/ui.css    →  css/app.min.css
// index.php automatically serves the .min files when they exist (and cache-busts with the file's mtime).
// Edit the readable sources, then run `npm run build`. Open the site with ?dev=1 to bypass the minified files while debugging.
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const kb = (f) => (fs.statSync(path.join(root, f)).size / 1024).toFixed(1) + ' KB';

await build({
  entryPoints: [path.join(root, 'js/main.js')],
  outfile: path.join(root, 'js/app.min.js'),
  bundle: true, minify: true, format: 'esm', target: ['es2020'], legalComments: 'none', sourcemap: false, logLevel: 'warning',
});
console.log('js/app.min.js ', kb('js/app.min.js'));

// concatenate the two stylesheets (fonts are relative to /css, so the output stays in /css)
const tmp = path.join(root, 'css', '.bundle.tmp.css');
fs.writeFileSync(tmp, fs.readFileSync(path.join(root, 'css/main.css'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'css/ui.css'), 'utf8'));
await build({ entryPoints: [tmp], outfile: path.join(root, 'css/app.min.css'), bundle: false, minify: true, loader: { '.css': 'css' }, target: ['chrome90', 'safari14', 'firefox90'], logLevel: 'warning' });
fs.unlinkSync(tmp);
console.log('css/app.min.css', kb('css/app.min.css'));
