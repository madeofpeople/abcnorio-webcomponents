const INSTAGRAM_PROFILE_BASE_URL = 'https://www.instagram.com/';
const MENTION_PATTERN = /(^|[^A-Za-z0-9_@])@([A-Za-z0-9._-]+)/g;
const ANCHOR_SEGMENT_PATTERN = /(<a\b[^>]*>[\s\S]*?<\/a>)/gi;
const HTML_TAG_PATTERN = /(<[^>]+>)/g;

const linkifyTextMentions = (text = '') => text.replace(
  MENTION_PATTERN,
  (_match, prefix, mention) => (
    `${prefix}<a href="${INSTAGRAM_PROFILE_BASE_URL}${mention}" target="_blank" rel="noopener noreferrer">@${mention}</a>`
  ),
);

const linkifyNonAnchorHtmlSegment = (segment = '') => {
  if (!segment || !segment.includes('@')) {
    return segment;
  }

  return segment
    .split(HTML_TAG_PATTERN)
    .map((part) => (part.startsWith('<') ? part : linkifyTextMentions(part)))
    .join('');
};

export const linkifyInstagramMentionsInHtml = (html = '') => {
  if (!html || !String(html).includes('@')) {
    return String(html || '');
  }

  return String(html)
    .split(ANCHOR_SEGMENT_PATTERN)
    .map((segment) => (
      /^<a\b/i.test(segment)
        ? segment
        : linkifyNonAnchorHtmlSegment(segment)
    ))
    .join('');
};
