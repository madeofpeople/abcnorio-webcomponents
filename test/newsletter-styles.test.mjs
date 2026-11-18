import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../dist/newsletter-signup.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles/component-fixtures.css', import.meta.url), 'utf8');
const editorCss = readFileSync(new URL('../dist/styles/editor/newsletter-signup.css', import.meta.url), 'utf8');
const preview = readFileSync(new URL('../dist/newsletter-signup/preview.html', import.meta.url), 'utf8');
const editor = readFileSync(new URL('../dist/newsletter-signup/editor.html', import.meta.url), 'utf8');

assert.match(html, /class="abcnorio-newsletter-signup"/);
assert.match(html, /class="abcnorio-newsletter-signup__field"/);
assert.match(html, /<button class="button reversed" type="submit"/);
assert.match(css, /\.abcnorio-newsletter-signup\{[^{}]*background-color:var\(--color-gray--darkest\)/);
assert.match(css, /\.abcnorio-newsletter-signup label\{/);
assert.match(css, /\.abcnorio-newsletter-signup input\{/);
assert.match(editorCss, /\.abcnorio-newsletter-signup__preview-label\{/);
assert.match(editorCss, /\.abcnorio-newsletter-signup__preview-input\{/);
assert.match(editorCss, /(?:^|\})\.editor-styles-wrapper \.abcnorio-newsletter-signup \.abcnorio-newsletter-signup__preview-button\{(?=[^{}]*background-color:var\(--color-link\))(?=[^{}]*width:100%)[^{}]*\}/);

for (const fixture of [preview, editor]) {
  assert.match(fixture, /data-newsletter-preview/);
  assert.match(fixture, /<button\b[^>]*\bdisabled/);
  assert.match(fixture, /abcnorio-newsletter-signup__preview-label/);
  assert.doesNotMatch(fixture, /<form\b|<input\b|<select\b|data-newsletter-signup(?:[ >]|-form)|data-submit-endpoint/);
}
assert.doesNotMatch(preview, /data-editor-/);
assert.match(editor, /data-editor-root/);
assert.doesNotMatch(html, /data-newsletter-preview|data-editor-/);
console.log('Newsletter public form is separate from the shared inert WordPress placeholder, with component-owned styles.');
