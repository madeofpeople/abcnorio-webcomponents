export const metadata = {
  deps: {
    css: [],
    js: [],
  },
};

export default {
  default: {
  props: {
      urlBase: 'events/event-type/',
      terms: [
        { slug: 'slug-a', name: 'Tag A'},
        { slug: 'slug-b', name: 'Tag B'},
        { slug: 'slug-c', name: 'Tag C'},
      ]
    },
  },
};
