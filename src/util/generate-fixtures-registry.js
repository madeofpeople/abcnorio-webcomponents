import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// Setup paths relative to the execution root
const distDir = path.resolve('./dist');
const manifestPath = path.join(distDir, 'manifest.json');
const legacyManifestPath = path.join(distDir, 'fixtures-manifest.json');
const elementsManifestPath = path.join(distDir, 'elements', '.vite', 'manifest.json');
const packageJsonPath = path.resolve('./package.json');
const fixtureSourceDir = path.resolve('./src/components');
const defaultStyleFile = path.join(distDir, 'styles', '_..css');
const stableStyleRelativePath = 'styles/components.css';
const stableStyleFile = path.join(distDir, stableStyleRelativePath);

const fail = (message) => {
  console.error(`Error: ${message}`);
  process.exit(1);
};

const assertFileExists = (filePath, message) => {
  if (!fs.existsSync(filePath)) {
    fail(message);
  }
};

const parseJsonFile = (filePath, message) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    fail(message);
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
  return noExt.includes('/') ? noExt.split('/')[0] : noExt;
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
    fail(`${fixtureModulePath} must export metadata.deps for strict manifest generation.`);
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

const ensureComponentEntry = (manifest, componentId) => {
  if (!manifest.components[componentId]) {
    manifest.components[componentId] = {
      id: componentId,
      fixtures: [],
      css: [],
      js: [],
      deps: [],
    };
  }

  return manifest.components[componentId];
};

const createManifest = () => {
  const manifest = {
    components: {},
    fixtures: {},
    shared: {
      css: [],
      js: [],
    },
  };

  if (fs.existsSync(defaultStyleFile)) {
    fs.copyFileSync(defaultStyleFile, stableStyleFile);
  }

  if (fs.existsSync(stableStyleFile)) {
    manifest.shared.css.push(stableStyleRelativePath);
  }

  return manifest;
};

const collectFixtureEntries = (rootDir, prefix = '') => {
  const entries = [];
  for (const item of fs.readdirSync(rootDir)) {
    const fullPath = path.join(rootDir, item);
    const relativePath = path.join(prefix, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (item.startsWith('.') || item === 'assets' || item === 'styles') {
        continue;
      }
      entries.push(...collectFixtureEntries(fullPath, relativePath));
      continue;
    }

    if (!item.endsWith('.html') || item === 'index.html') {
      continue;
    }

    entries.push(relativePath.replace(/\\/g, '/'));
  }

  return entries;
};

const componentIdFromFixturePath = (fixturePath) => {
  const noExt = fixturePath.replace(/\.html$/, '');
  return noExt.includes('/') ? noExt.split('/')[0] : noExt;
};

