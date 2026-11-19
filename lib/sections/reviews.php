<?php /* REVIEWS — live Google reviews (Places API, server-proxied) with an honest fallback + post-visit feedback (review management) */ ?>
<section id="reviews" class="section reviews" aria-labelledby="reviews-title" data-section-title="Guest Reviews — 4.6★ on Google | Aroma Multicuisine Sakchi">
  <div class="container">
    <header class="section__head section__head--split">
      <div>
        <p class="eyebrow" data-reveal <?= ia('rev.eyebrow') ?>><?= t('rev.eyebrow') ?></p>
        <h2 class="h2" id="reviews-title" data-split <?= ia('rev.title') ?>><?= t('rev.title') ?></h2>
      </div>
      <div class="rating-big" data-reveal>
        <b class="rating-big__n" data-count="<?= (float) $SITE['rating']['value'] ?>" data-decimals="1"><?= number_format((float) $SITE['rating']['value'], 1) ?></b>
        <div>
          <span class="stars" role="img" aria-label="4.6 out of 5 stars"><?php for ($i = 0; $i < 5; $i++): ?><svg class="ic"><use href="#u-star"/></svg><?php endfor; ?></span>
          <span class="rating-big__sub">4.6★ · <?= e($SITE['rating']['countLabel']) ?> <span <?= ia('hero.googleReviews') ?>><?= t('hero.googleReviews') ?></span></span>
        </div>
      </div>
    </header>

    <div class="themes" data-reveal-stagger>
      <p class="themes__t" <?= ia('rev.loved') ?>><?= t('rev.loved') ?></p>
      <ul>
        <?php foreach ($SITE['reviewThemes'] as $th): ?>
        <li><svg class="ic"><use href="#i-<?= e($th['icon']) ?>"/></svg><span data-en="<?= e($th['en']) ?>" data-hi="<?= e($th['hi']) ?>"><?= e($th['en']) ?></span></li>
        <?php endforeach; ?>
      </ul>
    </div>

    <div class="live-reviews" data-live-reviews data-endpoint="<?= e(u('api/reviews.php')) ?>" hidden>
      <div class="swiper reviews-swiper"><div class="swiper-wrapper" data-reviews-wrapper></div><div class="swiper-pagination"></div></div>
      <p class="fineprint" data-reviews-credit></p>
    </div>

    <div class="reviews__cta" data-reveal>
      <a class="btn btn--saffron" href="<?= e(review_url($SITE)) ?>" target="_blank" rel="noopener" data-track="google_review_click"><svg class="ic"><use href="#u-star"/></svg><span <?= ia('rev.write') ?>><?= t('rev.write') ?></span></a>
      <a class="btn btn--ghost" href="https://www.google.com/maps/search/?api=1&query=<?= rawurlencode($LOC['mapQuery']) ?>" target="_blank" rel="noopener"><span <?= ia('rev.read') ?>><?= t('rev.read') ?></span></a>
    </div>

    <!-- Post-visit feedback: unhappy → private to the owner; happy → invited to review on Google -->
    <div class="feedback card" data-feedback>
      <h3 class="h3" <?= ia('fb.title') ?>><?= t('fb.title') ?></h3>
      <p class="fineprint" <?= ia('fb.sub') ?>><?= t('fb.sub') ?></p>
      <form class="form" data-form="feedback" novalidate>
        <div class="rate" role="radiogroup" aria-label="Your rating" data-rate>
          <?php for ($i = 1; $i <= 5; $i++): ?><button type="button" role="radio" aria-checked="false" aria-label="<?= $i ?> star<?= $i > 1 ? 's' : '' ?>" data-v="<?= $i ?>"><svg class="ic"><use href="#u-star"/></svg></button><?php endfor; ?>
        </div>
        <input type="hidden" name="rating" value="">
        <div class="fb__more" data-fb-more hidden>
          <div class="form__grid">
            <?= field('message', 'fb.msg', 'textarea', ['rows' => 3, 'class' => 'field--wide', 'form' => 'fb', 'maxlength' => 800]) ?>
            <?= field('name', 'f.nameOpt', 'text', ['ac' => 'name', 'form' => 'fb']) ?>
            <?= field('phone', 'f.phoneOpt', 'tel', ['ac' => 'tel', 'im' => 'tel', 'form' => 'fb']) ?>
          </div>
          <?= spam_fields() ?>
          <input type="hidden" name="kind" value="feedback">
          <button class="btn btn--saffron" type="submit"><svg class="ic"><use href="#u-send"/></svg><span <?= ia('fb.send') ?>><?= t('fb.send') ?></span></button>
        </div>
        <div class="fb__happy" data-fb-happy hidden>
          <p <?= ia('fb.happy') ?>><?= t('fb.happy') ?></p>
          <a class="btn btn--saffron" href="<?= e(review_url($SITE)) ?>" target="_blank" rel="noopener" data-track="google_review_click"><svg class="ic"><use href="#u-star"/></svg><span <?= ia('rev.write') ?>><?= t('rev.write') ?></span></a>
        </div>
        <div class="form__status" role="status" aria-live="polite"></div>
      </form>
    </div>
  </div>
</section>
