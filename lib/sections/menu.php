<?php /* THE MENU — desktop: 3D page-flip book · mobile: story-style swipe menu · plus an indexable text menu */
$pages = $MENU['pages'] ?? [];
$cats  = $MENU['categories'] ?? [];
$first = $pages[0]['file'] ?? null;
?>
<section id="menu" class="section menu" aria-labelledby="menu-title" data-section-title="The Menu — Aroma Multicuisine, Sakchi, Jamshedpur" data-menu-section>
  <div class="container">
    <header class="section__head section__head--split">
      <div>
        <p class="eyebrow" data-reveal <?= ia('menu.eyebrow') ?>><?= t('menu.eyebrow') ?></p>
        <h2 class="h2" id="menu-title" data-split <?= ia('menu.title') ?>><?= t('menu.title') ?></h2>
      </div>
      <p class="lede" data-reveal <?= ia('menu.lede') ?>><?= t('menu.lede') ?></p>
    </header>

    <!-- DESKTOP / TABLET: the Aroma Menu Book -->
    <div class="bookstage" data-bookstage>
      <div class="bookstage__scene">
        <ol class="booktabs" data-booktabs aria-label="Menu categories">
          <?php foreach ($cats as $c): ?>
          <li><button type="button" class="booktab" data-goto="<?= (int) $c['page'] ?>"<?= hi($c['label']) ?>><?= e(L($c['label'])) ?></button></li>
          <?php endforeach; ?>
        </ol>
        <div class="book" data-book aria-label="Aroma Multicuisine menu book" role="region" tabindex="0">
          <div class="book__loading"><img class="ic" src="<?= u('assets/img/logo-96.webp') ?>" width="48" height="48" alt="" loading="lazy"><span <?= ia('menu.loading') ?>><?= t('menu.loading') ?></span></div>
        </div>
        <div class="book__shadow" aria-hidden="true"></div>
      </div>
      <div class="bookbar" data-bookbar>
        <button class="icon-btn" type="button" data-book-prev aria-label="Previous page"><svg class="ic"><use href="#u-prev"/></svg></button>
        <span class="bookbar__count" data-book-count aria-live="polite">1 / 1</span>
        <button class="icon-btn" type="button" data-book-next aria-label="Next page"><svg class="ic"><use href="#u-next"/></svg></button>
        <span class="bookbar__sep"></span>
        <button class="icon-btn" type="button" data-sound-toggle aria-pressed="false" aria-label="Page-turn sound (off)"><svg class="ic ic--off"><use href="#u-mute"/></svg><svg class="ic ic--on"><use href="#u-sound"/></svg></button>
        <button class="icon-btn" type="button" data-book-zoom aria-label="Open page full-screen"><svg class="ic"><use href="#u-zoom"/></svg></button>
      </div>
      <p class="book__hint" aria-hidden="true"><span <?= ia('menu.hint') ?>><?= t('menu.hint') ?></span></p>
    </div>

    <!-- MOBILE: teaser that opens the full-screen swipe menu -->
    <div class="menu-teaser" data-menu-teaser>
      <button class="menu-teaser__card" type="button" data-open-swipe-menu>
        <?php if ($first): ?><img src="<?= e(u('assets/menu/' . $first)) ?>" alt="" loading="lazy" decoding="async" width="764" height="1020"><?php endif; ?>
        <span class="menu-teaser__cta"><svg class="ic"><use href="#u-menu"/></svg><span <?= ia('menu.openSwipe') ?>><?= t('menu.openSwipe') ?></span></span>
      </button>
      <div class="chips" role="list">
        <?php foreach ($cats as $c): ?><button class="chip" type="button" role="listitem" data-open-swipe-menu data-page="<?= (int) $c['page'] ?>"<?= hi($c['label']) ?>><?= e(L($c['label'])) ?></button><?php endforeach; ?>
      </div>
    </div>

    <div class="menu-actions" data-reveal>
      <button class="btn btn--saffron" type="button" data-menu-pdf data-track="menu_download"><svg class="ic"><use href="#u-download"/></svg><span <?= ia('menu.pdf') ?>><?= t('menu.pdf') ?></span></button>
      <a class="btn btn--ghost" href="#" data-menu-share data-track="menu_share_wa"><svg class="ic"><use href="#u-wa"/></svg><span <?= ia('menu.share') ?>><?= t('menu.share') ?></span></a>
      <button class="btn btn--ghost" type="button" data-textmenu-toggle aria-expanded="false" aria-controls="textMenu"><svg class="ic"><use href="#u-list"/></svg><span data-textmenu-label <?= ia('menu.viewText') ?>><?= t('menu.viewText') ?></span></button>
    </div>

    <div class="glance" data-reveal>
      <p class="glance__t" <?= ia('menu.glance') ?>><?= t('menu.glance') ?></p>
      <ul class="glance__list">
        <?php foreach ($SITE['menuSections'] as $s): ?><li><span><?= e($s['label']) ?></span><b><?= (int) $s['count'] ?></b></li><?php endforeach; ?>
      </ul>
    </div>

    <!-- Indexable text version of the image menu (visually hidden until toggled — still readable by Google + screen readers) -->
    <div id="textMenu" class="textmenu is-collapsed" data-textmenu>
      <h3 class="h3" <?= ia('menu.textTitle') ?>><?= t('menu.textTitle') ?></h3>
      <p class="fineprint" <?= ia('menu.textNote') ?>><?= t('menu.textNote') ?></p>
      <?php foreach (($MENUTX['sections'] ?? []) as $sec): ?>
      <section class="tm__sec" id="tm-<?= e($sec['id']) ?>">
        <h4><?= e($sec['title']) ?></h4>
        <?php if (!empty($sec['note'])): ?><p class="tm__note"><?= e($sec['note']) ?></p><?php endif; ?>
        <?php foreach ($sec['groups'] as $g): ?>
        <div class="tm__group">
          <h5><?= e($g['name']) ?></h5>
          <ul>
            <?php foreach ($g['items'] as $it): ?>
            <li><span class="diet diet--<?= $it['diet'] === 'veg' ? 'veg' : ($it['diet'] === 'nonveg' ? 'nonveg' : 'none') ?>" aria-label="<?= $it['diet'] === 'veg' ? 'Vegetarian' : ($it['diet'] === 'nonveg' ? 'Non-vegetarian' : 'Diet not specified') ?>" role="img"></span><strong><?= e($it['n']) ?></strong> <span class="tm__d"><?= e($it['d']) ?></span></li>
            <?php endforeach; ?>
          </ul>
        </div>
        <?php endforeach; ?>
      </section>
      <?php endforeach; ?>
      <p class="tm__sig"><strong><?= e(t('menu.sigTitle')) ?></strong> <?= e(implode(', ', array_column($SITE['signature'], 'name'))) ?>.</p>
    </div>
    <noscript><p class="fineprint">
      <?php foreach ($pages as $p): ?><a href="<?= e(u('assets/menu/' . $p['file'])) ?>"><?= e($p['title']) ?></a> · <?php endforeach; ?>
    </p></noscript>
  </div>
</section>
