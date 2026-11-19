<?php /* GALLERY — masonry on desktop, swipe cards on mobile; filters Food · Interiors · Celebrations */
$order = ['hall', 'kebab', 'balloons', 'rice-gravy', 'booths', 'blue-drink', 'cake-cutting', 'entrance', 'crispy-starter', 'sculpture-gold', 'cake', 'greenwall', 'iced-drink', 'counter', 'sculpture-leaf', 'bust'];
$items = [];
foreach ($order as $id) if (isset($IMG[$id])) $items[$id] = $IMG[$id];
?>
<section id="gallery" class="section gallery" aria-labelledby="gallery-title" data-section-title="Gallery — Food, Interiors & Celebrations | Aroma Multicuisine Sakchi">
  <div class="container">
    <header class="section__head section__head--split">
      <div>
        <p class="eyebrow" data-reveal <?= ia('gal.eyebrow') ?>><?= t('gal.eyebrow') ?></p>
        <h2 class="h2" id="gallery-title" data-split <?= ia('gal.title') ?>><?= t('gal.title') ?></h2>
      </div>
      <div class="filters" role="tablist" aria-label="Gallery filters" data-gallery-filters>
        <button class="chip is-active" role="tab" aria-selected="true" data-filter="all" <?= ia('gal.all') ?>><?= t('gal.all') ?></button>
        <button class="chip" role="tab" aria-selected="false" data-filter="food" <?= ia('gal.food') ?>><?= t('gal.food') ?></button>
        <button class="chip" role="tab" aria-selected="false" data-filter="interiors" <?= ia('gal.interiors') ?>><?= t('gal.interiors') ?></button>
        <button class="chip" role="tab" aria-selected="false" data-filter="celebrations" <?= ia('gal.celebrations') ?>><?= t('gal.celebrations') ?></button>
      </div>
    </header>

    <div class="masonry" data-gallery>
      <?php foreach ($items as $id => $m): ?>
      <figure class="g-item" data-groups="<?= e(implode(' ', $m['groups'])) ?>" data-id="<?= e($id) ?>" data-full="<?= e(u('assets/images/' . $id . '-' . max($m['widths']) . '.webp')) ?>" data-alt="<?= e($m['alt']) ?>">
        <button type="button" class="g-item__btn" aria-label="View larger: <?= e($m['alt']) ?>">
          <?= pic($id, ['sizes' => '(min-width:1024px) 28vw, (min-width:768px) 45vw, 80vw']) ?>
          <span class="g-item__cap"><?= e(strtok($m['alt'], ',')) ?></span>
        </button>
      </figure>
      <?php endforeach; ?>
    </div>
    <div class="swiper gallery-swiper" data-gallery-swiper><div class="swiper-wrapper"></div><div class="swiper-pagination"></div></div>
    <p class="fineprint" <?= ia('gal.note') ?>><?= t('gal.note') ?></p>
  </div>
</section>
