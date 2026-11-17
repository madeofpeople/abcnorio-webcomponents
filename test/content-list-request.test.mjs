import assert from 'node:assert/strict';
import test from 'node:test';
import { contentListingUrl } from '../src/components/wp-blocks/content-list/content-list-request.js';

test('content listing uses the fetch REST host and preserves WordPress subdirectories', () => {
  for (const suffix of ['', '/']) {
    const url = contentListingUrl(`http://wordpress.internal/subdir/wp-json/wp/v2${suffix}`, {
      listingPostTypes: ['article'], listingCount: 12,
    });
    assert.equal(url.origin, 'http://wordpress.internal');
    assert.equal(url.pathname, '/subdir/wp-json/abcnorio/v1/content-listing');
    assert.equal(url.searchParams.get('post_types'), 'article');
    assert.equal(url.searchParams.get('count'), '12');
  }
  assert.throws(() => contentListingUrl(''), /requires.*REST URL/);
});

test('query controls forward filters, direction and manual order separately', () => {
  const url = contentListingUrl('https://cms.test/wp-json/wp/v2/', {
    listing_post_types: 'event, article', listing_tag_filter: ['benefit'],
    listing_count: 100, order: 'manual', sortOrderPostIds: [143, 144, 133],
  });
  assert.equal(url.searchParams.get('post_types'), 'event,article');
  assert.equal(url.searchParams.get('tags'), 'benefit');
  assert.equal(url.searchParams.get('count'), '50');
  assert.equal(url.searchParams.get('order'), 'desc');
  assert.deepEqual(url.searchParams.getAll('orderIds[]'), ['143', '144', '133']);
  const ascending = contentListingUrl('https://cms.test/wp-json/wp/v2/', { order: 'asc', sortOrderPostIds: [143] });
  assert.equal(ascending.searchParams.get('order'), 'asc');
  assert.equal(ascending.searchParams.has('orderIds[]'), false);
});
