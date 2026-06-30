export function normalizePostType(item = {}) {
  if (!item || typeof item !== 'object') {
    return item;
  }
  /* 
    Depending on whether something comes in from REST API
    the key is either post_type or type so we created this helper 
  */
  const postType = String(item?.post_type || item?.type || '').trim();
  return postType ? { ...item, post_type: postType } : item;
}

export const isEvent = (item) => item?.post_type === 'event';
export const isArticle = (item) => item?.post_type === 'article';
export const isCollective = (item) => item?.post_type === 'collective';
