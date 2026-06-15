export class HomepageArticlesListing extends HTMLElement {
  connectedCallback() {
    if (this.dataset.upgraded === 'true') {
      return;
    }

    this.dataset.upgraded = 'true';
    this.classList.add('is-upgraded');
  }
}

if (!customElements.get('homepage-articles-listing')) {
  customElements.define('homepage-articles-listing', HomepageArticlesListing);
}
