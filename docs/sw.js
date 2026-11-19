/* AROMA service worker — offline-cached menu + fast repeat visits.
 * Strategy: pages network-first (4 s) with cache fallback · static assets stale-while-revalidate · menu manifest network-first ·
 * API calls never cached. Bump VERSION to force a refresh of everything. */
const VERSION = 'aroma-v1';
const STATIC = VERSION + '-static';
const RUNTIME = VERSION + '-runtime';
const MENU = VERSION + '-menu';
const SCOPE = self.registration.scope; // always ends with "/"
const abs = (p) => new URL(p, SCOPE).toString();

// Files are cached with their query string stripped, so a rebuilt bundle (…min.js?v=<mtime>) is fetched fresh by stale-while-revalidate.
const CORE = [
  'css/app.min.css', 'js/app.min.js', 'css/vendor/swiper-bundle.min.css',
  'js/vendor/gsap.min.js', 'js/vendor/ScrollTrigger.min.js', 'js/vendor/lenis.min.js', 'js/vendor/page-flip.browser.js', 'js/vendor/swiper-bundle.min.js', 'js/vendor/jspdf.umd.min.js',
  'assets/fonts/fraunces-latin-wght-normal.woff2', 'assets/fonts/fraunces-latin-wght-italic.woff2', 'assets/fonts/manrope-latin-wght-normal.woff2',
  'assets/img/icon-192.png', 'assets/img/favicon.svg', 'content/i18n.json', 'offline.html',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const st = await caches.open(STATIC);
    await Promise.allSettled(CORE.map((p) => st.add(abs(p))));
    // the menu pages: cached up-front so the menu works with no signal
    try {
      const mc = await caches.open(MENU);
      const res = await fetch(abs('assets/menu/menu.json'), { cache: 'no-cache' });
      await mc.put(abs('assets/menu/menu.json'), res.clone());
      const m = await res.json();
      await Promise.allSettled((m.pages || []).map((p) => mc.add(abs('assets/menu/' + p.file))));
    } catch (_) { /* menu will be cached on first view */ }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keep = [STATIC, RUNTIME, MENU];
    await Promise.all((await caches.keys()).filter((k) => k.startsWith('aroma-') && !keep.includes(k)).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));

async function networkFirst(req, cacheName, ms = 4000) {
  const cache = await caches.open(cacheName);
  try {
    const res = await Promise.race([fetch(req), timeout(ms)]);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (_) {
    return (await cache.match(req, { ignoreSearch: false })) || (await caches.match(req)) || null;
  }
}
async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req, { ignoreSearch: cacheName === STATIC });   // ?v=mtime must not defeat the precache
  const net = fetch(req).then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
  return hit || (await net) || Response.error();
}

self.addEventListener('fetch', (e) => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.includes('/api/')) return;                      // always live

  if (req.mode === 'navigate') {
    e.respondWith((async () => (await networkFirst(req, RUNTIME)) || (await caches.match(abs('offline.html'))) || Response.error())());
    return;
  }
  if (url.pathname.endsWith('/assets/menu/menu.json') || url.pathname.endsWith('/content/site.json')) {
    e.respondWith((async () => (await networkFirst(req, url.pathname.includes('/menu/') ? MENU : RUNTIME, 3500)) || Response.error())());
    return;
  }
  if (url.pathname.includes('/assets/menu/')) { e.respondWith(staleWhileRevalidate(req, MENU)); return; }
  e.respondWith(staleWhileRevalidate(req, /\.(css|js|woff2?|json)$/.test(url.pathname) ? STATIC : RUNTIME));
});
