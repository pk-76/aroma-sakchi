<?php /* TRUST STRIP */
$items = [
    ['i-star-mark', 'trust.rating'], ['i-saffron', 'trust.reviews'], ['i-leaf', 'trust.diet'], ['i-flame', 'trust.family'], ['i-anise', 'trust.place'],
];
?>
<section class="trust" aria-label="Why guests choose Aroma">
  <div class="trust__track" data-marquee>
    <?php for ($r = 0; $r < 2; $r++): ?>
    <ul class="trust__list" <?= $r ? 'aria-hidden="true"' : '' ?>>
      <li><svg class="ic"><use href="#u-star"/></svg><span><b>4.6★</b> <span <?= $r ? '' : ia('trust.rating') ?>><?= t('trust.rating') ?></span></span></li>
      <li><svg class="ic"><use href="#i-saffron"/></svg><span><b>1,000+</b> <span <?= $r ? '' : ia('trust.reviews') ?>><?= t('trust.reviews') ?></span></span></li>
      <li><svg class="ic"><use href="#i-leaf"/></svg><span <?= $r ? '' : ia('trust.diet') ?>><?= t('trust.diet') ?></span></li>
      <li><svg class="ic"><use href="#i-flame"/></svg><span <?= $r ? '' : ia('trust.family') ?>><?= t('trust.family') ?></span></li>
      <li><svg class="ic"><use href="#u-pin"/></svg><span <?= $r ? '' : ia('trust.place') ?>><?= t('trust.place') ?></span></li>
    </ul>
    <?php endfor; ?>
  </div>
</section>
