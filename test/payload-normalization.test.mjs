import assert from 'node:assert/strict';

import { resolveFeaturedImage } from '../src/util/resolve-featured-image.js';
import { buildArticleTeaserPayload } from '../src/components/article-teaser/article-teaser-payload.js';
import { buildEventTeaserPayload } from '../src/components/event-teaser/event-teaser-payload.js';
import { buildCollectiveTeaserPayload } from '../src/components/collective-teaser/collective-teaser-payload.js';

function testResolveFeaturedImage() {
  const direct = resolveFeaturedImage({
    featured_image: { url: 'https://img/direct.webp', alt: 'Direct', width: 640, height: 480 },
  });
  assert.deepEqual(direct, {
    url: 'https://img/direct.webp',
    alt: 'Direct',
    width: 640,
    height: 480,
  });

  const embeddedOnly = resolveFeaturedImage({
    _embedded: {
      'wp:featuredmedia': [
        {
          source_url: 'https://img/full.webp',
          alt_text: 'Embedded',
          media_details: {
            width: 1200,
            height: 800,
            sizes: {
              'abcnorio-card': {
                source_url: 'https://img/card.webp',
                width: 353,
                height: 199,
              },
            },
          },
        },
      ],
    },
  });
  assert.deepEqual(embeddedOnly, {
    url: 'https://img/card.webp',
    alt: 'Embedded',
    width: 353,
    height: 199,
  });

  const none = resolveFeaturedImage({});
  assert.equal(none, null);
}

function testPayloadBuilders() {
  const article = buildArticleTeaserPayload({
    slug: 'article-1',
    title: { rendered: 'Article 1' },
    date: '2026-06-20T10:00:00',
    _embedded: {
      'wp:featuredmedia': [{
        source_url: 'https://img/article-full.webp',
        media_details: { width: 900, height: 600 },
      }],
    },
  }, { hrefBase: '/articles' });
  assert.equal(article.href, '/articles/article-1');
  assert.equal(article.featured_image.url, 'https://img/article-full.webp');

  const event = buildEventTeaserPayload({
    slug: 'event-1',
    title: { rendered: 'Event 1' },
    event_start_date: '2026-06-24 18:00:00',
    featured_image: { url: 'https://img/event.webp', alt: 'Event image', width: 300, height: 200 },
  }, { hrefBase: '/events' });
  assert.equal(event.href, '/events/event-1');
  assert.equal(event.featured_image.url, 'https://img/event.webp');

  const collective = buildCollectiveTeaserPayload({
    slug: 'collective-1',
    title: { rendered: 'Collective 1' },
    _embedded: {
      'wp:featuredmedia': [{
        source_url: 'https://img/collective-full.webp',
        alt_text: 'Collective image',
        media_details: { width: 500, height: 500 },
      }],
    },
  }, { hrefBase: '/collectives' });
  assert.equal(collective.href, '/collectives/collective-1');
  assert.equal(collective.featured_image.url, 'https://img/collective-full.webp');
}

testResolveFeaturedImage();
testPayloadBuilders();
console.log('payload-normalization: ok');
