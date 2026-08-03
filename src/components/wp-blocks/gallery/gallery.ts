import BlazeSlider from 'blaze-slider';
// import { bp } from '@util/breakpoints';

type PhotoSwipeLightboxInstance = {
  init: () => void;
  destroy: () => void;
};

export class GalleryListing extends HTMLElement {
  activeSlideIndex = 0;
  lastStateIndex = 0;
  pendingActiveSlideIndex: number | null = null;
  lightbox: PhotoSwipeLightboxInstance | null = null;
  photoswipeLoadAttempted = false;

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

  updateActiveState(slider: any, dots: HTMLButtonElement[]) {
    if (!slider || !Array.isArray(dots) || dots.length === 0) {
      return;
    }

    const currentStateIndex = slider.stateIndex ?? 0;

    dots.forEach((dot, index) => {
      const isActive = index === currentStateIndex;
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

    const pageStates = Array.isArray(slider.states) ? slider.states : [];
    const totalPages = pageStates.length;
    if (totalPages <= 1) {
      dotsEl.innerHTML = '';
      return;
    }

    dotsEl.innerHTML = '';
    const dots: HTMLButtonElement[] = [];

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'blaze-slide-dot';
      dot.setAttribute('aria-label', `Go to page ${pageIndex + 1}`);

      dot.addEventListener('click', () => {
        const targetStateIndex = pageIndex;
        const targetState = pageStates[targetStateIndex];
        this.pendingActiveSlideIndex = targetState?.page?.[0] ?? 0;
        const moved = this.goToState(slider, targetStateIndex);
        if (!moved) {
          this.activeSlideIndex = this.pendingActiveSlideIndex ?? 0;
          this.pendingActiveSlideIndex = null;
          this.updateActiveState(slider, dots);
        }
      });

      dots.push(dot);
      dotsEl.append(dot);
    }

    this.lastStateIndex = slider.stateIndex;
    this.activeSlideIndex = pageStates?.[slider.stateIndex]?.page?.[0] ?? 0;
    this.updateActiveState(slider, dots);

    slider.onSlide(() => {
      const currentStateIndex = slider.stateIndex;
      const currentState = pageStates?.[currentStateIndex];

      if (typeof this.pendingActiveSlideIndex === 'number') {
        this.activeSlideIndex = this.pendingActiveSlideIndex;
      } else if (currentStateIndex > this.lastStateIndex) {
        this.activeSlideIndex = currentState?.page?.[1] ?? this.activeSlideIndex;
      } else if (currentStateIndex < this.lastStateIndex) {
        this.activeSlideIndex = currentState?.page?.[0] ?? this.activeSlideIndex;
      }

      this.pendingActiveSlideIndex = null;
      this.lastStateIndex = currentStateIndex;
      this.updateActiveState(slider, dots);
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
    const variant = String(this.dataset.variant || 'default').toLowerCase();
    const isSliderVariant = variant === 'slider' || this.classList.contains('gallery--slider');
    const slidesAll = this.getClassNumber('blaze-all') ?? 4;
    // const slidesXs = this.getClassNumber('blaze-xs') ?? 1;
    // const slidesSm = this.getClassNumber('blaze-sm') ?? 1;
    // const slidesMd = this.getClassNumber('blaze-md') ?? 1;
    // const slidesLg = this.getClassNumber('blaze-lg') ?? 1;
    const config = {
      all: {
        slidesToShow: slidesAll,
        loop: isSliderVariant,
        slidesToScroll: 1,
        enablePagination: true,
        transitionDuration: 200,
      },
      // [`(min-width: ${bp('xs')}px)`]: {
      //   slidesToShow: slidesXs,
      //   slidesToScroll: slidesXs,
      // },
      // [`(min-width: ${bp('sm')}px)`]: {
      //   slidesToShow: slidesSm,
      //   slidesToScroll: slidesSm,
      // },
      // [`(min-width: ${bp('md')}px)`]: {
      //   slidesToShow: slidesMd,
      //   slidesToScroll: slidesMd,
      // },
      // [`(min-width: ${bp('lg')}px)`]: {
      //   slidesToShow: slidesLg,
      //   slidesToScroll: slidesLg,
      // },
    };

    const slider = new BlazeSlider(this, config as any);
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
