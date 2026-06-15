import type { StargazerConfig } from 'astro-stargazer';
import addToCalendarFixtures from './src/components/add-to-calendar/add-to-calendar.fixture.js';
import articleTeaserFixtures from './src/components/article-teaser/article-teaser.fixture.js';
import contentListingFixtures from './src/components/content-listing/content-listing.fixture.js';
import eventListingFixtures from './src/components/event-listing/event-listing.fixture.js';
import eventTeaserFixtures from './src/components/event-teaser/event-teaser.fixture.js';

// const stargazerEventsHref = import.meta.env.STARGAZER_EVENTS_HREF || '/events/';

const config: StargazerConfig = {
  mode: 'files',
  base: '/',
  defaultLayout: 'canvas',
  layouts: {
    canvas: 'src/layouts/StargazerPreviewLayout.astro',
  },
  darkMode: {
    method: 'attribute',
    attribute: 'color-scheme',
    dark: 'dark',
    light: 'light',
  },
  navLinks: [
    // { label: 'Demo Home', href: '/' },
    // { label: 'Events', href: stargazerEventsHref, target: '_blank', highlight: true },
  ],
  logoHref: '/',
  components: [
    {
      name: 'Add To Calendar',
      path: './src/components/add-to-calendar/add-to-calendar.astro',
      category: 'Events',
      description: 'Calendar button and drawer interactions for event detail pages.',
      variants: [
        { name: 'Default', props: addToCalendarFixtures.default.props },
      ],
    },
    {
      name: 'Event Listing',
      path: './src/components/event-listing/event-listing.astro',
      category: 'Events',
      description: 'Paginated event card grid with htmx-ready state classes.',
      variants: [
        { name: 'Default', props: eventListingFixtures.default.props },
        { name: 'Empty', props: eventListingFixtures.empty.props },
      ],
    },
    {
      name: 'Event Teaser',
      path: './src/components/event-teaser/event-teaser.astro',
      category: 'Events',
      description: 'Single event card with upcoming and past visual states.',
      variants: [
        { name: 'Upcoming', props: eventTeaserFixtures.default.props },
        { name: 'Past', props: eventTeaserFixtures.past.props },
      ],
    },
    {
      name: 'Article Teaser',
      path: './src/components/article-teaser/article-teaser.astro',
      category: 'Content',
      description: 'Article card used in listing and related-content areas.',
      variants: [
        { name: 'Default', props: articleTeaserFixtures.default.props },
      ],
    },
    {
      name: 'Content Listing',
      path: './src/components/content-listing/content-listing.astro',
      category: 'Content',
      description: 'Mixed post-type listing wrapper for event and article payloads.',
      variants: [
        { name: 'Default', props: contentListingFixtures.default.props },
      ],
    },
    {
      name: 'Articles Teaser',
      path: './src/components/articles-teaser/articles-teaser.astro',
      category: 'Content',
      description: 'Article teaser card used by article listings and homepage previews.',
    },
    {
      name: 'Articles Listing',
      path: './src/components/articles-listing/articles-listing.astro',
      category: 'Content',
      description: 'Articles listing wrapper with ARIA region semantics.',
    },
    {
      name: 'Homepage Articles Listing',
      path: './src/components/homepage-articles-listing/homepage-articles-listing.astro',
      category: 'Content',
      description: 'Homepage-focused articles listing with optional view-all link.',
    },
    {
      name: 'Homepage Events Listing',
      path: './src/components/homepage-events-listing/homepage-events-listing.astro',
      category: 'Events',
      description: 'Generic homepage listing wrapper for event-like teaser grids.',
    },
    {
      name: 'Segmented Control',
      path: './src/components/segmented-control/segmented-control.astro',
      category: 'UI',
      description: 'Radio-group segmented control with progressive enhancement pill behavior.',
    },
    {
      name: 'Social Share',
      path: './src/components/social-share/social-share.astro',
      category: 'UI',
      description: 'Expandable social sharing links for Bluesky, Facebook, and Twitter.',
    },
  ],
};

export default config;
