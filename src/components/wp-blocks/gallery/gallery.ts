import BlazeSlider from 'blaze-slider';
import { bp } from '@util/breakpoints';

type PhotoSwipeLightboxInstance = {
  init: () => void;
  destroy: () => void;
  on?: (eventName: string, callback: () => void) => void;
  pswp?: {
    currSlide?: {
      data?: {
        element?: Element | null;
      };
    };
    ui?: {
      registerElement: (options: {
        name: string;
        order: number;
        isButton: boolean;
        appendTo: string;
        html: string;
        onInit: (el: HTMLElement, pswp: any) => void;
      }) => void;
    };
  };
};

export class GalleryListing extends HTMLElement {
  realItemCount = 0;
  lightbox: PhotoSwipeLightboxInstance | null = null;
  photoswipeLoadAttempted = false;

  getNavigationMode(): 'item' | 'page' {
    return this.dataset.navigationMode === 'page' ? 'page' : 'item';
  }

  getClassNumber(prefix: string): number | null {
    const token = Array.from(this.classList).find((entry) => entry.startsWith(`${prefix}-`));
    if (!token) {
      return null;
    }

    const rawValue = token.slice(prefix.length + 1);
    const parsed = Number.parseInt(rawValue, 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      return null;
    }

    return parsed;
  }

  resolvePhotoSwipeSource(image: HTMLImageElement) {
    const currentSource = image.currentSrc || image.getAttribute('src') || '';
    if (!currentSource) {
      return '';
    }

    const srcset = image.getAttribute('srcset')?.trim();
    if (srcset) {
      const candidates = srcset
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
          const parts = entry.split(/\s+/);
          const url = parts[0];
          const descriptor = parts[1];
          const width = Number.parseInt(descriptor?.replace(/w$/i, '') || '', 10);

          return {
            url,
            width: Number.isFinite(width) ? width : null,
          };
        })
        .filter((candidate) => candidate.url);

      const preferred = candidates
        .filter((candidate) => candidate.width && candidate.width >= 1080)
        .sort((left, right) => (right.width ?? 0) - (left.width ?? 0))[0];

