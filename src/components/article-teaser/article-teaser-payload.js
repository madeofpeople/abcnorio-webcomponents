import { resolveFeaturedImage } from '../../util/resolve-featured-image.js';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatArticleDate(raw) {
  const value = String(raw || '').trim();
  if (!value) return null;

  const datePart = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;

  return {
    datetime: `${datePart}T00:00:00`,
    label: `${months[month - 1]} ${day}, ${year}`,
  };
}

const normalizeHref = (basePath, slug) => {
  const [pathPart, queryPart = ''] = String(basePath).split('?');
  const trimmedPath = String(pathPart || '/articles').replace(/\/+$/, '');
  const normalizedPath = `${trimmedPath}/${slug}`;
  return queryPart ? `${normalizedPath}?${queryPart}` : normalizedPath;
};

export function buildArticleTeaserPayload(attributes = {}, options = {}) {
  const slug = String(attributes?.slug || '').trim();
  const title = attributes?.title?.rendered || slug || 'Untitled article';
  const dateRaw = String(attributes?.acf?.item_date || attributes?.date || '').trim();
  const date = formatArticleDate(dateRaw);
  const hrefBase = options.hrefBase || '/articles';

  return {
    href: slug ? normalizeHref(hrefBase, slug) : hrefBase,
    slug,
    title,
    dateLabel: date?.label || '',
    dateTime: date?.datetime || '',
    excerpt: attributes?.excerpt || '',
    featured_image: resolveFeaturedImage(attributes, {
      size: 'abcnorio-card',
      defaultWidth: 900,
      defaultHeight: 600,
    }),
  };
}
