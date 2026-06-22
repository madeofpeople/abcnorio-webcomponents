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
          featured_image: {
            url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
            alt: 'Audience waiting for an event to begin',
            width: 900,
            height: 1200,
          },
        },
        {
          post_type: 'article',
          slug: 'fixture-article',
          excerpt: { rendered: 'Fixture excerpt' },
          title: { rendered: 'Something of a Longish Article Title to Stress Test our Layouts' },
          acf: { item_date: '2026-06-10' },
          featured_image: {
            url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80',
            alt: 'Typewriter on desk',
            width: 900,
            height: 600,
          },
        },
      ],
    },
  },
};
