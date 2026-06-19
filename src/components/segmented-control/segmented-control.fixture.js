export const metadata = {
  deps: {
    css: [],
    js: [],
  },
};

export default {
  default: {
    props: {
      name: 'fixture-segment',
      options: [
        { value: 'all', label: 'All', checked: true },
        { value: 'upcoming', label: 'Upcoming' },
      ],
      label: 'Filter',
    },
  },
};