/* AROMA motion: preloader, Lenis, GSAP reveals, horizontal dish gallery, magnetic buttons, cursor, smoke, nav */
import { $, $$, root, reduced, mqMobile, mqDesktop, store, scrollToId, cfg, lib } from './core.js';

const hasGsap = () => typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

/* ---------- preloader (≤1.5 s, skipped on repeat visits) ---------------------------------- */
function runPreloader() {
  const p = $('[data-preloader]'); if (!p) return Promise.resolve();
  if (root.classList.contains('no-preload') || reduced) { p.classList.add('is-done'); store.set('seen', '1'); return Promise.resolve(); }
  return new Promise((res) => {
    const done = () => { p.classList.add('is-done'); store.set('seen', '1'); setTimeout(() => p.remove(), 800); res(); };
    // wait for fonts + hero image but never longer than 1.5s
    const hero = $('.hero__pic img');
    const ready = Promise.race([
      Promise.all([document.fonts ? document.fonts.ready : 0, hero && !hero.complete ? new Promise((r) => { hero.onload = hero.onerror = r; }) : 0]),
      new Promise((r) => setTimeout(r, 1500)),
    ]);
    Promise.all([ready, new Promise((r) => setTimeout(r, 1100))]).then(done);
  });
}

/* ---------- word splitter that keeps inline markup (<em>, <br>) ----------------------------- */
export function splitWords(el) {
  if (el.dataset.splitDone) return;
  const walk = (node) => {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'w';
          const i = document.createElement('span'); i.className = 'w__i'; i.textContent = tok; w.appendChild(i); frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(el); el.dataset.splitDone = '1';
}

/* ---------- Lenis smooth scroll (desktop / fine pointer only) ----------------------------------- */
function initLenis() {
  if (reduced || typeof Lenis === 'undefined' || !matchMedia('(hover:hover) and (pointer:fine)').matches || mqMobile.matches) return null;
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, smoothWheel: true });
  window.__lenis = lenis;
  if (hasGsap()) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else { const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  return lenis;
}

/* ---------- anchor links ------------------------------------------------------------------------------ */
function initAnchors() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]'); if (!a || e.defaultPrevented) return;
    // the menu / sheet triggers are handled by their own modules (they open overlays on mobile)
    if (a.hasAttribute('data-open-swipe-menu') || (mqMobile.matches && (a.hasAttribute('data-sheet-open') || a.hasAttribute('data-open-swipe-menu-mobile')))) return;
    if (a.hasAttribute('data-sheet-open')) return; // desktop: forms.js scrolls to the form section
    const id = a.getAttribute('href'); if (id === '#' || id.length < 2) return;
    const t = document.getElementById(id.slice(1)); if (!t) return;
    e.preventDefault(); scrollToId(t);
    history.replaceState(null, '', id);
  });
}

/* ---------- nav: hide on scroll down, reveal on scroll up --------------------------------------------- */
function initNav() {
  const nav = $('[data-nav]'); if (!nav) return;
  let last = scrollY, ticking = false;
  const upd = () => {
    const y = scrollY; const dy = y - last;
    nav.classList.toggle('is-scrolled', y > 12); document.body.classList.toggle('is-scrolled', y > 12);
    const locked = root.classList.contains('is-locked');
    if (!locked && y > 320 && dy > 6) nav.classList.add('is-hidden'); else if (dy < -4 || y < 320) nav.classList.remove('is-hidden');
    if (Math.abs(dy) > 4) last = y; ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
}

/* ---------- mobile hero stories: dots + hide when out of hero --------------------------------------------- */
function initStories() {
  const slides = $$('.hero .slide'); const dots = $$('[data-story-dots] i'); const wrap = $('[data-story-dots]'); if (!slides.length) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const i = slides.indexOf(e.target); dots.forEach((d, k) => d.classList.toggle('is-on', k === i)); } }), { threshold: 0.6 });
  slides.forEach((s) => io.observe(s));
  const hero = $('.hero');
  new IntersectionObserver((es) => es.forEach((e) => wrap.classList.toggle('is-off', !e.isIntersecting)), { threshold: 0.05 }).observe(hero);
}

