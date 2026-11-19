<?php /* FOOTER */ ?>
<footer class="footer">
  <div class="container footer__grid">
    <div class="footer__brand">
      <a class="nav__brand" href="#top"><img class="nav__mark" src="<?= u('assets/img/logo-96.webp') ?>" width="44" height="44" alt="" loading="lazy"><span class="nav__name">Aroma <small>Multicuisine</small></span></a>
      <p class="footer__tag" <?= ia('footer.tag') ?>><?= t('footer.tag') ?></p>
      <?php if ($T['social'] && (!empty($SITE['social']['instagram']) || !empty($SITE['social']['facebook']))): ?>
      <p class="footer__social">
        <?php if (!empty($SITE['social']['instagram'])): ?><a href="<?= e($SITE['social']['instagram']) ?>" target="_blank" rel="noopener me" data-track="instagram_click">Instagram</a><?php endif; ?>
        <?php if (!empty($SITE['social']['facebook'])): ?><a href="<?= e($SITE['social']['facebook']) ?>" target="_blank" rel="noopener me" data-track="facebook_click">Facebook</a><?php endif; ?>
      </p>
      <?php endif; ?>
    </div>
    <div>
      <h3 class="footer__h" <?= ia('footer.visit') ?>><?= t('footer.visit') ?></h3>
      <address><?php foreach ($LOC['addressLines'] as $l): ?><span><?= e($l) ?></span><br><?php endforeach; ?></address>
      <p><a href="<?= e(directions_url($SITE)) ?>" target="_blank" rel="noopener" data-track="directions_click" <?= ia('visit.directions') ?>><?= t('visit.directions') ?></a></p>
    </div>
    <div>
      <h3 class="footer__h" <?= ia('footer.hours') ?>><?= t('footer.hours') ?></h3>
      <p><?= e(fmt12($SITE['hours']['default']['open'])) ?> – <?= e(fmt12($SITE['hours']['default']['close'])) ?><br><span <?= ia('footer.daily') ?>><?= t('footer.daily') ?></span></p>
      <h3 class="footer__h" <?= ia('footer.call') ?>><?= t('footer.call') ?></h3>
      <p><a href="tel:<?= e($C['phoneTel']) ?>" data-track="call_click"><?= e($C['phoneDisplay']) ?></a><br><a href="<?= e(wa_link($SITE, 'Hello Aroma!')) ?>" target="_blank" rel="noopener" data-track="whatsapp_click">WhatsApp</a></p>
    </div>
    <nav aria-label="Footer">
      <h3 class="footer__h" <?= ia('footer.links') ?>><?= t('footer.links') ?></h3>
      <ul>
        <li><a href="#dishes" <?= ia('nav.dishes') ?>><?= t('nav.dishes') ?></a></li>
        <li><a href="#menu" <?= ia('nav.menu') ?>><?= t('nav.menu') ?></a></li>
        <li><a href="#celebrate" <?= ia('nav.celebrate') ?>><?= t('nav.celebrate') ?></a></li>
        <li><a href="#gallery" <?= ia('nav.gallery') ?>><?= t('nav.gallery') ?></a></li>
        <li><a href="#reviews" <?= ia('nav.reviews') ?>><?= t('nav.reviews') ?></a></li>
        <li><a href="#reserve" data-sheet-open="reserve" <?= ia('cta.reserve') ?>><?= t('cta.reserve') ?></a></li>
        <?php if ($T['onlineOrdering'] && !empty($SITE['onlineOrdering']['url'])): ?><li><a href="<?= e($SITE['onlineOrdering']['url']) ?>" target="_blank" rel="noopener" data-track="order_online_click"><?= e($SITE['onlineOrdering']['label']) ?></a></li><?php endif; ?>
      </ul>
    </nav>
  </div>
  <div class="container footer__base">
    <span>© <?= date('Y') ?> <?= e($B['name']) ?>. <span <?= ia('footer.rights') ?>><?= t('footer.rights') ?></span></span>
    <span class="credit"><span <?= ia('footer.credit') ?>><?= t('footer.credit') ?></span> <a href="https://eastgrowdigital.in" target="_blank" rel="noopener">EastGrow Digital</a></span>
  </div>
</footer>
