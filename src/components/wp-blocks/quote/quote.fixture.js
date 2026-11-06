export const metadata = {
  name: 'quote',
  label: 'Blockquote',
};

export default {
  default: {
    props: {
      attributes: {},
      innerBlocks: [
        {
          name: 'core/paragraph',
          attributes: { content: 'This is a sample quote or testimonial.' },
          innerBlocks: [],
        },
      ],
    },
  },
};
