import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../dist/newsletter-signup.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles/component-fixtures.css', import.meta.url), 'utf8');

assert.match(html, /class="abcnorio-newsletter-signup"/);
assert.match(html, /class="abcnorio-newsletter-signup__field"/);
assert.match(html, /<button class="button reversed" type="submit"/);
assert.match(css, /\.abcnorio-newsletter-signup\{[^{}]*background-color:var\(--color-grey--dark\)/);
assert.match(css, /\.abcnorio-newsletter-signup label,\.abcnorio-newsletter-signup__preview-label\{/);
assert.match(css, /\.abcnorio-newsletter-signup input,\.abcnorio-newsletter-signup__preview-input\{/);
assert.match(css, /(?:^|\})\.editor-styles-wrapper \.abcnorio-newsletter-signup \.abcnorio-newsletter-signup__preview-button\{(?=[^{}]*background-color:var\(--color-link\))(?=[^{}]*width:100%)[^{}]*\}/);

console.log('Newsletter preview shares form, field, label and button styles.');
