/* AROMA core: config, helpers, i18n, theme, open-now status, counters, analytics, festive, PWA, section tracking */

export const cfg = JSON.parse(document.getElementById('aroma-config').textContent);
// QR table mode also works on static previews (no server-side query handling there)
{ const q = new URLSearchParams(location.search); if (q.get('table')) cfg.table = q.get('table').replace(/[^0-9A-Za-z-]/g, ''); if (q.has('menu') || q.has('table')) cfg.view = 'menu'; }
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const mqMobile = matchMedia('(max-width: 767px)');
export const mqDesktop = matchMedia('(min-width: 1024px)');
export const isMobile = () => mqMobile.matches;
export const store = {
  get(k, d = null) { try { const v = localStorage.getItem('aroma.' + k); return v === null ? d : v; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('aroma.' + k, v); } catch { /* private mode */ } },
};
export const root = document.documentElement;

/* ---------- i18n ---------------------------------------------------------- */
let lang = root.lang === 'hi' ? 'hi' : 'en';
let fullDict = null;
export const getLang = () => lang;
export function T(key, vars) {
  let s = (cfg.i18n[lang] && cfg.i18n[lang][key]) || (fullDict && fullDict[lang] && fullDict[lang][key]) || cfg.i18n.en[key] || key;
  if (vars) for (const k in vars) s = s.replaceAll('{' + k + '}', vars[k]);
  return s;
}
/** Pick the localised value from {en,hi} or a plain string. */
export const pick = (v) => (v && typeof v === 'object') ? (v[lang] || v.en || '') : (v || '');

export async function setLang(next, { silent = false } = {}) {
  if (next === 'hi' && !fullDict) {
    try { fullDict = await (await fetch(cfg.base + 'content/i18n.json')).json(); } catch { /* keep English */ next = 'en'; }
  }
  lang = next;
  root.lang = next;
  store.set('lang', next);
  if (fullDict || next === 'en') {
    $$('[data-i18n]').forEach((el) => {
      if (el.dataset.en0 === undefined) el.dataset.en0 = el.innerHTML;
      const v = next === 'hi' ? fullDict.hi[el.dataset.i18n] : el.dataset.en0;
      if (v != null) { el.innerHTML = v; if (el.hasAttribute('data-split')) el.classList.add('is-split'); }
    });
    $$('[data-i18n-attr]').forEach((el) => {
      const [attr, key] = el.dataset.i18nAttr.split(':');
      const slot = 'en0' + attr.replace(/[^a-z]/gi, '');           // "aria-label" is not a valid dataset key
      if (el.dataset[slot] === undefined) el.dataset[slot] = el.getAttribute(attr) || '';
      const v = next === 'hi' ? fullDict.hi[key] : el.dataset[slot];
      if (v) el.setAttribute(attr, v.replace(/<[^>]+>/g, ''));
    });
  }
  $$('[data-hi]').forEach((el) => { el.textContent = next === 'hi' ? el.dataset.hi : (el.dataset.en ?? el.textContent); });
  const lbl = $('[data-lang-label]'); if (lbl) lbl.textContent = next === 'hi' ? 'EN' : 'हिं';
  if (!silent) document.dispatchEvent(new CustomEvent('aroma:lang', { detail: next }));
}

/* ---------- misc helpers ------------------------------------------------------- */
export const waLink = (msg = '') => `https://wa.me/${cfg.whatsapp}${msg ? '?text=' + encodeURIComponent(msg) : ''}`;
export const url = (p) => cfg.base + p.replace(/^\//, '');
export function el(tag, attrs = {}, html = '') {
  const n = document.createElement(tag);
  for (const k in attrs) { if (k === 'class') n.className = attrs[k]; else if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); }
  if (html) n.innerHTML = html;
  return n;
}
export function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

let toastTimer;
export function toast(msg, ms = 3200) {
  const t = $('[data-toast]'); if (!t) return;
  t.textContent = msg; t.hidden = false;
  t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, ms);
}

let lockCount = 0;
export function lock() { if (lockCount++ === 0) { root.classList.add('is-locked'); window.__lenis && window.__lenis.stop(); } }
export function unlock() { if (--lockCount <= 0) { lockCount = 0; root.classList.remove('is-locked'); window.__lenis && window.__lenis.start(); } }

