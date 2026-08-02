import { normalizeTeaserHref, resolveFeaturedImage } from '../../util/resolve-featured-image.js';

export function buildCollectiveTeaserPayload(attributes = {}, options = {}) {
  const cmsUrl = options.cmsUrl || '';
  const {
    slug = '',
    title: titleSource = {},
    excerpt: excerptSource = {},
    priority = false,
  } = attributes;

  const hrefBase = options.hrefBase || '/collectives';
  const title = (
    (typeof titleSource === 'string' ? titleSource : titleSource?.rendered)
    || slug
    || 'Untitled collective'
  );
  const excerpt = (typeof excerptSource === 'string' ? excerptSource : excerptSource?.rendered) || '';

  return {
    href: normalizeTeaserHref(hrefBase, slug),
    slug,
    title,
    excerpt,
    priority,
    featured_image: resolveFeaturedImage(attributes, {
      size: 'abcnorio-collective-thumb',
      defaultWidth: 290,
      defaultHeight: 9999,
      cmsUrl,
    }),
  };
}