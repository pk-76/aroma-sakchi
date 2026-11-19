<?php /* CUISINES — 5 tiles; hover reveals a real photo where one genuinely matches, otherwise gold line-art */ ?>
<section id="cuisines" class="section cuisines" aria-labelledby="cuisines-title" data-section-title="Cuisines — North Indian, Mughlai, Chinese, Continental, Biryani & Kebabs | Aroma Sakchi">
  <div class="container">
    <header class="section__head">
      <p class="eyebrow" data-reveal <?= ia('cuisines.eyebrow') ?>><?= t('cuisines.eyebrow') ?></p>
      <h2 class="h2" id="cuisines-title" data-split <?= ia('cuisines.title') ?>><?= t('cuisines.title') ?></h2>
    </header>
    <div class="cuisine-grid" data-reveal-stagger>
      <?php foreach ($SITE['cuisines'] as $i => $c): ?>
      <article class="cuisine" tabindex="0">
        <?php if (!empty($c['photo'])): ?><div class="cuisine__photo" aria-hidden="false"><?= pic($c['photo'], ['sizes' => '(min-width:1024px) 20vw, 80vw']) ?></div><?php endif; ?>
        <div class="cuisine__veil"></div>
        <svg class="cuisine__icon" aria-hidden="true"><use href="#i-<?= e($c['icon']) ?>"/></svg>
        <span class="cuisine__no"><?= sprintf('%02d', $i + 1) ?></span>
        <div class="cuisine__body">
          <h3 data-hi="<?= e($c['hi']) ?>" data-en="<?= e($c['name']) ?>"><?= e($c['name']) ?></h3>
          <p<?= hi($c['line']) ?>><?= e(L($c['line'])) ?></p>
          <ul class="cuisine__picks"><?php foreach ($c['picks'] as $p): ?><li><?= e($p) ?></li><?php endforeach; ?></ul>
        </div>
      </article>
      <?php endforeach; ?>
    </div>
  </div>
</section>
