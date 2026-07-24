import EventsListBlock from './events-list/events-list.astro';
import CollectiveListBlock from './collective-list/collective-list.astro';
import ContentListBlock from './content-list/content-list.astro';
import ParagraphBlock from './paragraph/paragraph.astro';
import HeadingBlock from './heading/heading.astro';
import ImageBlock from './image/image.astro';
import QuoteBlock from './quote/quote.astro';
import ListBlock from './list/list.astro';
import ListItemBlock from './list-item/list-item.astro';
import CoverBlock from './cover/cover.astro';
import GalleryBlock from './gallery/gallery.astro';
import ButtonsBlock from './buttons/buttons.astro';
import GroupBlock from './group/group.astro';
import MailchimpBlock from './mailchimp/mailchimp.astro';
import AnnouncementToutBlock from './announcement-tout/announcement-tout.astro';
import SidebarToutBlock from './sidebar-tout/sidebar-tout.astro';
import YouTubeEmbed from './youtube/youtube.astro';
import MatterportEmbed from './matterport/matterport.astro';
import { CONTENT_LISTING_KEY } from '../content-listing/content-listing.metadata.js';
import { EVENT_LISTING_KEY } from '../event-listing/event-listing.metadata.js';
import { COLLECTIVE_LISTING_KEY } from '../collective-listing/collective-listing.metadata.js';

export const CORE_BLOCK_KEYS = {
  PARAGRAPH: 'core/paragraph',
  HEADING: 'core/heading',
  IMAGE: 'core/image',
  QUOTE: 'core/quote',
  LIST: 'core/list',
  LIST_ITEM: 'core/list-item',
  COVER: 'core/cover',
  GALLERY: 'core/gallery',
  BUTTONS: 'core/buttons',
  GROUP: 'core/group',
};

export const CUSTOM_BLOCK_KEYS = {
  CONTENT_LISTING: CONTENT_LISTING_KEY,
  EVENT_LISTING: EVENT_LISTING_KEY,
  COLLECTIVE_LISTING: COLLECTIVE_LISTING_KEY,
  ANNOUNCEMENT_TOUT: 'abcnorio/announcement-tout',
  SIDEBAR_TOUT: 'abcnorio/sidebar-tout',
  MAILCHIMP: 'mailchimp/mailchimp',
};

export const CORE_BLOCK_REGISTRY = {
  [CORE_BLOCK_KEYS.PARAGRAPH]: ParagraphBlock,
  [CORE_BLOCK_KEYS.HEADING]: HeadingBlock,
  [CORE_BLOCK_KEYS.IMAGE]: ImageBlock,
  [CORE_BLOCK_KEYS.QUOTE]: QuoteBlock,
  [CORE_BLOCK_KEYS.LIST]: ListBlock,
  [CORE_BLOCK_KEYS.LIST_ITEM]: ListItemBlock,
  [CORE_BLOCK_KEYS.COVER]: CoverBlock,
  [CORE_BLOCK_KEYS.GALLERY]: GalleryBlock,
  [CORE_BLOCK_KEYS.BUTTONS]: ButtonsBlock,
  [CORE_BLOCK_KEYS.GROUP]: GroupBlock,
};

export const CUSTOM_BLOCK_REGISTRY = {
  [CUSTOM_BLOCK_KEYS.CONTENT_LISTING]: ContentListBlock,
  [CUSTOM_BLOCK_KEYS.EVENT_LISTING]: EventsListBlock,
  [CUSTOM_BLOCK_KEYS.COLLECTIVE_LISTING]: CollectiveListBlock,
  [CUSTOM_BLOCK_KEYS.ANNOUNCEMENT_TOUT]: AnnouncementToutBlock,
  [CUSTOM_BLOCK_KEYS.SIDEBAR_TOUT]: SidebarToutBlock,
  [CUSTOM_BLOCK_KEYS.MAILCHIMP]: MailchimpBlock,
};

export const EMBED_PROVIDER_REGISTRY = {
  youtube: YouTubeEmbed,
  matterport: MatterportEmbed,
};

export const BLOCK_KEYS = {
  ...CORE_BLOCK_KEYS,
  ...CUSTOM_BLOCK_KEYS,
};

export const BLOCK_REGISTRY = {
  ...CORE_BLOCK_REGISTRY,
  ...CUSTOM_BLOCK_REGISTRY,
};