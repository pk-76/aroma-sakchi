<?php
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';
header('Content-Type: text/plain; charset=utf-8');
$base = site_url($SITE);
?>
User-agent: *
Allow: /
Disallow: /api/
Disallow: /data/
Disallow: /lib/
Disallow: /tools/

Sitemap: <?= $base ?>sitemap.xml
