import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../dist/button.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles/component-fixtures.css', import.meta.url), 'utf8');
const editorCss = readFileSync(new URL('../dist/styles/editor/buttons.css', import.meta.url), 'utf8');
const scope = html.match(/<a\b[^>]*class="button"[^>]*\b(data-astro-cid-[a-z0-9]+)/)?.[1];
assert.ok(scope, 'Frontend button has a scope attribute');

const editor = '.editor-styles-wrapper .wp-block-buttons .wp-block-button>.wp-block-button__link';
const reversed = '.editor-styles-wrapper .wp-block-buttons .wp-block-button.reversed>.wp-block-button__link';
const dark = '.editor-styles-wrapper .wp-block-buttons .wp-block-button.dark>.wp-block-button__link';
const rules = Array.from(`${css}\n${editorCss}`.matchAll(/([^{}]+)\{([^{}]*)\}/g), ([, selector, declarations]) => ({ selector, declarations }));
const shared = (frontendSelector, editorSelector, declarations) =>
  [frontendSelector, editorSelector].every((selector) => rules.some((rule) =>
    rule.selector.includes(selector)
    && declarations.every((declaration) => rule.declarations.includes(declaration))));

assert.ok(shared(`.button[${scope}]`, editor, ['border:1px var(--color-link) solid', 'background-color:var(--color-link)', 'padding:.5rem 1rem']), 'Frontend and editor share base button styles');
assert.ok(shared(`.button[${scope}]:hover`, `${editor}:hover`, ['background-color:var(--color-page-bg)', 'color:var(--color-link)']), 'Frontend and editor share hover styles');
assert.ok(shared(`.button[${scope}].reversed`, reversed, ['background-color:var(--color-link)']), 'Reversed variant is shared');
assert.ok(shared(`.button[${scope}].dark`, dark, ['background-color:var(--color-gray-6)']), 'Dark variant is shared');
assert.ok(!css.includes(':global('), 'Compiled styles contain no Astro-only global selectors');
assert.ok(!css.includes(editor), 'Core button editor rules stay out of frontend CSS');

console.log('Frontend and editor core buttons share component styles.');