export function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });
}
function loadCss(href) {
  return new Promise((res) => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; l.onload = l.onerror = res; document.head.appendChild(l); });
}
/** Heavy libraries are loaded on demand so phones never download what they don't use. */
const LIBS = {
  gsap: { js: ['js/vendor/gsap.min.js'], then: ['js/vendor/ScrollTrigger.min.js'] },
  lenis: { js: ['js/vendor/lenis.min.js'] },
  pageflip: { js: ['js/vendor/page-flip.browser.js'] },
  swiper: { js: ['js/vendor/swiper-bundle.min.js'], css: ['css/vendor/swiper-bundle.min.css'] },
};
const libCache = {};
export function lib(name) {
  if (libCache[name]) return libCache[name];
  const d = LIBS[name];
  libCache[name] = Promise.all([...(d.css || []).map((c) => loadCss(url(c))), ...d.js.map((j) => loadScript(url(j)))])
    .then(() => Promise.all((d.then || []).map((j) => loadScript(url(j)))))
    .catch((e) => { delete libCache[name]; throw e; });
  return libCache[name];
}

/** Scroll to an element id (Lenis if running, native otherwise). */
export function scrollToId(id, opts = {}) {
  const t = typeof id === 'string' ? document.getElementById(id.replace('#', '')) : id; if (!t) return;
  const off = -(parseInt(getComputedStyle(root).getPropertyValue('--nav-h')) || 60) + 1;
  if (window.__lenis) window.__lenis.scrollTo(t, { offset: off, duration: 1.4, ...opts });
  else t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}

/* ---------- analytics (GA4 / Meta Pixel / dataLayer) ----------------------------- */
export function track(name, params = {}) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...params });
    if (window.gtag) window.gtag('event', name, params);
    if (window.fbq) {
      const std = { call_click: 'Contact', whatsapp_click: 'Contact', directions_click: 'FindLocation', reserve_submit: 'Schedule', celebration_enquiry: 'Lead' };
      window.fbq(std[name] ? 'track' : 'trackCustom', std[name] || name, params);
    }
  } catch { /* never break the page for analytics */ }
}
function initAnalytics() {
  const a = cfg.analytics || {};
  if (a.ga4) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', a.ga4, { anonymize_ip: true });
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(a.ga4)).catch(() => {});
  }
  if (a.metaPixel) {
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', a.metaPixel); window.fbq('track', 'PageView');
  }
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-track]'); if (t) track(t.dataset.track, { label: (t.textContent || '').trim().slice(0, 40) });
  });
}

/* ---------- theme ----------------------------------------------------------------- */
function initTheme() {
  const set = (th) => {
    root.setAttribute('data-theme', th); store.set('theme', th);
    const m = $('meta[name="theme-color"]'); if (m) m.content = th === 'light' ? '#F5EDE0' : '#14110F';
  };
  set(root.getAttribute('data-theme') || 'light');
  $$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', () => set(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light')));
}

/* ---------- festive themes (site.json → festive.active) ------------------------------ */
function initFestive() {
  const f = cfg.festive || {}; const th = f.themes && f.themes[f.active];
  if (!th) return;
  root.setAttribute('data-festive', f.active);
  root.style.setProperty('--f-accent', th.accent); root.style.setProperty('--f-accent2', th.accent2);
}

/* ---------- announcement banner ------------------------------------------------------- */
function initBanner() {
  const b = $('[data-banner]'); if (!b) return;
  if (store.get('banner-x') === new Date().toDateString()) { b.remove(); return; }
  document.body.classList.add('has-banner');
  const sync = () => root.style.setProperty('--banner-h', b.offsetHeight + 'px');
  sync(); addEventListener('resize', sync);
  $('[data-banner-close]', b).addEventListener('click', () => { store.set('banner-x', new Date().toDateString()); b.remove(); document.body.classList.remove('has-banner'); root.style.setProperty('--banner-h', '0px'); });
}

