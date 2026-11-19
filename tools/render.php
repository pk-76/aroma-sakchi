<?php
// CLI helper for export-static.mjs: renders a PHP page of the site as if served at https://<host><base>
// usage: php render.php <file> <base> <host>
[$self, $file, $base, $host] = $argv;
$root = dirname(__DIR__);
$_SERVER['SCRIPT_NAME'] = rtrim($base, '/') . '/index.php';
$_SERVER['HTTP_HOST'] = $host;
$_SERVER['HTTPS'] = 'on';
$_SERVER['REQUEST_METHOD'] = 'GET';
chdir($root);
include $root . '/' . $file;
