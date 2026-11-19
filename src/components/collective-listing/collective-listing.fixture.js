import { COLLECTIVE_LISTING_FIXTURE_METADATA } from './collective-listing.metadata.js';

export const metadata = COLLECTIVE_LISTING_FIXTURE_METADATA;

const defaultItems = [
  {
    post_type: 'facility',
    slug: 'fixture-collective-a',
    title: { rendered: 'Fixture collective' },
    excerpt: { rendered: '<p>Collective fixture excerpt.</p>' },
    collective_start_date: '2026-06-20 19:00:00',
    featured_image: {
      url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
      alt: 'Audience waiting for an event to begin',
      width: 900,
      height: 1200,
    },
  },
  {
    post_type: 'facility',
    slug: 'fixture-collective-b',
    title: { rendered: 'Another fixture collective' },
    excerpt: { rendered: 'Another collective fixture excerpt.' },
    collective_start_date: '2026-06-10 19:00:00',
    featured_image: {
      url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80',
      alt: 'Typewriter on desk',
      width: 900,
      height: 600,
    },
  },
];

export default {
  default: {
    props: {
      items: defaultItems,
      showCount: true,
    },
  },
};
