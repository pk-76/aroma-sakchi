/* AROMA menu: desktop 3D page-flip book · mobile story-style swipe menu · PDF · WhatsApp share · text menu · QR table mode */
import { cfg, $, $$, el, url, T, pick, toast, lock, unlock, loadScript, lib, waLink, track, isMobile, mqMobile, reduced, store } from './core.js';
import { ZoomPan, Gestures, openLightbox } from './zoom.js';

/* ---------- manifest (assets/menu/menu.json) — replace images + edit the JSON, no code change ---------- */
let menuP;
export function loadMenu() {
  return menuP || (menuP = fetch(url('assets/menu/menu.json'), { cache: 'no-cache' })
    .then((r) => { if (!r.ok) throw 0; return r.json(); })
    .then((m) => { m.pages = (m.pages || []).map((p, i) => ({ ...p, i, src: url('assets/menu/' + p.file) })); m.categories = m.categories || []; return m; })
    .catch(() => null));
}
const catLabel = (c) => pick(c.label);

/* ---------- page-turn sound (synthesised — muted by default) ---------- */
let ac = null, soundOn = false;
function toggleSound(btn) {
  soundOn = !soundOn;
  if (soundOn && !ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { soundOn = false; } }
  if (ac && ac.state === 'suspended') ac.resume();
  btn.setAttribute('aria-pressed', String(soundOn));
  btn.setAttribute('aria-label', T(soundOn ? 'js.sound.on' : 'js.sound.off'));
  toast(T(soundOn ? 'js.sound.on' : 'js.sound.off'), 1400);
  if (soundOn) flipSound();
}
function flipSound() {
  if (!soundOn || !ac) return;
  const dur = 0.26, n = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) { const t = i / n; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.2) * (t < 0.06 ? t / 0.06 : 1); }
  const src = ac.createBufferSource(); src.buffer = buf;
  const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8;
  f.frequency.setValueAtTime(1500, ac.currentTime); f.frequency.exponentialRampToValueAtTime(5600, ac.currentTime + dur);
  const g = ac.createGain(); g.gain.value = 0.45;
  src.connect(f); f.connect(g); g.connect(ac.destination); src.start();
}

/* ===================================== DESKTOP: THE MENU BOOK ===================================== */
let book = null, bookReady = false;

