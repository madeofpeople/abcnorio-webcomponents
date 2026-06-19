export const metadata = {
  deps: {
    css: [
      'styles/event-teaser.css',
      'styles/article-teaser.css',
    ],
    js: [],
  },
};

export default {
  default: {
    props: {
      items: [
        {
          post_type: 'event',
          slug: 'fixture-event',
          title: { rendered: 'Fixture event' },
          event_start_date: '2026-06-20 19:00:00',
          featured_image: null,
        },
        {
          post_type: 'article',
          slug: 'fixture-article',
          title: { rendered: 'Fixture article' },
          acf: { item_date: '2026-06-10' },
        },
      ],
    },
  },
};
