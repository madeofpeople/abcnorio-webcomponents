import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const primary = readFileSync(new URL('../dist/press-item.html', import.meta.url), 'utf8');
const fallback = readFileSync(new URL('../dist/press-item/fallback.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles/component-fixtures.css', import.meta.url), 'utf8');

assert.match(primary, /<article class="press-item"><time datetime="2026-06-06">[^<]+<\/time><h3>Press item title<\/h3><p>.*<a class="source" href="\/example"/);
assert.match(fallback, /<article class="press-item"><time>June 2026<\/time><h3>Another press item<\/h3><p>.*<span class="source">Publication<\/span>/);
assert.match(css, /\.press-item\{(?=[^{}]*border-bottom:1px solid #dedede)(?=[^{}]*padding-bottom:1rem)[^{}]*\}/);
assert.match(css, /\.press-item time\{(?=[^{}]*font-family:var\(--font-impact-label-reversed\))[^{}]*\}/);
assert.match(css, /\.press-item h2,\.press-item h3\{[^{}]*margin-top:\.75rem/);

console.log('Press item fixtures use shared editor-compatible styles.');
