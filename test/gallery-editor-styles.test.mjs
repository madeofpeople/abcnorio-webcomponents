import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('gallery owns editor-only slider and paged-grid styles', () => {
  const css = readFileSync(new URL('../dist/styles/editor/gallery.css', import.meta.url), 'utf8');
  const editor = '.block-editor-iframe__body.editor-styles-wrapper .wp-block-abcnorio-gallery';
  const slider = `${editor}.abcnorio-gallery-editor:not(.abcnorio-gallery--paged-grid):not(.abcnorio-gallery--masonry)>gallery-listing`;
  const sliderOnly = slider;
  const grid = `${editor}.abcnorio-gallery--paged-grid gallery-listing .images`;
  const declarations = (selector) => {
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
    return rules
      .filter((rule) => rule[1].replaceAll('::', ':').split(',').includes(selector))
      .map((rule) => rule[2])
      .join(';');
  };

  assert.match(declarations(sliderOnly), /margin-left:-2rem/);
  assert.match(declarations(sliderOnly), /padding-bottom:2rem/);
  assert.match(declarations(sliderOnly), /background-color:var\(--color-gray--darkest\)/);
  assert.match(declarations(`${slider} .blaze-track`), /display:flex/);
  assert.match(declarations(`${slider} .blaze-track`), /gap:2rem/);
  assert.match(declarations(`${slider} .blaze-track>.wp-block-image`), /height:400px/);
  assert.match(declarations(`${slider} .blaze-track>.wp-block-image`), /(?:^|;)width:auto(?:;|$)/);
  assert.match(declarations(`${slider} .blaze-track>.wp-block-image`), /min-width:0/);
  assert.match(declarations(`${slider} .blaze-track>.wp-block-image figure`), /height:100%/);
  assert.equal(declarations(`${slider} .blaze-track>.wp-block`), '');
  assert.match(declarations(`${slider} .blaze-track>.wp-block-image img`), /object-fit:contain/);
  assert.match(declarations(`${slider} .blaze-track>.wp-block-image img`), /height:100%\s*!important/);
  assert.equal(declarations(`${slider} .blaze-track>.wp-block img`), '');
  assert.match(declarations(`${slider} .blaze-prev`), /width:2rem/);
  assert.match(declarations(`${slider} .blaze-prev`), /(?:^|;)left:0(?:;|$)/);
  assert.match(declarations(`${slider} .blaze-next`), /(?:^|;)right:0(?:;|$)/);
  assert.match(declarations(`${slider} .blaze-prev>span`), /clip:rect/);
  assert.match(declarations(`${slider} .blaze-slide-dots`), /margin:1\.5rem 0 3rem/);
  assert.equal(declarations(`${slider} .blaze-slide-dots:before`), '');
  assert.match(declarations(`${slider} .blaze-slide-dots .blaze-slide-dot`), /border-radius:50%/);
  assert.match(declarations(`${slider} .blaze-track-container`), /overflow-x:auto/);
  assert.match(declarations(`${slider} .gallery-item--ghost`), /pointer-events:none/);
  assert.match(declarations(`${sliderOnly} .gallery-item`), /height:400px/);
  assert.match(declarations(`${grid}>.wp-block`), /margin-block:0/);
  assert.match(declarations(`${grid}>.block-list-appender`), /grid-column:1\/-1/);
  assert.match(declarations(grid), /min-height:var\(--gallery-paged-grid-min-height, ?0\)/);

  const group = '.block-editor-iframe__body.editor-styles-wrapper .wp-block-group.gallery';
  assert.match(declarations(group), /width:calc\(100% \+ 4rem\)/);
  assert.equal(declarations(`${group}.dark`), '');
  assert.match(declarations(`${group}>h2`), /width:fit-content/);
  assert.match(declarations(`${group}>h2`), /(?:^|;)margin:0(?:;|$)/);
  assert.match(declarations(`${group}>.wp-block-abcnorio-gallery.abcnorio-gallery-editor>gallery-listing.gallery`), /margin-left:0;margin-right:0/);
});
