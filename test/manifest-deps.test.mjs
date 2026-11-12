import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('preserves a declared WP dependency even when it is a direct asset', (t) => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), 'manifest-deps-'));
  t.after(() => fs.rmSync(project, { recursive: true }));
  for (const dir of ['src/util', 'src/components/sample', 'src/design-tokens', 'dist/elements/.vite']) {
    fs.mkdirSync(path.join(project, dir), { recursive: true });
  }
  for (const script of ['generate-fixtures-registry.js', 'validate-manifest.js']) {
    fs.copyFileSync(path.join(root, 'src/util', script), path.join(project, 'src/util', script));
  }
  const write = (file, value) => fs.writeFileSync(path.join(project, file), value);
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(project, 'node_modules'), 'dir');
  fs.copyFileSync(path.join(root, 'src/design-tokens/_fonts.scss'), path.join(project, 'src/design-tokens/_fonts.scss'));
  fs.mkdirSync(path.join(project, 'dist/assets'));
  for (const name of ['SourceSans3-Regular', 'SourceSans3-Bold', 'SourceSans3-Italic', 'SourceSans3-BoldItalic', 'SpecialElite-Regular', 'Impact_Label_Reversed']) {
    write(`dist/assets/${name}.woff2`, '');
  }
  write('package.json', JSON.stringify({
    type: 'module',
    exports: { './sample/element': './src/components/sample/sample.js' },
  }));
  write('src/components/sample/sample.fixture.js', "export const metadata = { deps: { css: [], js: ['elements/sample.js'] } };\n");
  write('src/components/sample/editor.scss', '.editor-styles-wrapper .sample { color: red; }');
  write('dist/sample.html', '<p>Sample</p>');
  write('dist/gallery-image-sizes.json', '{"default":"large"}');
  write('dist/elements/sample.js', 'export {};\n');
  write('dist/elements/.vite/manifest.json', JSON.stringify({
    'src/components/sample/sample.js': {
      isEntry: true, file: 'sample.js', src: 'src/components/sample/sample.js',
    },
  }));
  for (const script of ['generate-fixtures-registry.js', 'validate-manifest.js']) {
    const result = spawnSync(process.execPath, [`src/util/${script}`], { cwd: project, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(project, 'dist/manifest.json')));
  assert.deepEqual(manifest.components.sample.js, ['elements/sample.js']);
  assert.deepEqual(manifest.components.sample.deps, ['elements/sample.js']);
  assert.ok(manifest.shared.css.includes('styles/fonts.css'));
  assert.deepEqual(manifest.components.sample.editorCss, ['styles/editor/sample.css']);
  assert.ok(!manifest.shared.css.includes('styles/editor/sample.css'));
  assert.match(fs.readFileSync(path.join(project, 'dist/styles/editor/sample.css'), 'utf8'), /color:red/);

  fs.renameSync(path.join(project, 'dist/styles/editor/sample.css'), path.join(project, 'dist/styles/editor/sample.css.bak'));
  const editorValidation = spawnSync(process.execPath, ['src/util/validate-manifest.js'], {
    cwd: project, encoding: 'utf8',
  });
  assert.notEqual(editorValidation.status, 0);
  assert.match(editorValidation.stderr, /editorCss references missing file/);
  fs.renameSync(path.join(project, 'dist/styles/editor/sample.css.bak'), path.join(project, 'dist/styles/editor/sample.css'));

  const fontCss = fs.readFileSync(path.join(project, 'dist/styles/fonts.css'), 'utf8');
  write('dist/styles/fonts.css', fontCss.replace('--font-impact-label-reversed:', '--missing-font:'));
  const fontValidation = spawnSync(process.execPath, ['src/util/validate-manifest.js'], {
    cwd: project, encoding: 'utf8',
  });
  assert.notEqual(fontValidation.status, 0);
  assert.match(fontValidation.stderr, /styles\/fonts.css missing --font-impact-label-reversed/);
  write('dist/styles/fonts.css', fontCss);

  manifest.components.sample.deps = [];
  write('dist/manifest.json', JSON.stringify(manifest));
  const validation = spawnSync(process.execPath, ['src/util/validate-manifest.js'], {
    cwd: project, encoding: 'utf8',
  });
  assert.notEqual(validation.status, 0);
  assert.match(validation.stderr, /deps do not match fixture metadata/);

});
