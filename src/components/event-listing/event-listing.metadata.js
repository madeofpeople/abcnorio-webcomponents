export const EVENT_LISTING_TAG = 'event-listing';
export const EVENT_LISTING_KEY = `abcnorio/${EVENT_LISTING_TAG}`;

export const EVENT_LISTING_DEFAULTS = {
  ariaLabel: 'Event results',
  hrefBase: '/events',
  mountId: 'events-listing',
  teaserListId: 'teaser-list',
  paginationId: 'pagination',
  filtersFormSelector: '#event-filters-form',
};

export const EVENT_LISTING_FIXTURE_METADATA = {
  deps: {
    css: [
      `styles/${EVENT_LISTING_TAG}.css`,
      'styles/event-teaser.css',
    ],
    js: [],
  },
};