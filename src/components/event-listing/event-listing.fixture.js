import { buildEventTeaserPayload } from '../event-teaser/event-teaser-payload.js';

const defaultItems = [
  buildEventTeaserPayload(
    {
      slug: 'example-event',
      title: { rendered: 'Example event' },
      excerpt: { rendered: '' },
      event_start_date: '2026-06-06 19:00:00',
      featured_image: null,
      priority: true,
    },
    { hrefBase: '/events' },
  ),
  buildEventTeaserPayload(
    {
      slug: 'summer-social',
      title: { rendered: 'Summer social' },
      excerpt: { rendered: '' },
      event_start_date: '2026-07-18 18:30:00',
      featured_image: {
        url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
        alt: 'Crowd at a live event',
        width: 900,
        height: 1200,
      },
    },
    { hrefBase: '/events' },
  ),
];

export default {
  default: {
    props: {
      items: defaultItems,
    },
  },
  empty: {
    props: {
      items: [],
      countText: 'The current filters are displaying 0 events.',
    },
  },
};