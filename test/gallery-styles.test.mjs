import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { metadata } from '../src/components/wp-blocks/gallery/gallery.fixture.js';

const css = readFileSync(new URL('../dist/styles/component-fixtures.css', import.meta.url), 'utf8');

assert.deepEqual(metadata.deps.js, [], 'WordPress gallery does not load frontend JS');
assert.ok(/gallery-listing\.gallery\{display:block\}/.test(css), 'Gallery is block-level');
assert.ok(/gallery-listing\.gallery\.blaze-slider\{[^{}]*background-color:var\(--color-text\)[^{}]*padding-top:2rem/.test(css), 'Slider has shared background and padding');
assert.ok(/gallery-listing\.gallery\.blaze-slider \.images\.blaze-track\{[^{}]*padding:0 1rem/.test(css), 'Track has shared padding');
assert.ok(/gallery-listing\.gallery\.blaze-slider \.gallery-item figure,gallery-listing\.gallery\.blaze-slider \.blaze-track>\.wp-block figure\{margin:0;padding:0\}/.test(css), 'Slide and editor figures share spacing');
assert.ok(/gallery-listing\.gallery\.blaze-slider \.gallery-item img,gallery-listing\.gallery\.blaze-slider \.blaze-track>\.wp-block img\{[^{}]*object-fit:contain/.test(css), 'Slide and editor images share sizing');
assert.ok(/\.abcnorio-gallery-editor:not\(\.abcnorio-gallery--paged-grid\):not\(\.abcnorio-gallery--masonry\)>gallery-listing\{(?=[^{}]*margin-(?:left|right):-2rem)(?=[^{}]*padding-bottom:2rem)[^{}]*\}/.test(css), 'Editor slider retains its outer spacing');
assert.ok(/\.abcnorio-gallery-editor:not\(\.abcnorio-gallery--paged-grid\)>gallery-listing \.gallery-item\{(?=[^{}]*height:400px)(?=[^{}]*min-width:(?:fit-content|-moz-fit-content))[^{}]*\}/.test(css), 'Editor gallery items retain their sizing');
assert.ok(/\.abcnorio-gallery-editor:not\(\.abcnorio-gallery--paged-grid\)>gallery-listing \.gallery-item--ghost\{(?=[^{}]*opacity:0)(?=[^{}]*pointer-events:none)(?=[^{}]*user-select:none)[^{}]*\}/.test(css), 'Editor ghost items remain invisible and non-interactive');
assert.ok(/\.abcnorio-gallery--paged-grid gallery-listing \.images>\.wp-block\{margin-block:0\}/.test(css), 'Editor paged grid blocks retain their margins');
assert.ok(/\.abcnorio-gallery--paged-grid gallery-listing \.images>\.block-list-appender\{(?=[^{}]*grid-column:1\/-1)(?=[^{}]*height:auto)[^{}]*\}/.test(css), 'Editor paged grid appender spans the grid');
assert.ok(/\.wp-block-abcnorio-gallery\.abcnorio-gallery-editor:not\(\.abcnorio-gallery--paged-grid\)>gallery-listing \.blaze-track\{(?=[^{}]*display:flex)(?=[^{}]*gap:2rem)(?=[^{}]*align-items:center)[^{}]*\}/.test(css), 'Editor track retains its layout');
assert.ok(/\.wp-block-abcnorio-gallery\.abcnorio-gallery-editor:not\(\.abcnorio-gallery--paged-grid\)>gallery-listing \.blaze-track>\.wp-block\{(?=[^{}]*height:400px)(?=[^{}]*width:auto)(?=[^{}]*margin-block:0)[^{}]*\}/.test(css), 'Editor slides retain their dimensions and margins');
assert.ok(/\.wp-block-abcnorio-gallery\.abcnorio-gallery-editor:not\(\.abcnorio-gallery--paged-grid\)>gallery-listing \.blaze-track>\.wp-block figure\{height:100%\}/.test(css), 'Editor figures fill their slides');
assert.ok(/\.wp-block-abcnorio-gallery\.abcnorio-gallery-editor:not\(\.abcnorio-gallery--paged-grid\)>gallery-listing \.blaze-slide-dots\{(?=[^{}]*margin:1\.5rem 0 3rem)(?=[^{}]*gap:\.5rem)[^{}]*\}/.test(css), 'Editor placeholder dots retain their spacing');
assert.ok(/\.wp-block-abcnorio-gallery\.abcnorio-gallery-editor:not\(\.abcnorio-gallery--paged-grid\)>gallery-listing \.blaze-slide-dots:before\{(?=[^{}]*box-shadow:)(?=[^{}]*background:var\(--color-accent\))[^{}]*\}/.test(css), 'Editor placeholder dots retain their appearance');
assert.ok(/\.block-editor-iframe__body\.editor-styles-wrapper [^{}]*\.blaze-track>\.wp-block img\{[^{}]*height:100%!important/.test(css), 'Editor image height overrides inline style');
assert.ok(/\.blaze-track-container\{overflow:hidden\}/.test(css), 'Track clips overflow');
assert.ok(/gallery-listing\.gallery\.blaze-slider \.blaze-prev,gallery-listing\.gallery\.blaze-slider \.blaze-next\{[^{}]*width:3rem;height:3rem/.test(css), 'Arrow styles apply without Astro scope attributes');
assert.ok(/gallery-listing\.gallery\.blaze-slider \.blaze-prev span,gallery-listing\.gallery\.blaze-slider \.blaze-next span\{[^{}]*clip:rect/.test(css), 'Arrow labels are visually hidden in both contexts');
assert.ok(/gallery-listing\.gallery\.blaze-slider \.blaze-prev:after\{content:/.test(css), 'Previous arrow icon is shared');
assert.ok(/gallery-listing\.gallery\.blaze-slider \.blaze-next:after\{content:/.test(css), 'Next arrow icon is shared');
assert.ok(/gallery-listing\.gallery\.blaze-slider \.blaze-prev:after,gallery-listing\.gallery\.blaze-slider \.blaze-next:after\{font-family:var\(--font-source-sans\),\s*sans-serif\}/.test(css), 'Arrow glyphs use Source Sans in both contexts');
assert.ok(!/gallery-listing\.gallery\.blaze-slider [^{}]*:global/.test(css), 'Compiled gallery selectors do not contain :global');

console.log('Gallery shared styles cover frontend slides and editor image blocks.');
