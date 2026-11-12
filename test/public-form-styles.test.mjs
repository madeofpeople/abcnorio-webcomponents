import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../dist/styles/component-fixtures.css', import.meta.url), 'utf8');
const editorCss = readFileSync(new URL('../dist/styles/editor/public-form.css', import.meta.url), 'utf8');

assert.match(css, /\.abcnorio-form\{(?=[^{}]*max-width:800px)(?=[^{}]*padding:2rem)[^{}]*\}/);
assert.match(css, /\.abcnorio-form \.field\{(?=[^{}]*display:flex)(?=[^{}]*margin-bottom:1rem)[^{}]*\}/);
assert.match(css, /\.abcnorio-form \.field-group>legend\{[^{}]*clip:rect\(0, 0, 0, 0\)/);
assert.match(css, /\.abcnorio-form \.field label\{[^{}]*font-family:var\(--font-impact-label-reversed\)/);
assert.match(css, /\.abcnorio-form textarea,\.abcnorio-form input\{[^{}]*width:100%/);
assert.match(editorCss, /\.editor-styles-wrapper \.abcnorio-form select\{[^{}]*width:100%/);
assert.match(editorCss, /\.editor-styles-wrapper \.abcnorio-form\{position:relative\}/);
assert.match(editorCss, /\.abcnorio-form__preview-overlay\{[^{}]*position:absolute/);
assert.doesNotMatch(css, /:global\(/);

console.log('Public form styles are shared with the editor preview.');
