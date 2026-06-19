export const metadata = {
  deps: {
    css: [],
    js: [],
  },
};

export default {
  default: {
    props: {
      articles: [
        {
          slug: 'fixture-article-listing-item',
          title: { rendered: 'Fixture listing article' },
          acf: { item_date: '2026-06-15' },
        },
      ],
      hrefBase: '/articles',
    },
  },
};