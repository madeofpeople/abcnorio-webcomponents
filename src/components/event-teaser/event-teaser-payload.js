const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const normalizeHref = (basePath, slug) => {
  const trimmedBasePath = String(basePath).replace(/\/+$/, '');
  return `${trimmedBasePath}/${slug}`;
};

export function formatEventDate(raw) {
  if (!raw) {
    return null;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const hour = date.getHours() % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = date.getHours() < 12 ? 'AM' : 'PM';

  return {
    datetime: String(raw).replace(' ', 'T'),
    label_date: `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`,
    label_time: `${hour}:${minutes}`,
    ampm,
  };
}

export function buildEventTeaserPayload(attributes = {}, options = {}) {
  const {
    slug = '',
    title: titleSource = {},
    excerpt: excerptSource = {},
    event_start_date: startRaw = '',
    event_end_date: endRaw = '',
    event_effective_end: effectiveEndRaw = '',
    featured_image: featuredImage = null,
    showTeaser = true,
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
    showTeaser,
    priority,
    isPastEvent,
    startLabelDate: start ? start.label_date : '',
    startLabelTime: start ? start.label_time : '',
    startDateTime: start ? start.datetime : startRaw,
    image: featuredImage && featuredImage.url
      ? {
          url: featuredImage.url,
          alt: featuredImage.alt || '',
          width: featuredImage.width || 290,
          height: featuredImage.height || 9999,
        }
      : null,
  };
}