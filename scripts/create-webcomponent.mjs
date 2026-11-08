import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const componentsDir = path.join(root, 'src/components');
const packagePath = path.join(root, 'package.json');
const typesPath = path.join(root, 'src/types/index.d.ts');
const registryPath = path.join(componentsDir, 'wp-blocks/block-registry.js');

function fail(message) {
  throw new Error(message);
}

function readOptions(args) {
  const [name, ...options] = args;
  if (!name || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    fail('Expected a component name in kebab-case.');
  }
  if (/^[0-9]/.test(name)) {
    fail('Component names cannot start with a number.');
  }

  let scope = 'components';
  let wpBlock = '';
  while (options.length) {
    const option = options.shift();
    const value = options.shift();
    if (!value || value.startsWith('--')) fail(`Missing value for ${option}.`);
    if (option === '--scope') scope = value;
    else if (option === '--wp-block') wpBlock = value;
    else fail(`Unknown argument: ${option}`);
  }

  if (scope !== 'components' && scope !== 'wp-blocks') {
    fail('Scope must be components or wp-blocks.');
  }
  if ((scope === 'wp-blocks') !== Boolean(wpBlock)) {
    fail('--scope wp-blocks and --wp-block must be used together.');
  }
  if (wpBlock && !/^[a-z0-9]+\/[a-z0-9]+(-[a-z0-9]+)*$/.test(wpBlock)) {
    fail('Expected a block name like core/cover or abcnorio/announcement-tout.');
  }
  if (wpBlock === 'core/embed') {
    fail('Embed providers use a separate registry and are not supported by this scaffold.');
  }
  return { name, scope, wpBlock };
}

function fixtureExists(dir, filename) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (entry.isDirectory() && fixtureExists(path.join(dir, entry.name), filename)) return true;
    if (entry.isFile() && entry.name === filename) return true;
  }
  return false;
}

function section(source, name) {
  const match = source.match(new RegExp(`export const ${name} = \\{\\n([\\s\\S]*?)\\n\\};`));
  if (!match) fail(`Registry section missing: ${name}`);
  return match[0];
}

async function updateRegistry(source, name, wpBlock) {
  const keySections = ['CORE_BLOCK_KEYS', 'CUSTOM_BLOCK_KEYS'].map((key) => section(source, key));
  const imports = [...source.matchAll(/^import \{ ([^}]+) \} from '([^']+)';$/gm)]
    .map((match) => `import { ${match[1]} } from '${pathToFileURL(path.resolve(path.dirname(registryPath), match[2])).href}';`);
  const keyModule = `${imports.join('\n')}\n${keySections.join('\n')}`;
  const keys = await import(`data:text/javascript;base64,${Buffer.from(keyModule).toString('base64')}`);
  const constant = name.toUpperCase().replace(/-/g, '_');
  const className = `${name.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('')}Block`;

  for (const entries of [keys.CORE_BLOCK_KEYS, keys.CUSTOM_BLOCK_KEYS]) {
    if (Object.hasOwn(entries, constant)) fail(`Block registry already contains constant: ${constant}`);
    if (Object.values(entries).includes(wpBlock)) fail(`Block registry already contains key: ${wpBlock}`);
  }
  if (new RegExp(`\\bimport\\s+${className}\\s+from\\b`).test(source)) {
    fail(`Block registry already contains import: ${className}`);
  }

  const prefix = wpBlock.startsWith('core/') ? 'CORE' : 'CUSTOM';
  const keySection = section(source, `${prefix}_BLOCK_KEYS`);
  const registrySection = section(source, `${prefix}_BLOCK_REGISTRY`);
  const append = (text, line) => text.replace(/\n\};$/, `\n  ${line}\n};`);
  const importLine = `import ${className} from './${name}/${name}.astro';\n`;

  return importLine + source
    .replace(keySection, append(keySection, `${constant}: '${wpBlock}',`))
    .replace(registrySection, append(registrySection, `[${prefix}_BLOCK_KEYS.${constant}]: ${className},`));
}

