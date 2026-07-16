export const COLLECTIVE_LISTING_TAG = 'collective-listing';
export const COLLECTIVE_LISTING_KEY = `abcnorio/${COLLECTIVE_LISTING_TAG}`;

export const COLLECTIVE_LISTING_DEFAULTS = {
  ariaLabel: 'Content results',
  collectiveHrefBase: '/collectives',
  mountId: COLLECTIVE_LISTING_TAG,
  listId: 'collective-list',
};

export const COLLECTIVE_LISTING_FIXTURE_METADATA = {
  deps: {
    css: [
      `styles/${COLLECTIVE_LISTING_TAG}.css`,
      'styles/collective-teaser.css',
    ],
    js: [],
  },
};