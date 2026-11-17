import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('event listing fixtures and styles work without generated Astro scope hashes', () => {
  const css = readFileSync(new URL('../dist/styles/event-listing.css', import.meta.url), 'utf8');
  const editor = readFileSync(new URL('../dist/styles/editor/event-listing.css', import.meta.url), 'utf8');
  assert.doesNotMatch(css, /:global|data-astro-cid-|--listing-preview/);
  assert.match(css, /\.event-listing\.card-grid \.teaser-list/);
  assert.match(css, /\.event-listing\.blaze-slider \.blaze-prev/);
  assert.match(css, /@keyframes event-teaser-in/);
  assert.match(editor, /--listing-preview-columns/);
  assert.match(editor, /--listing-preview-slides/);
  for (const variant of ['event-listing.html', 'event-listing/slider.html']) {
    const html = readFileSync(new URL(`../dist/${variant}`, import.meta.url), 'utf8');
    assert.match(html, /<event-listing\b/);
    assert.doesNotMatch(html, /data-astro-cid-/);
    for (const className of ['event-listing__title', 'teaser-list', 'actions', 'show-all']) {
      assert.ok(html.includes(className), `${variant} retains ${className}`);
    }
    if (variant.includes('/slider')) {
      assert.match(html, /class="blaze-next"/);
      assert.match(html, /class="blaze-track-container"/);
    }
  }
});
