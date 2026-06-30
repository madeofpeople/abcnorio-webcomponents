import { formatEventDate } from '../../util/dates.js';
import { resolveFeaturedImage } from '../../util/resolve-featured-image.js';

const normalizeHref = (basePath, slug) => {
  const [pathPart, queryPart = ''] = String(basePath).split('?');
  const trimmedPath = String(pathPart || '/events').replace(/\/+$/, '');
  const normalizedPath = `${trimmedPath}/${slug}`;
  return queryPart ? `${normalizedPath}?${queryPart}` : normalizedPath;
};

export { formatEventDate };

export function buildEventTeaserPayload(attributes = {}, options = {}) {
  const {
    slug = '',
    title: titleSource = {},
    excerpt: excerptSource = {},
    event_start_date: startRaw = '',
    event_end_date: endRaw = '',
    event_effective_end: effectiveEndRaw = '',
    priority = false,
  } = attributes;
  const hrefBase = options.hrefBase || '/events';

  const start = formatEventDate(startRaw);
  const end = formatEventDate(endRaw);
  const effectiveEnd = formatEventDate(effectiveEndRaw);

  const title = titleSource.rendered || slug || 'Untitled event';
  const excerpt = excerptSource.rendered || '';

  const comparisonDateTime = end ? end.datetime : effectiveEnd ? effectiveEnd.datetime : start ? start.datetime : '';
  const isPastEvent = comparisonDateTime ? new Date(comparisonDateTime) < new Date() : false;

  return {
    href: normalizeHref(hrefBase, slug),
    slug,
    title,
    excerpt,
    priority,
    isPastEvent,
    startLabelDate: start ? start.label_date : '',
    startLabelTime: start ? start.label_time : '',
    startDateTime: start ? start.datetime : startRaw,
    featured_image: resolveFeaturedImage(attributes, {
      size: 'abcnorio-card',
      defaultWidth: 290,
      defaultHeight: 9999,
    }),
  };
}