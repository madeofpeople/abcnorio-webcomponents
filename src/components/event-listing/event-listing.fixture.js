import { buildEventTeaserPayload } from '../event-teaser/event-teaser-payload.js';
import { EVENT_LISTING_FIXTURE_METADATA } from './event-listing.metadata.js';

export const metadata = EVENT_LISTING_FIXTURE_METADATA;

const defaultItems = [
  buildEventTeaserPayload(
    {
      slug: 'example-event-a',
      title: { rendered: 'Example event' },
      excerpt: { rendered: '' },
      event_start_date: '2026-06-06 19:00:00',
      featured_image: {
        url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
        alt: 'Crowd at a live event',
        width: 900,
        height: 1200,
      },
      priority: true,
    },
    { hrefBase: '/events' },
  ),
  buildEventTeaserPayload(
    {
      slug: 'example-event-b',
      title: { rendered: 'Example event' },
      excerpt: { rendered: '' },
      event_start_date: '2026-05-06 19:00:00',
      featured_image: {
        url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
        alt: 'Crowd at a live event',
        width: 900,
        height: 1200,
      },
      priority: true,
    },
    { hrefBase: '/events' },
  ),
    buildEventTeaserPayload(
    {
      slug: 'example-event-c',
      title: { rendered: 'Example event' },
      excerpt: { rendered: '' },
      event_start_date: '2026-05-12 19:00:00',
      featured_image: {
        url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
        alt: 'Crowd at a live event',
        width: 900,
        height: 1200,
      },
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
      isSlider: false,
    },
  },
  empty: {
    props: {
      items: [],
    },
  },
};