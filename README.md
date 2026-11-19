# Aroma Multicuisine (Sakchi) — website

"Aroma — A Journey of Flavours". Static HTML/CSS/JS + small PHP endpoints. Runs on XAMPP and any cPanel/PHP 8+ host. Designed & developed by EastGrow Digital.

Open locally: `http://localhost/Aroma-sakchi/` (XAMPP Apache running). QR table menu: `/menu?table=5`.

## Why this stack (not Next.js)
The client host is PHP (XAMPP / typical Indian shared hosting) and the owner must update the menu and content **without a build step**. So: plain HTML/CSS/JS, PHP for server-side rendering from `site.json`, forms, AI proxy and reviews proxy. GSAP + ScrollTrigger + Lenis, StPageFlip and Swiper are self-hosted (no CDN). Framer Motion is React-only and was not needed.

## Folder map
```
index.php               page shell (SEO tags, JSON-LD, includes the sections)
lib/sections/*.php      one file per section (hero, menu, gallery, …)
content/site.json       ★ everything the owner edits: hours, phone, toggles, dishes, moods, offers, festive theme…
content/menu-text.json  text version of the menu (SEO, screen readers, AI) — NO prices on purpose
content/i18n.json       English + Hindi UI text
content/images.json     catalogue of real photos (alt text, groups, focal point)
assets/menu/            ★ menu page images + menu.json (page order, category tabs)
assets/images/          generated, colour-graded AVIF/WebP + manifest.json   (do not edit by hand)
assest/                 your ORIGINAL uploads (kept untouched; not served)
api/                    enquiry.php · ask.php · reviews.php
css/ js/                readable sources;  css/app.min.css + js/app.min.js are the production bundles
tools/                  build scripts (Node) — not needed on the server
.env.example            copy to .env for email / AI / Google keys
```

## Everyday tasks (no code)
**Change hours / phone / toggles / offers** → edit `content/site.json` (hours are in `hours`, one place; the Open-now badge, hours table, schema and time slots all follow it). Set `"mon": null` for a closed day.

**Replace the menu** → put the new pages in `assets/menu/` (JPG, portrait, ~1500 px wide, sharp text) and edit `assets/menu/menu.json`: `pages` = order, `categories` = side tabs / mobile chips (`page` is the 1-based start page). The book, swipe menu, PDF and share button all update. Then update `content/menu-text.json` so Google and screen readers see the same dishes (`tools/ocr-menu.mjs` can draft it).

**Switch on buffet / Instagram / Facebook / dish prices / online ordering** → fill the matching block in `site.json` and set the toggle to `true`. They are OFF until you confirm real details.

**Aggregator badges** (Zomato, Swiggy Dineout, Magicpin, District) → paste each listing URL in `also`. Without a URL the badge is a plain label (no dead links).

**Offer / Today's Special banner** → add to `offers` (see the example in `_offersNote`). Empty = no banner. **Festive theme** → `festive.active`: `diwali | durga-puja | christmas | new-year | none`.

**Photos** → add the file to `assest/`, add an entry in `content/images.json` (write the alt text), then `cd tools && npm run build`.

**Tracking** → paste a GA4 id and/or Meta Pixel id in `analytics`. Events: call, WhatsApp, directions, reserve, menu views/downloads, celebration enquiry, reviews.

## Configuration (.env)
Copy `.env.example` to `.env` (blocked from the web by `.htaccess`).
| Key | Purpose |
|---|---|
| `OWNER_EMAIL`, `MAIL_FROM` | where enquiries are emailed (PHP `mail()`; if your host blocks it, enquiries are still logged in `/data` and every guest also gets the pre-filled WhatsApp button) |
| `AI_PROVIDER` / `AI_API_KEY` / `AI_MODEL` / `AI_BASE_URL` | "Ask Aroma" + Mood-to-Meal personalisation. `anthropic` (default, `claude-haiku-5-5`) or `openai` (any OpenAI-compatible endpoint). No key → the built-in rules engine answers from site data. |
| `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID` | live Google reviews (cached 6 h). Not set → the themed "what guests love" cards show; nothing is invented. |

AI safety: the model only sees facts from `site.json` / `menu-text.json`, never prices; any reply containing a rupee amount (other than the published "for two" range) is replaced with a WhatsApp hand-off.

## Build (after changing CSS/JS/photos)
```
cd tools
npm install          # once
npm run build        # vendor libs → photos (grade, AVIF/WebP, blur) → logo/icons → minified css/js
```
`index.php` serves `css/app.min.css` and `js/app.min.js` when present (cache-busted by file time). Add `?dev=1` to the URL to use the readable sources.

## Deploy checklist
1. Upload everything except `tools/`, `assest/`, `node_modules`. Keep `.htaccess` (needs `mod_rewrite`, `mod_headers`, `mod_expires`).
2. Create `.env`. Set `business.siteUrl` in `site.json` to the final https URL (canonical, sitemap, OG tags).
3. Fill the **CONFIRM** items in `site.json`: exact `latitude/longitude`, `googlePlaceId`, `parking`.
4. Make sure `data/` is writable by PHP (it is created automatically and is web-blocked).
5. Submit `https://yourdomain/sitemap.xml` in Search Console; add the Google Business Profile link.

## What's built
Preloader (skips repeat visits) · cinematic hero (Ken Burns, smoke) · mobile vertical "stories" hero · trust strip · story · 5 cuisines · signature dishes (pinned horizontal scroll on desktop, swipe cards on mobile) · **3D menu book** with side tabs, counter, keyboard, optional page-turn sound, click-to-lightbox with pinch/wheel zoom · **mobile swipe menu** (progress bars, tap zones, double-tap/pinch zoom, category chips, Android back closes) · PDF download · WhatsApp share · indexable text menu · QR table mode · Mood-to-Meal · Ask Aroma · celebration/reservation/feedback forms (honeypot, time-trap, per-IP rate limit, WhatsApp confirmation screen) · gallery (masonry / swipe cards, filters, lightbox) · Google reviews · map + hours · EN/हिन्दी · dark/light · festive themes · installable offline PWA · schema.org Restaurant JSON-LD, sitemap, robots, OG image.

## Known limits (be upfront with the client)
* Source photos are small (≈380–680 px). They are graded and gently upscaled, but full-screen hero and menu text need **original high-resolution files** (and a proper scan/photo of every menu page). The logo supplied is 150 px — please send a vector/PNG.
* Only 4 menu pages exist so far (Breakfast, Evening Snacks ×2, Beverages & Soups). The Thali/Starters/Main Course/Biryani pages must be added to `assets/menu/`.
* No real photos of biryani/kebab dishes by name → signature cards use gold line-art, plus three real "plate" photos. Add `"photo": "<image-id>"` to a dish once a genuine photo exists.
* `fish.webp` carries a "GENERATED" watermark (AI/stock) and `party.webp` is a close-up selfie: both are excluded.
* Menu page prices are visible only inside the photos (not retyped) until the owner confirms them.
