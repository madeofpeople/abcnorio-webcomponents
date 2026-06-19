import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

const packageJsonPath = path.resolve('./package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const exportsMap = packageJson.exports ?? {};

const input = {};
for (const [key, target] of Object.entries(exportsMap)) {
  if (!key.endsWith('/element') || typeof target !== 'string') {
    continue;
  }

  const componentId = key.replace(/^\.\//, '').replace(/\/element$/, '');
  const entryPath = path.resolve(target);
  if (!fs.existsSync(entryPath)) {
    console.warn(`[vite.elements] skipping missing entry for ${key}: ${target}`);
    continue;
  }

  input[componentId] = entryPath;
}

if (Object.keys(input).length === 0) {
  throw new Error('No valid component element entry files found for Vite build.');
}

export default defineConfig({
  build: {
    outDir: 'dist/elements',
    emptyOutDir: false,
    manifest: '.vite/manifest.json',
    rollupOptions: {
      input,
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});