async function initBook() {
  if (bookReady) return; bookReady = true;
  const host = $('[data-book]'); const menu = await loadMenu();
  try { await lib('pageflip'); } catch { /* falls through to the message below */ }
  if (!menu || !menu.pages.length || typeof St === 'undefined') { host.innerHTML = '<p class="fineprint" style="padding:2rem;text-align:center">Menu pages unavailable — please use the PDF or text menu below.</p>'; return; }
  const pages = menu.pages, N = pages.length;
  // natural page ratio from the first image
  const probe = new Image(); probe.src = pages[0].src; try { await probe.decode(); } catch { /* use defaults */ }
  const W = probe.naturalWidth || 764, H = probe.naturalHeight || 1020;

  host.innerHTML = '';
  const wrap = el('div', { class: 'book__wrap' }); host.appendChild(wrap);
  const mk = (i, p) => {
    const d = el('div', { class: 'page' + (i === 0 ? ' page--cover' : '') });
    if (i === 0 || i === N - 1) d.dataset.density = 'hard';
    const im = el('img', { alt: p.alt || p.title || '', draggable: 'false', decoding: 'async', width: W, height: H }); im.dataset.i = i;
    if (i < 3) im.src = p.src; else im.dataset.src = p.src;
    d.appendChild(im); return d;
  };
  pages.forEach((p, i) => wrap.appendChild(mk(i, p)));
  // pad so the back cover sits alone: total page count must be even
  const logoHtml = `<img src="${url('assets/img/logo.webp')}" alt="" width="256" height="256">`;
  if ((N + 1) % 2 !== 0) wrap.appendChild(el('div', { class: 'page page--back' }, logoHtml));
  wrap.appendChild(el('div', { class: 'page page--back', 'data-density': 'hard' }, logoHtml));
  wrap.firstChild.dataset.density = 'hard';

  book = new St.PageFlip(wrap, {
    width: W, height: H, size: 'stretch', minWidth: 220, maxWidth: W * 1.15, minHeight: 300, maxHeight: H * 1.15,
    showCover: true, drawShadow: true, maxShadowOpacity: 0.55, flippingTime: 950, usePortrait: true, startPage: 0,
    mobileScrollSupport: true, disableFlipByClick: true, swipeDistance: 28, clickEventForward: false, autoSize: true,
  });
  book.loadFromHTML(wrap.querySelectorAll('.page'));
  // lazy-load the remaining page images while the browser is idle
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 600));
  idle(() => $$('img[data-src]', wrap).forEach((im) => { im.src = im.dataset.src; delete im.dataset.src; }));

  const count = $('[data-book-count]'), tabs = $$('[data-booktabs] .booktab');
  const sync = () => {
    const idx = book.getCurrentPageIndex(); const portrait = book.getOrientation() === 'portrait';
    const left = idx + 1; const right = (!portrait && idx >= 1 && idx + 2 <= N) ? idx + 2 : null;
    count.textContent = T('js.page', { n: right ? `${left}–${right}` : Math.min(left, N), m: N });
    const ref = right || Math.min(left, N);
    const cats = menu.categories.slice().sort((a, b) => a.page - b.page);
    let active = -1; cats.forEach((c, k) => { if (c.page <= ref) active = k; });
    tabs.forEach((t) => t.classList.toggle('is-active', cats[active] && +t.dataset.goto === cats[active].page));
    $('[data-book-prev]').disabled = idx === 0; $('[data-book-next]').disabled = idx >= book.getPageCount() - 1;
    // a closed book sits centred: slide the stage while the front / back cover is showing
    const last = idx >= book.getPageCount() - 1;
    wrap.style.transform = portrait ? '' : idx === 0 ? 'translateX(-25%)' : last ? 'translateX(25%)' : '';
  };
  wrap.style.transition = 'transform .9s cubic-bezier(.22,.8,.2,1)';
  book.on('flip', sync); book.on('init', sync); book.on('changeOrientation', sync);
  book.on('changeState', (e) => { if (e.data === 'flipping') flipSound(); });
  sync();

  $('[data-book-prev]').addEventListener('click', () => book.flipPrev());
  $('[data-book-next]').addEventListener('click', () => book.flipNext());
  $$('[data-booktabs] .booktab').forEach((b) => b.addEventListener('click', () => { book.flip(Math.max(0, +b.dataset.goto - 1)); track('menu_view', { page: +b.dataset.goto }); }));
  $('[data-sound-toggle]').addEventListener('click', (e) => toggleSound(e.currentTarget));
  // keyboard: arrows flip while the book is focused / hovered
  const keys = (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); book.flipNext(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); book.flipPrev(); } else if (e.key === 'Enter' || e.key === ' ') { if (document.activeElement === host) { e.preventDefault(); zoomCurrent(); } } };
  host.addEventListener('keydown', keys);
  let hover = false; host.addEventListener('pointerenter', () => { hover = true; }); host.addEventListener('pointerleave', () => { hover = false; });
  document.addEventListener('keydown', (e) => { if (hover && !e.target.closest('input,textarea,select') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) keys(e); });

  // click (not drag) on a page → full-screen lightbox with zoom + pan
  let dn = null;
  host.addEventListener('pointerdown', (e) => { dn = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  host.addEventListener('pointerup', (e) => {
    if (!dn) return; const moved = Math.hypot(e.clientX - dn.x, e.clientY - dn.y) > 6 || performance.now() - dn.t > 450; dn = null;
    if (moved) return; const pg = e.target.closest('.page'); const im = pg && pg.querySelector('img'); if (im) openPages(+im.dataset.i);
  });
  const openPages = (i) => { track('menu_view', { page: i + 1 }); openLightbox(pages.map((p) => ({ src: p.src, alt: p.alt || p.title })), i); };
  const zoomCurrent = () => openPages(Math.min(book.getCurrentPageIndex() + (book.getOrientation() === 'portrait' ? 0 : 0), N - 1));
  $('[data-book-zoom]').addEventListener('click', () => { const idx = book.getCurrentPageIndex(); openPages(Math.min(idx === 0 ? 0 : idx, N - 1)); });
}

/* ===================================== MOBILE: SWIPE MENU (stories) ===================================== */
let sm = null;
async function buildSwipe() {
  if (sm) return sm;
  const menu = await loadMenu(); if (!menu || !menu.pages.length) return null;
  const root = $('[data-smenu]'), stage = $('[data-smenu-stage]', root), bars = $('[data-smenu-bars]', root), chips = $('[data-smenu-chips]', root), title = $('[data-smenu-title]', root);
  const track_ = el('div', { class: 'smenu__track' }); stage.innerHTML = ''; stage.appendChild(track_);
  const zps = [];
  menu.pages.forEach((p, i) => {
    const pg = el('div', { class: 'spage' }); const inner = el('div', { class: 'spage__inner' });
    const im = el('img', { alt: p.alt || p.title, draggable: 'false', decoding: 'async' }); im.dataset.src = p.src; inner.appendChild(im); pg.appendChild(inner); track_.appendChild(pg);
    zps.push(new ZoomPan(inner, stage, { max: 5 }));
    bars.appendChild(el('i', {}, '<b></b>'));
  });
  menu.categories.slice().sort((a, b) => a.page - b.page).forEach((c) => {
    const b = el('button', { class: 'chip', type: 'button', role: 'tab' }); b.textContent = catLabel(c); b.dataset.page = c.page; b.dataset.en = c.label.en || ''; b.dataset.hi = c.label.hi || '';
    b.addEventListener('click', () => go(c.page - 1)); chips.appendChild(b);
  });
  let idx = 0, w = innerWidth, dragging = false;
  const barEls = $$('i', bars), chipEls = $$('.chip', chips);
  const load = (i) => { [i - 1, i, i + 1].forEach((k) => { const im = $('img', track_.children[k] || document.createElement('i')); if (im && im.dataset.src) { im.src = im.dataset.src; delete im.dataset.src; } }); };
  function go(i, instant) {
    i = Math.max(0, Math.min(menu.pages.length - 1, i));
    if (i !== idx) zps[idx].reset();
    idx = i; w = stage.clientWidth;
    track_.classList.toggle('is-drag', !!instant); track_.style.transform = `translate3d(${-idx * w}px,0,0)`;
    barEls.forEach((b, k) => b.classList.toggle('is-done', k <= idx));
    const cats = menu.categories.slice().sort((a, b) => a.page - b.page); let act = -1; cats.forEach((c, k) => { if (c.page - 1 <= idx) act = k; });
    chipEls.forEach((c, k) => { c.classList.toggle('is-active', k === act); c.setAttribute('aria-selected', String(k === act)); });
    if (chipEls[act]) chipEls[act].scrollIntoView({ inline: 'center', block: 'nearest', behavior: instant ? 'auto' : 'smooth' });
    title.textContent = menu.pages[idx].title; load(idx); track('menu_view', { page: idx + 1 });
  }
  new Gestures(stage, () => zps[idx], {
    onDrag: (dx) => { dragging = true; track_.classList.add('is-drag'); const edge = (idx === 0 && dx > 0) || (idx === menu.pages.length - 1 && dx < 0); track_.style.transform = `translate3d(${-idx * w + (edge ? dx * 0.3 : dx)}px,0,0)`; },
    onRelease: ({ dx, dt }) => { track_.classList.remove('is-drag'); const v = Math.abs(dx) / dt; if (Math.abs(dx) > w * 0.2 || (v > 0.5 && Math.abs(dx) > 30)) go(idx + (dx < 0 ? 1 : -1)); else go(idx); dragging = false; },
    onTap: ({ rx }) => { if (rx < 0.28) { go(idx - 1); return true; } if (rx > 0.72) { go(idx + 1); return true; } return false; },
  });
  addEventListener('resize', () => { if (!root.hidden) go(idx, true); });
  document.addEventListener('keydown', (e) => { if (root.hidden) return; if (e.key === 'Escape') closeSwipe(); else if (e.key === 'ArrowRight') go(idx + 1); else if (e.key === 'ArrowLeft') go(idx - 1); });
  document.addEventListener('aroma:lang', () => chipEls.forEach((c) => { c.textContent = (store.get('lang') === 'hi' ? c.dataset.hi : c.dataset.en) || c.textContent; }));
  if (cfg.table) { const t = $('[data-smenu-table]', root); t.hidden = false; t.textContent = T('js.table', { n: cfg.table }); }
  sm = { root, go, menu, getIdx: () => idx };
  return sm;
}
let pushed = false, lastFocus = null;
export async function openSwipe(page = 1) {
  const s = await buildSwipe(); if (!s) { location.hash = '#menu'; return; }
  lastFocus = document.activeElement; s.root.hidden = false; lock();
  const hint = $('[data-smenu-hint]', s.root); if (hint) { hint.style.animation = 'none'; void hint.offsetWidth; hint.style.animation = ''; }
  requestAnimationFrame(() => s.go(Math.max(0, page - 1), true));
  history.pushState({ smenu: 1 }, ''); pushed = true;
  $('[data-smenu-close]', s.root).focus({ preventScroll: true });
}
export function closeSwipe(fromPop = false) {
  if (!sm || sm.root.hidden) return; sm.root.hidden = true; unlock();
  if (pushed && !fromPop) { pushed = false; history.back(); } else pushed = false;
  if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
}

/* ===================================== PDF / SHARE / TEXT MENU ===================================== */
async function toJpeg(src) {
  const blob = await (await fetch(src)).blob();
  const dataUrl = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
  const im = new Image(); im.src = dataUrl; await im.decode();
  if (/jpe?g/i.test(blob.type)) return { data: dataUrl, w: im.naturalWidth, h: im.naturalHeight };
  const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext('2d').drawImage(im, 0, 0);
  return { data: c.toDataURL('image/jpeg', 0.92), w: c.width, h: c.height };
}
async function buildPdf() {
  const menu = await loadMenu(); if (!menu) return;
  track('menu_download');
  toast(T('js.pdf.making'), 30000);
  try {
    if (!window.jspdf) await loadScript(url('js/vendor/jspdf.umd.min.js'));
    const { jsPDF } = window.jspdf; let doc;
    for (let i = 0; i < menu.pages.length; i++) {
      const { data, w, h } = await toJpeg(menu.pages[i].src);
      const o = w > h ? 'l' : 'p';
      if (i === 0) doc = new jsPDF({ unit: 'px', format: [w, h], orientation: o, compress: true, hotfixes: ['px_scaling'] }); else doc.addPage([w, h], o);
      doc.addImage(data, 'JPEG', 0, 0, w, h, undefined, 'FAST');
    }
    doc.setProperties({ title: menu.title || 'Aroma Multicuisine Menu', author: 'Aroma Multicuisine' });
    doc.save('Aroma-Multicuisine-Menu.pdf'); toast('✓ PDF', 1800);
  } catch (err) { console.warn(err); toast(T('js.pdf.err'), 4000); window.open(menu.pages[0].src, '_blank'); }
}
function initActions() {
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-menu-pdf]'); if (b) { e.preventDefault(); buildPdf(); } });
  const link = waLink(T('js.share.msg', { url: cfg.siteUrl + '?menu=1#menu' }));
  $$('[data-menu-share]').forEach((a) => { a.href = link; a.target = '_blank'; a.rel = 'noopener'; });
  document.addEventListener('aroma:lang', () => $$('[data-menu-share]').forEach((a) => { a.href = waLink(T('js.share.msg', { url: cfg.siteUrl + '?menu=1#menu' })); }));
  const btn = $('[data-textmenu-toggle]'), box = $('[data-textmenu]'), lab = $('[data-textmenu-label]');
  if (btn) btn.addEventListener('click', () => {
    const open = box.classList.toggle('is-collapsed') === false; btn.setAttribute('aria-expanded', String(open));
    lab.removeAttribute('data-i18n'); lab.textContent = T(open ? 'js.menu.hideText' : 'js.menu.viewText');
    if (open) box.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
  });
}

