import BlazeSlider from 'blaze-slider';
import { bp } from '@util/breakpoints';

export class ContentListing extends HTMLElement {
  connectedCallback() {
    if (this.dataset.upgraded === 'true') {
      return;
    }

    this.dataset.upgraded = 'true';
    this.classList.add('is-upgraded');

    if (this.classList.contains('blaze-slider')) {
      const config = {
        'all': {
          slidesToShow: 1,
          loop: true,
          slidesToScroll: 1,
          enablePagination: false,
          transitionDuration: 300,
        },
        [`(min-width: ${bp('xs')}px)`]: {
          slidesToShow: 1,
        },
        [`(min-width: ${bp('sm')}px)`]: {
          slidesToShow: 3,
        },
        [`(min-width: ${bp('md')}px)`]: {
          slidesToShow: 4,
        },
        [`(min-width: ${bp('lg')}px)`]: {
          slidesToShow: 5,
        },
      };

      new BlazeSlider(this, config);
    }
  }
}

if (!customElements.get('content-listing')) {
  customElements.define('content-listing', ContentListing);
}
