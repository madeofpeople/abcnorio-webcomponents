export const metadata = {
  name: 'gallery',
  label: 'Gallery',
  deps: {
    css: [],
    js: [],
  },
};

export default {
  editor: {
    props: { editorShell: true },
    slots: { default: '__EDITOR_SLOT_CONTENT__' },
  },
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
  slider: { props: { attributes: { variant: 'slider' } } },
  'paged-grid': { props: { attributes: { variant: 'paged-grid' } } },
  masonry: { props: { attributes: { variant: 'masonry' } } },
};
