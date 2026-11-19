/* AROMA forms: bottom sheet (mobile), reservation / celebration / feedback → API + pre-filled WhatsApp, confirmation screen */
import { cfg, $, $$, el, esc, T, waLink, track, lock, unlock, url, mqMobile, scrollToId, reduced } from './core.js';

const istToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: cfg.hours.timezone }).format(new Date());

/* ---------------------------- bottom sheet ---------------------------- */
let sheet, sheetBody, moved = null;
function openSheet(kind) {
  const home = $(`[data-form-home="${kind}"]`); const form = home && $('form', home); if (!form) return;
  sheetBody.appendChild(form); moved = { form, home }; sheet.hidden = false; lock();
  sheet.querySelector('.sheet__panel').setAttribute('aria-label', (form.querySelector('.h3') || {}).textContent || 'Form');
  setTimeout(() => { const f = $('input:not([type=hidden]):not([name=website]),select', form); f && f.focus({ preventScroll: true }); }, 350);
}
function closeSheet() {
  if (!moved) { sheet.hidden = true; return; }
  moved.home.prepend(moved.form); moved = null; sheet.hidden = true; unlock();
  const p = sheet.querySelector('.sheet__panel'); p.style.transform = '';
}
function initSheet() {
  sheet = $('[data-sheet]'); sheetBody = $('[data-sheet-body]'); if (!sheet) return;
  $$('[data-sheet-close]', sheet).forEach((b) => b.addEventListener('click', closeSheet));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) closeSheet(); });
  // drag the grab-handle down to dismiss
  const grab = $('[data-sheet-grab]', sheet), panel = $('.sheet__panel', sheet); let y0 = null, dy = 0;
  grab.addEventListener('pointerdown', (e) => { y0 = e.clientY; grab.setPointerCapture(e.pointerId); panel.style.animation = 'none'; });
  grab.addEventListener('pointermove', (e) => { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); panel.style.transform = `translateY(${dy}px)`; });
  grab.addEventListener('pointerup', () => { if (y0 == null) return; y0 = null; if (dy > 110) closeSheet(); else { panel.style.transition = 'transform .3s'; panel.style.transform = ''; setTimeout(() => { panel.style.transition = ''; }, 320); } dy = 0; });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sheet-open]'); if (!b) return;
    const kind = b.dataset.sheetOpen;
    if (mqMobile.matches) { e.preventDefault(); const ask = $('[data-ask]'); if (ask && !ask.hidden) ask.hidden = true; openSheet(kind); }
    else { e.preventDefault(); scrollToId(kind); setTimeout(() => { const f = $(`#${kind} input:not([type=hidden]):not([name=website])`); f && f.focus({ preventScroll: true }); }, 900); }
  });
  mqMobile.addEventListener('change', () => { if (!mqMobile.matches && moved) closeSheet(); });
}

/* ---------------------------- validation + messages ---------------------------- */
const digits = (s) => s.replace(/\D/g, '').slice(-10);
function validate(f) {
  let ok = true; const today = istToday();
  $$('.field', f).forEach((fl) => {
    const i = $('input,select,textarea', fl); if (!i || i.type === 'hidden') return;
    const v = i.value.trim(); let msg = '';
    if (i.required && !v) msg = T('js.err.req');
    else if (i.name === 'phone' && v && !/^[6-9]\d{9}$/.test(digits(v))) msg = T('js.err.phone');
    else if (i.name === 'date' && v && v < today) msg = T('js.err.date');
    fl.classList.toggle('is-invalid', !!msg); $('.field__e', fl).textContent = msg; if (msg) ok = false;
  });
  const bad = $('.is-invalid input,.is-invalid select,.is-invalid textarea', f); if (bad) bad.focus();
  return ok;
}
const nice = (d) => { try { return new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; } };
function collect(f) {
  const d = {}; new FormData(f).forEach((v, k) => { d[k] = typeof v === 'string' ? v.trim() : v; });
  const sel = (n) => { const s = f.elements[n]; return s && s.options ? s.options[s.selectedIndex].text : d[n]; };
  d._timeLabel = d.time ? sel('time') : ''; d._guestsLabel = d.guests ? (f.elements.guests.options ? sel('guests') : d.guests + ' guests') : '';
  return d;
}
function message(kind, d) {
  const L = (k, v) => (v ? `• ${k}: ${v}\n` : '');
  if (kind === 'reservation') return `Hello Aroma! I'd like to reserve a table.\n${L('Name', d.name)}${L('Phone', digits(d.phone))}${L('Date', nice(d.date))}${L('Time', d._timeLabel)}${L('Guests', d._guestsLabel)}${L('Preference', d.pref && d.pref !== 'No preference' ? d.pref : '')}${L('Notes', d.notes)}\nSent from the Aroma website.`;
  return `Hello Aroma! I'd like to enquire about a celebration.\n${L('Name', d.name)}${L('Phone', digits(d.phone))}${L('Occasion', d.occasion)}${L('Date', nice(d.date))}${L('Guests', d.guests)}${L('Veg / non-veg', d.ratio)}${L('Budget', d.budget)}${L('Notes', d.notes)}\nSent from the Aroma website.`;
}

