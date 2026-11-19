<?php /* FLOATING UI & OVERLAYS: WhatsApp, speed-dial FAB, Ask Aroma, bottom sheet, lightbox, swipe menu, toast, install */ ?>

<!-- WhatsApp (desktop) -->
<a class="wa-fab" href="<?= e(wa_link($SITE, 'Hello Aroma!')) ?>" target="_blank" rel="noopener" aria-label="Chat on WhatsApp" data-track="whatsapp_click"><svg class="ic"><use href="#u-wa"/></svg></a>

<!-- Contact speed-dial (mobile): one tap → WhatsApp / Call / Directions -->
<div class="fab" data-fab>
  <div class="fab__menu" id="fabMenu">
    <a class="fab__item" href="<?= e(wa_link($SITE, 'Hello Aroma!')) ?>" target="_blank" rel="noopener" data-track="whatsapp_click"><span>WhatsApp</span><svg class="ic"><use href="#u-wa"/></svg></a>
    <a class="fab__item" href="tel:<?= e($C['phoneTel']) ?>" data-track="call_click"><span <?= ia('tab.call') ?>><?= t('tab.call') ?></span><svg class="ic"><use href="#u-phone"/></svg></a>
    <a class="fab__item" href="<?= e(directions_url($SITE)) ?>" target="_blank" rel="noopener" data-track="directions_click"><span <?= ia('fab.directions') ?>><?= t('fab.directions') ?></span><svg class="ic"><use href="#u-pin"/></svg></a>
  </div>
  <button class="fab__btn" type="button" aria-expanded="false" aria-controls="fabMenu" aria-label="Contact options"><svg class="ic ic--open"><use href="#u-plus"/></svg><svg class="ic ic--close"><use href="#u-close"/></svg></button>
</div>

<?php if ($T['askAroma']): ?>
<!-- Ask Aroma — AI concierge -->
<button class="ask-fab" type="button" data-ask-open aria-haspopup="dialog" aria-controls="askPanel"><svg class="ic"><use href="#u-sparkle"/></svg><span <?= ia('ask.fab') ?>><?= t('ask.fab') ?></span></button>
<section class="ask" id="askPanel" role="dialog" aria-modal="false" aria-labelledby="ask-title" hidden data-ask>
  <header class="ask__head">
    <img class="ic--mark" src="<?= u('assets/img/logo-96.webp') ?>" width="38" height="38" alt="" loading="lazy">
    <div><h2 id="ask-title" <?= ia('ask.title') ?>><?= t('ask.title') ?></h2><p <?= ia('ask.sub') ?>><?= t('ask.sub') ?></p></div>
    <button class="icon-btn" type="button" data-ask-close aria-label="Close"><svg class="ic"><use href="#u-close"/></svg></button>
  </header>
  <div class="ask__log" data-ask-log aria-live="polite"></div>
  <div class="ask__chips" data-ask-chips></div>
  <form class="ask__form" data-ask-form autocomplete="off">
    <input type="text" name="q" maxlength="300" <?= ta('placeholder', 'ask.ph') ?> <?= ta('aria-label', 'ask.ph') ?> required>
    <button class="icon-btn icon-btn--solid" type="submit" aria-label="Send"><svg class="ic"><use href="#u-send"/></svg></button>
  </form>
  <p class="ask__foot" <?= ia('ask.foot') ?>><?= t('ask.foot') ?></p>
</section>
<?php endif; ?>

<!-- Bottom sheet (mobile forms) -->
<div class="sheet" data-sheet hidden>
  <div class="sheet__backdrop" data-sheet-close></div>
  <div class="sheet__panel" role="dialog" aria-modal="true" aria-label="Form">
    <div class="sheet__grab" data-sheet-grab aria-hidden="true"></div>
    <button class="icon-btn sheet__x" type="button" data-sheet-close aria-label="Close"><svg class="ic"><use href="#u-close"/></svg></button>
    <div class="sheet__body" data-sheet-body></div>
  </div>
