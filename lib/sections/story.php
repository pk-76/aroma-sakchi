<?php /* OUR STORY */ ?>
<section id="story" class="section story" aria-labelledby="story-title" data-section-title="Our Story — Aroma Multicuisine, Sakchi">
  <div class="container story__grid">
    <div class="story__col story__col--text">
      <p class="eyebrow" data-reveal><span <?= ia('story.eyebrow') ?>><?= t('story.eyebrow') ?></span> <span class="devanagari" lang="hi">· स्वाद</span></p>
      <h2 class="h2" id="story-title" data-split <?= ia('story.title') ?>><?= t('story.title') ?></h2>
      <p class="lede" data-reveal <?= ia('story.p1') ?>><?= t('story.p1') ?></p>
      <p data-reveal <?= ia('story.p2') ?>><?= t('story.p2') ?></p>
      <ul class="facts" data-reveal-stagger>
        <li><svg class="ic"><use href="#i-leaf"/></svg><b <?= ia('story.f1t') ?>><?= t('story.f1t') ?></b><span <?= ia('story.f1d') ?>><?= t('story.f1d') ?></span></li>
        <li><svg class="ic"><use href="#i-flame"/></svg><b <?= ia('story.f2t') ?>><?= t('story.f2t') ?></b><span <?= ia('story.f2d') ?>><?= t('story.f2d') ?></span></li>
        <li><svg class="ic"><use href="#i-saffron"/></svg><b <?= ia('story.f3t') ?>><?= t('story.f3t') ?></b><span <?= ia('story.f3d') ?>><?= t('story.f3d') ?></span></li>
      </ul>
      <div class="story__price" data-reveal>
        <span <?= ia('story.price') ?>><?= t('story.price') ?></span> <b><?= e($SITE['price']['label']) ?></b>
      </div>
    </div>
    <div class="story__col story__col--art" aria-hidden="false">
      <figure class="arch arch--lg" data-mask-reveal><?= pic('entrance', ['sizes' => '(min-width:1024px) 34vw, 80vw']) ?><span class="arch__frame"></span></figure>
      <figure class="arch arch--sm arch--b" data-mask-reveal data-parallax="-40"><?= pic('booths', ['sizes' => '(min-width:1024px) 20vw, 40vw']) ?><span class="arch__frame"></span></figure>
      <figure class="arch arch--sm arch--c" data-mask-reveal data-parallax="30"><?= pic('sculpture-gold', ['sizes' => '(min-width:1024px) 18vw, 36vw']) ?><span class="arch__frame"></span></figure>
      <svg class="story__spice story__spice--a" aria-hidden="true"><use href="#i-anise"/></svg>
      <svg class="story__spice story__spice--b" aria-hidden="true"><use href="#i-cardamom"/></svg>
    </div>
  </div>
</section>
