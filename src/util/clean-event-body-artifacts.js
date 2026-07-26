const HTML_TAG_PATTERN = /<[^>]+>/g;

const ARTIFACT_PATTERNS = [
  /\[\s*TEST\s+APPEND\b[^\]]*\]/i,
  /\bregression\s+check\b/i,
  /\bedit\s+check\s+round\b/i,
];

const stripTags = (value = '') => String(value).replace(HTML_TAG_PATTERN, ' ');

const hasArtifactMarker = (value = '') => {
  const text = stripTags(value).replace(/\s+/g, ' ').trim();
  if (!text) {
    return false;
  }
  return ARTIFACT_PATTERNS.some((pattern) => pattern.test(text));
};

export const cleanEventBodyArtifactsInHtml = (html = '') => {
  if (!html) {
    return '';
  }

  return hasArtifactMarker(html) ? '' : String(html);
};
