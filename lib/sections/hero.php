<?php /* HERO — desktop: cinematic Ken Burns photo. Mobile: vertical-snap "stories" (ambience → biryani → kebabs → celebrations) */ ?>
<section id="top" class="hero" data-hero aria-labelledby="hero-title">
  <div class="hero__slides">

    <!-- Story 1 / desktop hero -->
    <div class="slide slide--main" data-story>
      <div class="hero__media" data-parallax-hero><?= pic('hall', ['wrap' => 'hero__pic', 'class' => 'kenburns', 'eager' => true, 'sizes' => '100vw']) ?></div>
      <canvas class="hero__smoke" data-smoke aria-hidden="true"></canvas>
      <div class="hero__shade" aria-hidden="true"></div>
      <div class="hero__grain" aria-hidden="true"></div>
      <div class="hero__content">
        <p class="eyebrow"><span <?= ia('hero.eyebrow') ?>><?= t('hero.eyebrow') ?></span> <span class="devanagari" lang="hi">· स्वाद का सफ़र</span></p>
        <h1 class="hero__title" id="hero-title" data-split <?= ia('hero.title') ?>><?= t('hero.title') ?></h1>
        <p class="hero__lede" <?= ia('hero.lede') ?>><?= t('hero.lede') ?></p>
        <div class="hero__badges">
          <a class="badge badge--rating" href="#reviews">
            <b data-count="<?= (float) $SITE['rating']['value'] ?>" data-decimals="1"><?= number_format((float) $SITE['rating']['value'], 1) ?></b><svg class="ic ic--star" aria-hidden="true"><use href="#u-star"/></svg>
            <span class="badge__dot" aria-hidden="true">·</span>
            <b data-count="<?= (int) $SITE['rating']['count'] ?>" data-suffix="+" data-commas><?= e($SITE['rating']['countLabel']) ?></b>
            <span <?= ia('hero.googleReviews') ?>><?= t('hero.googleReviews') ?></span>
          </a>
          <span class="badge badge--open" data-open-badge role="status"><i class="pulse" aria-hidden="true"></i><span data-open-text <?= ia('hero.openDaily') ?>><?= t('hero.openDaily') ?></span></span>
        </div>
        <div class="hero__ctas">
          <a class="btn btn--saffron btn--lg" href="#reserve" data-sheet-open="reserve" data-track="reserve_click" data-magnetic><span <?= ia('cta.reserve') ?>><?= t('cta.reserve') ?></span><svg class="ic"><use href="#i-arrow"/></svg></a>
          <a class="btn btn--ghost btn--lg" href="#menu" data-track="menu_view" data-open-swipe-menu-mobile data-magnetic><span <?= ia('cta.explore') ?>><?= t('cta.explore') ?></span></a>
        </div>
      </div>
      <a class="hero__scroll" href="#story" aria-label="Scroll to our story"><span <?= ia('hero.scroll') ?>><?= t('hero.scroll') ?></span><i aria-hidden="true"></i></a>
    </div>

    <!-- Story 2 · biryani (illustration — we never fake a dish photo) -->
    <div class="slide slide--story slide--biryani" data-story>
      <div class="story__bg" aria-hidden="true"><svg class="story__art"><use href="#i-handi"/></svg><span class="story__steam"><i></i><i></i><i></i></span></div>
      <div class="story__txt">
        <span class="story__n">02 / 04</span>
        <h2 <?= ia('story2.t') ?>><?= t('story2.t') ?></h2>
        <p <?= ia('story2.p') ?>><?= t('story2.p') ?></p>
        <a class="btn btn--saffron" href="#dishes" <?= ia('cta.seeDishes') ?>><?= t('cta.seeDishes') ?></a>
      </div>
    </div>

    <!-- Story 3 · kebabs (real photo) -->
    <div class="slide slide--story slide--kebab" data-story>
      <div class="story__bg"><?= pic('kebab', ['wrap' => 'story__pic', 'sizes' => '100vw']) ?></div>
      <div class="story__txt">
        <span class="story__n">03 / 04</span>
        <h2 <?= ia('story3.t') ?>><?= t('story3.t') ?></h2>
        <p <?= ia('story3.p') ?>><?= t('story3.p') ?></p>
        <a class="btn btn--saffron" href="#menu" data-open-swipe-menu-mobile <?= ia('cta.explore') ?>><?= t('cta.explore') ?></a>
      </div>
    </div>

    <!-- Story 4 · celebrations (real photo) -->
    <div class="slide slide--story slide--celebrate" data-story>
      <div class="story__bg"><?= pic('balloons', ['wrap' => 'story__pic', 'sizes' => '100vw']) ?></div>
      <div class="story__txt">
        <span class="story__n">04 / 04</span>
        <h2 <?= ia('story4.t') ?>><?= t('story4.t') ?></h2>
        <p <?= ia('story4.p') ?>><?= t('story4.p') ?></p>
        <a class="btn btn--saffron" href="#celebrate" data-sheet-open="celebrate" <?= ia('cta.planParty') ?>><?= t('cta.planParty') ?></a>
      </div>
    </div>
  </div>
  <div class="story-dots" data-story-dots aria-hidden="true"><i class="is-on"></i><i></i><i></i><i></i></div>
</section>
