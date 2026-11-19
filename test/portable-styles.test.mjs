import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { editorStyleEntries } from '../src/styles/editor-style-entries.js';

const dist = path.resolve(process.env.ABCNORIO_COMPONENTS_DIST_DIR || 'dist');
const read = (file) => readFileSync(path.join(dist, file), 'utf8');

test('portable styles are manifest-owned, unscoped, and absent from combined fixture CSS', () => {
  const manifest = JSON.parse(read('manifest.json'));
  const combined = read('styles/component-fixtures.css');
  for (const [id, source] of Object.entries(editorStyleEntries)) {
    const entry = manifest.styleEntries[id];
    assert.equal(entry.source, source.source);
    assert.ok(manifest.shared.css.includes(entry.css));
    const css = read(entry.css);
    assert.doesNotMatch(css, /:global|data-astro-cid-/);
    assert.ok(css.length > 100);
    if (source.editor) {
      assert.equal(entry.editorSource, source.editor);
      assert.deepEqual(manifest.components[id].editorCss, [entry.editorCss]);
    }
  }
  for (const selector of [
    '.abcnorio-hero{', '.wp-block-group.dark', 'gallery-listing.gallery',
    '.event-listing{', '.event-listing.card-grid', '.event-teaser{',
    '.content-listing{', '.content-listing.card-grid', '.article-teaser{',
    'article-teaser-out', '.collective-teaser__excerpt',
  ]) {
    assert.ok(!combined.includes(selector), `Combined CSS must not duplicate ${selector}`);
  }
  for (const fixture of ['event-listing.html', 'event-listing/slider.html', 'hero.html', 'gallery.html', 'content-listing.html', 'content-listing/slider.html', 'article-teaser.html']) {
    assert.doesNotMatch(read(fixture).match(/<(?:event-listing|content-listing|article-teaser|gallery-listing|div class="abcnorio-hero")[^>]*>/)?.[0] || '', /data-astro-cid-/);
  }
  for (const fixture of ['event-listing/slider.html', 'content-listing/slider.html']) {
    const track = read(fixture).match(/<section\b[^>]*blaze-track[^>]*>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(track, `${fixture} has a slider track`);
    assert.doesNotMatch(track, /<link\b/, 'Stylesheet links must not become carousel slides');
  }
  for (const fixture of ['event-listing/slider.html', 'content-listing/slider.html']) {
    const slider = read(fixture);
    for (const control of ['prev', 'next']) {
      assert.match(slider, new RegExp(`<button type="button" class="blaze-${control}">`));
    }
    assert.doesNotMatch(slider, /javascript:void|<button href=/);
  }
  assert.match(read('event-listing/slider.html'), /<a href="[^"]+" class="show-all button">/);
});

test('past event teaser styles match the rendered card and its children', () => {
  const html = read('event-teaser/past.html');
  const css = read('styles/event-teaser.css');
  assert.match(html, /<event-teaser\b[^>]*class="[^"]*\bevent-teaser--past\b/);
  assert.match(css, /\.event-teaser--past \.event-teaser__content::after\{[^}]*content:["']Past Event["']/);
  assert.match(css, /\.event-teaser--past \.event-teaser__title\{[^}]*bottom:4rem/);
  assert.match(css, /\.event-teaser--past \.event-teaser__image\{[^}]*opacity:0?\.35/);
});

test('article listing links portable CSS with matching HTMX animations', () => {
  const html = read('article-listing.html');
  const css = read('styles/article-listing.css');
  assert.match(html, /<link rel="stylesheet" href="\/styles\/article-listing\.css">/);
  assert.match(html, /<article-listing\b[^>]*data-component="abcnorio\/article-listing"/);
  assert.doesNotMatch(html.match(/<article-listing\b[^>]*>/)[0], /data-astro-cid-/);
  const listing = 'article-listing[data-component="abcnorio/article-listing"]';
  for (const [state, animation] of [['htmx-swapping', 'article-teaser-out'], ['htmx-added', 'article-teaser-in']]) {
    assert.ok(css.includes(`@keyframes ${animation}{`));
    assert.ok(css.includes(`${listing}.${state} article-teaser,.${state} ${listing} article-teaser{animation:${animation} `));
    assert.ok(css.includes(`.${state} ${listing} article-teaser:nth-child(2){animation-delay:`));
  }
});
