import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../dist/collective-teaser.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles/collective-teaser.css', import.meta.url), 'utf8');
const teaser = html.match(/<collective-teaser\b[\s\S]*?<\/collective-teaser>/)?.[0];
assert.ok(teaser, 'Fixture includes the collective teaser');
assert.doesNotMatch(teaser, /data-astro-cid-/);
assert.match(html, /<link rel="stylesheet" href="\/styles\/collective-teaser\.css">/);
assert.match(teaser, /<img\b[^>]*class="collective-teaser__image"/);
assert.match(teaser, /class="collective-teaser__excerpt"[^>]*><p>/);
assert.match(css, /\.collective-teaser \.collective-teaser__image\{/);
assert.match(css, /\.collective-teaser \.collective-teaser__excerpt p\{margin:0;padding:0\}/);

const listing = readFileSync(new URL('../dist/collective-listing.html', import.meta.url), 'utf8');
assert.match(listing, /<link rel="stylesheet" href="\/styles\/collective-teaser\.css">/);
const listingMarkup = listing.match(/<collective-listing\b[\s\S]*?<\/collective-listing>/)?.[0];
assert.match(listingMarkup, /<collective-teaser\b/);
assert.doesNotMatch(listingMarkup, /<link\b/, 'Load teaser CSS outside the list, not once per item');
