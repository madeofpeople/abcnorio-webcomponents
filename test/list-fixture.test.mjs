import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const unordered = readFileSync(new URL('../dist/list.html', import.meta.url), 'utf8');
const ordered = readFileSync(new URL('../dist/list/ordered.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles/component-fixtures.css', import.meta.url), 'utf8');

assert.match(unordered, /<ul\b[^>]*class="[^"]*\blist\b/);
assert.match(ordered, /<ol\b[^>]*class="[^"]*\blist\b/);
assert.match(ordered, /<ol\b[^>]*\bstart="5"/);
assert.match(ordered, /<ol\b[^>]*\breversed(?:\s|>|="")/);
assert.match(ordered, /<ol\b[^>]*\blist-style-type:\s*upper-roman/);
assert.match(css, /ol\.list:is\(ol\)>li[^{}]*\{display:list-item\}/);
assert.match(css, /ol\.wp-block-list:is\(ol\)>li[^{}]*\{display:list-item\}/);

console.log('List fixtures preserve unordered and ordered markup.');
