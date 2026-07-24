declare module 'abcnorio-webcomponents/article-teaser' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/article-teaser/payload' {
  export function buildArticleTeaserPayload(attributes?: any, options?: any): any;
}

declare module 'abcnorio-webcomponents/article-listing' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/segmented-control' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/social-share' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/add-to-calendar' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/collective-listing' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/content-listing' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/event-listing' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/event-teaser' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/event-teaser/payload' {
  export function buildEventTeaserPayload(attributes?: any, options?: any): any;
}

declare module 'abcnorio-webcomponents/util/resolve-featured-image' {
  export function resolveFeaturedImage(source?: any, options?: any): any;
}

declare module 'abcnorio-webcomponents/util/normalize-post-type' {
  export function normalizePostType(item?: any): any;
  export function isEvent(item?: any): boolean;
  export function isArticle(item?: any): boolean;
  export function isCollective(item?: any): boolean;
}

declare module 'abcnorio-webcomponents/homepage-events-listing' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/paragraph' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/heading' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/image' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/quote' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/list' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/list-item' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/gallery' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/youtube' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/matterport' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/buttons' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/group' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/cover' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/events-list' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/collective-list' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/content-list' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/router' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/wp-block-router' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/breadcrumbs' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/fixtures' {
  export function listFixtures(): any[];
  export function getFixtureBySlug(slug?: string): any;
  export function getDefaultFixtureByComponent(componentName?: string): any;
}

declare module 'abcnorio-webcomponents/util/dates' {
  export function formatEventDate(raw?: string): {
    datetime: string;
    label_date: string;
    label_time: string;
    ampm: string;
  } | null;
}

declare module 'abcnorio-webcomponents/collective-teaser' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/collective-teaser/element' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/collective-listing/element' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/add-to-calendar/element' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/article-listing/element' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/article-teaser/element' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/content-listing/element' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/event-listing/element' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/event-teaser/element' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/segmented-control/element' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/social-share/element' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/button' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/announcement-tout' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/sidebar-tout' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/cover/element' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/announcement-tout' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/sidebar-tout' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/wp-blocks/block-registry' {
  export const CORE_BLOCK_KEYS: Record<string, string>;
  export const CUSTOM_BLOCK_KEYS: Record<string, string>;
  export const CORE_BLOCK_REGISTRY: Record<string, any>;
  export const CUSTOM_BLOCK_REGISTRY: Record<string, any>;
  export const EMBED_PROVIDER_REGISTRY: Record<string, any>;
  export const BLOCK_KEYS: Record<string, string>;
  export const BLOCK_REGISTRY: Record<string, any>;
}

declare module 'abcnorio-webcomponents/taxonomy-links' {
  const Component: any;
  export default Component;
}

declare module 'abcnorio-webcomponents/taxonomy-links/element' {
  const Component: any;
  export default Component;
}