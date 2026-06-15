export class ArticlesTeaser extends HTMLElement {
  connectedCallback() {
    if (this.dataset.upgraded === 'true') {
      return;
    }

    this.dataset.upgraded = 'true';
    this.classList.add('is-upgraded');
  }
}

if (!customElements.get('articles-teaser')) {
  customElements.define('articles-teaser', ArticlesTeaser);
}
