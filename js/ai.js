/* AROMA AI: "Ask Aroma" concierge + Mood-to-Meal recommender.
 * Strategy: try the server (api/ask.php → configured LLM, grounded in our own menu/info) and fall back to a local rules engine
 * that answers from site.json + menu-text.json only. It never invents prices; unknown questions are handed off to WhatsApp. */
import { cfg, $, $$, el, esc, T, pick, getLang, waLink, track, openStatus, lock, unlock, url, mqMobile, scrollToId } from './core.js';

/* ============================ local knowledge helpers ============================ */
const sig = () => cfg.signature;
const byName = (n) => sig().find((s) => s.name.toLowerCase().includes(n));
const vegPicks = () => sig().filter((s) => s.diet === 'veg').map((s) => s.name);
const nonvegPicks = () => sig().filter((s) => s.diet === 'nonveg').map((s) => s.name);
const hoursLine = () => { const h = cfg.hours.default; return `${t12(h.open)} – ${t12(h.close)}`; };
const t12 = (s) => { const [h, m] = s.split(':').map(Number); return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''} ${h >= 12 ? 'PM' : 'AM'}`; };
const menuItems = () => cfg.menuText.flatMap((s) => s.items.map(([n, d, g]) => ({ n, d, g, sec: s.title })));
const list = (arr) => '<ul>' + arr.map((x) => `<li>${esc(x)}</li>`).join('') + '</ul>';
const hi = () => getLang() === 'hi';
const L2 = (en, hiTxt) => (hi() ? hiTxt : en);

function parseParty(q) {
  const num = (re) => { const m = q.match(re); return m ? +m[1] : null; };
  const people = num(/(\d+)\s*(?:people|persons?|pax|of us|guests?|members?|adults?|log|लोग)/) || num(/(?:we are|we're|total|group of|party of|हम)\s*(\d+)/);
  const veg = num(/(\d+)\s*(?:veg(?:etarian)?|वेज)\b/);
  const nonveg = num(/(\d+)\s*non[\s-]?veg/);
  return { people, veg, nonveg, spicy: /spic|teekha|tikha|hot|तीखा|chilli|chili/.test(q), mild: /mild|kids?|child|bachch|बच्च|not spicy|less spicy/.test(q) };
}
function recommend(q) {
  const p = parseParty(q);
  const n = p.people, v = p.veg ?? (n && p.nonveg != null ? n - p.nonveg : null), nv = p.nonveg ?? (n && v != null ? n - v : null);
  const allVeg = n && v === n;
  const items = [];
  const starter = p.spicy ? 'Crispy Chilli Baby Corn' : 'Crispy Chilli Baby Corn';
  items.push(L2(`Starter (veg): ${starter}`, `स्टार्टर (वेज): ${starter}`));
  if (!allVeg) items.push(L2('Starter (non-veg): Chicken Malai Kebab — creamy and mild', 'स्टार्टर (नॉन-वेज): चिकन मलाई कबाब — मलाईदार और हल्का'));
  const bir = p.spicy ? 'Bombay Biryani (our boldest)' : p.mild ? 'Lucknowi Biryani (gentle and aromatic)' : 'Dum Biryani';
  items.push(L2(`Biryani to share: ${bir}`, `शेयर करने के लिए बिरयानी: ${bir}`));
  items.push(L2('Gravy (veg): Paneer Khurchan', 'ग्रेवी (वेज): पनीर खुरचन'));
  if (!allVeg) items.push(L2('Chicken: ask your server for our chicken specialities', 'चिकन: हमारे चिकन स्पेशल के लिए सर्वर से पूछिए'));
  items.push(L2('Breads: Butter Naan', 'ब्रेड: बटर नान'));
  const who = n ? L2(`For ${n} guests${v != null ? ` (${v} veg${nv != null ? `, ${nv} non-veg` : ''})` : ''}${p.spicy ? ' who love spicy food' : ''}, here's a good table:`, `${n} मेहमानों${v != null ? ` (${v} वेज${nv != null ? `, ${nv} नॉन-वेज` : ''})` : ''} के लिए${p.spicy ? ' जिन्हें तीखा पसंद है' : ''}, यह अच्छा रहेगा:`)
    : L2('A good table to start with:', 'शुरुआत के लिए एक अच्छी टेबल:');
  const tail = L2(`Ask your server about portion sizes${n ? ' for ' + n + ' guests' : ''} and today's prices.`, `${n ? n + ' मेहमानों के लिए ' : ''}मात्रा और आज की क़ीमतें सर्वर से पूछिए।`);
  return { html: `${esc(who)}${list(items)}<p>${esc(tail)}</p>`, actions: [{ label: T('js.mood.reserve'), reserve: true }] };
}

