<?php
/**
 * Aroma — shared bootstrap: loads the JSON content + helpers used by index.php and the API.
 * Everything the owner edits lives in /content/site.json, /content/menu-text.json, /assets/menu/menu.json.
 */
declare(strict_types=1);

define('ROOT', dirname(__DIR__));
date_default_timezone_set('Asia/Kolkata');

function load_json(string $rel, bool $assoc = true) {
    $path = ROOT . '/' . ltrim($rel, '/');
    if (!is_file($path)) return $assoc ? [] : null;
    $data = json_decode((string) file_get_contents($path), $assoc);
    return $data ?? ($assoc ? [] : null);
}

/** Minimal .env reader (KEY=value, # comments). Values are never printed to the client. */
function env(string $key, ?string $default = null): ?string {
    static $env = null;
    if ($env === null) {
        $env = [];
        $file = ROOT . '/.env';
        if (is_file($file)) {
            foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                $line = trim($line);
                if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) continue;
                [$k, $v] = explode('=', $line, 2);
                $env[trim($k)] = trim(trim($v), "\"'");
            }
        }
    }
    $v = $env[$key] ?? getenv($key);
    return ($v === false || $v === null || $v === '') ? $default : (string) $v;
}

/** URL base (works in a sub-folder like /Aroma-sakchi/ and at the domain root). Always ends with "/". */
function base_path(): string {
    $dir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/'));
    $dir = rtrim($dir, '/');
    if (str_ends_with($dir, '/api')) $dir = substr($dir, 0, -4);
    return $dir . '/';
}
function u(string $path = ''): string { return base_path() . ltrim($path, '/'); }
function origin(): string {
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    return ($https ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost');
}
function site_url(array $site): string {
    $configured = trim((string) ($site['business']['siteUrl'] ?? ''));
    return $configured !== '' ? rtrim($configured, '/') . '/' : origin() . base_path();
}

function e($s): string { return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

/* ---------- content ---------- */
$SITE   = load_json('content/site.json');
$I18N   = load_json('content/i18n.json');
$IMG    = load_json('assets/images/manifest.json');
$MENU   = load_json('assets/menu/menu.json');
$MENUTX = load_json('content/menu-text.json');

/* ---------- i18n ---------- */
function t(string $key): string {                 // English text (HTML allowed — trusted, from our own JSON)
    global $I18N;
    return $I18N['en'][$key] ?? $key;
}
function ia(string $key): string { return 'data-i18n="' . e($key) . '"'; }
/** For attributes (placeholder, aria-label) that must also translate. */
function ta(string $attr, string $key): string {
    return e($attr) . '="' . e(strip_tags(t($key))) . '" data-i18n-attr="' . e($attr) . ':' . e($key) . '"';
}
/** Localised value of {"en":..,"hi":..} or plain string (returns English) */
function L($v): string { return is_array($v) ? (string) ($v['en'] ?? '') : (string) $v; }
/** data-hi attribute for dynamic JSON text so the language switch can translate it. */
function hi($v): string { return (is_array($v) && !empty($v['hi'])) ? ' data-hi="' . e($v['hi']) . '" data-en="' . e($v['en'] ?? '') . '"' : ''; }

/* ---------- images ---------- */
/**
 * Responsive <picture>: AVIF + WebP srcsets, intrinsic size (no layout shift), blur-up placeholder, alt text.
 * opts: class, sizes, eager (bool), alt (override), fit
 */
function pic(string $id, array $o = []): string {
    global $IMG;
    $m = $IMG[$id] ?? null;
    if (!$m) return '<!-- missing image ' . e($id) . ' -->';
    $widths = $m['widths'];
    $set = function (string $ext) use ($id, $widths): string {
        return implode(', ', array_map(fn($w) => u("assets/images/$id-$w.$ext") . " {$w}w", $widths));
    };
    $maxW = max($widths);
    $ratio = $m['w'] . '/' . $m['h'];
    $alt = array_key_exists('alt', $o) ? $o['alt'] : $m['alt'];
    $sizes = $o['sizes'] ?? '100vw';
    $eager = !empty($o['eager']);
    $cls = trim('ph ' . ($o['wrap'] ?? ''));
    $imgCls = $o['class'] ?? '';
    $style = '--blur:url(' . $m['blur'] . ');--focal:' . $m['focal'] . ';--ar:' . $ratio;
    $h = '<picture class="' . e($cls) . '" style="' . e($style) . '">';
    $h .= '<source type="image/avif" srcset="' . e($set('avif')) . '" sizes="' . e($sizes) . '">';
    $h .= '<source type="image/webp" srcset="' . e($set('webp')) . '" sizes="' . e($sizes) . '">';
    $h .= '<img src="' . e(u("assets/images/$id-$maxW.webp")) . '" width="' . (int) $m['w'] . '" height="' . (int) $m['h'] . '" alt="' . e($alt) . '"';
    $h .= $imgCls !== '' ? ' class="' . e($imgCls) . '"' : '';
    $h .= $eager ? ' fetchpriority="high" decoding="async"' : ' loading="lazy" decoding="async"';
    $h .= ' onload="this.parentNode.classList.add(\'is-loaded\')">';
    return $h . '</picture>';
}

/* ---------- misc helpers ---------- */
function wa_link(array $site, string $msg = ''): string {
    $n = $site['contact']['whatsapp'];
    return 'https://wa.me/' . $n . ($msg !== '' ? '?text=' . rawurlencode($msg) : '');
}
function directions_url(array $site): string {
    return 'https://www.google.com/maps/dir/?api=1&destination=' . rawurlencode($site['location']['mapQuery']);
}
function review_url(array $site): string {
    $pid = trim((string) ($site['location']['googlePlaceId'] ?? ''));
    return $pid !== ''
        ? 'https://search.google.com/local/writereview?placeid=' . rawurlencode($pid)
        : 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode($site['location']['mapQuery']);
}
/** Form field helper. $o: required, ph (i18n key), ac (autocomplete), im (inputmode), min, max, step, options [value => i18n-key|label], rows, value */
function field(string $name, string $labelKey, string $type = 'text', array $o = []): string {
    $id = 'f-' . ($o['form'] ?? 'x') . '-' . $name;
    $req = !empty($o['required']);
    $attrs = ' id="' . e($id) . '" name="' . e($name) . '"' . ($req ? ' required' : '');
    foreach (['ac' => 'autocomplete', 'im' => 'inputmode', 'min' => 'min', 'max' => 'max', 'step' => 'step', 'pattern' => 'pattern', 'maxlength' => 'maxlength'] as $k => $a) {
        if (isset($o[$k])) $attrs .= ' ' . $a . '="' . e((string) $o[$k]) . '"';
    }
    if (isset($o['value'])) $attrs .= ' value="' . e((string) $o['value']) . '"';
    if (isset($o['ph'])) $attrs .= ' ' . ta('placeholder', $o['ph']);
    $h = '<label class="field' . (isset($o['class']) ? ' ' . $o['class'] : '') . '" for="' . e($id) . '"><span class="field__l" ' . ia($labelKey) . '>' . t($labelKey) . ($req ? '<i aria-hidden="true">*</i>' : '') . '</span>';
    if ($type === 'select') {
        $h .= '<select' . $attrs . '>';
        foreach ($o['options'] ?? [] as $val => $lab) {
            $isKey = str_contains((string) $lab, '.') && isset($GLOBALS['I18N']['en'][$lab]);
            $sel = (isset($o['value']) && (string) $o['value'] === (string) $val) ? ' selected' : '';
            $h .= '<option value="' . e((string) $val) . '"' . $sel . ($isKey ? ' ' . ia($lab) : '') . '>' . ($isKey ? t($lab) : e((string) $lab)) . '</option>';
        }
        $h .= '</select>';
    } elseif ($type === 'textarea') {
        $h .= '<textarea' . $attrs . ' rows="' . (int) ($o['rows'] ?? 3) . '"></textarea>';
    } else {
        $h .= '<input type="' . e($type) . '"' . $attrs . '>';
    }
    return $h . '<span class="field__e" aria-live="polite"></span></label>';
}
/** Honeypot + time-trap fields (bots fill the first, submit the second too fast). */
function spam_fields(): string {
    return '<div class="hp" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div><input type="hidden" name="ts" value="">';
}

function json_out(array $data, int $code = 200): never {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