/* ---------- smoke canvas (desktop only; pauses off-screen) ------------------------------------------------------ */
function initSmoke() {
  const c = $('[data-smoke]'); if (!c || reduced || mqMobile.matches) return;
  const ctx = c.getContext('2d'); let w, h, parts = [], run = false, raf;
  const size = () => { const r = c.getBoundingClientRect(); w = c.width = Math.floor(r.width / 2); h = c.height = Math.floor(r.height / 2); };
  size(); addEventListener('resize', size);
  const mk = (init) => ({ x: Math.random() * w, y: init ? Math.random() * h : h + 40, r: 50 + Math.random() * 90, vy: .12 + Math.random() * .3, vx: (Math.random() - .5) * .18, a: 0, life: 0, max: 400 + Math.random() * 400 });
  for (let i = 0; i < 16; i++) parts.push(mk(true));
  const frame = () => {
    ctx.clearRect(0, 0, w, h);
    parts.forEach((p, i) => {
      p.y -= p.vy; p.x += p.vx + Math.sin((p.life + i * 17) / 90) * .12; p.life++; p.r += .08;
      const k = p.life / p.max; p.a = Math.sin(Math.min(1, k) * Math.PI) * .22;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(245,225,190,${p.a})`); g.addColorStop(1, 'rgba(245,225,190,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      if (k >= 1 || p.y < -p.r) parts[i] = mk(false);
    });
    if (run) raf = requestAnimationFrame(frame);
  };
  const io = new IntersectionObserver((es) => es.forEach((e) => { run = e.isIntersecting && !document.hidden; cancelAnimationFrame(raf); if (run) frame(); }));
  io.observe(c);
  document.addEventListener('visibilitychange', () => { run = !document.hidden; cancelAnimationFrame(raf); if (run) frame(); });
}

/* ---------- custom cursor ------------------------------------------------------------------------------------------------ */
function initCursor() {
  const cur = $('[data-cursor]');
  if (!cur || !mqDesktop.matches || !matchMedia('(hover:hover) and (pointer:fine)').matches || reduced) return;
  root.classList.add('has-cursor');
  const dot = $('.cursor__dot', cur), ring = $('.cursor__ring', cur);
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
  addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; cur.classList.remove('is-hidden'); dot.style.transform = `translate3d(${x}px,${y}px,0)`; }, { passive: true });
  const loop = () => { rx += (x - rx) * .18; ry += (y - ry) * .18; ring.style.transform = `translate3d(${rx}px,${ry}px,0)`; requestAnimationFrame(loop); }; loop();
  document.addEventListener('pointerover', (e) => { cur.classList.toggle('is-hover', !!e.target.closest('a,button,[role="button"],[data-magnetic],.cuisine,.g-item,select,label')); cur.classList.toggle('is-drag', !!e.target.closest('.book,.dishes__viewport')); });
  document.addEventListener('pointerdown', () => cur.classList.add('is-down')); document.addEventListener('pointerup', () => cur.classList.remove('is-down'));
  document.addEventListener('pointerleave', () => cur.classList.add('is-hidden'));
}

/* ---------- magnetic buttons ----------------------------------------------------------------------------------------------- */
function initMagnetic() {
  if (reduced || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  $$('[data-magnetic]').forEach((b) => {
    const s = 0.32;
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * s}px,${(e.clientY - r.top - r.height / 2) * s}px)`; });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

/* ---------- GSAP: reveals, splits, masks, parallax, hero intro, horizontal gallery --------------------------------------------------- */
function initGsap(preloaded) {
  if (!hasGsap() || reduced) { $$('[data-split]').forEach((e) => e.classList.add('is-split')); return; }
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('gsap-ready');
  const ease = 'power3.out';

  // heading word reveals
  $$('[data-split]').forEach((h) => {
    splitWords(h); h.classList.add('is-split');
    const words = $$('.w__i', h); gsap.set(words, { yPercent: 115 });
    const isHero = h.closest('.hero');
    const tween = () => gsap.to(words, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: .055 });
    if (isHero) preloaded.then(() => setTimeout(tween, 120));
    else ScrollTrigger.create({ trigger: h, start: 'top 88%', once: true, onEnter: tween });
  });

  // hero supporting elements
  const hc = $$('.hero__content > *:not(.hero__title)');
  gsap.set(hc, { opacity: 0, y: 26 });
  preloaded.then(() => gsap.to(hc, { opacity: 1, y: 0, duration: 1, ease, stagger: .12, delay: .55 }));

  // simple reveals
  ScrollTrigger.batch('[data-reveal]', { start: 'top 90%', once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: .9, ease, stagger: .1 }) });
  $$('[data-reveal-stagger]').forEach((g) => {
    ScrollTrigger.create({ trigger: g, start: 'top 86%', once: true, onEnter: () => gsap.to(g.children, { opacity: 1, y: 0, duration: .9, ease, stagger: .1 }) });
  });

  // arch / map mask reveals
  $$('[data-mask-reveal]').forEach((m) => {
    const img = $('picture img', m);
    ScrollTrigger.create({ trigger: m, start: 'top 88%', once: true, onEnter: () => {
      // end on an explicit "none" (clearProps would fall back to the CSS hidden state)
      gsap.fromTo(m, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', onComplete: () => { m.style.clipPath = 'none'; } });
      if (img) gsap.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'expo.out' });
    } });
  });

  // soft parallax
  $$('[data-parallax]').forEach((p) => {
    gsap.to(p, { y: +p.dataset.parallax, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // hero photo scroll-parallax (desktop)
  const hm = $('[data-parallax-hero]');
  if (hm && !mqMobile.matches) gsap.to(hm, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  initHorizontal();
}

/* pinned horizontal-scroll signature-dish gallery (≥1024px) */
function initHorizontal() {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    const pin = $('[data-hscroll]'), track = $('[data-hscroll-track]'), vp = track && track.parentElement, bar = $('[data-hscroll-bar]');
    if (!pin || !track) return;
    root.classList.add('has-hscroll');
    const dist = () => Math.max(0, track.scrollWidth - vp.clientWidth);
    const tween = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: {
      trigger: pin, pin: true, scrub: 1, start: 'top top', end: () => '+=' + (dist() + innerHeight * .25), invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: (self) => { if (bar) bar.style.transform = `scaleX(${self.progress})`; },
    } });
    $$('.plate__img', track).forEach((img) => {
      img.style.animation = 'none';
      gsap.fromTo(img, { scale: 1.28 }, { scale: 1.02, ease: 'none', scrollTrigger: { trigger: img.closest('.plate'), containerAnimation: tween, start: 'left 95%', end: 'right 5%', scrub: true } });
    });
    $$('.dish__icon:not(.dish__icon--ghost)', track).forEach((ic) => {
      gsap.fromTo(ic, { x: -18 }, { x: 18, ease: 'none', scrollTrigger: { trigger: ic.closest('.dish'), containerAnimation: tween, start: 'left 100%', end: 'right 0%', scrub: true } });
    });
    return () => { root.classList.remove('has-hscroll'); $$('.plate__img', track).forEach((i) => { i.style.animation = ''; }); };
  });
}

