/* AROMA content: gallery (filters · lightbox · mobile swipe cards) + live Google reviews */
import { $, $$, el, esc, T, mqMobile, url, reduced, lib } from './core.js';
import { openLightbox } from './zoom.js';

/* ---------------------------- gallery ---------------------------- */
function initGallery() {
  const grid = $('[data-gallery]'); if (!grid) return;
  const items = $$('.g-item', grid); const swEl = $('[data-gallery-swiper]'); let sw = null, filter = 'all';
  const visible = () => items.filter((i) => !i.hidden);
  const list = () => visible().map((i) => ({ src: i.dataset.full, alt: i.dataset.alt }));

  grid.addEventListener('click', (e) => { const b = e.target.closest('.g-item__btn'); if (!b) return; openLightbox(list(), visible().indexOf(b.closest('.g-item'))); });

  const build = async () => {
    if (!swEl) return;
    try { await lib('swiper'); } catch { return; }
    if (!mqMobile.matches) return;
    if (sw) { sw.destroy(true, true); sw = null; }
    const wrap = $('.swiper-wrapper', swEl); wrap.innerHTML = '';
    visible().forEach((it, k) => {
      const s = el('div', { class: 'swiper-slide' }); const pic = $('picture', it).cloneNode(true); pic.classList.add('is-loaded');
      const im = $('img', pic); im.loading = 'lazy'; s.appendChild(pic); s.dataset.k = k; wrap.appendChild(s);
    });
    sw = new Swiper(swEl, { effect: 'cards', grabCursor: true, cardsEffect: { perSlideOffset: 9, perSlideRotate: 3, rotate: true, slideShadows: false }, pagination: { el: $('.swiper-pagination', swEl), type: 'progressbar' }, a11y: true });
    $$('.swiper-slide', swEl).forEach((s) => s.addEventListener('click', () => { if (sw.clickedIndex === sw.activeIndex || true) openLightbox(list(), +s.dataset.k); }));
  };

  $('[data-gallery-filters]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]'); if (!b) return; filter = b.dataset.filter;
    $$('[data-filter]').forEach((x) => { const on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-selected', String(on)); });
    items.forEach((i) => { i.hidden = !(filter === 'all' || i.dataset.groups.split(' ').includes(filter)); });
    if (window.gsap && !reduced) gsap.fromTo(visible(), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .6, stagger: .04, ease: 'power3.out', clearProps: 'all' });
    if (mqMobile.matches) build();
    if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 100);
  });
  const sync = () => { if (mqMobile.matches) build(); else if (sw) { sw.destroy(true, true); sw = null; } };
  sync(); mqMobile.addEventListener('change', sync);
}

/* ---------------------------- live Google reviews (Places API via our server) ---------------------------- */
async function initReviews() {
  const box = $('[data-live-reviews]'); if (!box) return;
  let j; try { const r = await fetch(box.dataset.endpoint, { headers: { Accept: 'application/json' } }); if (!r.ok) return; j = await r.json(); } catch { return; }
  if (!j || !j.ok || !j.reviews || !j.reviews.length) return;
  const wrap = $('[data-reviews-wrapper]', box);
  const stars = (n) => `<span class="stars" role="img" aria-label="${n} out of 5">${'<svg class="ic"><use href="#u-star"/></svg>'.repeat(Math.round(n))}</span>`;
  j.reviews.forEach((rv) => {
    const s = el('div', { class: 'swiper-slide review' }, `
      <div class="review__head">${rv.photo ? `<img class="review__av" src="${esc(rv.photo)}" alt="" loading="lazy" referrerpolicy="no-referrer" width="40" height="40">` : '<span class="review__av"></span>'}
      <div><span class="review__name">${esc(rv.author || 'Google user')}</span><span class="review__when">${esc(rv.when || '')}</span></div></div>
      ${stars(rv.rating || 5)}<p class="review__txt">${esc(rv.text)}</p>`);
    wrap.appendChild(s);
  });
  $('[data-reviews-credit]', box).textContent = T('js.reviews.credit') + ' · Google';
  box.hidden = false;
  try { await lib('swiper'); } catch { return; }
  new Swiper($('.reviews-swiper', box), { slidesPerView: 1.12, spaceBetween: 14, pagination: { el: $('.swiper-pagination', box), clickable: true }, breakpoints: { 768: { slidesPerView: 2.1 }, 1100: { slidesPerView: 3 } } });
}

export function initContent() { initGallery(); initReviews(); }
