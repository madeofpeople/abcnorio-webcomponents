import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../dist/collective-teaser.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles/component-fixtures.css', import.meta.url), 'utf8');
const root = html.match(/<collective-teaser\b[^>]*\b(data-astro-cid-[a-z0-9]+)(?:="[^"]*")?[^>]*>/);
const image = html.match(/<img\b[^>]*class="collective-teaser__image"[^>]*>/);

assert.ok(root, 'Collective teaser root carries an Astro scope attribute');
assert.ok(image, 'Collective teaser fixture includes an image for WordPress to populate');
assert.ok(image[0].includes(root[1]), 'Collective image shares the teaser scope');
assert.ok(css.includes(`.collective-teaser[${root[1]}] .collective-teaser__image[${root[1]}]`), 'Shared image styles match fixture markup');

console.log('Collective teaser image fixture matches scoped shared styles.');
