<?php
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';

$view  = (isset($_GET['menu']) || isset($_GET['table'])) ? 'menu' : 'home';
$table = isset($_GET['table']) ? preg_replace('/[^0-9A-Za-z-]/', '', (string) $_GET['table']) : '';
$SITEURL = site_url($SITE);
$B = $SITE['business']; $C = $SITE['contact']; $LOC = $SITE['location']; $T = $SITE['toggles'];

$pageTitle = $view === 'menu'
    ? 'Menu — Aroma Multicuisine, Sakchi, Jamshedpur'
    : 'Aroma Multicuisine | Family Restaurant in Sakchi, Jamshedpur';
$pageDesc = $view === 'menu'
    ? 'Browse the Aroma Multicuisine menu — breakfast, evening snacks, beverages and more. 3rd Floor, Basant Central, Sakchi, Jamshedpur.'
    : 'Aroma Multicuisine on the 3rd floor of Basant Central, Sakchi, Jamshedpur — biryani, kebabs, North Indian, Mughlai, Chinese & Continental. Veg & non-veg, family dining, birthday & party bookings. 4.6★ on Google.';
$canonical = $SITEURL;

/* ---- schema.org JSON-LD ---- */
$dayNames = ['mon' => 'Monday', 'tue' => 'Tuesday', 'wed' => 'Wednesday', 'thu' => 'Thursday', 'fri' => 'Friday', 'sat' => 'Saturday', 'sun' => 'Sunday'];
$hoursSpec = [];
foreach ($dayNames as $k => $full) {
    $d = $SITE['hours']['days'][$k] ?? $SITE['hours']['default'];
    if ($d) $hoursSpec[] = ['@type' => 'OpeningHoursSpecification', 'dayOfWeek' => $full, 'opens' => $d['open'], 'closes' => $d['close']];
}
$sameAs = array_values(array_filter(array_merge(
    array_column($SITE['also'], 'url'),
    $T['social'] ? [$SITE['social']['instagram'] ?? '', $SITE['social']['facebook'] ?? ''] : []
)));
$schema = [
    '@context' => 'https://schema.org',
    '@type' => 'Restaurant',
    '@id' => $SITEURL . '#restaurant',
    'name' => $B['name'],
    'url' => $SITEURL,
    'image' => [$SITEURL . 'assets/img/og-image.jpg'],
    'telephone' => $C['phoneTel'],
    'priceRange' => $SITE['price']['schemaRange'],
    'servesCuisine' => $SITE['cuisinesList'],
    'acceptsReservations' => 'True',
    'menu' => $SITEURL . '?menu=1#menu',
    'hasMenu' => $SITEURL . '?menu=1#menu',
    'address' => [
        '@type' => 'PostalAddress',
        'streetAddress' => '3rd Floor, Basant Central, Mills & Godown Area, beside Trends, Hirasingh Bagan, Sakchi',
        'addressLocality' => $B['city'], 'addressRegion' => $B['state'], 'postalCode' => $B['postalCode'], 'addressCountry' => $B['country'],
    ],
    'openingHoursSpecification' => $hoursSpec,
    'aggregateRating' => ['@type' => 'AggregateRating', 'ratingValue' => (string) $SITE['rating']['value'], 'reviewCount' => (string) $SITE['rating']['count'], 'bestRating' => '5'],
    'hasMap' => 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode($LOC['mapQuery']),
];
if ($LOC['latitude'] !== null && $LOC['longitude'] !== null) {
    $schema['geo'] = ['@type' => 'GeoCoordinates', 'latitude' => $LOC['latitude'], 'longitude' => $LOC['longitude']];
}
if ($sameAs) $schema['sameAs'] = $sameAs;

/* ---- client config (only what the browser needs) ---- */
$menuTextCompact = array_map(fn($s) => [
    'id' => $s['id'], 'title' => $s['title'], 'note' => $s['note'] ?? '',
    'items' => array_merge(...array_map(fn($g) => array_map(fn($i) => [$i['n'], $i['diet'] ?? null, $g['name']], $g['items']), $s['groups'])),
], $MENUTX['sections'] ?? []);
$jsKeys = ['en' => [], 'hi' => []];
foreach (['en', 'hi'] as $lg) foreach (($I18N[$lg] ?? []) as $k => $v) if (str_starts_with($k, 'js.')) $jsKeys[$lg][$k] = $v;
$client = [
    'base' => base_path(), 'siteUrl' => $SITEURL, 'name' => $B['name'], 'view' => $view, 'table' => $table,
    'phoneTel' => $C['phoneTel'], 'phoneDisplay' => $C['phoneDisplay'], 'whatsapp' => $C['whatsapp'],
    'hours' => $SITE['hours'], 'rating' => $SITE['rating'], 'price' => $SITE['price'], 'toggles' => $T,
    'location' => ['address' => $LOC['addressOneLine'], 'landmark' => $LOC['landmark'], 'parking' => $LOC['parking'], 'mapQuery' => $LOC['mapQuery']],
    'directions' => directions_url($SITE), 'reviewUrl' => review_url($SITE),
    'signature' => $SITE['signature'], 'moods' => $SITE['moods'], 'cuisines' => $SITE['cuisinesList'],
    'menuSections' => $SITE['menuSections'], 'menuText' => $menuTextCompact,
    'buffet' => $T['buffet'] ? $SITE['buffet'] : null, 'onlineOrdering' => $T['onlineOrdering'] ? $SITE['onlineOrdering'] : null,
    'offers' => $SITE['offers'], 'festive' => $SITE['festive'], 'analytics' => $SITE['analytics'],
    'i18n' => $jsKeys,
];

