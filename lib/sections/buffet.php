<?php /* BUFFET — hidden until the owner confirms details (toggles.buffet + site.json "buffet"). */
if (!$T['buffet']) return;
$bf = $SITE['buffet'];
?>
<section id="buffet" class="section buffet" aria-labelledby="buffet-title" data-section-title="Buffet — Aroma Multicuisine, Sakchi">
  <div class="container buffet__grid">
    <div>
      <p class="eyebrow" data-reveal <?= ia('buffet.eyebrow') ?>><?= t('buffet.eyebrow') ?></p>
      <h2 class="h2" id="buffet-title" data-split <?= ia('buffet.title') ?>><?= t('buffet.title') ?></h2>
      <dl class="buffet__facts" data-reveal>
        <?php if (!empty($bf['timings'])): ?><div><dt <?= ia('buffet.timings') ?>><?= t('buffet.timings') ?></dt><dd><?= e($bf['timings']) ?></dd></div><?php endif; ?>
        <?php if (!empty($bf['days'])): ?><div><dt <?= ia('buffet.days') ?>><?= t('buffet.days') ?></dt><dd><?= e($bf['days']) ?></dd></div><?php endif; ?>
        <?php if (!empty($bf['price'])): ?><div><dt <?= ia('buffet.price') ?>><?= t('buffet.price') ?></dt><dd><?= e($bf['price']) ?></dd></div><?php endif; ?>
      </dl>
      <a class="btn btn--saffron" href="#reserve" data-sheet-open="reserve" <?= ia('cta.reserve') ?>><?= t('cta.reserve') ?></a>
    </div>
    <figure class="arch arch--lg" data-mask-reveal><?= pic('counter', ['sizes' => '(min-width:1024px) 34vw, 80vw']) ?><span class="arch__frame"></span></figure>
  </div>
</section>
