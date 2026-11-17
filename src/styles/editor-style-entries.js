// Paths are package-relative and shared by manifest generation and the existing Vite server.
export const editorStyleEntries = {
  hero: { source: 'src/components/wp-blocks/hero/hero.scss', editor: 'src/components/wp-blocks/hero/editor.scss' },
  gallery: { source: 'src/components/wp-blocks/gallery/gallery.scss', editor: 'src/components/wp-blocks/gallery/editor.scss' },
  group: { source: 'src/components/wp-blocks/group/group.scss' },
  'event-listing': { source: 'src/components/event-listing/event-listing.scss', editor: 'src/components/event-listing/editor.scss' },
  'event-teaser': { source: 'src/components/event-teaser/event-teaser.scss' },
  'content-listing': { source: 'src/components/content-listing/content-listing.scss', editor: 'src/components/content-listing/editor.scss' },
  'article-teaser': { source: 'src/components/article-teaser/article-teaser.scss' },
};
