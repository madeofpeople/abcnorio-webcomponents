import fs from 'fs';
import path from 'path';

// Setup paths relative to the execution root
const distDir = path.resolve('./dist');
const manifestPath = path.join(distDir, 'fixtures-manifest.json');
const registry = {};

const defaultStyleFile = path.join(distDir, 'styles', '_..css');
const stableStyleRelativePath = 'styles/components.css';
const stableStyleFile = path.join(distDir, stableStyleRelativePath);

if (fs.existsSync(defaultStyleFile)) {
  fs.copyFileSync(defaultStyleFile, stableStyleFile);
}

const sharedStylePath = fs.existsSync(stableStyleFile)
  ? stableStyleRelativePath
  : null;

const collectFixtureEntries = () => {
  const entries = new Map();

  for (const file of fs.readdirSync(distDir)) {
    const fullPath = path.join(distDir, file);

    if (fs.statSync(fullPath).isFile() && file.endsWith('.html') && file !== 'index.html') {
      entries.set(path.basename(file, '.html'), file);
    }
  }

  for (const file of fs.readdirSync(distDir)) {
    const fullPath = path.join(distDir, file);

    if (
      fs.statSync(fullPath).isDirectory() &&
      file !== 'styles' &&
      file !== 'assets' &&
      !file.startsWith('.')
    ) {
      const nestedIndex = path.join(file, 'index.html');
      if (fs.existsSync(path.join(distDir, nestedIndex)) && !entries.has(file)) {
        entries.set(file, nestedIndex);
      }
    }
  }

  return entries;
};

try {
  // Ensure the dist directory exists before scanning
  if (!fs.existsSync(distDir)) {
    console.error('❌ Error: The "dist" directory does not exist. Run "npm run build" first.');
    process.exit(1);
  }

  const fixtureEntries = collectFixtureEntries();

  fixtureEntries.forEach((fixtureRelativePath, component) => {
    const fixturePath = path.join(distDir, fixtureRelativePath);
    const expectedScript = `${component}.js`;

    if (fs.existsSync(fixturePath)) {
      const htmlContent = fs.readFileSync(fixturePath, 'utf-8');

      registry[component] = {
        name: component,
        html: htmlContent.trim(),
        fixturePath: fixtureRelativePath,
        scriptPath: fs.existsSync(path.join(distDir, expectedScript)) ? expectedScript : null,
        stylePath: sharedStylePath
      };
    }
  });

  // Write the centralized JSON manifest file
  fs.writeFileSync(manifestPath, JSON.stringify(registry, null, 2));
  console.log(`\x1b[32m%s\x1b[0m`, `🎉 Successfully generated fixtures manifest at: ./dist/fixtures-manifest.json`);

} catch (error) {
  console.error('Critical error assembling the fixtures registry:', error.message);
  process.exit(1);
}