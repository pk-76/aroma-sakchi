<?php /* FIND US — map, landmark directions, hours table (from site.json) */
$dayShort = ['mon' => 'Monday', 'tue' => 'Tuesday', 'wed' => 'Wednesday', 'thu' => 'Thursday', 'fri' => 'Friday', 'sat' => 'Saturday', 'sun' => 'Sunday'];
$mapSrc = 'https://www.google.com/maps?q=' . rawurlencode($LOC['mapQuery']) . '&output=embed';
?>
<section id="visit" class="section visit" aria-labelledby="visit-title" data-section-title="Find Us — 3rd Floor, Basant Central, Sakchi, Jamshedpur | Aroma Multicuisine">
  <div class="container visit__grid">
    <div class="visit__info">
      <p class="eyebrow" data-reveal <?= ia('visit.eyebrow') ?>><?= t('visit.eyebrow') ?></p>
      <h2 class="h2" id="visit-title" data-split <?= ia('visit.title') ?>><?= t('visit.title') ?></h2>
      <address class="visit__addr" data-reveal>
        <?php foreach ($LOC['addressLines'] as $l): ?><span><?= e($l) ?></span><?php endforeach; ?>
      </address>
      <p class="visit__landmark" data-reveal><svg class="ic"><use href="#u-pin"/></svg><span <?= ia('visit.landmark') ?>><?= t('visit.landmark') ?></span></p>
      <?php if (!empty($LOC['parking'])): ?><p class="visit__landmark" data-reveal><svg class="ic"><use href="#i-leaf"/></svg><span><?= e($LOC['parking']) ?></span></p><?php endif; ?>

      <div class="visit__ctas" data-reveal>
        <a class="btn btn--saffron" href="<?= e(directions_url($SITE)) ?>" target="_blank" rel="noopener" data-track="directions_click"><svg class="ic"><use href="#u-pin"/></svg><span <?= ia('visit.directions') ?>><?= t('visit.directions') ?></span></a>
        <a class="btn btn--ghost" href="tel:<?= e($C['phoneTel']) ?>" data-track="call_click"><svg class="ic"><use href="#u-phone"/></svg><?= e($C['phoneDisplay']) ?></a>
        <a class="btn btn--ghost" href="<?= e(wa_link($SITE, 'Hello Aroma, I have a question.')) ?>" target="_blank" rel="noopener" data-track="whatsapp_click"><svg class="ic"><use href="#u-wa"/></svg>WhatsApp</a>
      </div>

      <table class="hours" data-reveal>
        <caption class="sr-only" <?= ia('visit.hours') ?>><?= t('visit.hours') ?></caption>
        <tbody>
        <?php foreach ($dayShort as $k => $name): $d = $SITE['hours']['days'][$k] ?? null; ?>
          <tr data-day="<?= $k ?>"><th scope="row" <?= ia('day.' . $k) ?>><?= t('day.' . $k) ?></th>
            <td><?= $d ? e(fmt12($d['open'])) . ' – ' . e(fmt12($d['close'])) : '<span ' . ia('visit.closed') . '>' . t('visit.closed') . '</span>' ?></td></tr>
        <?php endforeach; ?>
        </tbody>
      </table>
      <p class="busy busy--inline" data-reveal><svg class="ic"><use href="#i-flame"/></svg><span<?= hi($SITE['hours']['busyNote']) ?>><?= e(L($SITE['hours']['busyNote'])) ?></span></p>
    </div>

    <div class="visit__map" data-mask-reveal>
      <iframe title="Map: Aroma Multicuisine, Basant Central, Sakchi" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
              src="<?= e($mapSrc) ?>" allowfullscreen></iframe>
      <span class="arch__frame arch__frame--rect"></span>
    </div>
  </div>
</section>
