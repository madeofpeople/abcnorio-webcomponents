import BlazeSlider from 'blaze-slider';
import { bp } from '@util/breakpoints';

export class EventListing extends HTMLElement {
  activeSlideIndex = 0;
  lastStateIndex = 0;
  pendingActiveSlideIndex = null;

  ensureHtmxReady() {
    const hasHtmxLinks = this.querySelector('[hx-get]');
    if (!hasHtmxLinks) {
      return;
    }

    if (window.htmx) {
      window.htmx.process(this);
      return;
    }

    const scriptSelector = 'script[data-abcnorio-htmx-loader="true"]';
    const existing = document.querySelector(scriptSelector);
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.htmx) {
          window.htmx.process(this);
        }
      }, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.defer = true;
    script.src = '/vendor/htmx.min.js';
    script.dataset.abcnorioHtmxLoader = 'true';
    script.addEventListener('load', () => {
      if (window.htmx) {
        window.htmx.process(this);
      }
    }, { once: true });
    document.head.append(script);
  }

  updateArrowVisibility(slider) {
    if (!slider) {
      return;
    }

    const prev = this.querySelector('.blaze-prev');
    const next = this.querySelector('.blaze-next');
    const totalPages = Array.isArray(slider.states) ? slider.states.length : 0;
    const lastIndex = Math.max(totalPages - 1, 0);
    const currentStateIndex = Number.isFinite(slider.stateIndex) ? slider.stateIndex : 0;
    const hideEdges = slider.config?.loop !== true;
    const hidePrev = totalPages <= 1 || (hideEdges && currentStateIndex <= 0);
    const hideNext = totalPages <= 1 || (hideEdges && currentStateIndex >= lastIndex);

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

  goToState(slider, nextStateIndex) {
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

  updateActiveState(slider, dots) {
    if (!slider || !Array.isArray(dots) || dots.length === 0) {
      return;
    }

    const currentStateIndex = slider.stateIndex ?? 0;
    const currentState = slider.states?.[currentStateIndex];
    const activeSlideIndex = this.activeSlideIndex ?? 0;
    const slides = Array.from(slider.slides || []);

    dots.forEach((dot, index) => {
      const isActive = index === currentStateIndex;
      dot.classList.toggle('active', isActive);
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      dot.setAttribute('aria-label', `Go to page ${index + 1}`);
    });

    slides.forEach((slide, index) => {
      const isActive = index === activeSlideIndex;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  initSlideDots(slider, dotsEl) {
    if (!slider || !dotsEl) {
      return;
    }

    this.unsubscribeSlide?.();
    this.unsubscribeSlide = null;
    const totalPages = slider.states?.length ?? 0;
    if (totalPages <= 1) {
      dotsEl.innerHTML = '';
      this.updateArrowVisibility(slider);
      return;
    }

    dotsEl.innerHTML = '';
    const dots = [];

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'blaze-slide-dot';
      dot.setAttribute('aria-label', `Go to page ${pageIndex + 1}`);

      dot.addEventListener('click', () => {
        const targetStateIndex = pageIndex;
        const targetState = slider.states?.[targetStateIndex];
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
    this.activeSlideIndex = slider.states?.[slider.stateIndex]?.page?.[0] ?? 0;
    this.updateActiveState(slider, dots);
    this.updateArrowVisibility(slider);
    this.unsubscribeSlide = slider.onSlide(() => {
      const currentStateIndex = slider.stateIndex;
      const currentState = slider.states?.[currentStateIndex];

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
      this.updateArrowVisibility(slider);
    });
  }

  connectedCallback() {
    if (this.dataset.upgraded === 'true') {
      return;
    }

    this.dataset.upgraded = 'true';
    this.classList.add('is-upgraded');

    this.ensureHtmxReady();


    if( this.classList.contains('blaze-slider')) {
      const dotsEl = this.querySelector('.blaze-slide-dots');
      const baseSlidesPerPage = {
        all: 1,
        xs: 2,
        sm: 3,
        md: 4,
        lg: 3.5,
      };
      const presetOverrides = this.dataset.sliderPreset === 'content-width'
        ? {
        sm: 2,
        md: 3,
        lg: 4,
        }
        : {};
      const slidesPerPageDefaults = { ...baseSlidesPerPage, ...presetOverrides };
      const slidesPerPage = Object.fromEntries(
        Object.entries({
          all: 'slidesPerPage',
          xs: 'slidesPerPageXs',
          sm: 'slidesPerPageSm',
          md: 'slidesPerPageMd',
          lg: 'slidesPerPageLg',
        }).map(([breakpoint, dataKey]) => {
          const parsed = Number.parseFloat(this.dataset[dataKey] || '');
          const count = Number.isFinite(parsed) ? parsed : slidesPerPageDefaults[breakpoint];
          return [breakpoint, Math.max(1, Math.min(6, count))];
        }),
      );
      const config = {
        'all': {
          slidesToShow: slidesPerPage.all,
          loop: false,
          slidesToScroll: slidesPerPage.all,
          enablePagination: false,
          transitionDuration: 300,
        },
        [`(min-width: ${bp("xs")}px)`]: {
          slidesToShow: slidesPerPage.xs,
          slidesToScroll: slidesPerPage.xs,
        },
        [`(min-width: ${bp("sm")}px)`]: {
          slidesToShow: slidesPerPage.sm,
          slidesToScroll: slidesPerPage.sm,
        },
        [`(min-width: ${bp("md")}px)`]: {
          slidesToShow: slidesPerPage.md,
          slidesToScroll: slidesPerPage.md,
        },
        [`(min-width: ${bp("lg")}px)`]: {
          slidesToShow: slidesPerPage.lg,
          slidesToScroll: slidesPerPage.lg,
        }
      };

      const slider = new BlazeSlider(this, config);
      this.slider = slider;
      this.updateArrowVisibility(slider);
      this.initSlideDots(slider, dotsEl);
      let width = window.innerWidth;
      this.onResize = () => {
        if (width === window.innerWidth) return;
        width = window.innerWidth;
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
          slider.refresh();
          this.initSlideDots(slider, dotsEl);
        }, 250);
      };
      window.addEventListener('resize', this.onResize);
    }
    
  }

  disconnectedCallback() {
    if (this.onResize) {
      window.removeEventListener('resize', this.onResize);
      this.onResize = null;
    }
    clearTimeout(this.resizeTimer);
    this.unsubscribeSlide?.();
    this.unsubscribeSlide = null;
    this.slider?.destroy();
    this.slider = null;
    delete this.dataset.upgraded;
    this.classList.remove('is-upgraded');
  }
}

if (!customElements.get('event-listing')) {
  customElements.define('event-listing', EventListing);
}