</div>

<!-- Lightbox: pinch / wheel zoom + pan (gallery & desktop menu pages) -->
<div class="lightbox" data-lightbox hidden role="dialog" aria-modal="true" aria-label="Image viewer">
  <div class="lightbox__top">
    <span class="lightbox__count" data-lb-count></span>
    <div class="lightbox__tools">
      <button class="icon-btn" type="button" data-lb-zoom-out aria-label="Zoom out"><svg class="ic"><use href="#u-minus"/></svg></button>
      <button class="icon-btn" type="button" data-lb-zoom-in aria-label="Zoom in"><svg class="ic"><use href="#u-plus"/></svg></button>
      <button class="icon-btn" type="button" data-lb-reset aria-label="Reset zoom"><svg class="ic"><use href="#u-zoom"/></svg></button>
      <button class="icon-btn" type="button" data-lb-close aria-label="Close"><svg class="ic"><use href="#u-close"/></svg></button>
    </div>
  </div>
  <div class="lightbox__stage" data-lb-stage><img data-lb-img alt="" draggable="false"></div>
  <button class="lightbox__nav lightbox__nav--prev icon-btn" type="button" data-lb-prev aria-label="Previous"><svg class="ic"><use href="#u-prev"/></svg></button>
  <button class="lightbox__nav lightbox__nav--next icon-btn" type="button" data-lb-next aria-label="Next"><svg class="ic"><use href="#u-next"/></svg></button>
  <p class="lightbox__cap" data-lb-cap></p>
</div>

<!-- Swipe Menu (mobile + QR table mode): full-screen stories -->
<div class="smenu" data-smenu hidden role="dialog" aria-modal="true" aria-label="Menu">
  <div class="smenu__bars" data-smenu-bars aria-hidden="true"></div>
  <header class="smenu__top">
    <span class="smenu__title" data-smenu-title></span>
    <span class="smenu__table" data-smenu-table hidden></span>
    <button class="icon-btn" type="button" data-smenu-close aria-label="Close menu"><svg class="ic"><use href="#u-close"/></svg></button>
  </header>
  <div class="smenu__stage" data-smenu-stage></div>
  <p class="smenu__hint" data-smenu-hint aria-hidden="true"><span <?= ia('smenu.hint') ?>><?= t('smenu.hint') ?></span></p>
  <div class="smenu__bottom">
    <div class="smenu__chips" data-smenu-chips role="tablist" aria-label="Menu categories"></div>
    <div class="smenu__actions">
      <button class="chip chip--solid" type="button" data-menu-pdf><svg class="ic"><use href="#u-download"/></svg><span <?= ia('menu.pdfShort') ?>><?= t('menu.pdfShort') ?></span></button>
      <a class="chip chip--solid" href="#" data-menu-share><svg class="ic"><use href="#u-wa"/></svg><span <?= ia('menu.shareShort') ?>><?= t('menu.shareShort') ?></span></a>
    </div>
  </div>
</div>

<div class="toast" data-toast role="status" aria-live="polite" hidden></div>

<?php if ($T['installPrompt']): ?>
<div class="install" data-install hidden>
  <img class="ic--mark" src="<?= u('assets/img/logo-96.webp') ?>" width="38" height="38" alt="" loading="lazy">
  <p data-install-text <?= ia('install.text') ?>><?= t('install.text') ?></p>
  <button class="btn btn--saffron btn--sm" type="button" data-install-go <?= ia('install.cta') ?>><?= t('install.cta') ?></button>
  <button class="icon-btn" type="button" data-install-x aria-label="Dismiss"><svg class="ic"><use href="#u-close"/></svg></button>
</div>
<?php endif; ?>

<div class="cursor" data-cursor aria-hidden="true"><i class="cursor__dot"></i><i class="cursor__ring"></i></div>
