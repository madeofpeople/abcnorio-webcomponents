export const metadata = {
  name: 'gallery',
  label: 'Gallery',
  deps: {
    css: [],
    js: [
      'elements/wp-blocks/gallery.js',
    ],
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
};
