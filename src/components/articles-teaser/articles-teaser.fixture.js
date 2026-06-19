export const metadata = {
  deps: {
    css: [],
    js: [],
  },
};

export default {
  default: {
    props: {
      data: {
        slug: 'fixture-article-teaser',
        title: { rendered: 'Fixture teaser article' },
        acf: { item_date: '2026-06-10' },
      },
      hrefBase: '/articles',
    },
  },
};