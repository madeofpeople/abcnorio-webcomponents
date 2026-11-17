import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('group context retains dark gallery spacing alongside all gallery variants', () => {
  const css = readFileSync(new URL('../dist/styles/group.css', import.meta.url), 'utf8');
  assert.ok(/\.wp-block-group\.dark :where\(\*\)\{[^{}]*background-color:var\(--color-group-bg--dark\)[^{}]*color:var\(--color-gray--lightest\)/.test(css), 'Dark group contents retain the staging background and light text');
  assert.ok(!/\.wp-block-group\.dark\{[^{}]*background-color:/.test(css), 'Outermost dark groups remain transparent');
  assert.ok(/\.wp-block-group\.gallery\.dark\{padding-top:2rem\}/.test(css), 'Gallery groups retain top padding');
  assert.ok(/\.wp-block-group\.gallery\.dark gallery-listing\.gallery\.gallery--paged-grid,\.wp-block-group\.gallery\.dark \.images\{padding:0?\.5rem\}/.test(css), 'Group context retains compact image padding');
  assert.ok(/\.wp-block-group\.gallery\.dark \.gallery--masonry,\.wp-block-group\.gallery\.dark \.gallery--paged-grid\{margin-left:-2rem;margin-right:-2rem\}/.test(css), 'Grid variants retain group breakout margins');
  assert.ok(/\.wp-block-group\.gallery\{margin-bottom:3rem\}/.test(css), 'Gallery groups retain bottom spacing');
});