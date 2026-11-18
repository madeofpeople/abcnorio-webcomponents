import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('public form editor fixture is a declared inert placeholder, not a working form', () => {
  const editor = readFileSync(new URL('../dist/public-form/editor.html', import.meta.url), 'utf8');
  const normal = readFileSync(new URL('../dist/public-form.html', import.meta.url), 'utf8');
  assert.match(editor, /data-editor-root/);
  for (const name of ['title', 'slug', 'status', 'submit']) {
    assert.match(editor, new RegExp(`data-editor-bind="${name}"`));
  }
  assert.match(editor, /<button\b[^>]*type="button"[^>]*disabled/);
  assert.doesNotMatch(editor, /<(?:form|input|select|textarea|fieldset)\b|data-generic-form|data-submit-action|<script\b/);
  assert.doesNotMatch(normal, /data-editor-|abcnorio-form__placeholder/);
});
