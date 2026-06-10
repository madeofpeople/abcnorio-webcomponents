import { buildEventTeaserPayload } from './event-teaser-payload.js';

export default {
  default: {
    props: buildEventTeaserPayload(
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
  },
  past: {
    props: buildEventTeaserPayload(
      {
        slug: 'past-event',
        title: { rendered: 'Past event' },
        excerpt: { rendered: '' },
        event_start_date: '2025-05-02 18:30:00',
        event_end_date: '2025-05-02 20:00:00',
        featured_image: {
          url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
          alt: 'Audience waiting for an event to begin',
          width: 900,
          height: 1200,
        },
      },
      { hrefBase: '/events' },
    ),
  },
};