const loadElementSourceMap = () => {
  assertFileExists(packageJsonPath, 'package.json missing while resolving component element entries.');

  const packageJson = parseJsonFile(
    packageJsonPath,
    'package.json is not valid JSON while resolving component element entries.',
  );
  const exportsMap = packageJson.exports ?? {};
  const srcToComponent = {};
  const validComponentIds = new Set();

  for (const [key, target] of Object.entries(exportsMap)) {
    if (!key.endsWith('/element') || typeof target !== 'string') {
      continue;
    }

    const componentId = key.replace(/^\.\//, '').replace(/\/element$/, '');
    const normalizedSource = target.replace(/^\.\//, '').replace(/\\/g, '/');

    srcToComponent[normalizedSource] = componentId;
    validComponentIds.add(componentId);
  }

  return { srcToComponent, validComponentIds };
};

const resolveComponentIdFromEntry = (entryKey, entry, srcToComponent, validComponentIds) => {
  const candidateNames = [entry?.name, entry?.src, entryKey]
    .filter(Boolean)
    .map((value) => String(value).replace(/^\.\//, '').replace(/\\/g, '/'));

  for (const candidate of candidateNames) {
    if (srcToComponent[candidate]) {
      return srcToComponent[candidate];
    }

    const sourceMatch = candidate.match(/src\/components\/([^/]+)\/\1\.js$/);
    if (sourceMatch?.[1] && validComponentIds.has(sourceMatch[1])) {
      return sourceMatch[1];
    }

    if (validComponentIds.has(candidate)) {
      return candidate;
    }
  }

  const fileName = entry?.file ? path.basename(entry.file, '.js') : null;
  if (fileName && validComponentIds.has(fileName)) {
    return fileName;
  }

  return null;
};

const collectImportedCss = (viteManifest, manifestKey, visited = new Set()) => {
  if (visited.has(manifestKey)) {
    return [];
  }

  visited.add(manifestKey);
  const entry = viteManifest[manifestKey];
  if (!entry) {
    return [];
  }

  const css = new Set(Array.isArray(entry.css) ? entry.css : []);
  for (const importedKey of entry.imports ?? []) {
    for (const importedCss of collectImportedCss(viteManifest, importedKey, visited)) {
      css.add(importedCss);
    }
  }

  return Array.from(css);
};

const loadElementAssets = () => {
  assertFileExists(
    elementsManifestPath,
    'Missing compiler manifest dist/elements/.vite/manifest.json.',
  );

  const viteManifest = parseJsonFile(
    elementsManifestPath,
    'Invalid compiler manifest JSON in dist/elements/.vite/manifest.json.',
  );
  if (!viteManifest || typeof viteManifest !== 'object') {
    fail('Invalid compiler manifest shape in dist/elements/.vite/manifest.json.');
  }

  const { srcToComponent, validComponentIds } = loadElementSourceMap();
  const componentAssets = {};

  for (const [entryKey, entry] of Object.entries(viteManifest)) {
    if (!entry?.isEntry || typeof entry.file !== 'string' || !entry.file.endsWith('.js')) {
      continue;
    }

    const componentId = resolveComponentIdFromEntry(entryKey, entry, srcToComponent, validComponentIds);
    if (!componentId) {
      continue;
    }

    if (!componentAssets[componentId]) {
      componentAssets[componentId] = { js: new Set(), css: new Set() };
    }

    componentAssets[componentId].js.add(`elements/${entry.file}`);
    const importedCss = collectImportedCss(viteManifest, entryKey);
    for (const cssPath of importedCss) {
      componentAssets[componentId].css.add(`elements/${cssPath}`);
    }
  }

  const output = {};
  for (const [componentId, assets] of Object.entries(componentAssets)) {
    output[componentId] = {
      css: Array.from(assets.css).sort(),
      js: Array.from(assets.js).sort(),
    };
  }

  return output;
};

const registerFixture = (manifest, fixtureRelativePath, metadataDepsByComponent) => {
  const fixturePath = path.join(distDir, fixtureRelativePath);
  assertFileExists(fixturePath, `Expected fixture file missing: ${fixtureRelativePath}`);

  const htmlContent = fs.readFileSync(fixturePath, 'utf-8');
  const componentId = componentIdFromFixturePath(fixtureRelativePath);
  const fixtureId = fixtureRelativePath.replace(/\.html$/, '');
  const metadataDeps = metadataDepsByComponent[componentId];
  if (!Array.isArray(metadataDeps)) {
    fail(`No metadata.deps declared for fixture component "${componentId}".`);
  }
  const fixtureDeps = metadataDeps;

  manifest.fixtures[fixtureId] = {
    id: fixtureId,
    component: componentId,
    fixturePath: fixtureRelativePath,
    html: htmlContent.trim(),
    css: [],
    js: [],
  };

  const componentEntry = ensureComponentEntry(manifest, componentId);
  componentEntry.fixtures.push(fixtureId);
  componentEntry.deps.push(...fixtureDeps);
};

const finalizeComponentAssets = (manifest, elementAssets) => {
  for (const [componentId, component] of Object.entries(manifest.components)) {
    const assets = elementAssets[componentId] ?? { css: [], js: [] };

    component.css = assets.css;
    component.js = assets.js;
    const componentAssetSet = new Set([...component.css, ...component.js]);
    // deps are fixture-linked assets that are not part of the component's direct compiled css/js bundles.
    component.deps = Array.from(new Set(component.deps.filter((assetPath) => !componentAssetSet.has(assetPath)))).sort();
    component.fixtures.sort();
    component.css.sort();
    component.js.sort();

    for (const fixtureId of component.fixtures) {
      manifest.fixtures[fixtureId].css = [...component.css];
      manifest.fixtures[fixtureId].js = [...component.js];
    }
  }
};

const ensureBuildInputs = () => {
  assertFileExists(distDir, 'The "dist" directory does not exist. Run "npm run build" first.');
};

const collectBuildInputs = async (context) => {
  const fixtureEntries = collectFixtureEntries(distDir);
  if (fixtureEntries.length === 0) {
    fail('No fixture HTML files found in dist. Build contract invalid.');
  }

  context.fixtureEntries = fixtureEntries;
  context.elementAssets = loadElementAssets();
  context.metadataDepsByComponent = await loadFixtureMetadataDepsByComponent();
};

const buildFixtureManifest = (context) => {
  for (const fixtureRelativePath of context.fixtureEntries) {
    registerFixture(context.manifest, fixtureRelativePath, context.metadataDepsByComponent);
  }
};

const finalizeManifest = (context) => {
  finalizeComponentAssets(context.manifest, context.elementAssets);
};

const removeLegacyManifest = () => {
  if (fs.existsSync(legacyManifestPath)) {
    fs.rmSync(legacyManifestPath);
  }
};

const writeManifest = (context) => {
  fs.writeFileSync(manifestPath, JSON.stringify(context.manifest, null, 2));
};

const runSteps = async (steps, context) => {
  for (const step of steps) {
    await step(context);
  }
};

const run = async () => {
  ensureBuildInputs();

  const context = {
    manifest: createManifest(),
    fixtureEntries: [],
    elementAssets: {},
    metadataDepsByComponent: {},
  };

  await runSteps([
    collectBuildInputs,
    buildFixtureManifest,
    finalizeManifest,
    () => removeLegacyManifest(),
    writeManifest,
  ], context);

  console.log('\x1b[32m%s\x1b[0m', '🎉 Successfully generated manifest at: ./dist/manifest.json');
};

run().catch((error) => {
  fail(`Critical error assembling the fixtures registry: ${error.message}`);
});