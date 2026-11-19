<?php
/**
 * Shared API guard: same-origin check, JSON input, file-based rate limiting, safe private storage, owner mail.
 * Included by every endpoint in /api. Never echoes secrets.
 */
declare(strict_types=1);
require_once dirname(__DIR__) . '/lib/bootstrap.php';

function data_dir(string $sub = ''): string {
    $dir = ROOT . '/data' . ($sub !== '' ? '/' . $sub : '');
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    $root = ROOT . '/data';
    if (!is_file($root . '/.htaccess')) {                       // never web-readable
        @file_put_contents($root . '/.htaccess', "Require all denied\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n");
        @file_put_contents($root . '/index.html', '');
    }
    return $dir;
}

function guard_post(): void {
    header('X-Content-Type-Options: nosniff');
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_out(['ok' => false, 'error' => 'Method not allowed'], 405);
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '') {
        $oh = parse_url($origin, PHP_URL_HOST) . ((($p = parse_url($origin, PHP_URL_PORT)) ? ':' . $p : ''));
        if (strcasecmp($oh, $_SERVER['HTTP_HOST'] ?? '') !== 0) json_out(['ok' => false, 'error' => 'Bad origin'], 403);
    }
}

function read_input(): array {
    $raw = file_get_contents('php://input') ?: '';
    if (strlen($raw) > 20000) json_out(['ok' => false, 'error' => 'Too large'], 413);
    $j = json_decode($raw, true);
    return is_array($j) ? $j : $_POST;
}

function clean(mixed $v, int $max = 200): string {
    $s = is_string($v) ? $v : (is_scalar($v) ? (string) $v : '');
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '';
    return trim(mb_substr($s, 0, $max));
}

function client_ip(): string { return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'; }

/** Sliding-window limiter. Returns true if the call is allowed. */
function rate_limit(string $bucket, int $max, int $windowSec): bool {
    $file = data_dir('ratelimit') . '/' . hash('sha256', $bucket . '|' . client_ip() . '|' . (env('APP_SALT', 'aroma'))) . '.json';
    $fh = @fopen($file, 'c+');
    if (!$fh) return true;                                      // fail open rather than lose a customer
    flock($fh, LOCK_EX);
    $now = time();
    $hits = json_decode((string) stream_get_contents($fh), true);
    $hits = array_values(array_filter(is_array($hits) ? $hits : [], fn($t) => $t > $now - $windowSec));
    $allowed = count($hits) < $max;
    if ($allowed) $hits[] = $now;
    ftruncate($fh, 0); rewind($fh); fwrite($fh, json_encode($hits));
    flock($fh, LOCK_UN); fclose($fh);
    // opportunistic cleanup of stale limiter files
    if (random_int(1, 60) === 1) foreach (glob(data_dir('ratelimit') . '/*.json') ?: [] as $f) if (filemtime($f) < $now - 86400) @unlink($f);
    return $allowed;
}

function append_log(string $name, array $row): void {
    $row = ['at' => date('c'), 'ip_hash' => substr(hash('sha256', client_ip()), 0, 12)] + $row;
    @file_put_contents(data_dir() . '/' . $name . '.jsonl', json_encode($row, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
}

/** Deliver to the owner by email (PHP mail()). Returns whether the mail function accepted it. */
function mail_owner(string $subject, string $body, string $replyTo = ''): bool {
    $to = env('OWNER_EMAIL');
    if (!$to) return false;
    $host = preg_replace('/^www\./', '', (string) parse_url(origin(), PHP_URL_HOST));
    $from = env('MAIL_FROM', 'no-reply@' . ($host ?: 'localhost'));
    $strip = fn(string $s) => str_replace(["\r", "\n"], ' ', $s);
    $headers = 'From: Aroma Website <' . $strip($from) . ">\r\n" . 'MIME-Version: 1.0' . "\r\n" . 'Content-Type: text/plain; charset=UTF-8' . "\r\n";
    if ($replyTo !== '' && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) $headers .= 'Reply-To: ' . $strip($replyTo) . "\r\n";
    return (bool) @mail($to, '=?UTF-8?B?' . base64_encode($strip($subject)) . '?=', $body, $headers);
}
