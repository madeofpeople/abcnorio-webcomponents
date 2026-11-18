export const metadata = { deps: { css: [], js: [] } };

export default {
  editor: { props: { preview: true, editorShell: true, attributes: { subHeader: 'News and updates' } } },
  preview: { props: { preview: true, attributes: { subHeader: 'News and updates' } } },
  default: {
    props: {
      attributes: {
        header: 'Newsletter Signup',
        subHeader: 'News and updates',
        submitText: 'Subscribe',
      },
    },
  },
};