function fmt12(string $hhmm): string { return date('g:i A', strtotime($hhmm)); }
?>
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title><?= e($pageTitle) ?></title>
<meta name="description" content="<?= e($pageDesc) ?>">
<meta name="keywords" content="best restaurant in Sakchi, family restaurant Jamshedpur, biryani in Jamshedpur, multicuisine restaurant Sakchi, birthday party restaurant Jamshedpur, restaurant in Basant Central">
<link rel="canonical" href="<?= e($canonical) ?>">
<meta name="robots" content="<?= $table !== '' ? 'noindex,follow' : 'index,follow,max-image-preview:large' ?>">
<meta name="theme-color" content="#F5EDE0">
<meta name="color-scheme" content="light dark">
<meta name="application-name" content="Aroma">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Aroma">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta property="og:type" content="restaurant.restaurant">
<meta property="og:site_name" content="<?= e($B['name']) ?>">
<meta property="og:title" content="<?= e($pageTitle) ?>">
<meta property="og:description" content="<?= e($pageDesc) ?>">
<meta property="og:url" content="<?= e($canonical) ?>">
<meta property="og:image" content="<?= e($SITEURL) ?>assets/img/og-image.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:locale" content="en_IN"><meta property="og:locale:alternate" content="hi_IN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="<?= e($pageTitle) ?>">
<meta name="twitter:description" content="<?= e($pageDesc) ?>">
<meta name="twitter:image" content="<?= e($SITEURL) ?>assets/img/og-image.jpg">
<link rel="manifest" href="<?= u('manifest.webmanifest') ?>">
<link rel="icon" href="<?= u('assets/img/favicon.svg') ?>" type="image/svg+xml">
<link rel="icon" href="<?= u('assets/img/favicon-32.png') ?>" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="<?= u('assets/img/apple-touch-icon.png') ?>">
<link rel="preload" href="<?= u('assets/fonts/fraunces-latin-wght-normal.woff2') ?>" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="<?= u('assets/fonts/manrope-latin-wght-normal.woff2') ?>" as="font" type="font/woff2" crossorigin>
<?php $hm = $IMG['hall']; ?>
<link rel="preload" as="image" type="image/avif" href="<?= u('assets/images/hall-' . max($hm['widths']) . '.avif') ?>" imagesrcset="<?= e(implode(', ', array_map(fn($w) => u("assets/images/hall-$w.avif") . " {$w}w", $hm['widths']))) ?>" imagesizes="100vw" fetchpriority="high">
<?php
// production: one minified stylesheet + one JS bundle (built by `npm run build` in /tools); falls back to the readable sources
$useMin = is_file(__DIR__ . '/css/app.min.css') && is_file(__DIR__ . '/js/app.min.js') && !isset($_GET['dev']);
$ver = fn(string $p) => '?v=' . (is_file(__DIR__ . '/' . $p) ? filemtime(__DIR__ . '/' . $p) : '1');
?>
<?php if ($useMin): ?>
<link rel="stylesheet" href="<?= u('css/app.min.css') . $ver('css/app.min.css') ?>">
<?php else: ?>
<link rel="stylesheet" href="<?= u('css/main.css') . $ver('css/main.css') ?>">
<link rel="stylesheet" href="<?= u('css/ui.css') . $ver('css/ui.css') ?>">
<?php endif; ?>
<script>
/* pre-paint: theme, language, return-visit flag (avoids flash + skips preloader on repeat visits) */
(function(){try{var d=document.documentElement,s=localStorage;
  var th=s.getItem('aroma.theme'); if(th==='light'||th==='dark') d.setAttribute('data-theme',th);
  var lg=s.getItem('aroma.lang'); if(lg==='hi'){d.lang='hi';}
  if(s.getItem('aroma.seen')||/[?&]table=/.test(location.search)) d.classList.add('no-preload');
}catch(e){}
d=document.documentElement; d.classList.add('js');
})();
</script>
<script type="application/ld+json"><?= json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG) ?></script>
<script type="application/ld+json"><?= json_encode(['@context' => 'https://schema.org', '@type' => 'WebSite', 'name' => $B['name'], 'url' => $SITEURL], JSON_UNESCAPED_SLASHES) ?></script>
</head>
<body data-view="<?= e($view) ?>" data-table="<?= e($table) ?>">
<?php include __DIR__ . '/lib/sprite.inc.html'; include __DIR__ . '/lib/ui-icons.inc.html'; ?>
<a class="skip" href="#main" <?= ia('a11y.skip') ?>><?= t('a11y.skip') ?></a>

<?php include __DIR__ . '/lib/sections/chrome.php'; ?>

<main id="main">
<?php
foreach (['hero', 'trust', 'story', 'cuisines', 'dishes', 'menu', 'mood', 'celebrate', 'buffet', 'gallery', 'reviews', 'reserve', 'visit', 'also'] as $sec) {
    include __DIR__ . "/lib/sections/$sec.php";
}
?>
</main>

<?php include __DIR__ . '/lib/sections/footer.php'; ?>
<?php include __DIR__ . '/lib/sections/widgets.php'; ?>

<script id="aroma-config" type="application/json"><?= json_encode($client, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP) ?></script>
<?php /* GSAP, Lenis, StPageFlip and Swiper are loaded on demand by js/core.js → lib() — phones never download GSAP/Lenis/StPageFlip. */ ?>
<script type="module" src="<?= $useMin ? u('js/app.min.js') . $ver('js/app.min.js') : u('js/main.js') . $ver('js/main.js') ?>"></script>
<noscript><style>.preloader{display:none!important}[data-reveal],[data-split]{opacity:1!important;transform:none!important}</style></noscript>
</body>
</html>
