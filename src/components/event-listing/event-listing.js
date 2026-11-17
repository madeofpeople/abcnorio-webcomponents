import { ListingSlider } from '../_utils/listing-slider.js';

export class EventListing extends ListingSlider {
  get slidesPerPageDefaults() {
    return this.dataset.sliderPreset === 'content-width'
      ? { all: 1, xs: 2, sm: 2, md: 3, lg: 4 }
      : { all: 1, xs: 2, sm: 3, md: 4, lg: 3.5 };
  }

  ensureHtmxReady() {
    const hasHtmxLinks = this.querySelector('[hx-get]');
    if (!hasHtmxLinks) {
      return;
    }

    if (window.htmx) {
      window.htmx.process(this);
      return;
    }

    const scriptSelector = 'script[data-abcnorio-htmx-loader="true"]';
    const existing = document.querySelector(scriptSelector);
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.htmx) {
          window.htmx.process(this);
        }
      }, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.defer = true;
    script.src = '/vendor/htmx.min.js';
    script.dataset.abcnorioHtmxLoader = 'true';
    script.addEventListener('load', () => {
      if (window.htmx) {
        window.htmx.process(this);
      }
    }, { once: true });
    document.head.append(script);
  }

  connectedCallback() {
    if (this.dataset.upgraded === 'true') {
      return;
    }
    this.ensureHtmxReady();
    super.connectedCallback();
  }
}

if (!customElements.get('event-listing')) {
  customElements.define('event-listing', EventListing);
}
