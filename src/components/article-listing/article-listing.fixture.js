import { ARTICLE_LISTING_FIXTURE_METADATA } from './article-listing.metadata.js';

export const metadata = ARTICLE_LISTING_FIXTURE_METADATA;

export default {
  default: {
    props: {
      items: [
        {
          slug: 'fixture-article-listing-item',
          title: { rendered: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.' },
          acf: { article_date: '2026-06-15' },
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