      if (preferred?.url) {
        return preferred.url;
      }
    }

    return currentSource;
  }

  ensurePhotoSwipeItem(image: HTMLImageElement) {
    const source = this.resolvePhotoSwipeSource(image);
    if (!source) {
      return null;
    }

    const figure = image.closest('figure');
    const container = figure && this.contains(figure) ? figure : image;
    let trigger = container.closest('a');

    if (!trigger || !this.contains(trigger)) {
      trigger = document.createElement('a');
      const parentNode = container.parentNode;
      if (parentNode && this.contains(parentNode)) {
        parentNode.insertBefore(trigger, container);
      }
      trigger.appendChild(container);
    }

    trigger.setAttribute('href', source);
    trigger.setAttribute('data-pswp-item', 'true');

    const width = image.getAttribute('width') || String(image.naturalWidth || 0);
    const height = image.getAttribute('height') || String(image.naturalHeight || 0);

    if (width !== '0' && height !== '0') {
      trigger.setAttribute('data-pswp-width', width);
      trigger.setAttribute('data-pswp-height', height);
    }

    const caption = figure?.querySelector('figcaption')?.textContent?.trim() || image.alt || '';

    if (caption) {
      trigger.setAttribute('data-pswp-caption', caption);
    }

    return trigger;
  }

  ensurePhotoSwipeStylesheet() {
    if (document.getElementById('abcnorio-photoswipe-css')) {
      return;
    }

    const link = document.createElement('link');
    link.id = 'abcnorio-photoswipe-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe.css';
    document.head.appendChild(link);
  }

  async initPhotoSwipe() {
    if (this.lightbox) {
      return;
    }

    if (this.photoswipeLoadAttempted) {
      return;
    }

    this.photoswipeLoadAttempted = true;

    const images = Array.from(this.querySelectorAll<HTMLImageElement>('.images img'));
    if (images.length === 0) {
      return;
    }

    images.forEach((image) => this.ensurePhotoSwipeItem(image));

    const items = this.querySelectorAll('a[data-pswp-item="true"]');
    if (items.length === 0) {
      return;
    }

    const hasCaptions = Array.from(items).some((item) => {
      const caption = item.getAttribute('data-pswp-caption');
      return Boolean(caption && caption.trim());
    });

    let lightboxModule: any;

    try {
      const lightboxModuleUrl = 'https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe-lightbox.esm.min.js';
      lightboxModule = await import(/* @vite-ignore */ lightboxModuleUrl);
    } catch {
      return;
    }

    const PhotoSwipeLightbox = lightboxModule?.default;
    if (!PhotoSwipeLightbox) {
      return;
    }

    this.ensurePhotoSwipeStylesheet();

    const pswpModuleUrl = 'https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe.esm.js';

    const lightbox = new PhotoSwipeLightbox({
      gallery: this,
      children: 'a[data-pswp-item="true"]',
      pswpModule: () => import(/* @vite-ignore */ pswpModuleUrl),
    });

    if (hasCaptions && typeof lightbox.on === 'function') {
      lightbox.on('uiRegister', () => {
        lightbox.pswp?.ui?.registerElement({
          name: 'custom-caption',
          order: 9,
          isButton: false,
          appendTo: 'root',
          html: '',
          onInit: (el: HTMLElement, pswp: any) => {
            const updateCaption = () => {
              const slideElement = pswp?.currSlide?.data?.element as HTMLElement | null | undefined;
              const caption = slideElement?.getAttribute('data-pswp-caption')?.trim() || '';

              el.textContent = caption;
              el.toggleAttribute('hidden', !caption);
            };

            pswp.on('change', updateCaption);
            pswp.on('afterInit', updateCaption);
          },
        });
      });
    }

    lightbox.init();
    this.lightbox = lightbox;
  }

  goToState(slider: any, nextStateIndex: number) {
    if (!slider || typeof nextStateIndex !== 'number') {
      return false;
    }

    const delta = nextStateIndex - slider.stateIndex;
    if (delta > 0) {
      slider.next(delta);
      return true;
    }

    if (delta < 0) {
      slider.prev(Math.abs(delta));
      return true;
    }

    return false;
  }

  getCurrentRealItemIndex(slider: any) {
    if (!slider) {
      return 0;
    }

    const maxRealIndex = Math.max(this.realItemCount - 1, 0);
    const stateIndex = Number.isFinite(slider.stateIndex) ? slider.stateIndex : 0;
    return Math.max(0, Math.min(stateIndex, maxRealIndex));
  }

  getCurrentNavigationIndex(slider: any) {
    if (!slider) {
      return 0;
    }

    if (this.getNavigationMode() === 'page') {
      return Number.isFinite(slider.stateIndex) ? slider.stateIndex : 0;
    }

    return this.getCurrentRealItemIndex(slider);
  }

  prepareSlideTrack(slidesToShow: number) {
    const track = this.querySelector('.images.blaze-track');
    if (!track) {
      this.realItemCount = 0;
      return;
    }

    Array.from(track.querySelectorAll('.gallery-item--ghost')).forEach((ghost) => ghost.remove());

    const realItems = Array.from(track.querySelectorAll(':scope > .gallery-item:not(.gallery-item--ghost)'));
    this.realItemCount = realItems.length;

    if (this.getNavigationMode() === 'page') {
      return;
    }

    const ghostCount = Math.max(slidesToShow - 1, 0);
    for (let i = 0; i < ghostCount; i += 1) {
      const ghostItem = document.createElement('div');
      ghostItem.className = 'gallery-item gallery-item--ghost';
      ghostItem.setAttribute('aria-hidden', 'true');
      track.appendChild(ghostItem);
    }
  }

  updateArrowVisibility(slider: any) {
    if (!slider) {
      return;
    }

    const prev = this.querySelector<HTMLElement>('.blaze-prev');
    const next = this.querySelector<HTMLElement>('.blaze-next');
    const currentNavigationIndex = this.getCurrentNavigationIndex(slider);
    const lastIndex = this.getNavigationMode() === 'page'
      ? Math.max(Array.isArray(slider.states) ? slider.states.length - 1 : 0, 0)
      : Math.max(this.realItemCount - 1, 0);
    const hidePrev = currentNavigationIndex <= 0;
    const hideNext = currentNavigationIndex >= lastIndex;

    if (prev) {
      prev.toggleAttribute('hidden', hidePrev);
      prev.style.display = hidePrev ? 'none' : '';
      prev.setAttribute('aria-hidden', hidePrev ? 'true' : 'false');
      prev.tabIndex = hidePrev ? -1 : 0;
    }

    if (next) {
      next.toggleAttribute('hidden', hideNext);
      next.style.display = hideNext ? 'none' : '';
      next.setAttribute('aria-hidden', hideNext ? 'true' : 'false');
      next.tabIndex = hideNext ? -1 : 0;
    }
  }

  updateActiveState(slider: any, dots: HTMLButtonElement[]) {
    if (!slider || !Array.isArray(dots) || dots.length === 0) {
      return;
    }

    const currentNavigationIndex = this.getCurrentNavigationIndex(slider);

    dots.forEach((dot, index) => {
      const isActive = index === currentNavigationIndex;
      dot.classList.toggle('active', isActive);
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      dot.setAttribute('aria-label', isActive ? `Current page ${index + 1}` : `Go to page ${index + 1}`);
    });
  }

  initSlideDots(slider: any, dotsEl: Element | null) {
    if (!slider || !dotsEl) {
      return;
    }

    const totalItems = this.getNavigationMode() === 'page'
      ? Math.max(Array.isArray(slider.states) ? slider.states.length : 0, 0)
      : this.realItemCount;
    if (totalItems <= 1) {
      dotsEl.innerHTML = '';
      this.updateArrowVisibility(slider);
      return;
    }

    dotsEl.innerHTML = '';
    const dots: HTMLButtonElement[] = [];

    for (let pageIndex = 0; pageIndex < totalItems; pageIndex += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'blaze-slide-dot';
      dot.setAttribute('aria-label', `Go to page ${pageIndex + 1}`);

      dot.addEventListener('click', () => {
        const currentStates = Array.isArray(slider.states) ? slider.states : [];
        const maxStateIndex = Math.max(currentStates.length - 1, 0);
        const targetStateIndex = Math.min(pageIndex, maxStateIndex);
        this.goToState(slider, targetStateIndex);
        this.updateActiveState(slider, dots);
        this.updateArrowVisibility(slider);
      });

      dots.push(dot);
      dotsEl.append(dot);
    }

    this.updateActiveState(slider, dots);
    this.updateArrowVisibility(slider);

    slider.onSlide(() => {
      this.updateActiveState(slider, dots);
      this.updateArrowVisibility(slider);
    });
  }

  connectedCallback() {
    if (this.dataset.upgraded === 'true') {
      return;
    }

    this.dataset.upgraded = 'true';
    this.classList.add('is-upgraded');
    void this.initPhotoSwipe();

    if (!this.classList.contains('blaze-slider')) {
      return;
    }

    const dotsEl = this.querySelector('.blaze-slide-dots');
    const shouldLoop = false;
    const slidesAll = this.getClassNumber('blaze-all') ?? 4;
    this.prepareSlideTrack(slidesAll);
    const config = {
      all: {
        slidesToShow: slidesAll,
        loop: shouldLoop,
        slidesToScroll: 1,
        enablePagination: false,
        transitionDuration: 200,
      },
      [`(min-width: ${bp('xs')}px)`]: {
        slidesToShow: 2,
        slidesToScroll: 2,
      },
      [`(min-width: ${bp('sm')}px)`]: {
        slidesToShow: 3,
        slidesToScroll: 3,
      },
      [`(min-width: ${bp('md')}px)`]: {
        slidesToShow: 3,
        slidesToScroll: 3,
      },
      [`(min-width: ${bp('lg')}px)`]: {
        slidesToShow: 4,
        slidesToScroll: 4,
      }
    };

    const slider = new BlazeSlider(this, config as any);
    this.updateArrowVisibility(slider);
    this.initSlideDots(slider, dotsEl);
  }

  disconnectedCallback() {
    if (!this.lightbox) {
      return;
    }

    this.lightbox.destroy();
    this.lightbox = null;
  }
}

if (!customElements.get('gallery-listing')) {
  customElements.define('gallery-listing', GalleryListing);
}