/* ---------------------------- submit + confirmation ---------------------------- */
async function post(payload) {
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 9000);
  try {
    const r = await fetch(url('api/enquiry.php'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctl.signal });
    const j = await r.json().catch(() => ({})); return { status: r.status, ...j };
  } catch { return { status: 0, ok: false, network: true }; } finally { clearTimeout(to); }
}
function showConfirm(f, kind, d, note) {
  const wa = waLink(message(kind, d));
  const rows = kind === 'reservation'
    ? [['Name', d.name], ['Date', nice(d.date)], ['Time', d._timeLabel], ['Guests', d._guestsLabel]]
    : [['Name', d.name], ['Occasion', d.occasion], ['Date', nice(d.date)], ['Guests', d.guests]];
  const c = el('div', { class: 'confirm', role: 'status' }, `
    <span class="confirm__tick"><svg class="ic"><use href="#u-tick"/></svg></span>
    <h3>${esc(T('js.conf.' + kind + '.t'))}</h3>
    <p>${esc(T('js.conf.' + kind + '.p'))}</p>
    <dl>${rows.filter((r) => r[1]).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
    ${note ? `<p class="fineprint">${esc(note)}</p>` : ''}
    <a class="btn btn--saffron btn--lg" href="${esc(wa)}" target="_blank" rel="noopener" data-track="whatsapp_click"><svg class="ic"><use href="#u-wa"/></svg>${esc(T('js.conf.wa'))}</a>
    <button class="btn btn--ghost btn--sm" type="button" data-conf-new>${esc(T('js.conf.new'))}</button>`);
  Array.from(f.children).forEach((ch) => { ch.dataset.wasHidden = ch.hidden ? '1' : ''; ch.hidden = true; });
  f.appendChild(c);
  $('[data-conf-new]', c).addEventListener('click', () => { c.remove(); Array.from(f.children).forEach((ch) => { ch.hidden = ch.dataset.wasHidden === '1'; }); f.reset(); $('.form__status', f).textContent = ''; });
  c.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
}
async function submit(f) {
  const kind = f.dataset.form === 'reserve' ? 'reservation' : f.dataset.form === 'celebrate' ? 'celebration' : 'feedback';
  if (kind === 'feedback') return submitFeedback(f);
  if (!validate(f)) return;
  const btn = $('button[type=submit]', f), st = $('.form__status', f); const d = collect(f);
  btn.disabled = true; st.textContent = T('js.sending');
  const res = await post({ ...d, kind, page: location.href, lang: document.documentElement.lang });
  btn.disabled = false; st.textContent = '';
  if (res.status === 429 || res.status === 400 || res.status === 422) { st.textContent = res.error || T('js.err.net'); return; }
  track(kind === 'reservation' ? 'reserve_submit' : 'celebration_enquiry', { guests: d.guests });
  showConfirm(f, kind, d, res.network ? T('js.err.net') : '');
}

/* ---------------------------- feedback / review management ---------------------------- */
function submitFeedback(f) {
  const rating = +f.elements.rating.value, st = $('.form__status', f);
  if (!rating) { st.textContent = T('js.fb.pick'); return; }
  if (rating >= 4) return;
  const d = collect(f); const btn = $('button[type=submit]', f); btn.disabled = true; st.textContent = T('js.sending');
  post({ ...d, kind: 'feedback', rating, page: location.href }).then((res) => {
    btn.disabled = false; track('feedback_private', { rating });
    st.textContent = res.status === 429 ? (res.error || '') : T('js.fb.thanks');
    if (res.status !== 429) { f.reset(); $$('[data-rate] button', f).forEach((b) => { b.classList.remove('is-on'); b.setAttribute('aria-checked', 'false'); }); $('[data-fb-more]', f).hidden = true; }
  });
}
function initFeedback() {
  const f = $('form[data-form="feedback"]'); if (!f) return;
  const btns = $$('[data-rate] button', f), more = $('[data-fb-more]', f), happy = $('[data-fb-happy]', f);
  const set = (v) => {
    f.elements.rating.value = v; btns.forEach((b) => { const on = +b.dataset.v <= v; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', String(+b.dataset.v === v)); });
    happy.hidden = v < 4; more.hidden = v >= 4; $('.form__status', f).textContent = '';
    if (v >= 4) track('feedback_happy', { rating: v });
  };
  btns.forEach((b) => b.addEventListener('click', () => set(+b.dataset.v)));
}

export function initForms() {
  initSheet(); initFeedback();
  const today = istToday();
  $$('.js-date input').forEach((i) => { i.min = today; });
  $$('input[name="ts"]').forEach((i) => { i.value = String(Date.now()); });
  $$('form[data-form]').forEach((f) => f.addEventListener('submit', (e) => { e.preventDefault(); submit(f); }));
  $$('.field input,.field select,.field textarea').forEach((i) => i.addEventListener('input', () => { const fl = i.closest('.field'); fl.classList.remove('is-invalid'); $('.field__e', fl).textContent = ''; }));
}
