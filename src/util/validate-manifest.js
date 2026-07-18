import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const distDir = path.resolve('./dist');
const manifestPath = path.join(distDir, 'manifest.json');
const fixtureSourceDir = path.resolve('./src/components');

const fail = (message) => {
  console.error(`ERROR: ${message}`);
  process.exit(1);
};

const assertObject = (value, label) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(`${label} missing or invalid.`);
  }
};

const assertString = (value, label) => {
  if (typeof value !== 'string' || value.length === 0) {
    fail(`${label} missing or invalid.`);
  }
};

const assertStringArray = (value, label) => {
  if (!Array.isArray(value)) {
    fail(`${label} must be an array.`);
  }

  for (const entry of value) {
    if (typeof entry !== 'string' || entry.length === 0) {
      fail(`${label} entries must be non-empty strings.`);
    }
  }
};

const normalizeLocalAssetPath = (assetPath) => {
  if (typeof assetPath !== 'string') {
    return null;
  }

  const trimmed = assetPath.trim();
  if (trimmed.length === 0) {
    return null;
  }

  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(trimmed)) {
    return null;
  }

  const noQueryOrHash = trimmed.split('#')[0].split('?')[0];
  const normalized = noQueryOrHash.replace(/^\/+/, '').replace(/\\/g, '/');

  return normalized.length > 0 ? normalized : null;
};

const collectFixtureModuleEntries = (rootDir, prefix = '') => {
  const entries = [];
  for (const item of fs.readdirSync(rootDir)) {
    const fullPath = path.join(rootDir, item);
    const relativePath = path.join(prefix, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (item.startsWith('.')) {
        continue;
      }
      entries.push(...collectFixtureModuleEntries(fullPath, relativePath));
      continue;
    }

    if (!item.endsWith('.fixture.js')) {
      continue;
    }

    entries.push(relativePath.replace(/\\/g, '/'));
  }

  return entries;
};

const componentIdFromFixtureModulePath = (fixtureModulePath) => {
  const noExt = fixtureModulePath.replace(/\.fixture\.js$/, '');
  const segments = noExt.split('/');

  if (segments[0] === 'wp-blocks' && segments.length > 1) {
    return segments[1];
  }

  return segments[0];
};

const normalizeDeclaredDepsList = (value, label) => {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value)) {
    fail(`${label} must be an array of relative asset paths.`);
  }

  const normalized = [];
  for (const entry of value) {
    if (typeof entry !== 'string') {
      fail(`${label} entries must be strings.`);
    }

    const assetPath = normalizeLocalAssetPath(entry);
    if (!assetPath) {
      fail(`${label} contains invalid path: ${entry}`);
    }

    normalized.push(assetPath);
  }

  return Array.from(new Set(normalized)).sort();
};

const parseFixtureMetadataDeps = (metadata, fixtureModulePath) => {
  if (typeof metadata === 'undefined') {
    fail(`${fixtureModulePath} must export metadata.deps for strict manifest validation.`);
  }

  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    fail(`${fixtureModulePath} metadata export must be an object.`);
  }

  const deps = metadata.deps ?? {};
  if (!deps || typeof deps !== 'object' || Array.isArray(deps)) {
    fail(`${fixtureModulePath} metadata.deps must be an object.`);
  }

  const cssDeps = normalizeDeclaredDepsList(deps.css, `${fixtureModulePath} metadata.deps.css`);
  const jsDeps = normalizeDeclaredDepsList(deps.js, `${fixtureModulePath} metadata.deps.js`);

  return Array.from(new Set([...cssDeps, ...jsDeps])).sort();
};

const loadFixtureMetadataDepsByComponent = async () => {
  if (!fs.existsSync(fixtureSourceDir)) {
    fail('Missing src/components directory while loading fixture metadata.');
  }

  const fixtureModules = collectFixtureModuleEntries(fixtureSourceDir);
  const metadataDepsByComponent = {};

  for (const fixtureModulePath of fixtureModules) {
    const absolutePath = path.join(fixtureSourceDir, fixtureModulePath);
    const componentId = componentIdFromFixtureModulePath(fixtureModulePath);
    const moduleUrl = pathToFileURL(absolutePath).href;

    let fixtureModule;
    try {
      fixtureModule = await import(moduleUrl);
    } catch {
      fail(`Failed to load fixture module metadata from ${fixtureModulePath}.`);
    }

    const metadataDeps = parseFixtureMetadataDeps(fixtureModule.metadata, fixtureModulePath);
    metadataDepsByComponent[componentId] = metadataDeps;
  }

  return metadataDepsByComponent;
};

const toSortedUnique = (paths) => Array.from(new Set(paths)).sort();

const sameStringSet = (left, right) => {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
};

const ensureBuildInputs = () => {
  if (!fs.existsSync(distDir)) {
    fail('dist directory missing. Run npm run build first.');
  }

  if (!fs.existsSync(manifestPath)) {
    fail('dist/manifest.json missing. Build contract broken.');
  }
};

