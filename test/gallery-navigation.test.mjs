import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

class Element {
  constructor() {
    this.attributes = new Map();
    this.children = [];
    this.style = { setProperty() {}, removeProperty() {} };
    this.dataset = {};
    this.listeners = {};
    this.classes = new Set();
    this.classList = {
      toggle: (name, enabled) => enabled ? this.classes.add(name) : this.classes.delete(name),
    };
  }

  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  removeAttribute(name) { this.attributes.delete(name); }
  toggleAttribute(name, enabled) {
    enabled ? this.attributes.set(name, '') : this.attributes.delete(name);
    if (name === 'hidden') this.hidden = enabled;
  }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  append(child) { this.children.push(child); }
  replaceChildren(...children) { this.children = children; }
  set innerHTML(value) { if (value === '') this.children = []; }
}

function dotContainer() {
  const dots = new Element();
  const template = { content: { firstElementChild: { cloneNode: () => new Element() } } };
  dots.querySelector = () => template;
  return dots;
}

async function loadGallery() {
  const context = vm.createContext({
    HTMLElement: Element,
    document: { createElement: () => new Element() },
    customElements: { get: () => true, define() {} },
    window: { matchMedia: () => ({ matches: true }) },
    requestAnimationFrame: (callback) => callback(),
    ResizeObserver: class { observe() {} },
  });
  const source = await readFile(new URL('../src/components/wp-blocks/gallery/gallery.js', import.meta.url), 'utf8');
  const module = new vm.SourceTextModule(source, { context });
  await module.link((specifier) => {
    if (specifier === 'blaze-slider') {
      return new vm.SyntheticModule(['default'], function () { this.setExport('default', class {}); }, { context });
    }
    if (specifier === '@util/breakpoints') {
      const widths = { xs: 450, sm: 720, md: 1024, lg: 1250 };
      return new vm.SyntheticModule(['bp'], function () { this.setExport('bp', (name) => widths[name]); }, { context });
    }
    throw new Error(`Unexpected dependency: ${specifier}`);
  });
  await module.evaluate();
  return module.namespace.GalleryListing;
}

test('Gallery dots navigate pages and update arrow accessibility', async () => {
  const Gallery = await loadGallery();
  const gallery = new Gallery();
  gallery.dataset.navigationMode = 'page';
  const previous = new Element();
  const next = new Element();
  const dots = dotContainer();
  gallery.querySelector = (selector) => ({ '.blaze-prev': previous, '.blaze-next': next })[selector];

  const slider = {
    states: [{}, {}, {}],
    stateIndex: 0,
    onSlide(callback) { this.onChange = callback; },
    next(count) { this.stateIndex += count; this.onChange(); },
    prev(count) { this.stateIndex -= count; this.onChange(); },
  };
  gallery.initSlideDots(slider, dots);
  const buttons = dots.children.slice(1);
  assert.equal(buttons.length, 3);
  assert.equal(previous.attributes.get('aria-hidden'), 'true');
  assert.equal(previous.tabIndex, -1);
  assert.equal(next.attributes.get('aria-hidden'), 'false');
  assert.equal(buttons[0].attributes.get('aria-current'), 'true');

  buttons[2].listeners.click();
  assert.equal(slider.stateIndex, 2);
  assert.equal(previous.attributes.get('aria-hidden'), 'false');
  assert.equal(next.attributes.get('aria-hidden'), 'true');
  assert.equal(next.tabIndex, -1);
  assert.equal(buttons[2].attributes.get('aria-label'), 'Current page 3');
  assert.equal(buttons[0].attributes.get('aria-current'), 'false');

  buttons[0].listeners.click();
  assert.equal(slider.stateIndex, 0);
  assert.equal(previous.attributes.get('aria-hidden'), 'true');
  assert.equal(next.attributes.get('aria-hidden'), 'false');
});

test('Gallery hides arrows and removes dots for a single page', async () => {
  const Gallery = await loadGallery();
  const gallery = new Gallery();
  gallery.dataset.navigationMode = 'page';
  const previous = new Element();
  const next = new Element();
  const dots = dotContainer();
  dots.append(new Element());
  gallery.querySelector = (selector) => ({ '.blaze-prev': previous, '.blaze-next': next })[selector];
  gallery.initSlideDots({ states: [{}], stateIndex: 0 }, dots);
  assert.equal(dots.children.length, 1, 'Only the inert component template remains');
  assert.equal(previous.attributes.get('aria-hidden'), 'true');
  assert.equal(next.attributes.get('aria-hidden'), 'true');
});

test('Gallery slider retains its built-in responsive slide counts', async () => {
  const Gallery = await loadGallery();
  const gallery = new Gallery();
  const config = gallery.getSliderConfig();
  assert.equal(config.all.slidesToShow, 2);
  assert.equal(config.all.slidesToScroll, 2);
  assert.equal(config['(min-width: 450px)'].slidesToShow, 2);
  assert.equal(config['(min-width: 450px)'].slidesToScroll, 2);
  assert.equal(config['(min-width: 720px)'].slidesToShow, 3);
  assert.equal(config['(min-width: 720px)'].slidesToScroll, 3);
  assert.equal(config['(min-width: 1024px)'].slidesToShow, 3);
  assert.equal(config['(min-width: 1024px)'].slidesToScroll, 3);
  assert.equal(config['(min-width: 1250px)'].slidesToShow, 4);
  assert.equal(config['(min-width: 1250px)'].slidesToScroll, 4);
});

test('Captioned gallery does not prepare lightbox links or load PhotoSwipe', async () => {
  const Gallery = await loadGallery();
  const gallery = new Gallery();
  gallery.dataset.variant = 'captioned';
  gallery.querySelectorAll = () => { throw new Error('Captioned gallery must not prepare lightbox images'); };
  await gallery.initPhotoSwipe();
  assert.equal(gallery.lightbox, null);
  assert.equal(gallery.photoswipeLoadAttempted, false);
});

test('Paged grid fills component-owned page templates and preserves image nodes', async () => {
  const Gallery = await loadGallery();
  const gallery = new Gallery();
  gallery.dataset.itemsPerPage = '8';
  gallery.getBoundingClientRect = () => ({ height: 400 });
  const items = Array.from({ length: 18 }, () => new Element());
  const previous = new Element();
  const next = new Element();
  const pages = [];
  const template = { content: { firstElementChild: { cloneNode() {
    const item = new Element();
    const button = new Element();
    item.querySelector = () => button;
    pages.push(button);
    return item;
  } } } };
  const list = {
    querySelector: (selector) => ({
      'li:first-child button': previous,
      'li:last-child button': next,
      'template[data-gallery-template="page"]': template,
    })[selector],
    insertBefore() {},
  };
  const pagination = { querySelector: () => list };
  gallery.querySelectorAll = () => items;
  gallery.querySelector = () => pagination;
  gallery.initPagedGrid();
  assert.equal(pages.length, 3);
  assert.equal(pagination.hidden, false);
  assert.equal(previous.disabled, true);
  assert.equal(items.filter((item) => !item.hidden).length, 8);
  pages[2].listeners.click();
  assert.equal(items.filter((item) => !item.hidden).length, 2);
  assert.equal(next.disabled, true);
  assert.equal(pages[2].attributes.get('aria-current'), 'page');
  previous.listeners.click();
  assert.equal(items.filter((item) => !item.hidden).length, 8);
  assert.equal(pages[1].attributes.get('aria-label'), 'Page 2, current page');
});
