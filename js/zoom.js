/* AROMA zoom engine: ZoomPan (transform maths), Gestures (pointer / pinch / double-tap / wheel) and the full-screen Lightbox. */
import { $, lock, unlock, T } from './core.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export class ZoomPan {
  constructor(el, box, { max = 5 } = {}) { this.el = el; this.box = box; this.max = max; this.s = 1; this.x = 0; this.y = 0; }
  get zoomed() { return this.s > 1.04; }
  apply(smooth = false) {
    this.el.style.transition = smooth ? 'transform .28s cubic-bezier(.22,.8,.2,1)' : 'none';
    this.el.style.transform = `translate3d(${this.x}px,${this.y}px,0) scale(${this.s})`;
  }
  clamp() {
    const r = this.el.getBoundingClientRect(), cb = this.box.getBoundingClientRect();
    const bw = r.width / this.s, bh = r.height / this.s;
    const mx = Math.max(0, (bw * this.s - cb.width) / 2), my = Math.max(0, (bh * this.s - cb.height) / 2);
    this.x = clamp(this.x, -mx, mx); this.y = clamp(this.y, -my, my);
  }
  /** Zoom to `ns`, keeping screen point (px,py) stationary. */
  zoomTo(ns, px, py, smooth = false) {
    ns = clamp(ns, 1, this.max);
    const r = this.el.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const k = 1 - ns / this.s;
    this.x += (px - cx) * k; this.y += (py - cy) * k; this.s = ns;
    if (this.s <= 1.001) { this.s = 1; this.x = 0; this.y = 0; } else this.clamp();
    this.apply(smooth);
  }
  reset(smooth = false) { this.s = 1; this.x = 0; this.y = 0; this.apply(smooth); }
}

export class Gestures {
  /**
   * hooks: onDrag(dx,dy) while 1 finger moves & not zoomed · onRelease({dx,dy,dt}) · onTap({x,y,rx}) → return true to cancel double-tap
   */
  constructor(box, getZP, hooks = {}) {
    this.box = box; this.getZP = getZP; this.h = hooks; this.pts = new Map(); this.lastTap = 0; this.lastPos = { x: 0, y: 0 }; this.pinching = false;
    box.addEventListener('pointerdown', (e) => this.down(e));
    box.addEventListener('pointermove', (e) => this.move(e));
    box.addEventListener('pointerup', (e) => this.up(e));
    box.addEventListener('pointercancel', (e) => this.up(e, true));
    box.addEventListener('wheel', (e) => this.wheel(e), { passive: false });
  }
  down(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.target.closest('button,a,input')) return;
    try { this.box.setPointerCapture(e.pointerId); } catch { /* noop */ }
    this.pts.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now() });
    const zp = this.getZP();
    if (this.pts.size === 2 && zp) {
      const [a, b] = [...this.pts.values()]; this.pd0 = Math.hypot(a.x - b.x, a.y - b.y) || 1; this.s0 = zp.s; this.pinching = true; this.moved = true;
    } else { this.moved = false; this.box.classList.add('is-grabbing'); }
  }
  move(e) {
    const p = this.pts.get(e.pointerId); if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    const zp = this.getZP();
    if (this.pts.size >= 2 && zp) {
      const [a, b] = [...this.pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      zp.zoomTo(this.s0 * (d / this.pd0), mx, my);
      return;
    }
    if (Math.hypot(p.x - p.sx, p.y - p.sy) > 8) this.moved = true;
    if (zp && zp.zoomed) { zp.x += dx; zp.y += dy; zp.clamp(); zp.apply(); }
    else if (this.moved && this.h.onDrag) this.h.onDrag(p.x - p.sx, p.y - p.sy, e);
  }
  up(e, cancelled = false) {
    const p = this.pts.get(e.pointerId); if (!p) return;
    this.pts.delete(e.pointerId); this.box.classList.remove('is-grabbing');
    const zp = this.getZP();
    if (this.pinching) { if (this.pts.size < 2) { this.pinching = false; if (zp && zp.s < 1.08) zp.reset(true); } return; }
    const dt = performance.now() - p.t, dx = p.x - p.sx, dy = p.y - p.sy;
    if (!this.moved && dt < 400 && !cancelled) {
      const r = this.box.getBoundingClientRect(); const now = performance.now();
      if (zp && now - this.lastTap < 320 && Math.hypot(p.x - this.lastPos.x, p.y - this.lastPos.y) < 44) {
        this.lastTap = 0;
        if (zp.zoomed) zp.reset(true); else zp.zoomTo(2.6, p.x, p.y, true);
        return;
      }
      this.lastTap = now; this.lastPos = { x: p.x, y: p.y };
      const handled = this.h.onTap && this.h.onTap({ x: p.x, y: p.y, rx: (p.x - r.left) / r.width, ry: (p.y - r.top) / r.height });
      if (handled) this.lastTap = 0;
    } else if (!(zp && zp.zoomed) && this.h.onRelease) this.h.onRelease({ dx, dy, dt });
  }
  wheel(e) {
    const zp = this.getZP(); if (!zp) return; e.preventDefault();
    const f = Math.exp(-e.deltaY * (e.ctrlKey ? 0.012 : 0.0022));
    zp.zoomTo(zp.s * f, e.clientX, e.clientY);
  }
}

