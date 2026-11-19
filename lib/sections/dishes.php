<?php
/* SIGNATURE DISHES — desktop: pinned horizontal-scroll; mobile: swipeable cards.
 * Cards for dishes show gold line-art (no fake dish photos). Real photos appear as "plate" cards with slow parallax zoom. */
$sig = $SITE['signature'];
$plates = $SITE['plates'];
$sequence = [];
$plateAt = [2, 5, 8];
$pi = 0; $n = 0;
foreach ($sig as $d) {
    $sequence[] = ['type' => 'dish', 'd' => $d, 'n' => ++$n];
    if (in_array($n, $plateAt, true) && isset($plates[$pi])) { $sequence[] = ['type' => 'plate', 'p' => $plates[$pi++]]; }
}
function spice_meter(int $lvl): string {
    $h = '<span class="spice" role="img" aria-label="Spice level ' . $lvl . ' of 3">';
    for ($i = 1; $i <= 3; $i++) $h .= '<svg class="chilli' . ($i <= $lvl ? ' is-on' : '') . '" viewBox="0 0 64 64"><use href="#i-chilli"/></svg>';
    return $h . '</span>';
}
?>
<section id="dishes" class="section dishes" aria-labelledby="dishes-title" data-section-title="Signature Dishes — Dum Biryani, Chicken Malai Kebab, Paneer Khurchan | Aroma Sakchi">
  <div class="dishes__pin" data-hscroll>
    <div class="dishes__intro">
      <p class="eyebrow" <?= ia('dishes.eyebrow') ?>><?= t('dishes.eyebrow') ?> <span class="devanagari" lang="hi">· ज़ायका</span></p>
      <h2 class="h2" id="dishes-title" data-split <?= ia('dishes.title') ?>><?= t('dishes.title') ?></h2>
      <p class="lede" <?= ia('dishes.lede') ?>><?= t('dishes.lede') ?></p>
      <p class="dishes__hint" aria-hidden="true"><span <?= ia('dishes.hint') ?>><?= t('dishes.hint') ?></span><svg class="ic"><use href="#i-arrow"/></svg></p>
      <p class="fineprint" <?= ia('dishes.spiceNote') ?>><?= t('dishes.spiceNote') ?></p>
    </div>
    <div class="dishes__viewport">
      <div class="dishes__track" data-hscroll-track>
        <?php foreach ($sequence as $s): if ($s['type'] === 'dish'): $d = $s['d']; ?>
        <article class="dish" data-dish="<?= e($d['id']) ?>" style="--tone:<?= ($s['n'] % 3) ?>">
          <div class="dish__art">
            <?php if (!empty($d['photo'])): ?><?= pic($d['photo'], ['wrap' => 'dish__photo', 'sizes' => '(min-width:1024px) 30vw, 80vw']) ?><?php endif; ?>
            <svg class="dish__icon" aria-hidden="true"><use href="#i-<?= e($d['icon']) ?>"/></svg>
            <svg class="dish__icon dish__icon--ghost" aria-hidden="true"><use href="#i-<?= e($d['icon']) ?>"/></svg>
            <span class="ribbon" <?= ia('dishes.ribbon') ?>><?= t('dishes.ribbon') ?></span>
            <span class="dish__no"><?= sprintf('%02d', $s['n']) ?></span>
          </div>
          <div class="dish__body">
            <h3 data-hi="<?= e($d['hi']) ?>" data-en="<?= e($d['name']) ?>"><?= e($d['name']) ?></h3>
            <p class="dish__hi" lang="hi"><?= e($d['hi']) ?></p>
            <p class="dish__desc"<?= hi($d['desc']) ?>><?= e(L($d['desc'])) ?></p>
            <div class="dish__meta">
              <?php if ($d['diet'] === 'veg'): ?><span class="diet diet--veg" role="img" aria-label="Vegetarian"></span><span class="dish__tag" <?= ia('diet.veg') ?>><?= t('diet.veg') ?></span>
              <?php elseif ($d['diet'] === 'nonveg'): ?><span class="diet diet--nonveg" role="img" aria-label="Non-vegetarian"></span><span class="dish__tag" <?= ia('diet.nonveg') ?>><?= t('diet.nonveg') ?></span>
              <?php else: ?><span class="dish__tag dish__tag--ask" <?= ia('diet.both') ?>><?= t('diet.both') ?></span><?php endif; ?>
              <?= spice_meter((int) $d['spice']) ?>
            </div>
          </div>
        </article>
        <?php else: $p = $s['p']; ?>
        <figure class="plate" data-plate>
          <?= pic($p['photo'], ['wrap' => 'plate__pic', 'class' => 'plate__img', 'sizes' => '(min-width:1024px) 34vw, 85vw']) ?>
          <figcaption<?= hi($p['caption']) ?>><?= e(L($p['caption'])) ?></figcaption>
        </figure>
        <?php endif; endforeach; ?>
        <a class="dish dish--end" href="#menu" data-open-swipe-menu-mobile>
          <svg class="dish__icon" aria-hidden="true"><use href="#i-saffron"/></svg>
          <h3 <?= ia('dishes.endT') ?>><?= t('dishes.endT') ?></h3>
          <span class="btn btn--ghost" <?= ia('cta.explore') ?>><?= t('cta.explore') ?></span>
        </a>
      </div>
    </div>
    <div class="dishes__progress" aria-hidden="true"><i data-hscroll-bar></i></div>
  </div>
</section>
