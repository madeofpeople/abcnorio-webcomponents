import { ListingSlider } from '../_utils/listing-slider.js';

export class ContentListing extends ListingSlider {}

if (!customElements.get('content-listing')) {
  customElements.define('content-listing', ContentListing);
}
