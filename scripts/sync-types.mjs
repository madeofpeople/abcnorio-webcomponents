#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const typesPath = path.join(rootDir, 'src/types/index.d.ts');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const exportsMap = packageJson.exports ?? {};

const specialDeclarations = new Map([
  ['abcnorio-webcomponents/fixtures', `declare module 'abcnorio-webcomponents/fixtures' {\n  export function listFixtures(): any[];\n  export function getFixtureBySlug(slug?: string): any;\n  export function getDefaultFixtureByComponent(componentName?: string): any;\n}`],
  ['abcnorio-webcomponents/wp-blocks/block-registry', `declare module 'abcnorio-webcomponents/wp-blocks/block-registry' {\n  export const CORE_BLOCK_KEYS: Record<string, string>;\n  export const CUSTOM_BLOCK_KEYS: Record<string, string>;\n  export const CORE_BLOCK_REGISTRY: Record<string, any>;\n  export const CUSTOM_BLOCK_REGISTRY: Record<string, any>;\n  export const EMBED_PROVIDER_REGISTRY: Record<string, any>;\n  export const BLOCK_KEYS: Record<string, string>;\n  export const BLOCK_REGISTRY: Record<string, any>;\n}`],
  ['abcnorio-webcomponents/util/dates', `declare module 'abcnorio-webcomponents/util/dates' {\n  export function formatEventDate(raw?: string): {\n    datetime: string;\n    label_date: string;\n    label_time: string;\n    ampm: string;\n  } | null;\n}`],
  ['abcnorio-webcomponents/util/normalize-post-type', `declare module 'abcnorio-webcomponents/util/normalize-post-type' {\n  export function normalizePostType(item?: any): any;\n  export function isEvent(item?: any): boolean;\n  export function isArticle(item?: any): boolean;\n  export function isCollective(item?: any): boolean;\n}`],
  ['abcnorio-webcomponents/util/resolve-featured-image', `declare module 'abcnorio-webcomponents/util/resolve-featured-image' {\n  export function resolveFeaturedImage(source?: any, options?: any): any;\n}`],
  ['abcnorio-webcomponents/article-teaser/payload', `declare module 'abcnorio-webcomponents/article-teaser/payload' {\n  export function buildArticleTeaserPayload(attributes?: any, options?: any): any;\n}`],
  ['abcnorio-webcomponents/event-teaser/payload', `declare module 'abcnorio-webcomponents/event-teaser/payload' {\n  export function buildEventTeaserPayload(attributes?: any, options?: any): any;\n}`],
]);

const defaultExportDeclaration = (moduleName) => `declare module '${moduleName}' {\n  const Component: any;\n  export default Component;\n}`;

const desiredDeclarations = new Map();

for (const [exportKey, target] of Object.entries(exportsMap)) {
  if (typeof target !== 'string') continue;

  const moduleName = `abcnorio-webcomponents/${exportKey.replace(/^\.\//, '')}`;

  if (specialDeclarations.has(moduleName)) {
    desiredDeclarations.set(moduleName, specialDeclarations.get(moduleName));
    continue;
  }

  if (exportKey.endsWith('/element') || target.endsWith('.astro')) {
    desiredDeclarations.set(moduleName, defaultExportDeclaration(moduleName));
    continue;
  }
}

const current = fs.readFileSync(typesPath, 'utf8').trimEnd();
let next = current;

for (const [moduleName, declaration] of desiredDeclarations) {
  if (!next.includes(`declare module '${moduleName}'`)) {
    next += `\n\n${declaration}`;
  }
}

fs.writeFileSync(typesPath, `${next}\n`);