/* ---------- phones: no GSAP at all — IntersectionObserver + CSS transitions keep the main thread free ---------- */
function initLite(preloaded) {
  root.classList.add('lite');
  const els = $$('[data-reveal],[data-reveal-stagger],[data-mask-reveal],[data-split]');
  $$('[data-split]').forEach((h) => { splitWords(h); h.classList.add('is-split'); $$('.w__i', h).forEach((w, i) => w.style.setProperty('--i', i)); });
  $$('[data-reveal-stagger]').forEach((g) => Array.from(g.children).forEach((c, i) => c.style.setProperty('--i', i)));
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.filter((e) => !e.closest('.hero')).forEach((e) => io.observe(e));
  preloaded.then(() => setTimeout(() => $$('.hero [data-split],.hero__content').forEach((e) => e.classList.add('is-in')), 80));
}

export async function initMotion() {
  const preloaded = runPreloader();
  initAnchors(); initNav(); initStories();
  if (mqMobile.matches && !reduced) { initLite(preloaded); return; }      // phone: lightweight path
  if (reduced) { $$('[data-split]').forEach((e) => e.classList.add('is-split')); return; }
  // tablet / desktop: libraries load in parallel, then the cinematic layer starts
  try { await Promise.all([lib('gsap'), lib('lenis')]); } catch { $$('[data-split]').forEach((e) => e.classList.add('is-split')); return; }
  initLenis(); initSmoke(); initCursor(); initMagnetic(); initGsap(preloaded);
  // images finishing late change layout height → refresh triggers
  addEventListener('load', () => hasGsap() && ScrollTrigger.refresh());
  document.fonts && document.fonts.ready.then(() => hasGsap() && ScrollTrigger.refresh());
  document.addEventListener('aroma:lang', () => hasGsap() && setTimeout(() => ScrollTrigger.refresh(), 200));
}
