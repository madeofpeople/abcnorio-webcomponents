import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('masonry styles use responsive columns and keep items together', () => {
  const css = readFileSync(new URL('../dist/styles/gallery.css', import.meta.url), 'utf8');

  assert.match(css, /gallery-listing\.gallery\.gallery--masonry \.images\{[^}]*column-count:2/);
  assert.match(css, /@media\s*\(min-width: ?720px\)\{gallery-listing\.gallery\.gallery--masonry \.images\{column-count:4/);
  assert.match(css, /gallery-listing\.gallery\.gallery--masonry \.gallery-item[^}]*break-inside:avoid/);
});