function localAnswer(raw) {
  const q = raw.toLowerCase().replace(/[?!.,]/g, ' ').replace(/\s+/g, ' ').trim();
  const wa = (extra) => ({ label: T('js.ask.handoffBtn'), href: waLink(`Hello Aroma, ${extra || 'I have a question'}: "${raw}"`) });
  const has = (re) => re.test(q);
  const hand = (txt) => ({ html: esc(txt || T('js.ask.handoff')), actions: [wa()], handoff: true });

  if (has(/^(hi+|hello|hey|namaste|namaskar|नमस्ते)\b/)) return { html: esc(T('js.ask.hello')) };
  if (has(/\b(thanks|thank you|shukriya|dhanyavad)\b|धन्यवाद/)) return { html: esc(L2('You\'re most welcome! See you at Aroma.', 'आपका स्वागत है! अरोमा में मिलते हैं।')) };
  if (has(/park|पार्किंग/)) {
    if (cfg.location.parking) return { html: esc(cfg.location.parking), actions: [{ label: T('fab.directions'), href: cfg.directions }] };
    return hand(L2('I don\'t have confirmed parking details — our team can tell you the best option on WhatsApp.', 'मेरे पास पार्किंग की पक्की जानकारी नहीं है — हमारी टीम WhatsApp पर बता देगी।'));
  }
  if (has(/breakfast|nashta|नाश्ता/)) {
    return { html: esc(L2('Our menu lists a "Breakfast @ 99" page (South Indian, Indian and English options). Because our dining hours start at 11 AM, please confirm breakfast timing with us first.', 'हमारे मेन्यू में "Breakfast @ 99" पेज है (साउथ इंडियन, इंडियन और इंग्लिश)। हमारे डाइनिंग घंटे 11 बजे से शुरू होते हैं, इसलिए ब्रेकफ़ास्ट का समय पहले पुष्टि कर लें।')), actions: [wa('about breakfast timing')], handoff: true };
  }
  if (has(/party|birthday|anniversar|celebrat|kitty|function|office|जन्मदिन|पार्टी|सालगिरह/) && !has(/^(open|timing)/)) {
    return { html: esc(L2('We host birthdays, anniversaries, office get-togethers and kitty parties. Share the date, guest count, veg / non-veg mix and budget and the team will plan the table with you.', 'हम जन्मदिन, सालगिरह, ऑफ़िस गेट-टुगेदर और किटी पार्टी होस्ट करते हैं। तारीख़, मेहमानों की संख्या, वेज/नॉन-वेज अनुपात और बजट बताइए — टीम आपके साथ टेबल प्लान करेगी।')), actions: [{ label: T('cel.open'), celebrate: true }, wa('about a party booking')] };
  }
  if (has(/buffet|बुफ़े|बुफे/)) {
    const b = cfg.buffet; if (b && (b.timings || b.price)) return { html: esc([b.timings && `Timings: ${b.timings}`, b.days && `Days: ${b.days}`, b.price && `Price: ${b.price}`].filter(Boolean).join(' · ')) };
    return hand(L2('I don\'t have confirmed buffet details — please check with the team on WhatsApp.', 'बुफ़े की पक्की जानकारी मेरे पास नहीं है — कृपया WhatsApp पर टीम से पूछें।'));
  }
  if (has(/\b(book|reserv|booking)\b|table|बुक/)) return { html: esc(L2('Happy to help — pick a date, time and guest count and we\'ll confirm on WhatsApp.', 'ज़रूर — तारीख़, समय और मेहमानों की संख्या चुनिए, हम WhatsApp पर पुष्टि करेंगे।')), actions: [{ label: T('cta.reserve'), reserve: true }] };
  if (has(/open|close|timing|hours|kab|khul|band|samay|समय|खुल|बंद/)) {
    const s = openStatus();
    const now = s.state === 'closed' ? L2('We\'re closed at the moment.', 'अभी हम बंद हैं।') : s.state === 'soon' ? L2('We\'re open — but closing soon.', 'हम खुले हैं — पर जल्द बंद होंगे।') : L2('Yes, we\'re open right now!', 'हाँ, हम अभी खुले हैं!');
    return { html: `${esc(now)} ${esc(L2('We\'re open daily', 'हम रोज़ खुले रहते हैं'))}: <b>${hoursLine()}</b>.<br>${esc(pick(cfg.hours.busyNote))}` };
  }
  if (has(/where|location|address|direction|reach|find you|landmark|map|kahan|kaha|pata|रास्ता|पता|कहाँ|basant|sakchi|trends/)) {
    return { html: `${esc(cfg.location.address)}<br><em>${esc(cfg.location.landmark)}</em>`, actions: [{ label: T('visit.directions'), href: cfg.directions }] };
  }
  if (has(/phone|call|contact|number|whatsapp|नंबर/)) return { html: `${esc(L2('Call or WhatsApp us on', 'हमें कॉल या WhatsApp करें'))} <b>${esc(cfg.phoneDisplay)}</b>.`, actions: [{ label: T('tab.call'), href: 'tel:' + cfg.phoneTel }, { label: 'WhatsApp', href: waLink('Hello Aroma!') }] };
  if (has(/deliver|zomato|swiggy|online|magicpin|district|takeaway|parcel/)) {
    return { html: esc(L2('We\'re a dine-in restaurant. You can also find us on Zomato, Swiggy Dineout, Magicpin and District. For online ordering or takeaway, please ask on WhatsApp.', 'हम मुख्य रूप से डाइन-इन रेस्टोरेंट हैं। हमें Zomato, Swiggy Dineout, Magicpin और District पर भी पाया जा सकता है। ऑनलाइन ऑर्डर या टेकअवे के लिए WhatsApp पर पूछें।')), actions: cfg.onlineOrdering && cfg.onlineOrdering.url ? [{ label: cfg.onlineOrdering.label, href: cfg.onlineOrdering.url }] : [wa('about online ordering')] };
  }
  if (has(/price|cost|rate|how much|expensive|cheap|budget|kitna|daam|कीमत|क़ीमत|दाम|₹|rs\b/)) {
    return { html: esc(L2(`A typical meal for two is ${cfg.price.label}. Exact dish prices are printed on our menu pages — I don't quote individual prices.`, `दो लोगों का सामान्य बिल लगभग ${cfg.price.label.replace('approx. ', '')} है। हर डिश की सही क़ीमत मेन्यू के पन्नों पर छपी है — मैं अलग-अलग क़ीमतें नहीं बताता।`)), actions: [{ label: T('menu.openSwipe'), menu: true }] };
  }
  if (parseParty(q).people) return recommend(q);   // "I'm 4 people, 2 veg, we love spicy food"
  if (has(/non[\s-]?veg|chicken|mutton|egg|fish|मांसाहारी|नॉन/)) {
    return { html: `${esc(L2('Non-veg favourites:', 'नॉन-वेज पसंदीदा:'))}${list([...nonvegPicks(), ...(has(/biryani/) ? [] : ['Dum / Bombay / Lucknowi Biryani'])])}`, actions: [{ label: T('menu.openSwipe'), menu: true }] };
  }
  if (has(/veg|jain|शाकाहारी|वेज|paneer/)) {
    if (has(/jain|pure veg|separate|only veg kitchen/)) return hand(L2('For strictly vegetarian or Jain preparation, please confirm with the team on WhatsApp so they can be sure.', 'सख़्त शाकाहारी या जैन तैयारी के लिए कृपया WhatsApp पर टीम से पुष्टि कर लें।'));
    const mv = menuItems().filter((i) => i.d === 'veg').slice(0, 4).map((i) => i.n);
    return { html: `${esc(L2('We serve both veg and non-veg. Veg favourites:', 'हमारे यहाँ वेज और नॉन-वेज दोनों हैं। वेज पसंदीदा:'))}${list([...vegPicks(), ...mv])}`, actions: [{ label: T('menu.openSwipe'), menu: true }] };
  }
  if (has(/spic|teekha|tikha|mild|hot|chilli|तीखा/) && !has(/\d+\s*(people|persons?|pax|guests?)/)) {
    const rows = sig().map((s) => `${s.name} — ${'🌶'.repeat(s.spice)}`);
    return { html: `${esc(L2('Typical heat for our signature dishes (tell your server how hot you like it):', 'हमारे ख़ास व्यंजनों का सामान्य तीखापन (सर्वर को बताइए कितना तीखा चाहिए):'))}${list(rows)}` };
  }
  if (has(/recommend|suggest|what should|what to order|best|famous|special|popular|biryani|kebab|dish|menu|khana|\d+\s*(people|persons?|pax|guests?|of us)|we are|we love/)) return recommend(q);
  if (has(/rating|review|google/)) return { html: esc(L2(`Guests rate us ${cfg.rating.value}★ on Google from ${cfg.rating.countLabel} reviews.`, `गूगल पर ${cfg.rating.countLabel} रिव्यू से मेहमान हमें ${cfg.rating.value}★ देते हैं।`)), actions: [{ label: T('rev.write'), href: cfg.reviewUrl }] };
  return hand();
}

