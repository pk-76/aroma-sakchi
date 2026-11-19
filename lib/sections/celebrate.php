<?php /* CELEBRATIONS & PARTIES — enquiry form → WhatsApp + email, gift voucher enquiry, optional Birthday Wall */ ?>
<section id="celebrate" class="section celebrate" aria-labelledby="celebrate-title" data-section-title="Birthday & Party Bookings — Aroma Multicuisine, Jamshedpur">
  <div class="container celebrate__grid">
    <div class="celebrate__intro">
      <p class="eyebrow" data-reveal <?= ia('cel.eyebrow') ?>><?= t('cel.eyebrow') ?></p>
      <h2 class="h2" id="celebrate-title" data-split <?= ia('cel.title') ?>><?= t('cel.title') ?></h2>
      <p class="lede" data-reveal <?= ia('cel.lede') ?>><?= t('cel.lede') ?></p>
      <ul class="occasions" data-reveal-stagger>
        <li><svg class="ic"><use href="#i-saffron"/></svg><span <?= ia('cel.o1') ?>><?= t('cel.o1') ?></span></li>
        <li><svg class="ic"><use href="#i-flame"/></svg><span <?= ia('cel.o2') ?>><?= t('cel.o2') ?></span></li>
        <li><svg class="ic"><use href="#i-anise"/></svg><span <?= ia('cel.o3') ?>><?= t('cel.o3') ?></span></li>
        <li><svg class="ic"><use href="#i-leaf"/></svg><span <?= ia('cel.o4') ?>><?= t('cel.o4') ?></span></li>
      </ul>
      <figure class="arch arch--wide" data-mask-reveal><?= pic('cake-cutting', ['sizes' => '(min-width:1024px) 40vw, 90vw']) ?><span class="arch__frame"></span></figure>
    </div>

    <div class="celebrate__form" data-form-home="celebrate">
      <form class="form card" data-form="celebrate" novalidate autocomplete="on">
        <h3 class="h3" <?= ia('cel.formTitle') ?>><?= t('cel.formTitle') ?></h3>
        <div class="form__grid">
          <?= field('name', 'f.name', 'text', ['required' => true, 'ac' => 'name', 'form' => 'cel']) ?>
          <?= field('phone', 'f.phone', 'tel', ['required' => true, 'ac' => 'tel', 'im' => 'tel', 'ph' => 'f.phonePh', 'form' => 'cel']) ?>
          <?= field('occasion', 'f.occasion', 'select', ['required' => true, 'form' => 'cel', 'options' => ['Birthday' => 'f.occ1', 'Anniversary' => 'f.occ2', 'Office group' => 'f.occ3', 'Kitty party' => 'f.occ4', 'Other' => 'f.occ5']]) ?>
          <?= field('date', 'f.date', 'date', ['required' => true, 'form' => 'cel', 'class' => 'js-date']) ?>
          <?= field('guests', 'f.guests', 'number', ['required' => true, 'min' => 2, 'max' => 200, 'im' => 'numeric', 'form' => 'cel', 'value' => 10]) ?>
          <?= field('ratio', 'f.ratio', 'select', ['form' => 'cel', 'options' => ['Not sure yet' => 'f.ratio0', 'All veg' => 'f.ratio1', 'Mostly veg' => 'f.ratio2', '50-50 veg / non-veg' => 'f.ratio3', 'Mostly non-veg' => 'f.ratio4', 'All non-veg' => 'f.ratio5']]) ?>
          <?= field('budget', 'f.budget', 'text', ['ph' => 'f.budgetPh', 'form' => 'cel', 'maxlength' => 60, 'class' => 'field--wide']) ?>
          <?= field('notes', 'f.notes', 'textarea', ['rows' => 2, 'form' => 'cel', 'class' => 'field--wide', 'maxlength' => 400]) ?>
        </div>
        <?= spam_fields() ?>
        <input type="hidden" name="kind" value="celebration">
        <div class="form__foot">
          <button class="btn btn--saffron btn--lg" type="submit" data-track="celebration_enquiry"><svg class="ic"><use href="#u-wa"/></svg><span <?= ia('f.send') ?>><?= t('f.send') ?></span></button>
          <p class="fineprint" <?= ia('f.waNote') ?>><?= t('f.waNote') ?></p>
        </div>
        <div class="form__status" role="status" aria-live="polite"></div>
      </form>
      <button class="btn btn--saffron btn--lg celebrate__open" type="button" data-sheet-open="celebrate"><svg class="ic"><use href="#u-cal"/></svg><span <?= ia('cel.open') ?>><?= t('cel.open') ?></span></button>

      <?php if ($T['giftVoucher']): ?>
      <div class="voucher card">
        <svg class="ic voucher__ic"><use href="#u-gift"/></svg>
        <div>
          <h3 class="voucher__t" <?= ia('gift.title') ?>><?= t('gift.title') ?></h3>
          <p class="fineprint" <?= ia('gift.text') ?>><?= t('gift.text') ?></p>
        </div>
        <a class="btn btn--ghost btn--sm" href="#" data-wa-msg="gift" data-track="gift_voucher_enquiry"><span <?= ia('gift.cta') ?>><?= t('gift.cta') ?></span></a>
      </div>
      <?php endif; ?>
    </div>
  </div>

  <?php if ($T['birthdayWall']): ?>
  <div class="container birthwall">
    <h3 class="h3" <?= ia('wall.title') ?>><?= t('wall.title') ?></h3>
    <div class="birthwall__grid">
      <?php foreach ($IMG as $id => $m): if (in_array('celebrations', $m['groups'], true)): ?>
      <figure class="arch arch--sm"><?= pic($id, ['sizes' => '(min-width:1024px) 22vw, 45vw']) ?><span class="arch__frame"></span></figure>
      <?php endif; endforeach; ?>
    </div>
    <p class="fineprint" <?= ia('wall.note') ?>><?= t('wall.note') ?></p>
  </div>
  <?php endif; ?>
</section>