const createAssetFileChecks = () => {
  const fileExists = (relativePath) => fs.existsSync(path.join(distDir, relativePath));
  const assertAssetFilesExist = (paths, label) => {
    for (const assetPath of paths) {
      if (!fileExists(assetPath)) {
        fail(`${label} references missing file: ${assetPath}`);
      }
    }
  };

  return { fileExists, assertAssetFilesExist };
};

const checkManifestShape = ({ manifest }) => {
  assertObject(manifest, 'manifest');
  assertObject(manifest.components, 'manifest.components');
  assertObject(manifest.fixtures, 'manifest.fixtures');
  assertObject(manifest.shared, 'manifest.shared');
};

const checkFixtures = ({ manifest, fileExists, assertAssetFilesExist }) => {
  for (const [fixtureId, fixture] of Object.entries(manifest.fixtures)) {
    assertObject(fixture, `fixture "${fixtureId}"`);

    if (fixture.id !== fixtureId) {
      fail(`fixture id mismatch for "${fixtureId}".`);
    }

    assertString(fixture.component, `fixture "${fixtureId}" component`);
    assertString(fixture.fixturePath, `fixture "${fixtureId}" fixturePath`);
    assertString(fixture.html, `fixture "${fixtureId}" html`);

    if (!fileExists(fixture.fixturePath)) {
      fail(`fixturePath does not exist for "${fixtureId}": ${fixture.fixturePath}`);
    }

    assertStringArray(fixture.css, `fixture "${fixtureId}" css`);
    assertStringArray(fixture.js, `fixture "${fixtureId}" js`);
    assertAssetFilesExist(fixture.css, `fixture "${fixtureId}" css`);
    assertAssetFilesExist(fixture.js, `fixture "${fixtureId}" js`);
  }
};

const checkComponentFixtureLinks = (componentId, component, manifestFixtures) => {
  for (const fixtureId of component.fixtures) {
    const fixture = manifestFixtures[fixtureId];
    if (!fixture) {
      fail(`component "${componentId}" references unknown fixture "${fixtureId}".`);
    }

    if (fixture.component !== componentId) {
      fail(`fixture "${fixtureId}" component mismatch (expected ${componentId}, got ${fixture.component}).`);
    }
  }
};

const checkComponentDeps = (componentId, component, expectedMetadataDeps) => {
  const ownAssets = new Set([...component.css, ...component.js]);

  if (!Array.isArray(expectedMetadataDeps)) {
    fail(`component "${componentId}" is missing fixture metadata.deps declaration.`);
  }

  const normalizedMetadataDeps = toSortedUnique(
    expectedMetadataDeps.filter((depPath) => !ownAssets.has(depPath)),
  );
  const normalizedComponentDeps = toSortedUnique(component.deps);

  if (!sameStringSet(normalizedComponentDeps, normalizedMetadataDeps)) {
    fail(
      `component "${componentId}" deps do not match fixture metadata declaration. `
      + `expected [${normalizedMetadataDeps.join(', ')}], got [${normalizedComponentDeps.join(', ')}].`,
    );
  }

  for (const depPath of component.deps) {
    if (ownAssets.has(depPath)) {
      fail(`component "${componentId}" dep duplicates direct asset: ${depPath}`);
    }
  }
};

const checkComponents = ({ manifest, metadataDepsByComponent, assertAssetFilesExist }) => {
  for (const [componentId, component] of Object.entries(manifest.components)) {
    assertObject(component, `component "${componentId}"`);

    if (component.id !== componentId) {
      fail(`component id mismatch for "${componentId}".`);
    }

    if (!Array.isArray(component.fixtures) || component.fixtures.length === 0) {
      fail(`component "${componentId}" must have at least one fixture.`);
    }

    assertStringArray(component.css, `component "${componentId}" css`);
    assertStringArray(component.js, `component "${componentId}" js`);
    assertStringArray(component.deps, `component "${componentId}" deps`);

    checkComponentFixtureLinks(componentId, component, manifest.fixtures);
    assertAssetFilesExist(component.css, `component "${componentId}" css`);
    assertAssetFilesExist(component.js, `component "${componentId}" js`);
    assertAssetFilesExist(component.deps, `component "${componentId}" deps`);
    checkComponentDeps(componentId, component, metadataDepsByComponent[componentId]);
  }
};

const checkSharedAssets = ({ manifest, assertAssetFilesExist }) => {
  assertStringArray(manifest.shared.css, 'manifest.shared.css');
  assertStringArray(manifest.shared.js, 'manifest.shared.js');
  assertAssetFilesExist(manifest.shared.css, 'manifest.shared.css');
  assertAssetFilesExist(manifest.shared.js, 'manifest.shared.js');
};

const runChecks = (context) => {
  const checks = [
    checkManifestShape,
    checkFixtures,
    checkComponents,
    checkSharedAssets,
  ];

  for (const check of checks) {
    check(context);
  }
};

const run = async () => {
  ensureBuildInputs();

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const metadataDepsByComponent = await loadFixtureMetadataDepsByComponent();
  const { fileExists, assertAssetFilesExist } = createAssetFileChecks();

  runChecks({
    manifest,
    metadataDepsByComponent,
    fileExists,
    assertAssetFilesExist,
  });

  console.log('OK manifest contract valid');
};

run().catch((error) => {
  fail(`Manifest validation failed: ${error.message}`);
});