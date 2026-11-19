<?php /* ALSO FIND US ON — badges link only when the owner has pasted a URL (no dead links) */ ?>
<section class="also" aria-labelledby="also-title">
  <div class="container also__in">
    <h2 class="also__t" id="also-title" <?= ia('also.title') ?>><?= t('also.title') ?></h2>
    <ul class="also__list">
      <?php foreach ($SITE['also'] as $a): ?>
      <li><?php if (!empty($a['url'])): ?>
        <a class="also__badge" href="<?= e($a['url']) ?>" target="_blank" rel="noopener" data-track="aggregator_<?= e(strtolower(preg_replace('/\W+/', '_', $a['name']))) ?>"><?= e($a['name']) ?><svg class="ic"><use href="#i-arrow"/></svg></a>
      <?php else: ?><span class="also__badge also__badge--static"><?= e($a['name']) ?></span><?php endif; ?></li>
      <?php endforeach; ?>
    </ul>
  </div>
</section>