/* ============================ Ask Aroma UI ============================ */
function initAsk() {
  const panel = $('[data-ask]'); if (!panel) return;
  const log = $('[data-ask-log]', panel), chipsEl = $('[data-ask-chips]', panel), form = $('[data-ask-form]', panel), input = form.q;
  const fab = $('[data-ask-open]'); let history = [], greeted = false, busy = false;
  const chips = ['hours', 'loc', 'veg', 'party', 'rec', 'spice'];
  const renderChips = () => { chipsEl.innerHTML = ''; chips.forEach((k) => { const b = el('button', { class: 'chip', type: 'button' }); b.textContent = T('js.ask.chip.' + k); b.addEventListener('click', () => ask(b.textContent)); chipsEl.appendChild(b); }); };
  const add = (cls, html) => { const m = el('div', { class: 'msg ' + cls }, html); log.appendChild(m); log.scrollTop = log.scrollHeight; return m; };
  const actionsHtml = (acts = []) => acts.map((a, i) => a.href ? `<a class="btn btn--saffron btn--sm" target="_blank" rel="noopener" href="${esc(a.href)}">${esc(a.label)}</a>` : `<button class="btn btn--saffron btn--sm" type="button" data-act="${i}">${esc(a.label)}</button>`).join(' ');
  function bot(res) {
    const m = add('msg--bot', `${res.html}${res.actions && res.actions.length ? '<div>' + actionsHtml(res.actions) + '</div>' : ''}`);
    (res.actions || []).forEach((a, i) => {
      const b = m.querySelector(`[data-act="${i}"]`); if (!b) return;
      b.addEventListener('click', () => { close(); if (a.reserve) openSheetOrScroll('reserve'); else if (a.celebrate) openSheetOrScroll('celebrate'); else if (a.menu) document.querySelector('[data-open-swipe-menu]') && (mqMobile.matches ? document.querySelector('[data-open-swipe-menu]').click() : scrollToId('menu')); });
    });
  }
  const openSheetOrScroll = (kind) => { const b = document.querySelector(`[data-sheet-open="${kind}"]`); if (b) b.click(); else scrollToId(kind); };
  async function ask(text) {
    text = text.trim(); if (!text || busy) return; busy = true; input.value = '';
    add('msg--me', esc(text)); history.push({ role: 'user', content: text }); track('ask_aroma_query');
    const typing = add('msg--bot msg--typing', '<i></i><i></i><i></i>');
    let res = null;
    try {
      const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000);
      const r = await fetch(url('api/ask.php'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-8), lang: getLang() }), signal: ctl.signal });
      clearTimeout(to);
      if (r.ok) { const j = await r.json(); if (j.ok && j.reply) res = { html: esc(j.reply).replace(/\n/g, '<br>'), actions: j.handoff ? [{ label: T('js.ask.handoffBtn'), href: waLink(`Hello Aroma, I have a question: "${text}"`) }] : [] }; }
    } catch { /* offline / not configured → local rules */ }
    if (!res) res = localAnswer(text);
    typing.remove(); bot(res); history.push({ role: 'assistant', content: res.html.replace(/<[^>]+>/g, ' ') }); busy = false;
  }
  function open() {
    panel.hidden = false; fab.setAttribute('aria-expanded', 'true'); if (mqMobile.matches) lock();
    if (!greeted) { greeted = true; add('msg--bot', esc(T('js.ask.hello'))); renderChips(); track('ask_aroma_open'); }
    setTimeout(() => input.focus({ preventScroll: true }), 80);
  }
  function close() { panel.hidden = true; fab.setAttribute('aria-expanded', 'false'); if (mqMobile.matches) unlock(); }
  fab.addEventListener('click', () => (panel.hidden ? open() : close()));
  $('[data-ask-close]', panel).addEventListener('click', close);
  form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) close(); });
  document.addEventListener('aroma:lang', () => { if (greeted) renderChips(); });
  window.AromaAsk = { open, ask };
}

