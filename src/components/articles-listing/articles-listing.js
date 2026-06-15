export class ArticlesListing extends HTMLElement {
  connectedCallback() {
    if (this.dataset.upgraded === 'true') {
      return;
    }

    this.dataset.upgraded = 'true';
    this.classList.add('is-upgraded');
  }
}

if (!customElements.get('articles-listing')) {
  customElements.define('articles-listing', ArticlesListing);
}
