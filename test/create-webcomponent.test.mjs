import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function workspace(t) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'wc-create-test-'));
  t.after(() => fs.rmSync(temp, { recursive: true }));
  const project = path.join(temp, 'abcnorio-webcomponents');
  for (const dir of ['scripts', 'src/types', 'src/components/wp-blocks']) {
    fs.mkdirSync(path.join(project, dir), { recursive: true });
  }
  for (const file of [
    'package.json',
    'scripts/create-webcomponent.sh',
    'scripts/create-webcomponent.mjs',
    'scripts/sync-types.mjs',
    'src/types/index.d.ts',
    'src/components/wp-blocks/block-registry.js',
    'src/components/content-listing/content-listing.metadata.js',
    'src/components/event-listing/event-listing.metadata.js',
    'src/components/collective-listing/collective-listing.metadata.js',
  ]) {
    const destination = path.join(project, file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(root, file), destination);
  }
  return project;
}

function run(project, ...args) {
  return spawnSync('bash', [path.join(project, 'scripts/create-webcomponent.sh'), ...args], {
    encoding: 'utf8',
  });
}

function snapshot(dir, prefix = '') {
  const files = {};
  for (const entry of fs.readdirSync(path.join(dir, prefix), { withFileTypes: true })) {
    const name = path.join(prefix, entry.name);
    if (entry.isDirectory()) Object.assign(files, snapshot(dir, name));
    else files[name] = fs.readFileSync(path.join(dir, name), 'utf8');
  }
  return files;
}

test('creates a component with fixture, exports and types', (t) => {
  const project = workspace(t);
  const result = run(project, 'sample-card');
  assert.equal(result.status, 0, result.stderr);
  const component = path.join(project, 'src/components/sample-card');
  assert.deepEqual(fs.readdirSync(component).sort(), [
    'sample-card.astro', 'sample-card.fixture.js', 'sample-card.js', 'sample-card.scss',
  ]);
  const fixture = fs.readFileSync(path.join(component, 'sample-card.fixture.js'), 'utf8');
  assert.match(fixture, /metadata =/);
  assert.match(fixture, /props: \{\}/);
  const exports = JSON.parse(fs.readFileSync(path.join(project, 'package.json'))).exports;
  assert.equal(exports['./sample-card'], './src/components/sample-card/sample-card.astro');
  assert.equal(exports['./sample-card/element'], './src/components/sample-card/sample-card.js');
  assert.match(fs.readFileSync(path.join(project, 'src/types/index.d.ts'), 'utf8'), /abcnorio-webcomponents\/sample-card'/);
});

for (const [label, block, prefix] of [
  ['core', 'core/cover', 'CORE'],
  ['custom', 'abcnorio/sample-banner', 'CUSTOM'],
]) {
  test(`wires a ${label} block`, (t) => {
    const project = workspace(t);
    const result = run(project, 'sample-banner', '--scope', 'wp-blocks', '--wp-block', block);
    assert.equal(result.status, 0, result.stderr);
    const registry = fs.readFileSync(path.join(project, 'src/components/wp-blocks/block-registry.js'), 'utf8');
    assert.match(registry, /import SampleBannerBlock from '\.\/sample-banner\/sample-banner\.astro'/);
    assert.ok(registry.includes(`  SAMPLE_BANNER: '${block}',`));
    assert.ok(registry.includes(`  [${prefix}_BLOCK_KEYS.SAMPLE_BANNER]: SampleBannerBlock,`));
    assert.ok(fs.existsSync(path.join(project, 'src/components/wp-blocks/sample-banner/sample-banner.fixture.js')));
  });
}

for (const [label, args, setup, message] of [
  ['invalid name', ['Bad_Name'], () => {}, /kebab-case/],
  ['numeric component name', ['123-card'], () => {}, /cannot start with a number/],
  ['numeric WP wrapper name', ['123-card', '--scope', 'wp-blocks', '--wp-block', 'abcnorio/123-card'], () => {}, /cannot start with a number/],
  ['embed', ['sample-video', '--scope', 'wp-blocks', '--wp-block', 'core/embed'], () => {}, /Embed providers/],
  ['literal block key', ['sample-banner', '--scope', 'wp-blocks', '--wp-block', 'abcnorio/hero'], () => {}, /already contains key/],
  ['computed block key', ['sample-banner', '--scope', 'wp-blocks', '--wp-block', 'abcnorio/content-listing'], () => {}, /already contains key/],
  ['constant', ['sample-banner', '--scope', 'wp-blocks', '--wp-block', 'abcnorio/new-banner'], (project) => {
    const file = path.join(project, 'src/components/wp-blocks/block-registry.js');
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(
      'export const CUSTOM_BLOCK_KEYS = {',
      "export const CUSTOM_BLOCK_KEYS = {\n  SAMPLE_BANNER: 'abcnorio/old-banner',",
    ));
  }, /already contains constant/],
  ['existing export', ['button'], () => {}, /Export already exists/],
  ['fixture name', ['sample-card'], (project) => {
    const dir = path.join(project, 'src/components/wp-blocks/sample-card');
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'sample-card.fixture.js'), '');
  }, /Fixture name already exists/],
  ['missing registry section', ['sample-banner', '--scope', 'wp-blocks', '--wp-block', 'abcnorio/sample-banner'], (project) => {
    const file = path.join(project, 'src/components/wp-blocks/block-registry.js');
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('export const CUSTOM_BLOCK_REGISTRY', 'export const OLD_REGISTRY'));
  }, /Registry section missing/],
  ['type generation failure', ['sample-card'], (project) => {
    fs.writeFileSync(path.join(project, 'scripts/sync-types.mjs'), 'throw new Error("sync failed");\n');
  }, /sync failed/],
]) {
  test(`rejects ${label} without changing files`, (t) => {
    const project = workspace(t);
    setup(project);
    const before = snapshot(project);
    const result = run(project, ...args);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, message);
    assert.deepEqual(snapshot(project), before);
  });
}

test('rolls back files if writing fails', (t) => {
  const project = workspace(t);
  const preload = path.join(path.dirname(project), 'fail-write.mjs');
  const typesPath = path.join(project, 'src/types/index.d.ts');
  fs.writeFileSync(preload, `
import fs from 'node:fs';
const write = fs.writeFileSync;
let failed = false;
fs.writeFileSync = function (file, ...args) {
  if (!failed && file === ${JSON.stringify(typesPath)}) {
    failed = true;
    throw new Error('simulated write failure');
  }
  return write.call(this, file, ...args);
};
`);
  const before = snapshot(project);
  const result = spawnSync('bash', [
    path.join(project, 'scripts/create-webcomponent.sh'),
    'sample-banner', '--scope', 'wp-blocks', '--wp-block', 'abcnorio/sample-banner',
  ], {
    encoding: 'utf8',
    env: { ...process.env, NODE_OPTIONS: `--import=${preload}` },
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /simulated write failure/);
  assert.deepEqual(snapshot(project), before);
});
