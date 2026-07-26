import BlazeSlider from 'blaze-slider';
import { bp } from '@util/breakpoints';

export class EventListing extends HTMLElement {
  activeSlideIndex = 0;
  lastStateIndex = 0;
  pendingActiveSlideIndex = null;

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

    const totalPages = slider.states?.length ?? 0;
    if (totalPages <= 1) {
      dotsEl.innerHTML = '';
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
    slider.onSlide(() => {
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
    });
  }

  connectedCallback() {
    if (this.dataset.upgraded === 'true') {
      return;
    }

    this.dataset.upgraded = 'true';
    this.classList.add('is-upgraded');


    if( this.classList.contains('blaze-slider')) {
      const dotsEl = this.querySelector('.blaze-slide-dots');
      const defaultConfig = {
        'all': {
          slidesToShow: 1,  
          loop: true,
          slidesToScroll: 1,
          enablePagination: false,
          transitionDuration: 300,
        },
        [`(min-width: ${bp("xs")}px)`]: {
          slidesToShow: 2,
          slidesToScroll: 2
        },
        [`(min-width: ${bp("sm")}px)`]: {
          slidesToShow: 3,
          slidesToScroll: 3
        },
        [`(min-width: ${bp("md")}px)`]: {
          slidesToShow: 4,
          slidesToScroll: 4
        },
        [`(min-width: ${bp("lg")}px)`]: {
          slidesToShow: 5,
          slidesToScroll: 5
        }
      };
      const compactConfig = {
        'all': {
          slidesToShow: 1,
          loop: true,
          slidesToScroll: 1,
          enablePagination: false,
          transitionDuration: 300,
        },
        [`(min-width: ${bp("sm")}px)`]: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
        [`(min-width: ${bp("lg")}px)`]: {
          slidesToShow: 3,
          slidesToScroll: 3,
        }
      };
      const config = this.dataset.sliderPreset === 'compact' ? compactConfig : defaultConfig;

      const slider = new BlazeSlider(this, config);
      this.initSlideDots(slider, dotsEl);
    }
    
  }
}

if (!customElements.get('event-listing')) {
  customElements.define('event-listing', EventListing);
}