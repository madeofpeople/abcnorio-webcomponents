export const metadata = {
  name: 'buttons',
  label: 'Buttons',
  deps: { css: [], js: [] },
};

export default {
  default: {
    props: {
      innerBlocks: [{
        name: 'core/button',
        attributes: { url: '#example', text: 'Example button' },
      }],
    },
  },
};
