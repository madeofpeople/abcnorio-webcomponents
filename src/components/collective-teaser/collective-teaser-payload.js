import { resolveFeaturedImage } from '../../util/resolve-featured-image.js';

const normalizeHref = (basePath, slug) => {
  const [pathPart, queryPart = ''] = String(basePath).split('?');
  const trimmedPath = String(pathPart || '/collectives').replace(/\/+$/, '');
  const normalizedPath = `${trimmedPath}/${slug}`;
  return queryPart ? `${normalizedPath}?${queryPart}` : normalizedPath;
};

export function buildCollectiveTeaserPayload(attributes = {}, options = {}) {
  const {
    slug = '',
    title: titleSource = {},
    excerpt: excerptSource = {},
    priority = false,
  } = attributes;

  const hrefBase = options.hrefBase || '/collectives';
  const title = titleSource.rendered || slug || 'Untitled collective';
  const excerpt = excerptSource.rendered || '';

  return {
    href: normalizeHref(hrefBase, slug),
    slug,
    title,
    excerpt,
    priority,
    featured_image: resolveFeaturedImage(attributes, {
      size: 'abcnorio-collective-thumb',
      defaultWidth: 290,
      defaultHeight: 9999,
    }),
  };
}