/* ============================ Mood-to-Meal ============================ */
function initMood() {
  const wrap = $('[data-moods]'), out = $('[data-mood-result]'); if (!wrap) return;
  let current = null;
  const render = (id, { fresh = true } = {}) => {
    const m = cfg.moods.find((x) => x.id === id); if (!m) return; current = id;
    $$('.mood-chip', wrap).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.mood === id)));
    const li = m.picks.map((p) => `<li>${p.diet ? `<span class="diet diet--${p.diet}" role="img" aria-label="${esc(T('js.diet.' + p.diet))}"></span>` : '<span class="diet diet--none" aria-hidden="true"></span>'}<b>${esc(p.name)}</b><span class="role">${esc(pick(p.role))}</span></li>`).join('');
    const cta = m.cta === 'celebrate' ? `<button class="btn btn--saffron" type="button" data-sheet-open="celebrate">${esc(T('js.mood.celebrate'))}</button>` : '';
    out.innerHTML = `<div class="mood__combo"><h3>${esc(pick(m.headline))}</h3><ul class="combo">${li}</ul>
      <p class="mood__tip"><svg class="ic"><use href="#i-flame"/></svg><span>${esc(pick(m.tip))}</span></p>
      <p class="mood__ai" data-mood-ai hidden></p>
      <div class="mood__cta">${cta}<button class="btn ${cta ? 'btn--ghost' : 'btn--saffron'}" type="button" data-sheet-open="reserve" data-track="reserve_click">${esc(T('js.mood.reserve'))}</button></div>
      <p class="fineprint">${esc(T('js.mood.note'))}</p></div>`;
    if (window.gsap && fresh) gsap.from($$('.combo li', out), { opacity: 0, y: 14, duration: .55, stagger: .08, ease: 'power3.out' });
    if (fresh) { track('mood_pick', { mood: id }); personalise(id); }
  };
  async function personalise(id) {
    try {
      const r = await fetch(url('api/ask.php'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'mood', mood: id, lang: getLang() }) });
      if (!r.ok) return; const j = await r.json(); const p = $('[data-mood-ai]', out);
      if (j.ok && j.reply && p && current === id) { p.hidden = false; p.innerHTML = `<svg class="ic" style="display:inline;vertical-align:-.2em;color:var(--accent)"><use href="#u-sparkle"/></svg> ${esc(j.reply)} <small style="opacity:.6">· ${esc(T('js.mood.ai'))}</small>`; }
    } catch { /* AI layer is optional */ }
  }
  wrap.addEventListener('click', (e) => { const b = e.target.closest('.mood-chip'); if (b) render(b.dataset.mood); });
  wrap.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return; e.preventDefault();
    const bs = $$('.mood-chip', wrap), i = bs.indexOf(document.activeElement); const n = bs[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length]; n.focus(); n.click();
  });
  document.addEventListener('aroma:lang', () => current && render(current, { fresh: false }));
}

export function initAI() { initAsk(); initMood(); }
