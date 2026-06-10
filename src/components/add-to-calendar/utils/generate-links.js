const isMobile = () => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
};

const asText = (value) => {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value).split(',').join('');
};

const normalizeEvent = (event = {}) => {
  const title = asText(event.title);
  const description = asText(event.description);
  const start = asText(event.start ?? event.event_start_date);
  const end = asText(event.end ?? event.event_end_date ?? start);
  const location = asText(event.location ?? event.event_venue_name);
  const timeZone = asText(event.timeZone ?? event.timeZoneName ?? event.event_timezone);
  const url = asText(event.url);
  const details = [description, location ? `Location: ${location}` : '', url ? `URL: ${url}` : '']
    .filter(Boolean)
    .join(' — ');

  return { title, description, start, end, location, timeZone, url, details };
};

const parseEventDate = (value) => {
  const date = value instanceof Date ? value : new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? null : date;
};

const pad = (part) => String(part).padStart(2, '0');

const formatCalendarDate = (value) => {
  const date = parseEventDate(value);

  if (!date) {
    return asText(value);
  }

  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
};

const formatIcsUtcDate = (value) => {
  const date = parseEventDate(value);

  if (!date) {
    return '';
  }

  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
};

const pushParam = (parts, key, value) => {
  if (value) {
    parts.push(`${key}=${encodeURIComponent(value)}`);
  }
};

const escapeIcsText = (value) => asText(value)
  .replace(/\\/g, '\\\\')
  .replace(/;/g, '\\;')
  .replace(/,/g, '\\,')
  .replace(/\r?\n/g, '\\n');

const downloadFile = (blob, filename) => {
  const link = document.createElement('a');
  const objectUrl = URL.createObjectURL(blob);

  link.href = objectUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 0);
};

export const downloadICS = (rawEvent) => {
  const event = normalizeEvent(rawEvent);
  const start = formatIcsUtcDate(event.start);
  const end = formatIcsUtcDate(event.end);

  if (!start) {
    return;
  }

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//abcnorio//Add To Calendar//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@abcnorio.org`,
    `DTSTAMP:${formatIcsUtcDate(new Date())}`,
    `DTSTART:${start}`,
    end ? `DTEND:${end}` : '',
    `SUMMARY:${escapeIcsText(event.title)}`,
    event.description ? `DESCRIPTION:${escapeIcsText(event.description)}` : '',
    event.location ? `LOCATION:${escapeIcsText(event.location)}` : '',
    event.url ? `URL:${escapeIcsText(event.url)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  const blob = new Blob([`${lines.join('\r\n')}\r\n`], { type: 'text/calendar;charset=utf-8' });
  downloadFile(blob, `${event.title || 'event'}.ics`);
};

export const generateGoogleLink = (rawEvent) => {
  const event = normalizeEvent(rawEvent);
  const link = [
    isMobile()
      ? 'https://calendar.google.com/calendar/render?action=TEMPLATE&'
      : 'https://calendar.google.com/calendar/r/eventedit?',
    `dates=${encodeURIComponent(formatCalendarDate(event.start))}%2F${encodeURIComponent(formatCalendarDate(event.end))}`,
  ];

  pushParam(link, 'ctz', event.timeZone);
  pushParam(link, 'location', event.location);
  pushParam(link, 'text', event.title);
  pushParam(link, 'details', event.details);

  return link.join('&');
};

export const generateOutlookLink = (rawEvent) => {
  const event = normalizeEvent(rawEvent);
  const link = [
    'https://outlook.office.com/calendar/0/deeplink/compose?',
    `startdt=${encodeURIComponent(formatCalendarDate(event.start))}`,
    `enddt=${encodeURIComponent(formatCalendarDate(event.end))}`,
  ];

  pushParam(link, 'ctz', event.timeZone);
  pushParam(link, 'location', event.location);
  pushParam(link, 'subject', event.title);
  pushParam(link, 'body', event.details);
  link.push('path=%2Fcalendar%2Faction%2Fcompose');
  link.push('rru=addevent');

  return link.join('&');
};