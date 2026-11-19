import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

test('editor styles are separate assets, not frontend dependencies', () => {
  const dist = new URL('../dist/', import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL('manifest.json', dist), 'utf8'));
  const components = ['announcement-tout', 'gallery', 'hero', 'event-listing', 'content-listing', 'collective-listing', 'buttons', 'public-form', 'newsletter-signup'];
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
    for (const editorRule of ['--listing-preview-columns', 'abcnorio-gallery-editor', 'abcnorio-form__placeholder', 'abcnorio-newsletter-signup__preview-label', 'abcnorio-newsletter-signup__preview-input', 'abcnorio-newsletter-signup__preview-button', '.editor-styles-wrapper .wp-block-buttons', '.block-editor-iframe__body .announcement-tout']) {
      assert.ok(!css.includes(editorRule), `${file} must exclude ${editorRule}`);
    }
  }
});

test('both listing previews apply column changes before server markup refreshes', () => {
  for (const id of ['event-listing', 'content-listing']) {
    const css = readFileSync(new URL(`../dist/styles/editor/${id}.css`, import.meta.url), 'utf8');
    for (const variant of ['', '.grid-3', '.grid-4']) {
      assert.ok(css.includes(`.${id}.card-grid${variant} .teaser-list`), `${id}${variant} must support immediate grid preview changes`);
    }
    assert.match(css, /grid-template-columns:repeat\(var\(--listing-preview-columns,/);
  }
});

test('section spacing stays on editor wrappers instead of nested listing previews', () => {
  for (const id of ['content-listing', 'event-listing', 'collective-listing']) {
    const frontend = readFileSync(new URL(`../dist/styles/${id}.css`, import.meta.url), 'utf8');
    const editor = readFileSync(new URL(`../dist/styles/editor/${id}.css`, import.meta.url), 'utf8');
    assert.match(frontend, new RegExp(`\\.${id}\\{[^}]*margin-bottom:3rem`));
    assert.ok(editor.includes(`.editor-styles-wrapper .wp-block.wp-block-abcnorio-${id}{margin:0 0 3rem}`));
    assert.ok(editor.includes(`.wp-block-abcnorio-${id} .${id}{margin-bottom:0}`));
  }
  const announcement = readFileSync(new URL('../dist/styles/editor/announcement-tout.css', import.meta.url), 'utf8');
  assert.ok(announcement.includes('.editor-styles-wrapper .wp-block.wp-block-abcnorio-announcement-tout{margin:0 0 3rem}'));
});