export function initMenu() {
  initActions();
  // open triggers
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open-swipe-menu]');
    if (t) { e.preventDefault(); openSwipe(+t.dataset.page || 1); return; }
    const m = e.target.closest('[data-open-swipe-menu-mobile]');
    if (m && mqMobile.matches) { e.preventDefault(); openSwipe(1); }
  });
  addEventListener('popstate', () => { if (sm && !sm.root.hidden) closeSwipe(true); });
  $('[data-smenu-close]') && $('[data-smenu-close]').addEventListener('click', () => closeSwipe());
  // desktop book: build lazily when the menu section is near the viewport
  const sec = $('[data-menu-section]');
  const maybe = () => { if (matchMedia('(min-width: 768px)').matches) initBook(); };
  if (sec) { new IntersectionObserver((es, o) => { if (es.some((x) => x.isIntersecting)) { maybe(); if (matchMedia('(min-width: 768px)').matches) o.disconnect(); } }, { rootMargin: '700px 0px' }).observe(sec); }
  mqMobile.addEventListener('change', () => { if (!mqMobile.matches) maybe(); });
  // QR table mode: /menu?table=5 → swipe menu straight away
  if (cfg.toggles.qrTableMode && (cfg.table || cfg.view === 'menu')) setTimeout(() => openSwipe(1), 350);
  loadMenu().then((m) => { if (m && isMobile()) m.pages.slice(0, 2).forEach((p) => { const i = new Image(); i.src = p.src; }); });
}
