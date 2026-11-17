import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('source package contains build inputs but no project build output', () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const [packed] = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--ignore-scripts', '--json'], {
    cwd: root,
    encoding: 'utf8',
  }));
  const files = new Set(packed.files.map(({ path }) => path));
  for (const required of [
    'astro.config.mjs', 'vite.elements.config.mjs', 'tsconfig.json',
    'scripts/sync-font-assets.sh', 'src/pages/[...slug].astro',
    'src/util/generate-fixtures-registry.js', 'src/util/validate-manifest.js',
    'src/design-tokens/fonts/SourceSans3-Regular.woff2',
  ]) {
    assert.ok(files.has(required), `Missing build input: ${required}`);
  }
  assert.ok(![...files].some((file) => file.startsWith('dist/') || file.startsWith('public/assets/')));
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  assert.ok(pkg.dependencies.vite);
  for (const hook of ['preinstall', 'install', 'postinstall', 'prepare']) {
    assert.equal(pkg.scripts[hook], undefined, `Unexpected install-time build hook: ${hook}`);
  }
  assert.doesNotMatch(pkg.scripts.version, /git add.*dist/);
});
