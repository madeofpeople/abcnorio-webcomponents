import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

class Element {
  constructor() {
    this.attributes = new Map();
    this.children = [];
    this.style = {};
    this.dataset = {};
    this.listeners = {};
    this.classes = new Set();
    this.classList = {
      add: (name) => this.classes.add(name),
      remove: (name) => this.classes.delete(name),
      contains: (name) => this.classes.has(name),
      toggle: (name, enabled) => enabled ? this.classes.add(name) : this.classes.delete(name),
    };
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  toggleAttribute(name, enabled) { enabled ? this.attributes.set(name, '') : this.attributes.delete(name); }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  append(child) { this.children.push(child); }
  set innerHTML(value) { if (value === '') this.children = []; }
}

async function loadListing(component, context, Slider) {
  const load = async (url) => {
    const module = new vm.SourceTextModule(await readFile(url, 'utf8'), { context, identifier: url.href });
    await module.link((specifier, parent) => {
      if (specifier === 'blaze-slider') {
        return new vm.SyntheticModule(['default'], function () { this.setExport('default', Slider); }, { context });
      }
      if (specifier === '@util/breakpoints') {
        return new vm.SyntheticModule(['bp'], function () {
          this.setExport('bp', (key) => ({ xs: 425, sm: 720, md: 1024, lg: 1250 })[key]);
        }, { context });
      }
      return load(new URL(specifier, parent.identifier));
    });
    return module;
  };
  const module = await load(new URL(`../src/components/${component}/${component}.js`, import.meta.url));
  await module.evaluate();
  return module;
}

for (const [component, className] of [['event-listing', 'EventListing'], ['content-listing', 'ContentListing']]) {
test(`${component} dots navigate and hide arrows at edges`, async () => {
  const context = vm.createContext({
    HTMLElement: Element,
    document: { createElement: () => new Element() },
    customElements: { get: () => true, define() {} },
  });
  const module = await loadListing(component, context, class {});
  const listing = new module.namespace[className]();
  const previous = new Element();
  const next = new Element();
  const dots = new Element();
  listing.querySelector = (selector) => ({ '.blaze-prev': previous, '.blaze-next': next })[selector];
  const slider = {
    states: [{ page: [0] }, { page: [1] }, { page: [2] }],
    slides: [new Element(), new Element(), new Element()],
    stateIndex: 0,
    config: { loop: false },
    onSlide(callback) { this.onChange = callback; return () => { this.onChange = null; }; },
    next(count) { this.stateIndex += count; this.onChange(); },
    prev(count) { this.stateIndex -= count; this.onChange(); },
  };
  listing.initSlideDots(slider, dots);
  assert.equal(dots.children.length, 3);
  assert.equal(previous.attributes.get('aria-hidden'), 'true');
  assert.equal(next.attributes.get('aria-hidden'), 'false');
  assert.equal(dots.children[0].attributes.get('aria-current'), 'true');

  dots.children[2].listeners.click();
  assert.equal(slider.stateIndex, 2);
  assert.equal(previous.attributes.get('aria-hidden'), 'false');
  assert.equal(next.attributes.get('aria-hidden'), 'true');
  assert.equal(next.tabIndex, -1);
  assert.equal(dots.children[2].attributes.get('aria-current'), 'true');

  dots.children[0].listeners.click();
  assert.equal(slider.stateIndex, 0);
  assert.equal(previous.attributes.get('aria-hidden'), 'true');
  assert.equal(next.attributes.get('aria-hidden'), 'false');
});

test(`${component} refreshes navigation on resize and cleans up on replacement`, async () => {
  const listeners = new Map();
  const timers = new Map();
  let nextTimer = 0;
  const window = {
    innerWidth: 800,
    addEventListener(name, callback) { listeners.set(name, callback); },
    removeEventListener(name, callback) {
      if (listeners.get(name) === callback) listeners.delete(name);
    },
  };
  class Slider {
    constructor(element, config) {
      this.passedConfig = config;
      this.slides = [new Element(), new Element(), new Element(), new Element()];
      this.states = [{ page: [0] }, { page: [2] }];
      this.stateIndex = 0;
      this.config = { loop: false };
      this.callbacks = new Set();
    }
    onSlide(callback) { this.callbacks.add(callback); return () => this.callbacks.delete(callback); }
    refresh() {
      this.states = [{ page: [0] }, { page: [1] }, { page: [2] }, { page: [3] }];
      this.stateIndex = 0;
    }
    destroy() { this.destroyed = true; }
  }
  const context = vm.createContext({
    HTMLElement: Element,
    document: { createElement: () => new Element() },
    customElements: { get: () => true, define() {} },
    window,
    setTimeout(callback) { const id = ++nextTimer; timers.set(id, callback); return id; },
    clearTimeout(id) { timers.delete(id); },
  });
  const module = await loadListing(component, context, Slider);
  const listing = new module.namespace[className]();
  const previous = new Element();
  const next = new Element();
  const dots = new Element();
  listing.classList.add('blaze-slider');
  listing.querySelector = (selector) => ({
    '.blaze-prev': previous,
    '.blaze-next': next,
    '.blaze-slide-dots': dots,
  })[selector];
  listing.dataset.slidesPerPage = '1';
  listing.dataset.slidesPerPageXs = '2';
  listing.dataset.slidesPerPageSm = '2.333';
  listing.dataset.slidesPerPageMd = '4';
  listing.dataset.slidesPerPageLg = '5';
  listing.connectedCallback();
  const slider = listing.slider;
  assert.equal(slider.passedConfig.all.slidesToShow, 1);
  assert.equal(slider.passedConfig['(min-width: 720px)'].slidesToShow, 2.333);
  assert.equal(slider.passedConfig['(min-width: 720px)'].slidesToScroll, 2);
  assert.equal(slider.passedConfig['(min-width: 1250px)'].slidesToShow, 5);
  assert.equal(dots.children.length, 2);
  assert.equal(slider.callbacks.size, 1);
  window.innerWidth = 500;
  listeners.get('resize')();
  for (const callback of timers.values()) callback();
  timers.clear();
  assert.equal(dots.children.length, 4);
  assert.equal(slider.callbacks.size, 1);
  window.innerWidth = 400;
  listeners.get('resize')();
  listing.disconnectedCallback();
  assert.equal(timers.size, 0);
  assert.equal(listeners.size, 0);
  assert.equal(slider.callbacks.size, 0);
  assert.equal(slider.destroyed, true);
  assert.equal(listing.dataset.upgraded, undefined);
  delete listing.dataset.slidesPerPage;
  delete listing.dataset.slidesPerPageXs;
  delete listing.dataset.slidesPerPageSm;
  delete listing.dataset.slidesPerPageMd;
  delete listing.dataset.slidesPerPageLg;
  listing.dataset.sliderPreset = 'content-width';
  listing.connectedCallback();
  assert.notEqual(listing.slider, slider);
  assert.equal(listing.slider.passedConfig['(min-width: 720px)'].slidesToShow, component === 'event-listing' ? 2 : 3);
  assert.equal(listing.slider.passedConfig['(min-width: 1024px)'].slidesToShow, 3);
  assert.equal(listing.slider.passedConfig['(min-width: 1250px)'].slidesToShow, 4);
});
}
