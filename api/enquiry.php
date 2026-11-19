<?php
/**
 * POST /api/enquiry.php — reservations, celebration enquiries and private feedback.
 * Spam defence: same-origin check · honeypot field · minimum-fill-time trap · per-IP rate limit · strict validation.
 * Delivery: email to OWNER_EMAIL (.env) + append-only log in /data (not web-readable). The browser ALSO offers the
 * pre-filled WhatsApp message, so no lead is lost if mail() is not configured on the host.
 */
declare(strict_types=1);
require __DIR__ . '/_guard.php';
guard_post();
$in = read_input();

// bots: honeypot filled or form submitted impossibly fast → quietly "succeed"
$ts = (int) ($in['ts'] ?? 0);
if (clean($in['website'] ?? '', 50) !== '' || ($ts > 0 && (microtime(true) * 1000 - $ts) < 1500)) {
    json_out(['ok' => true, 'emailed' => false]);
}

$kind = clean($in['kind'] ?? '', 20);
if (!in_array($kind, ['reservation', 'celebration', 'feedback'], true)) json_out(['ok' => false, 'error' => 'Invalid request'], 422);

$limit = $kind === 'feedback' ? [4, 3600] : [6, 900];
if (!rate_limit('enquiry-' . $kind, $limit[0], $limit[1]) || !rate_limit('enquiry-all', 30, 3600)) {
    json_out(['ok' => false, 'error' => 'Too many requests — please try again in a little while, or message us on WhatsApp.'], 429);
}

$name  = clean($in['name'] ?? '', 80);
$phone = preg_replace('/\D/', '', clean($in['phone'] ?? '', 20)) ?? '';
$phone = substr($phone, -10);
$notes = clean($in['notes'] ?? ($in['message'] ?? ''), 800);

if ($kind !== 'feedback') {
    if ($name === '' || !preg_match('/^[6-9]\d{9}$/', $phone)) json_out(['ok' => false, 'error' => 'Please check your name and mobile number.'], 422);
    $date = clean($in['date'] ?? '', 10);
    $d = DateTime::createFromFormat('Y-m-d', $date, new DateTimeZone('Asia/Kolkata'));
    $today = new DateTime('today', new DateTimeZone('Asia/Kolkata'));
    if (!$d || $d->format('Y-m-d') !== $date || $d < $today || $d > (clone $today)->modify('+1 year')) json_out(['ok' => false, 'error' => 'Please pick a valid date.'], 422);
}

$fields = match ($kind) {
    'reservation' => ['Name' => $name, 'Phone' => $phone, 'Date' => $in['date'] ?? '', 'Time' => $in['time'] ?? '', 'Guests' => $in['guests'] ?? '', 'Preference' => $in['pref'] ?? '', 'Notes' => $notes],
    'celebration' => ['Name' => $name, 'Phone' => $phone, 'Occasion' => $in['occasion'] ?? '', 'Date' => $in['date'] ?? '', 'Guests' => $in['guests'] ?? '', 'Veg/Non-veg' => $in['ratio'] ?? '', 'Budget' => $in['budget'] ?? '', 'Notes' => $notes],
    default       => ['Rating' => (int) ($in['rating'] ?? 0) . '/5', 'Message' => $notes, 'Name' => $name, 'Phone' => $phone],
};
$fields = array_map(fn($v) => clean($v, 400), $fields);
if ($kind === 'feedback' && ((int) ($in['rating'] ?? 0) < 1 || (int) ($in['rating'] ?? 0) > 5)) json_out(['ok' => false, 'error' => 'Invalid rating'], 422);

$subject = match ($kind) {
    'reservation' => 'Table request — ' . $name . ' (' . $fields['Guests'] . ' guests, ' . $fields['Date'] . ' ' . $fields['Time'] . ')',
    'celebration' => 'Celebration enquiry — ' . $name . ' (' . $fields['Occasion'] . ', ' . $fields['Guests'] . ' guests)',
    default       => 'PRIVATE feedback — ' . $fields['Rating'],
};
$body = $subject . "\n" . str_repeat('-', 40) . "\n";
foreach ($fields as $k => $v) if ($v !== '') $body .= str_pad($k, 12) . ': ' . $v . "\n";
$body .= "\nReceived " . date('D, d M Y H:i') . " IST via the website.\nReply on WhatsApp: https://wa.me/91" . $phone . "\n";

append_log('enquiries', ['kind' => $kind] + $fields);
$emailed = mail_owner($subject, $body);
json_out(['ok' => true, 'emailed' => $emailed]);
