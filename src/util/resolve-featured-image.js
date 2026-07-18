const env = import.meta.env || {};
const mode = process.env.MODE || 'development';

const defaultCmsUrl = (
  mode === 'production' || mode === 'staging' || mode === 'preview'
    ? env.STAGING_CMS
    : env.DEV_CMS
) || '';

function resolveWordPressImageUrl(value, cmsUrl = defaultCmsUrl) {
  if (!value || !cmsUrl) {
    return value;
  }

  try {
    const cmsOrigin = new URL(cmsUrl).origin;
    const url = new URL(value);
    const isLegacyUploadsPath = url.pathname.startsWith('/wp-content/uploads/');
    const isCurrentUploadsPath = url.pathname.startsWith('/app/uploads/');

    if (!isLegacyUploadsPath && !isCurrentUploadsPath) {
      return value;
    }

    const canonicalPath = isLegacyUploadsPath
      ? url.pathname.replace('/wp-content/uploads/', '/app/uploads/')
      : url.pathname;

    return `${cmsOrigin}${canonicalPath}`;
  } catch {
    return value;
  }
}

export function resolveFeaturedImage(source = {}, options = {}) {
  const {
    size = 'abcnorio-card',
    defaultWidth = 290,
    defaultHeight = 9999,
    cmsUrl = defaultCmsUrl,
  } = options;

  const featuredImage = source?.featured_image;
  const embeddedMedia = source?._embedded?.['wp:featuredmedia']?.[0];
  const sizedMedia = embeddedMedia?.media_details?.sizes?.[size];

  const rawUrl = featuredImage?.url ?? sizedMedia?.source_url ?? embeddedMedia?.source_url ?? embeddedMedia?.url;
  const url = resolveWordPressImageUrl(rawUrl, cmsUrl);

  if (!url) {
    return null;
  }

  return {
    url,
    alt: featuredImage?.alt ?? embeddedMedia?.alt_text ?? '',
    width: Number(
      featuredImage?.width ??
      sizedMedia?.width ??
      embeddedMedia?.media_details?.width ??
      defaultWidth,
    ),
    height: Number(
      featuredImage?.height ??
      sizedMedia?.height ??
      embeddedMedia?.media_details?.height ??
      defaultHeight,
    ),
  };
}
