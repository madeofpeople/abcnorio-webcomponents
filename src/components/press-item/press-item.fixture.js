export const metadata = { deps: { css: [], js: [] } };

export default {
  default: {
    props: {
      date: '2026-06-06',
      title: 'Press item title',
      source: 'Publication',
      sourceUrl: '/example',
    },
  },
  fallback: {
    props: {
      fallbackDate: 'June 2026',
      title: 'Another press item',
      source: 'Publication',
    },
  },
};
