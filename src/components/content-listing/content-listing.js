export class ContentListing extends HTMLElement {
  connectedCallback() {
    if (this.dataset.upgraded === 'true') {
      return;
    }

    this.dataset.upgraded = 'true';
    this.classList.add('is-upgraded');
  }
}

if (!customElements.get('content-listing')) {
  customElements.define('content-listing', ContentListing);
}
