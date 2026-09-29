const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatDate(raw) {
  const value = String(raw || '').trim();
  const matches = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!matches) {
    return null;
  }

  const [, year, month, day] = matches;
  const monthIndex = Number(month) - 1;
  const date = new Date(Number(year), monthIndex, Number(day));
  if (monthIndex < 0 || monthIndex >= MONTHS.length || date.getFullYear() !== Number(year) || date.getMonth() !== monthIndex || date.getDate() !== Number(day)) {
    return null;
  }

  return {
    datetime: value,
    label_date: `${WEEKDAYS[date.getDay()]}, ${MONTHS[monthIndex]} ${Number(day)}, ${year}`,
  };
}

/**
 * Parse a WP ACF datetime string into display parts.
 * Returns null when raw is empty or invalid.
 *
 * @param {string} raw
 * @returns {{ datetime: string, label_date: string, label_time: string, ampm: string } | null}
 */
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