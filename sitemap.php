<?php
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';
$base = site_url($SITE);
$mod = date('c', max(filemtime(ROOT . '/content/site.json'), is_file(ROOT . '/content/menu-text.json') ? filemtime(ROOT . '/content/menu-text.json') : 0));
header('Content-Type: application/xml; charset=utf-8');
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc><?= e($base) ?></loc>
    <lastmod><?= e($mod) ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image><image:loc><?= e($base) ?>assets/img/og-image.jpg</image:loc><image:title>Aroma Multicuisine, Sakchi, Jamshedpur</image:title></image:image>
<?php foreach (['hall', 'kebab', 'balloons'] as $id): if (!isset($IMG[$id])) continue; ?>
    <image:image><image:loc><?= e($base) ?>assets/images/<?= e($id) ?>-<?= (int) max($IMG[$id]['widths']) ?>.webp</image:loc><image:caption><?= e($IMG[$id]['alt']) ?></image:caption></image:image>
<?php endforeach; ?>
  </url>
</urlset>
