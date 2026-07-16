export const CONTENT_LISTING_TAG = 'content-listing';
export const CONTENT_LISTING_KEY = `abcnorio/${CONTENT_LISTING_TAG}`;

export const CONTENT_LISTING_DEFAULTS = {
  ariaLabel: 'Content results',
  mountId: CONTENT_LISTING_TAG,
  listId: `${CONTENT_LISTING_TAG}-list`,
  articleHrefBase: '/articles',
  eventHrefBase: '/events',
  isSlider: false,
};

export const CONTENT_LISTING_FIXTURE_METADATA = {
  deps: {
    css: [
      `styles/${CONTENT_LISTING_TAG}.css`,
      'styles/event-teaser.css',
      'styles/article-teaser.css',
    ],
    js: [],
  },
};