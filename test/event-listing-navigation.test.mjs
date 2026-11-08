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

test('Event slider dots navigate and hide arrows at edges', async () => {
  const context = vm.createContext({
    HTMLElement: Element,
    document: { createElement: () => new Element() },
    customElements: { get: () => true, define() {} },
  });
  const source = await readFile(new URL('../src/components/event-listing/event-listing.js', import.meta.url), 'utf8');
  const module = new vm.SourceTextModule(source, { context });
  await module.link((specifier) => {
    if (specifier === 'blaze-slider') {
      return new vm.SyntheticModule(['default'], function () { this.setExport('default', class {}); }, { context });
    }
    if (specifier === '@util/breakpoints') {
      return new vm.SyntheticModule(['bp'], function () {
        this.setExport('bp', (key) => ({ xs: 450, sm: 720, md: 1024, lg: 1250 })[key]);
      }, { context });
    }
    throw new Error(`Unexpected dependency: ${specifier}`);
  });
  await module.evaluate();
  const listing = new module.namespace.EventListing();
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

test('slider refreshes navigation on resize and cleans up on replacement', async () => {
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
  const source = await readFile(new URL('../src/components/event-listing/event-listing.js', import.meta.url), 'utf8');
  const module = new vm.SourceTextModule(source, { context });
  await module.link((specifier) => {
    if (specifier === 'blaze-slider') {
      return new vm.SyntheticModule(['default'], function () { this.setExport('default', Slider); }, { context });
    }
    if (specifier === '@util/breakpoints') {
      return new vm.SyntheticModule(['bp'], function () {
        this.setExport('bp', (key) => ({ xs: 450, sm: 720, md: 1024, lg: 1250 })[key]);
      }, { context });
    }
    throw new Error(`Unexpected dependency: ${specifier}`);
  });
  await module.evaluate();
  const listing = new module.namespace.EventListing();
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
  listing.dataset.slidesPerPageSm = '3';
  listing.dataset.slidesPerPageMd = '4';
  listing.dataset.slidesPerPageLg = '5';
  listing.connectedCallback();
  const slider = listing.slider;
  assert.equal(slider.passedConfig.all.slidesToShow, 1);
  assert.equal(slider.passedConfig['(min-width: 720px)'].slidesToShow, 3);
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
  assert.equal(listing.slider.passedConfig['(min-width: 720px)'].slidesToShow, 2);
  assert.equal(listing.slider.passedConfig['(min-width: 1024px)'].slidesToShow, 3);
  assert.equal(listing.slider.passedConfig['(min-width: 1250px)'].slidesToShow, 4);
});
