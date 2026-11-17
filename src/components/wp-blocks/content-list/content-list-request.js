export function contentListingUrl(restPath, attributes = {}) {
  if (!restPath) {
    throw new Error('Content listing requires the server-side WordPress REST URL.');
  }
  const endpoint = new URL('../../abcnorio/v1/content-listing', restPath.replace(/\/?$/, '/'));
  const toList = (value) => {
    if (typeof value === 'string') return value.split(',').map((entry) => entry.trim()).filter(Boolean);
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (value && typeof value === 'object') return Object.values(value).map(String).filter(Boolean);
    return [];
  };
  const postTypes = toList(attributes.listing_post_types ?? attributes.listingPostTypes);
  const tags = toList(attributes.listing_tag_filter ?? attributes.listingTagFilter);
  const count = Math.max(1, Math.min(50, Number.parseInt(attributes.listing_count ?? attributes.listingCount ?? '5', 10) || 5));
  if (postTypes.length) endpoint.searchParams.set('post_types', postTypes.join(','));
  if (tags.length) endpoint.searchParams.set('tags', tags.join(','));
  endpoint.searchParams.set('count', String(count));
  endpoint.searchParams.set('order', attributes.order === 'asc' ? 'asc' : 'desc');
  if (attributes.order === 'manual') {
    toList(attributes.sortOrderPostIds).forEach((id) => endpoint.searchParams.append('orderIds[]', id));
  }
  return endpoint;
}
