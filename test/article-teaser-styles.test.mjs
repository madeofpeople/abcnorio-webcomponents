import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('article teaser text and background follow the same theme', () => {
  const css = readFileSync(new URL('../dist/styles/article-teaser.css', import.meta.url), 'utf8');

  assert.match(css, /\.article-teaser\{background-color:var\(--color-page-bg\)\}/);
  assert.match(css, /\.article-teaser__excerpt\{[^}]*color:var\(--color-text\)/);
});
