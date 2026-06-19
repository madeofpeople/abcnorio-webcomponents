export const metadata = {
  deps: {
    css: [],
    js: [],
  },
};

export default {
  default: {
    props: {
      title: 'Example event',
      description: 'Community event demo payload',
      start: '2026-06-06T18:00:00',
      end: '2026-06-06T20:00:00',
      location: 'Event venue',
      timeZone: 'America/New_York',
      url: 'https://abcnorio.org/events/example-event',
    },
  },
};