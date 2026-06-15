export class HomepageEventsListing extends HTMLElement {
  connectedCallback() {
    if (this.dataset.upgraded === 'true') {
      return;
    }

    this.dataset.upgraded = 'true';
    this.classList.add('is-upgraded');
  }
}

if (!customElements.get('homepage-events-listing')) {
  customElements.define('homepage-events-listing', HomepageEventsListing);
}
