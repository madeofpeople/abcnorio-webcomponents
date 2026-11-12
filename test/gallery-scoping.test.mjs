import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('gallery uses nested Sass with explicit global loading and scoped slider helpers', () => {
  const source = readFileSync(new URL('../src/components/wp-blocks/gallery/gallery.scss', import.meta.url), 'utf8');
  const astro = readFileSync(new URL('../src/components/wp-blocks/gallery/gallery.astro', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../dist/styles/component-fixtures.css', import.meta.url), 'utf8');

  assert.ok(!source.includes(':global'));
  assert.match(astro, /<style lang="scss" is:global>\s*@use '\.\/gallery\.scss';/);
  assert.match(css, /gallery-listing\.gallery\.gallery--paged-grid \.images\{/);
  assert.match(css, /gallery-listing\.gallery--paged-grid \.gallery-pagination button:hover/);
  assert.match(css, /\.pswp__custom-caption\[hidden\]\{display:none\}/);
  assert.match(css, /gallery-listing\.gallery\.blaze-slider \.blaze-prev\[data-astro-cid-[a-z0-9]+\]/);
  assert.doesNotMatch(css, /gallery-listing[^{}]*:global/);
});
