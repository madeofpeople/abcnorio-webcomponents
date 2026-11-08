import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../dist/hero.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles/component-fixtures.css', import.meta.url), 'utf8');

assert.match(html, /class="abcnorio-hero"[^>]*><div class="abcnorio-hero__image-wrapper"><\/div><div class="abcnorio-hero__content-wrapper"><div class="abcnorio-hero__content"/);
assert.match(css, /\.abcnorio-hero \.abcnorio-hero__image-wrapper\{(?=[^{}]*background-size:cover)(?=[^{}]*height:33rem)[^{}]*\}/);
assert.match(css, /\.abcnorio-hero \.abcnorio-hero__image\{(?=[^{}]*object-fit:cover)(?=[^{}]*height:100%)[^{}]*\}/);
assert.match(css, /\.abcnorio-hero \.abcnorio-hero__content-wrapper\{[^{}]*padding-top:24rem/);
assert.match(css, /\.abcnorio-hero\.short \.abcnorio-hero__image-wrapper\{height:24rem\}/);
assert.match(css, /\.abcnorio-hero\.short \.abcnorio-hero__content-wrapper\{padding-top:16rem\}/);
assert.match(css, /\.abcnorio-hero\.thin \.abcnorio-hero__image-wrapper\{height:18rem\}/);
assert.match(css, /\.abcnorio-hero\.thin \.abcnorio-hero__content-wrapper\{padding-top:10rem\}/);
assert.match(css, /\.abcnorio-hero \.abcnorio-hero__content h1,[^{}]*\{[^{}]*font-family:var\(--font-impact-label-reversed\)/);

console.log('Hero fixture and shared CSS cover hero structure and variants.');
