import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { metadata } from '../src/components/wp-blocks/gallery/gallery.fixture.js';

test('gallery shared styles are portable while Gutenberg adaptations stay editor-only', () => {
  const css = readFileSync(new URL('../dist/styles/gallery.css', import.meta.url), 'utf8');
  assert.deepEqual(metadata.deps.js, [], 'WordPress must not run DOM-mutating frontend gallery code');
  assert.ok(css.includes('gallery-listing.gallery{display:block}'));
  assert.match(css, /gallery-listing\.gallery\.blaze-slider\{[^{}]*background-color:var\(--color-gray--darkest\)/);
  assert.match(css, /gallery-listing\.gallery\.blaze-slider \.gallery-item img\{[^{}]*object-fit:contain/);
  assert.match(css, /gallery-listing\.gallery\.blaze-slider \.blaze-prev/);
  assert.match(css, /gallery-listing\.gallery\.blaze-slider \.blaze-next/);
  assert.doesNotMatch(css, /:global|data-astro-cid-|abcnorio-gallery-editor/);
});
