import { ANNOUNCEMENT_TOUT_FIXTURE_METADATA } from './announcement-tout.metadata.js';

export const metadata = ANNOUNCEMENT_TOUT_FIXTURE_METADATA;

export default {
  editor: {
    props: { editorShell: true },
    slots: { default: '__EDITOR_SLOT_CONTENT__' },
  },
  default: {
    props: {
      toast: 'Announcement toast',
      title: 'Announcement Title',
    },
  },
  secondary: {
    props: {
      class: 'announcement-tout--secondary',
      toast: 'Secondary announcement',
      toastHeadingLevel: 4,
      title: 'Secondary Title',
    },
  },
};
