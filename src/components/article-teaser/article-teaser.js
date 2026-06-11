export class ArticleTeaser extends HTMLElement {
  connectedCallback() {
    if (this.dataset.upgraded === 'true') {
      return;
    }

    this.dataset.upgraded = 'true';
    this.classList.add('is-upgraded');
  }
}

if (!customElements.get('article-teaser')) {
  customElements.define('article-teaser', ArticleTeaser);
}