/* ===================== Lightbox (gallery + menu pages) ===================== */
let lb, items = [], idx = 0, zp, gest, lastFocus, built = false;

function build() {
  if (built) return; built = true;
  lb = $('[data-lightbox]'); const stage = $('[data-lb-stage]', lb), img = $('[data-lb-img]', lb);
  zp = new ZoomPan(img, stage, { max: 6 });
  gest = new Gestures(stage, () => zp, {
    onRelease: ({ dx, dy }) => { if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy)) go(idx + (dx < 0 ? 1 : -1)); else if (dy > 120 && Math.abs(dx) < 60) close(); },
    onTap: ({ rx }) => false,
  });
  $('[data-lb-close]', lb).addEventListener('click', close);
  $('[data-lb-prev]', lb).addEventListener('click', () => go(idx - 1));
  $('[data-lb-next]', lb).addEventListener('click', () => go(idx + 1));
  $('[data-lb-zoom-in]', lb).addEventListener('click', () => { const r = stage.getBoundingClientRect(); zp.zoomTo(zp.s * 1.6, r.left + r.width / 2, r.top + r.height / 2, true); });
  $('[data-lb-zoom-out]', lb).addEventListener('click', () => { const r = stage.getBoundingClientRect(); zp.zoomTo(zp.s / 1.6, r.left + r.width / 2, r.top + r.height / 2, true); });
  $('[data-lb-reset]', lb).addEventListener('click', () => zp.reset(true));
  lb.addEventListener('click', (e) => { if (e.target === stage && !gest.moved) close(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') go(idx + 1); else if (e.key === 'ArrowLeft') go(idx - 1);
    else if (e.key === '+' || e.key === '=') $('[data-lb-zoom-in]', lb).click(); else if (e.key === '-') $('[data-lb-zoom-out]', lb).click(); else if (e.key === '0') zp.reset(true);
  });
}

function go(i) {
  if (!items.length) return; idx = (i + items.length) % items.length;
  const it = items[idx], img = $('[data-lb-img]', lb);
  zp.reset(); img.style.opacity = '.25'; img.alt = it.alt || '';
  img.onload = () => { img.style.opacity = ''; };
  img.src = it.src;
  $('[data-lb-cap]', lb).textContent = it.alt || '';
  $('[data-lb-count]', lb).textContent = items.length > 1 ? `${idx + 1} / ${items.length}` : '';
  $$nav(items.length > 1);
}
const $$nav = (show) => { lb.querySelectorAll('[data-lb-prev],[data-lb-next]').forEach((b) => { b.style.display = show ? '' : 'none'; }); };

export function openLightbox(list, start = 0) {
  build(); items = list; lastFocus = document.activeElement;
  lb.hidden = false; lock(); go(start); $('[data-lb-close]', lb).focus({ preventScroll: true });
}
export function close() {
  if (!lb || lb.hidden) return; lb.hidden = true; unlock();
  if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
}
