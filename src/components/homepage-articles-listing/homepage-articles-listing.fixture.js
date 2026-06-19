export const metadata = {
  deps: {
    css: [],
    js: [],
  },
};

export default {
  default: {
    props: {
      items: [
        {
          slug: 'fixture-homepage-article',
          title: { rendered: 'Homepage fixture article' },
          acf: { item_date: '2026-06-05' },
        },
      ],
      hrefBase: '/articles',
      showViewAllLink: true,
    },
  },
};