async function main() {
  const { name, scope, wpBlock } = readOptions(process.argv.slice(2));
  const relativeDir = scope === 'wp-blocks' ? `src/components/wp-blocks/${name}` : `src/components/${name}`;
  const targetDir = path.join(root, relativeDir);
  if (fs.existsSync(targetDir)) fail(`Component directory already exists: ${targetDir}`);
  if (fixtureExists(componentsDir, `${name}.fixture.js`)) fail(`Fixture name already exists: ${name}`);

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const exportPrefix = scope === 'wp-blocks' ? `./wp-blocks/${name}` : `./${name}`;
  for (const key of [exportPrefix, `${exportPrefix}/element`]) {
    if (Object.hasOwn(packageJson.exports, key)) fail(`Export already exists: ${key}`);
  }
  packageJson.exports[exportPrefix] = `./${relativeDir}/${name}.astro`;
  packageJson.exports[`${exportPrefix}/element`] = `./${relativeDir}/${name}.js`;
  const registry = wpBlock ? await updateRegistry(fs.readFileSync(registryPath, 'utf8'), name, wpBlock) : null;

  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'wc-create-'));
  const originals = new Map();
  const written = [];
  let targetCreated = false;
  try {
    fs.mkdirSync(path.join(temp, 'scripts'), { recursive: true });
    fs.mkdirSync(path.join(temp, 'src/types'), { recursive: true });
    fs.copyFileSync(path.join(root, 'scripts/sync-types.mjs'), path.join(temp, 'scripts/sync-types.mjs'));
    fs.copyFileSync(typesPath, path.join(temp, 'src/types/index.d.ts'));
    fs.writeFileSync(path.join(temp, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`);
    execFileSync(process.execPath, [path.join(temp, 'scripts/sync-types.mjs')], { stdio: 'inherit' });

    const files = new Map([
      [packagePath, fs.readFileSync(path.join(temp, 'package.json'))],
      [typesPath, fs.readFileSync(path.join(temp, 'src/types/index.d.ts'))],
    ]);
    if (registry !== null) files.set(registryPath, registry);
    for (const file of files.keys()) originals.set(file, fs.readFileSync(file));

    fs.mkdirSync(targetDir);
    targetCreated = true;
    fs.writeFileSync(path.join(targetDir, `${name}.astro`), `---
import { Debug } from 'astro:components';

const props = Astro.props;
---

<Debug {...props} />

<script>
  import './${name}.js';
</script>

<style lang="scss">
  @use './${name}.scss';
</style>
`);
    fs.writeFileSync(path.join(targetDir, `${name}.scss`), '/* Component styles */\n');
    fs.writeFileSync(path.join(targetDir, `${name}.js`), '// Component behavior\n');
    fs.writeFileSync(path.join(targetDir, `${name}.fixture.js`), `export const metadata = {
  deps: {
    css: [],
    js: [],
  },
};

export default {
  default: {
    props: {},
  },
};
`);
    for (const [file, contents] of files) {
      written.push(file);
      fs.writeFileSync(file, contents);
    }
    console.log(`Created component scaffold: ${targetDir}`);
    console.log('Updated package exports and types.');
    if (wpBlock) console.log(`Updated block registry for: ${wpBlock}`);
  } catch (error) {
    const cleanupErrors = [];
    for (const file of written.reverse()) {
      try {
        fs.writeFileSync(file, originals.get(file));
      } catch (cleanupError) {
        cleanupErrors.push(`${file}: ${cleanupError.message}`);
      }
    }
    if (targetCreated) {
      try {
        fs.rmSync(targetDir, { recursive: true });
      } catch (cleanupError) {
        cleanupErrors.push(`${targetDir}: ${cleanupError.message}`);
      }
    }
    if (cleanupErrors.length) {
      fail(`${error.message}\nRollback failed:\n${cleanupErrors.join('\n')}`);
    }
    throw error;
  } finally {
    fs.rmSync(temp, { recursive: true });
  }
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
