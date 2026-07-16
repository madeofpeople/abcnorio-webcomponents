export const ARTICLE_LISTING_TAG = 'article-listing';
export const ARTICLE_LISTING_KEY = `abcnorio/${ARTICLE_LISTING_TAG}`;

export const ARTICLE_LISTING_DEFAULTS = {
  ariaLabel: 'Article results',
  mountId: ARTICLE_LISTING_TAG,
  listId: `${ARTICLE_LISTING_TAG}-list`,
  hrefBase: '/articles',
};

export const ARTICLE_LISTING_FIXTURE_METADATA = {
  deps: {
    css: [
      `styles/${ARTICLE_LISTING_TAG}.css`,
      'styles/article-teaser.css',
    ],
    js: [],
  },
};