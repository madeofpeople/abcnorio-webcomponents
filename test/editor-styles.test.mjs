import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

test('editor styles are separate assets, not frontend dependencies', () => {
  const dist = new URL('../dist/', import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL('manifest.json', dist), 'utf8'));
  const components = ['announcement-tout', 'gallery', 'hero', 'event-listing', 'content-listing', 'buttons', 'public-form', 'newsletter-signup'];
  for (const id of components) {
    const component = manifest.components[id];
    const path = `styles/editor/${id}.css`;
    assert.deepEqual(component.editorCss, [path]);
    const css = readFileSync(new URL(path, dist), 'utf8');
    assert.ok(css.length > 0);
    assert.doesNotMatch(css, /:global\(|data-astro-cid-/, `${id} must match WordPress markup without Astro scoping`);
    assert.ok(!component.deps.includes(path));
    assert.ok(!component.css.includes(path));
    assert.ok(!manifest.shared.css.includes(path));
  }
  for (const file of readdirSync(new URL('styles/', dist)).filter((file) => file.endsWith('.css'))) {
    const css = readFileSync(new URL(`styles/${file}`, dist), 'utf8');
    for (const editorRule of ['--listing-preview-columns', 'abcnorio-gallery-editor', 'abcnorio-form__preview-overlay', 'abcnorio-newsletter-signup__preview-label', 'abcnorio-newsletter-signup__preview-input', 'abcnorio-newsletter-signup__preview-button', '.editor-styles-wrapper .wp-block-buttons', '.block-editor-iframe__body .announcement-tout']) {
      assert.ok(!css.includes(editorRule), `${file} must exclude ${editorRule}`);
    }
  }
});
