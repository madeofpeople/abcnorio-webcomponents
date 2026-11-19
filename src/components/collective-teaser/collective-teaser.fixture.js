export const metadata = {
  deps: {
    css: [],
    js: [],
  },
};

export default {
  default: {
    props: {
      excerpt: '<p>A collective teaser excerpt.</p>',
      featured_image: {
        url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
        alt: 'Audience at an event',
        width: 900,
        height: 1200,
      },
    },
  },
};
