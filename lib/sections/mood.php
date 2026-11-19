<?php /* MOOD-TO-MEAL — suggested combos built from real dish names. Works offline; an optional AI layer personalises it. */ ?>
<section id="mood" class="section mood" aria-labelledby="mood-title" data-section-title="Mood-to-Meal — what should we eat? | Aroma Multicuisine Sakchi">
  <div class="container mood__grid">
    <header class="mood__head">
      <p class="eyebrow" data-reveal><svg class="ic"><use href="#u-sparkle"/></svg> <span <?= ia('mood.eyebrow') ?>><?= t('mood.eyebrow') ?></span></p>
      <h2 class="h2" id="mood-title" data-split <?= ia('mood.title') ?>><?= t('mood.title') ?></h2>
      <p class="lede" data-reveal <?= ia('mood.lede') ?>><?= t('mood.lede') ?></p>
      <div class="moods" role="radiogroup" aria-label="Choose your mood" data-moods>
        <?php foreach ($SITE['moods'] as $m): ?>
        <button type="button" class="mood-chip" role="radio" aria-checked="false" data-mood="<?= e($m['id']) ?>">
          <svg class="ic"><use href="#i-<?= e($m['icon']) ?>"/></svg><span<?= hi($m['label']) ?>><?= e(L($m['label'])) ?></span>
        </button>
        <?php endforeach; ?>
      </div>
    </header>
    <div class="mood__result" data-mood-result aria-live="polite">
      <div class="mood__empty">
        <svg class="ic"><use href="#i-handi"/></svg>
        <p <?= ia('mood.empty') ?>><?= t('mood.empty') ?></p>
      </div>
    </div>
  </div>
</section>
