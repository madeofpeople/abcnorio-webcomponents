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
          featured_image: {
            url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80',
            alt: 'Typewriter on desk',
            width: 900,
            height: 600,
          },
        },
      ],
      hrefBase: '/articles',
    },
  },
};