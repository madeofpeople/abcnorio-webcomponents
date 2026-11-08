import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../dist/styles/component-fixtures.css', import.meta.url), 'utf8');

for (const variant of ['event-listing.html', 'event-listing/slider.html']) {
  const html = readFileSync(new URL(`../dist/${variant}`, import.meta.url), 'utf8');
  const root = html.match(/<event-listing\b[^>]*\b(data-astro-cid-[a-z0-9]+)(?:="[^"]*")?[^>]*>/);
  assert.ok(root, `${variant} root has a scope attribute`);

  for (const className of ['event-listing__title', 'teaser-list', 'actions', 'show-all']) {
    const element = html.match(new RegExp(`<[^>]+class="[^"]*\\b${className}\\b[^"]*"[^>]*>`));
    assert.ok(element?.[0].includes(root[1]), `${variant} ${className} has the listing scope`);
  }

  if (variant.includes('/slider')) {
    for (const className of ['blaze-prev', 'blaze-next', 'blaze-slide-dots']) {
      const element = html.match(new RegExp(`<[^>]+class="${className}"[^>]*>`));
      assert.ok(element?.[0].includes(root[1]), `${variant} ${className} has the listing scope`);
    }
    assert.ok(css.includes(`.event-listing[${root[1]}].blaze-slider .blaze-prev[${root[1]}]`), 'Slider arrow styles match fixture markup');
  } else {
    assert.ok(css.includes(`.event-listing[${root[1]}].card-grid .teaser-list[${root[1]}]`), 'Grid styles match fixture markup');
  }
}

console.log('Event listing fixtures preserve scoped grid and slider markup.');
