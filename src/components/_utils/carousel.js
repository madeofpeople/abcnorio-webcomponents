/**
 * Carousel configuration and initialization helpers
 */

/**
 * Normalize fractional slidesToShow values for proper carousel alignment.
 * For fractional slides-per-page, sets slidesToScroll to floor(slidesToShow)
 * so partial items become the first full item on next page, not additional fractional scrolls.
 */
export function normalizeFractionalSlides(config) {
  Object.keys(config).forEach(key => {
    if (config[key] && typeof config[key] === 'object') {
      const slidesToShow = config[key].slidesToShow;
      if (slidesToShow !== Math.floor(slidesToShow)) {
        config[key].slidesToScroll = Math.floor(slidesToShow);
      }
    }
  });
}

/**
 * Get current slides-per-page for current viewport
 */
export function getCurrentSlidesPerPage(slider, slidesPerPageConfig) {
  const width = window.innerWidth;
  
  // Check media queries in order (largest breakpoint first)
  if (width >= 1024) return slidesPerPageConfig.lg || slidesPerPageConfig.md || 1;
  if (width >= 768) return slidesPerPageConfig.md || slidesPerPageConfig.sm || 1;
  if (width >= 640) return slidesPerPageConfig.sm || slidesPerPageConfig.xs || 1;
  
  return slidesPerPageConfig.xs || 1;
}

