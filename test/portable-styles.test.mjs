import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { editorStyleEntries } from '../src/styles/editor-style-entries.js';
import { editorStylesDevPlugin } from '../src/util/editor-styles-dev.js';

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

test('existing Vite server maps only declared CSS routes to direct source requests', () => {
  let middleware;
  const plugin = editorStylesDevPlugin('/components');
  assert.equal(plugin.apply, 'serve');
  plugin.configureServer({ middlewares: { use(callback) { middleware = callback; } } });
  for (const [id, entry] of Object.entries(editorStyleEntries)) {
    for (const [suffix, source] of [['', entry.source], ['-editor', entry.editor]]) {
      if (!source) continue;
      const request = { url: `/__abcnorio/styles/${id}${suffix}.css?ver=123` };
      let next = false;
      middleware(request, {}, () => { next = true; });
      assert.equal(request.url, `/@fs//components/${source}?direct`);
      assert.equal(next, true);
    }
  }
  const response = { end(message) { this.message = message; } };
  middleware({ url: '/__abcnorio/styles/missing.css' }, response, () => assert.fail('Unknown style must not fall through'));
  assert.equal(response.statusCode, 404);
  let unrelated = false;
  middleware({ url: '/events/' }, {}, () => { unrelated = true; });
  assert.equal(unrelated, true);
});