/* ---------- live "Open now" badge, hours table (Asia/Kolkata) ---------------------------- */
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
function nowIn(tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { day: DAYS.indexOf(p.weekday.slice(0, 3).toLowerCase()), min: (+p.hour) * 60 + (+p.minute) };
}
const toMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const fmt12 = (min) => { min = ((min % 1440) + 1440) % 1440; const h = Math.floor(min / 60), m = min % 60; const ap = h >= 12 ? 'PM' : 'AM'; return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ':00'} ${ap}`; };
const hoursFor = (dayIdx) => { const h = cfg.hours; const d = h.days && DAYS[dayIdx] in h.days ? h.days[DAYS[dayIdx]] : h.default; return d || null; };

export function openStatus() {
  const { day, min } = nowIn(cfg.hours.timezone);
  const today = hoursFor(day), yest = hoursFor((day + 6) % 7);
  // open past midnight from yesterday?
  if (yest) { const o = toMin(yest.open), c = toMin(yest.close); if (c <= o && min < c) return { state: min > c - 45 ? 'soon' : 'open', until: c }; }
  if (today) {
    const o = toMin(today.open); let c = toMin(today.close); if (c <= o) c += 1440;
    if (min >= o && min < c) return { state: c - min <= 45 ? 'soon' : 'open', until: c };
    if (min < o) return { state: 'closed', next: o, today: true };
  }
  for (let i = 1; i <= 7; i++) { const h = hoursFor((day + i) % 7); if (h) return { state: 'closed', next: toMin(h.open), today: false }; }
  return { state: 'closed' };
}
function initStatus() {
  const badges = $$('[data-open-badge]');
  const tick = () => {
    const s = openStatus();
    badges.forEach((b) => {
      b.dataset.state = s.state;
      const t = $('[data-open-text]', b); if (!t) return;
      t.removeAttribute('data-i18n');
      t.textContent = s.state === 'open' ? T('js.open', { t: fmt12(s.until) }) : s.state === 'soon' ? T('js.openSoon', { t: fmt12(s.until) }) : s.next != null ? T('js.closed', { t: fmt12(s.next) }) : T('js.closedToday');
    });
    const { day } = nowIn(cfg.hours.timezone);
    $$('.hours tr').forEach((r) => r.classList.toggle('is-today', r.dataset.day === DAYS[day]));
  };
  tick(); setInterval(tick, 30000);
  document.addEventListener('aroma:lang', tick);
}

/* ---------- count-up ticker (rating 0 → 4.6, reviews → 1,000+) ----------------------------- */
function initCounters() {
  const els = $$('[data-count]'); if (!els.length || reduced) return;
  const fmt = (el, v) => {
    const d = +el.dataset.decimals || 0;
    let s = v.toFixed(d); if (el.hasAttribute('data-commas')) s = Number(s).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
    return s + (el.dataset.suffix || '');
  };
  const run = (el) => {
    const end = +el.dataset.count, dur = 1800, t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4); el.textContent = fmt(el, end * e); if (k < 1) requestAnimationFrame(step); };
    el.textContent = fmt(el, 0); requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); run(e.target); } }), { threshold: 0.6 });
  els.forEach((e) => io.observe(e));
}

/* ---------- section tracking: document.title per section, active nav/tab ----------------------- */
function initSectionTracking() {
  const base = document.title;
  const secs = $$('main [id]').filter((s) => s.matches('section') || s.id === 'top');
  const links = $$('.nav__links a'), tabs = $$('[data-tab]');
  const map = { top: 'top', story: 'top', cuisines: 'top', dishes: 'top', mood: 'top', menu: 'menu', celebrate: 'reserve', buffet: 'reserve', reserve: 'reserve', gallery: 'gallery', reviews: 'gallery', visit: 'gallery' };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      document.title = e.target.dataset.sectionTitle || base;
      links.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === '#' + id));
      const tab = map[id] || 'top';
      tabs.forEach((t) => t.classList.toggle('is-active', t.dataset.tab === tab));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach((s) => io.observe(s));
}

/* ---------- PWA: service worker + install prompt --------------------------------------------------- */
function initPWA() {
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    addEventListener('load', () => navigator.serviceWorker.register(cfg.base + 'sw.js', { scope: cfg.base }).catch(() => {}));
  }
  addEventListener('offline', () => toast(T('js.offline')));
  const box = $('[data-install]'); if (!box || !cfg.toggles.installPrompt) return;
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone || store.get('install-x')) return;
  let deferred = null;
  const show = () => { box.hidden = false; };
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; setTimeout(show, 20000); });
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  if (ios) { $('[data-install-text]', box).textContent = T('js.install.ios'); $('[data-install-go]', box).hidden = true; setTimeout(show, 25000); }
  $('[data-install-go]', box).addEventListener('click', async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; box.hidden = true; deferred = null; });
  $('[data-install-x]', box).addEventListener('click', () => { box.hidden = true; store.set('install-x', '1'); });
}

/* ---------- contact speed-dial FAB --------------------------------------------------------------------- */
function initFab() {
  const fab = $('[data-fab]'); if (!fab) return;
  const btn = $('.fab__btn', fab);
  btn.addEventListener('click', () => { const o = fab.classList.toggle('is-open'); btn.setAttribute('aria-expanded', o); });
  document.addEventListener('click', (e) => { if (!fab.contains(e.target)) { fab.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); } });
}

/* ---------- generic WhatsApp message buttons -------------------------------------------------------------- */
function initWaButtons() {
  $$('[data-wa-msg="gift"]').forEach((a) => {
    a.href = waLink('Hello Aroma! I would like to enquire about gift vouchers.'); a.target = '_blank'; a.rel = 'noopener';
  });
}

export function initCore() {
  initTheme(); initFestive(); initBanner(); initStatus(); initCounters(); initSectionTracking();
  initAnalytics(); initPWA(); initFab(); initWaButtons();
  $$('[data-lang-toggle]').forEach((b) => b.addEventListener('click', () => setLang(lang === 'hi' ? 'en' : 'hi')));
  if (lang === 'hi') setLang('hi');
  if (reduced) root.classList.add('no-motion');
}
