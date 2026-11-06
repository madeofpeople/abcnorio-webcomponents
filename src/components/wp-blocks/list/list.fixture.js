export const metadata = {
  name: 'list',
  label: 'List',
};

export default {
  default: {
    props: {
      attributes: {},
      innerBlocks: [
        {
          name: 'core/list-item',
          attributes: {},
          innerBlocks: [
            {
              name: 'core/paragraph',
              attributes: { content: 'First item' },
              innerBlocks: [],
            },
          ],
        },
        {
          name: 'core/list-item',
          attributes: {},
          innerBlocks: [
            {
              name: 'core/paragraph',
              attributes: { content: 'Second item' },
              innerBlocks: [],
            },
          ],
        },
      ],
    },
  },
};
