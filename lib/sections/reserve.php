<?php /* RESERVE A TABLE — desktop: inline · mobile: bottom sheet (the <form> is re-parented by JS) */
// time slots every 30 min from opening to 30 min before closing (from site.json — one place to edit)
$slots = [];
$o = strtotime($SITE['hours']['default']['open']); $c = strtotime($SITE['hours']['default']['close']);
for ($t = $o; $t <= $c - 1800; $t += 1800) $slots[date('H:i', $t)] = date('g:i A', $t);
$guestOpts = [];
for ($g = 1; $g <= 12; $g++) $guestOpts[(string) $g] = $g === 1 ? '1 guest' : "$g guests";
$guestOpts['13+'] = '13+ (large group)';
?>
<section id="reserve" class="section reserve" aria-labelledby="reserve-title" data-section-title="Reserve a Table — Aroma Multicuisine, Sakchi, Jamshedpur">
  <div class="container reserve__grid">
    <div class="reserve__intro">
      <p class="eyebrow" data-reveal <?= ia('res.eyebrow') ?>><?= t('res.eyebrow') ?></p>
      <h2 class="h2" id="reserve-title" data-split <?= ia('res.title') ?>><?= t('res.title') ?></h2>
      <p class="lede" data-reveal <?= ia('res.lede') ?>><?= t('res.lede') ?></p>
      <div class="busy" data-reveal>
        <svg class="ic"><use href="#i-flame"/></svg>
        <p<?= hi($SITE['hours']['busyNote']) ?>><?= e(L($SITE['hours']['busyNote'])) ?></p>
      </div>
      <ul class="reserve__quick" data-reveal-stagger>
        <li><a href="tel:<?= e($C['phoneTel']) ?>" data-track="call_click"><svg class="ic"><use href="#u-phone"/></svg><?= e($C['phoneDisplay']) ?></a></li>
        <li><a href="<?= e(wa_link($SITE, 'Hello Aroma, I would like to book a table.')) ?>" target="_blank" rel="noopener" data-track="whatsapp_click"><svg class="ic"><use href="#u-wa"/></svg><span <?= ia('res.waDirect') ?>><?= t('res.waDirect') ?></span></a></li>
      </ul>
    </div>

    <div class="reserve__formwrap" data-form-home="reserve">
      <form class="form card" data-form="reserve" novalidate autocomplete="on">
        <h3 class="h3" <?= ia('res.formTitle') ?>><?= t('res.formTitle') ?></h3>
        <div class="form__grid">
          <?= field('name', 'f.name', 'text', ['required' => true, 'ac' => 'name', 'form' => 'res']) ?>
          <?= field('phone', 'f.phone', 'tel', ['required' => true, 'ac' => 'tel', 'im' => 'tel', 'ph' => 'f.phonePh', 'form' => 'res']) ?>
          <?= field('date', 'f.date', 'date', ['required' => true, 'form' => 'res', 'class' => 'js-date']) ?>
          <?= field('time', 'f.time', 'select', ['required' => true, 'form' => 'res', 'options' => $slots]) ?>
          <?= field('guests', 'f.guestsSel', 'select', ['required' => true, 'value' => '2', 'form' => 'res', 'options' => $guestOpts]) ?>
          <?= field('pref', 'f.pref', 'select', ['form' => 'res', 'options' => ['No preference' => 'f.pref0', 'Veg' => 'f.pref1', 'Non-veg' => 'f.pref2', 'Both veg and non-veg' => 'f.pref3']]) ?>
          <?= field('notes', 'f.notesRes', 'textarea', ['rows' => 2, 'form' => 'res', 'class' => 'field--wide', 'maxlength' => 300]) ?>
        </div>
        <?= spam_fields() ?>
        <input type="hidden" name="kind" value="reservation">
        <div class="form__foot">
          <button class="btn btn--saffron btn--lg" type="submit" data-track="reserve_submit"><svg class="ic"><use href="#u-wa"/></svg><span <?= ia('f.reserveSend') ?>><?= t('f.reserveSend') ?></span></button>
          <p class="fineprint" <?= ia('f.confirmNote') ?>><?= t('f.confirmNote') ?></p>
        </div>
        <div class="form__status" role="status" aria-live="polite"></div>
      </form>
      <button class="btn btn--saffron btn--lg reserve__open" type="button" data-sheet-open="reserve"><svg class="ic"><use href="#u-cal"/></svg><span <?= ia('cta.reserve') ?>><?= t('cta.reserve') ?></span></button>
    </div>
  </div>
</section>
