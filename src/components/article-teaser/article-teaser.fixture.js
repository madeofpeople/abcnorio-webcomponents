export const metadata = {
  deps: {
    css: [],
    js: [],
  },
};

export default {
  default: {
    props: {
      href: '/articles/example-article',
      title: 'Example article',
      dateLabel: 'Jun 10, 2026',
      excerpt: {
        rendered: '<p>Sample excerpt from WordPress post content.</p>',
      },
      placeholderText: 'Article teaser placeholder',
      featured_image: {
        url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80',
        alt: 'Typewriter on desk',
        width: 900,
        height: 600,
      },
    },
  },
};
