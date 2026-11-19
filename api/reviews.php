<?php
/**
 * GET /api/reviews.php — live Google reviews through the Places API (New), cached 6 h on the server.
 * Needs GOOGLE_PLACES_API_KEY (.env) and a Place ID (.env GOOGLE_PLACE_ID or content/site.json → location.googlePlaceId).
 * Not configured / API error → {ok:false} (the page keeps showing the "what guests love" themes; nothing is invented).
 */
declare(strict_types=1);
require __DIR__ . '/_guard.php';
header('X-Content-Type-Options: nosniff');

$key = env('GOOGLE_PLACES_API_KEY');
$pid = env('GOOGLE_PLACE_ID') ?: trim((string) ($SITE['location']['googlePlaceId'] ?? ''));
if (!$key || !$pid) json_out(['ok' => false, 'error' => 'not_configured']);

$cache = data_dir('cache') . '/reviews.json';
$fresh = is_file($cache) && filemtime($cache) > time() - 6 * 3600;
if ($fresh) { header('Cache-Control: public, max-age=1800'); echo file_get_contents($cache); header('Content-Type: application/json; charset=utf-8'); exit; }

if (!rate_limit('reviews-refresh', 6, 3600)) { if (is_file($cache)) { header('Content-Type: application/json; charset=utf-8'); echo file_get_contents($cache); exit; } json_out(['ok' => false, 'error' => 'rate_limited'], 429); }

$ch = curl_init('https://places.googleapis.com/v1/places/' . rawurlencode($pid));
curl_setopt_array($ch, [
    CURLOPT_HTTPHEADER => ['X-Goog-Api-Key: ' . $key, 'X-Goog-FieldMask: rating,userRatingCount,reviews', 'Accept-Language: en'],
    CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10, CURLOPT_CONNECTTIMEOUT => 5,
]);
$resp = curl_exec($ch); $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);

if ($resp === false || $code !== 200) {
    if (is_file($cache)) { header('Content-Type: application/json; charset=utf-8'); echo file_get_contents($cache); exit; }   // serve stale rather than nothing
    json_out(['ok' => false, 'error' => 'upstream']);
}
$j = json_decode((string) $resp, true);
$reviews = [];
foreach (($j['reviews'] ?? []) as $r) {
    $text = trim((string) ($r['text']['text'] ?? $r['originalText']['text'] ?? ''));
    if ($text === '') continue;
    $reviews[] = [
        'author' => (string) ($r['authorAttribution']['displayName'] ?? ''),
        'photo'  => (string) ($r['authorAttribution']['photoUri'] ?? ''),
        'rating' => (int) ($r['rating'] ?? 5),
        'text'   => mb_substr($text, 0, 600),
        'when'   => (string) ($r['relativePublishTimeDescription'] ?? ''),
    ];
}
$out = json_encode(['ok' => true, 'rating' => $j['rating'] ?? null, 'count' => $j['userRatingCount'] ?? null, 'reviews' => $reviews], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
@file_put_contents($cache, $out);
header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: public, max-age=1800');
echo $out;
