import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import * as sass from 'sass-embedded';

test('announcement tout editor preserves shared rules and editor specificity', () => {
  const source = new URL('../src/components/announcement-tout/announcement-tout.scss', import.meta.url);
  const shared = sass.compile(fileURLToPath(source), {
    importers: [{
      findFileUrl(url) {
        return url.startsWith('@tokens/')
          ? new URL(`../src/design-tokens/${url.slice('@tokens/'.length)}`, import.meta.url)
          : null;
      },
    }],
    style: 'compressed',
  }).css;
  const editor = readFileSync(new URL('../dist/styles/editor/announcement-tout.css', import.meta.url), 'utf8');

  assert.ok(editor.includes('.block-editor-iframe__body .announcement-tout{'));
  assert.ok(editor.includes('.block-editor-iframe__body .announcement-tout--secondary{'));
  assert.equal(editor.replaceAll('.block-editor-iframe__body ', ''), shared);
  assert.ok(!shared.includes('.block-editor-iframe__body'));
});
