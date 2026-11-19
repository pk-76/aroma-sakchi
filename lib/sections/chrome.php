<?php /* preloader · announcement banners · nav (desktop) / top bar (mobile) · bottom tab bar (mobile) */
$activeOffers = array_values(array_filter($SITE['offers'], function ($o) {
    return empty($o['until']) || strtotime($o['until'] . ' 23:59:59 +0530') >= time();
}));
$festive = $SITE['festive']['active'] ?? 'none';
?>
<div class="preloader" data-preloader aria-hidden="true">
  <div class="preloader__inner">
    <img class="preloader__mark" src="<?= u('assets/img/logo.webp') ?>" width="96" height="96" alt="">
    <span class="preloader__steam" aria-hidden="true"><i></i><i></i><i></i></span>
    <span class="preloader__word">Aroma</span>
    <span class="preloader__sub">Multicuisine</span>
  </div>
</div>

<?php if ($T['offersBanner'] && ($activeOffers || ($festive !== 'none' && isset($SITE['festive']['themes'][$festive])))): ?>
<div class="banner" data-banner role="region" aria-label="Announcements">
  <?php if ($festive !== 'none' && isset($SITE['festive']['themes'][$festive])): $fb = $SITE['festive']['themes'][$festive]['banner']; ?>
    <p<?= hi($fb) ?>><?= e(L($fb)) ?></p>
  <?php endif; foreach ($activeOffers as $o): ?>
    <p<?= hi($o['text']) ?>><svg class="ic"><use href="#i-saffron"/></svg> <?= e(L($o['text'])) ?></p>
  <?php endforeach; ?>
  <button class="banner__x" type="button" data-banner-close aria-label="Dismiss"><svg class="ic"><use href="#u-close"/></svg></button>
</div>
<?php endif; ?>

<header class="nav" data-nav>
  <a class="nav__brand" href="#top">
    <img class="nav__mark" src="<?= u('assets/img/logo-96.webp') ?>" width="44" height="44" alt="">
    <span class="nav__name">Aroma <small>Multicuisine</small></span>
  </a>
  <nav class="nav__links" aria-label="Primary">
    <a href="#story" <?= ia('nav.story') ?>><?= t('nav.story') ?></a>
    <a href="#dishes" <?= ia('nav.dishes') ?>><?= t('nav.dishes') ?></a>
    <a href="#menu" <?= ia('nav.menu') ?>><?= t('nav.menu') ?></a>
    <a href="#celebrate" <?= ia('nav.celebrate') ?>><?= t('nav.celebrate') ?></a>
    <a href="#gallery" <?= ia('nav.gallery') ?>><?= t('nav.gallery') ?></a>
    <a href="#reviews" <?= ia('nav.reviews') ?>><?= t('nav.reviews') ?></a>
    <a href="#visit" <?= ia('nav.visit') ?>><?= t('nav.visit') ?></a>
  </nav>
  <div class="nav__tools">
    <button class="icon-btn" type="button" data-lang-toggle aria-label="Language: English / हिन्दी"><svg class="ic"><use href="#u-lang"/></svg><span class="icon-btn__t" data-lang-label>हिं</span></button>
    <button class="icon-btn" type="button" data-theme-toggle <?= ta('aria-label', 'a11y.theme') ?>><svg class="ic ic--moon"><use href="#u-moon"/></svg><svg class="ic ic--sun"><use href="#u-sun"/></svg></button>
    <a class="btn btn--sm btn--saffron nav__cta" href="#reserve" data-sheet-open="reserve" data-track="reserve_click" data-magnetic><span <?= ia('cta.reserve') ?>><?= t('cta.reserve') ?></span></a>
  </div>
</header>

<nav class="tabbar" aria-label="App navigation" data-tabbar>
  <a class="tabbar__i is-active" href="#top" data-tab="top"><svg class="ic"><use href="#u-home"/></svg><span <?= ia('tab.home') ?>><?= t('tab.home') ?></span></a>
  <a class="tabbar__i" href="#menu" data-tab="menu" data-open-swipe-menu><svg class="ic"><use href="#u-menu"/></svg><span <?= ia('tab.menu') ?>><?= t('tab.menu') ?></span></a>
  <a class="tabbar__i tabbar__i--book" href="#reserve" data-tab="reserve" data-sheet-open="reserve" data-track="reserve_click"><span class="tabbar__book"><svg class="ic"><use href="#u-cal"/></svg></span><span <?= ia('tab.book') ?>><?= t('tab.book') ?></span></a>
  <a class="tabbar__i" href="#gallery" data-tab="gallery"><svg class="ic"><use href="#u-img"/></svg><span <?= ia('tab.gallery') ?>><?= t('tab.gallery') ?></span></a>
  <a class="tabbar__i" href="tel:<?= e($C['phoneTel']) ?>" data-track="call_click"><svg class="ic"><use href="#u-phone"/></svg><span <?= ia('tab.call') ?>><?= t('tab.call') ?></span></a>
</nav>
