import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const primary = readFileSync(new URL('../dist/announcement-tout.html', import.meta.url), 'utf8');
const secondary = readFileSync(new URL('../dist/announcement-tout/secondary.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles/component-fixtures.css', import.meta.url), 'utf8');

assert.match(primary, /<div class="announcement-tout"[^>]*><h2 class="announcement-tout__toast">Announcement toast<\/h2><h3 class="announcement-tout__title">Announcement Title<\/h3><div class="announcement-tout__content">/);
assert.match(secondary, /<div class="announcement-tout announcement-tout--secondary"[^>]*><h4 class="announcement-tout__toast">Secondary announcement<\/h4><h3 class="announcement-tout__title">Secondary Title<\/h3><div class="announcement-tout__content">/);
assert.match(css, /\.block-editor-iframe__body \.announcement-tout,\.announcement-tout\{(?=[^{}]*background:var\(--color-text\))[^{}]*\}/);
assert.match(css, /\.block-editor-iframe__body \.announcement-tout--secondary,\.announcement-tout--secondary\{(?=[^{}]*background:var\(--color-page-bg\))(?=[^{}]*border:2px solid var\(--color-accent--secondary\))[^{}]*\}/);
assert.match(css, /\.block-editor-iframe__body \.announcement-tout \.announcement-tout__toast,\.announcement-tout \.announcement-tout__toast\{[^{}]*font-family:var\(--font-impact-label-reversed\)/);

console.log('Announcement tout fixtures and shared CSS cover default and secondary variants.');
