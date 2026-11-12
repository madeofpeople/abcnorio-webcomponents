import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('captioned gallery retains slider markup and provides caption layout', () => {
  const html = readFileSync(new URL('../dist/gallery/captioned.html', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../dist/styles/component-fixtures.css', import.meta.url), 'utf8');
  const editor = readFileSync(new URL('../dist/styles/editor/gallery.css', import.meta.url), 'utf8');
  const sizes = JSON.parse(readFileSync(new URL('../src/components/wp-blocks/gallery/image-sizes.json', import.meta.url), 'utf8'));

  assert.match(html, /data-variant="captioned"/);
  assert.match(html, /gallery--captioned/);
  assert.match(html, /images blaze-track/);
  assert.equal(sizes.captioned, sizes.slider);
  assert.match(css, /gallery-listing\.gallery\.gallery--captioned\.blaze-slider figcaption\{[^}]*caption-side:bottom/);
  assert.match(css, /gallery-listing\.gallery\.gallery--captioned\.blaze-slider \.gallery-item img\{[^}]*height:300px/);
  assert.match(editor, /abcnorio-gallery--captioned[^{}]*>\.wp-block-image\{[^}]*height:auto/);
  assert.match(editor, /abcnorio-gallery--captioned[^{}]*figcaption\{[^}]*caption-side:bottom/);
});
