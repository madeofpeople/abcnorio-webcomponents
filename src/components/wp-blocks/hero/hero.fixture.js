export const metadata = {
  name: 'hero',
  label: 'Hero',
};

export default {
  editor: {
    props: { editorShell: true },
    slots: {
      image: '__EDITOR_SLOT_IMAGE__',
      default: '__EDITOR_SLOT_CONTENT__',
    },
  },
  default: {
    props: {
      attributes: {
        variant: 'default',
      },
      innerBlocks: [],
    },
  },
};
