import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('gallery uses portable Sass and unscoped slider helpers', () => {
  const source = readFileSync(new URL('../src/components/wp-blocks/gallery/gallery.scss', import.meta.url), 'utf8');
  const astro = readFileSync(new URL('../src/components/wp-blocks/gallery/gallery.astro', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../dist/styles/gallery.css', import.meta.url), 'utf8');

  assert.ok(!source.includes(':global'));
  assert.match(astro, /import stylesHref from '\.\/gallery\.scss\?url'/);
  assert.match(astro, /<link rel="stylesheet" href=\{stylesHref\}/);
  assert.match(css, /gallery-listing\.gallery\.gallery--paged-grid \.images\{/);
  assert.match(css, /gallery-listing\.gallery--paged-grid \.gallery-pagination button:hover/);
  assert.match(css, /\.pswp__custom-caption\[hidden\]\{display:none\}/);
  assert.match(css, /gallery-listing\.gallery\.blaze-slider \.blaze-prev/);
  assert.doesNotMatch(css, /data-astro-cid-/);
  assert.doesNotMatch(css, /gallery-listing[^{}]*:global/);
});
