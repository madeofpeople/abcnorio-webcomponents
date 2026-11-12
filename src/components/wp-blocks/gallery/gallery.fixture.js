export const metadata = {
  name: 'gallery',
  label: 'Gallery',
  deps: {
    css: [],
    js: [],
  },
};

export default {
  default: {
    props: {
      attributes: {
        variant: 'default',
      },
      innerBlocks: [],
    },
  },
  captioned: {
    props: {
      attributes: { variant: 'captioned' },
      innerBlocks: [],
    },
  },
};
