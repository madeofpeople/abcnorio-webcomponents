export function resolveFeaturedImage(source = {}, options = {}) {
  const {
    size = 'abcnorio-card',
    defaultWidth = 290,
    defaultHeight = 9999,
  } = options;

  const featuredImage = source?.featured_image;
  const embeddedMedia = source?._embedded?.['wp:featuredmedia']?.[0];
  const sizedMedia = embeddedMedia?.media_details?.sizes?.[size];

  const url = featuredImage?.url ?? sizedMedia?.source_url ?? embeddedMedia?.source_url ?? embeddedMedia?.url;

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
