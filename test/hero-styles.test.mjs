import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../dist/hero.html', import.meta.url), 'utf8');
const editorHtml = readFileSync(new URL('../dist/hero/editor.html', import.meta.url), 'utf8');
const manifest = JSON.parse(readFileSync(new URL('../dist/manifest.json', import.meta.url), 'utf8'));
const css = readFileSync(new URL('../dist/styles/hero.css', import.meta.url), 'utf8');
const editorCss = readFileSync(new URL('../dist/styles/editor/hero.css', import.meta.url), 'utf8');
const editorRoot = '.block-editor-iframe__body.editor-styles-wrapper .wp-block-abcnorio-hero';

assert.equal(editorCss, `${editorRoot} .abcnorio-hero__content-wrapper{pointer-events:none}${editorRoot} .abcnorio-hero__content{pointer-events:auto}`);
assert.ok(!css.includes(editorRoot), 'Hero editor selectors must not be in frontend CSS');

assert.match(html, /class="abcnorio-hero"[^>]*><div class="abcnorio-hero__image-wrapper"><\/div><div class="abcnorio-hero__content-wrapper"><div class="abcnorio-hero__content"/);
assert.ok(manifest.components.hero.fixtures.includes('hero/editor'));
for (const marker of ['__EDITOR_SLOT_IMAGE__', '__EDITOR_SLOT_CONTENT__']) {
  assert.equal(editorHtml.split(marker).length - 1, 1, 'Editor fixture must have each slot exactly once');
  assert.ok(!html.includes(marker), 'Frontend fallback must not contain editor markers');
}
assert.equal(
  editorHtml.replace('__EDITOR_SLOT_IMAGE__', '').replace('__EDITOR_SLOT_CONTENT__', '')
    .replace(/ data-editor-(?:root|bind)(?:="[^"]*")?/g, ''),
  html,
  'Editor fixture must reuse the frontend shell without duplicating markup',
);
assert.match(css, /\.abcnorio-hero \.abcnorio-hero__image-wrapper\{(?=[^{}]*background-size:cover)(?=[^{}]*height:33rem)[^{}]*\}/);
assert.match(css, /\.abcnorio-hero \.abcnorio-hero__image\{(?=[^{}]*object-fit:cover)(?=[^{}]*height:100%)[^{}]*\}/);
assert.match(css, /\.abcnorio-hero \.abcnorio-hero__content-wrapper\{[^{}]*padding-top:24rem/);
assert.match(css, /\.abcnorio-hero\.short \.abcnorio-hero__image-wrapper\{height:24rem\}/);
assert.match(css, /\.abcnorio-hero\.short \.abcnorio-hero__content-wrapper\{padding-top:16rem\}/);
assert.match(css, /\.abcnorio-hero\.thin \.abcnorio-hero__image-wrapper\{height:18rem\}/);
assert.match(css, /\.abcnorio-hero\.thin \.abcnorio-hero__content-wrapper\{padding-top:10rem\}/);
assert.match(css, /\.abcnorio-hero \.abcnorio-hero__content h1,[^{}]*\{[^{}]*font-family:var\(--font-impact-label-reversed\)/);

console.log('Hero fixture and shared CSS cover hero structure and variants.');
