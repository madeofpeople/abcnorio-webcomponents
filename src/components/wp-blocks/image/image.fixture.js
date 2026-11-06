export const metadata = {
  name: 'image',
  label: 'Image',
};

export default {
  default: {
    props: {
      attributes: {
        url: 'https://via.placeholder.com/400x300',
        alt: 'Example image',
        caption: 'Image caption example',
        width: 400,
        height: 300,
      },
    },
  },
};
