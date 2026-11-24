const MIN_PAGED_GRID_PAGE_SIZE = 8;
const MAX_PAGED_GRID_PAGE_SIZE = 24;
const DEFAULT_PAGED_GRID_PAGE_SIZE = 8;
const SLIDE_MS = 200; // keep in sync with gallery.scss $slide-duration
export class GalleryListing extends HTMLElement {
    lightbox = null;
    photoswipeLoadAttempted = false;
    pagedGridResizeObserver = null;
    sliderCleanup = null;
    initSlider() {
        const track = this.querySelector('.images');
        const viewport = track.parentElement;
        const prev = this.querySelector('.blaze-prev');
        const next = this.querySelector('.blaze-next');
        const dotsEl = this.querySelector('.blaze-slide-dots');
        const template = dotsEl.querySelector('template[data-gallery-template="dot"]');
        if (!prev || !next || !template?.content?.firstElementChild) {
            throw new Error('Gallery navigation template missing from component markup.');
        }
        let offsets = [0];
        let frame;
        let dots = [];
        let drag = null;
        let suppressClick = false;
        const currentIndex = () => offsets.reduce((nearest, offset, index) =>
            Math.abs(offset - viewport.scrollLeft) < Math.abs(offsets[nearest] - viewport.scrollLeft)
                ? index : nearest, 0);
        const publish = () => {
            const index = currentIndex();
            for (const [button, hidden] of [[prev, index === 0], [next, index === offsets.length - 1]]) {
                button.hidden = hidden;
                button.style.display = hidden ? 'none' : '';
                button.setAttribute('aria-hidden', String(hidden));
                button.tabIndex = hidden ? -1 : 0;
            }
            dots.forEach((dot, candidate) => {
                dot.classList.toggle('is-active', candidate === index);
                dot.setAttribute('aria-current', candidate === index ? 'true' : 'false');
            });
        };
        const goTo = index => viewport.scrollTo({
            left: offsets[Math.max(0, Math.min(index, offsets.length - 1))],
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        });
        const measure = () => {
            const slides = Array.from(track.children);
            const maximum = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
            const start = slides[0]?.offsetLeft ?? 0;
            const candidates = [...new Set([0, ...slides.map(slide =>
                Math.min(maximum, Math.max(0, slide.offsetLeft - start))), maximum])];
            const pages = [0];
            while (pages[pages.length - 1] < maximum) {
                const current = pages[pages.length - 1];
                const remaining = candidates.filter(offset => offset > current);
                const fitting = remaining.filter(offset => offset <= current + viewport.clientWidth);
                pages.push(fitting.length ? fitting[fitting.length - 1] : remaining[0]);
            }
            offsets = pages;
            if (dots.length !== (offsets.length > 1 ? offsets.length : 0)) {
                dotsEl.replaceChildren(template);
                dots = offsets.length > 1 ? offsets.map((_, index) => {
                    const dot = template.content.firstElementChild.cloneNode(true);
                    dot.setAttribute('aria-label', `Go to page ${index + 1}`);
                    dot.addEventListener('click', () => goTo(index));
                    dotsEl.append(dot);
                    return dot;
                }) : [];
            }
            publish();
        };
        const scheduleMeasure = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(measure);
        };
        const observer = new ResizeObserver(scheduleMeasure);
        observer.observe(viewport);
        Array.from(track.children).forEach(slide => observer.observe(slide));
        const previous = () => goTo(currentIndex() - 1);
        const following = () => goTo(currentIndex() + 1);
        const pointerDown = event => {
            if (event.pointerType !== 'mouse' || event.button !== 0) return;
            drag = { id: event.pointerId, x: event.clientX, left: viewport.scrollLeft, index: currentIndex(), moved: false };
            suppressClick = false;
        };
        const pointerMove = event => {
            if (!drag || event.pointerId !== drag.id) return;
            const distance = event.clientX - drag.x;
            if (Math.abs(distance) > 5) {
                drag.moved = true;
                viewport.setPointerCapture(event.pointerId);
                event.preventDefault();
                viewport.scrollLeft = drag.left - distance;
            }
        };
        const pointerEnd = event => {
            if (!drag || event.pointerId !== drag.id) return;
            const previousDrag = drag;
            drag = null;
            if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
            if (!previousDrag.moved) return;
            suppressClick = true;
            const distance = event.clientX - previousDrag.x;
            goTo(previousDrag.index + (Math.abs(distance) > 10 ? Math.sign(-distance) : 0));
        };
        const preventDrag = event => event.preventDefault();
        const preventClick = event => {
            if (!suppressClick) return;
            suppressClick = false;
            event.preventDefault();
            event.stopImmediatePropagation();
        };
        prev.addEventListener('click', previous);
        next.addEventListener('click', following);
        viewport.addEventListener('scroll', publish, { passive: true });
        track.addEventListener('load', scheduleMeasure, true);
        viewport.addEventListener('pointerdown', pointerDown);
        viewport.addEventListener('pointermove', pointerMove);
        viewport.addEventListener('pointerup', pointerEnd);
        viewport.addEventListener('pointercancel', pointerEnd);
        viewport.addEventListener('dragstart', preventDrag);
        viewport.addEventListener('click', preventClick, true);
        measure();
        this.sliderCleanup = () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
            prev.removeEventListener('click', previous);
            next.removeEventListener('click', following);
            viewport.removeEventListener('scroll', publish);
            track.removeEventListener('load', scheduleMeasure, true);
            viewport.removeEventListener('pointerdown', pointerDown);
            viewport.removeEventListener('pointermove', pointerMove);
            viewport.removeEventListener('pointerup', pointerEnd);
            viewport.removeEventListener('pointercancel', pointerEnd);
            viewport.removeEventListener('dragstart', preventDrag);
            viewport.removeEventListener('click', preventClick, true);
        };
    }
    getClassNumber(prefix) {
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
    resolvePhotoSwipeSource(image) {
        const fullSource = image.dataset.lightboxSrc;
        if (fullSource) {
            return fullSource;
        }
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
    ensurePhotoSwipeItem(image) {
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
        const width = image.dataset.lightboxWidth || image.getAttribute('width') || String(image.naturalWidth || 0);
        const height = image.dataset.lightboxHeight || image.getAttribute('height') || String(image.naturalHeight || 0);
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
        const images = Array.from(this.querySelectorAll('.images img'));
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
        let lightboxModule;
        try {
            const lightboxModuleUrl = 'https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe-lightbox.esm.min.js';
            lightboxModule = await import(/* @vite-ignore */ lightboxModuleUrl);
        }
        catch {
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
                    onInit: (el, pswp) => {
                        const updateCaption = () => {
                            const slideElement = pswp?.currSlide?.data?.element;
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
    initPagedGrid() {
        const items = Array.from(this.querySelectorAll('.images > *'));
        const pagination = this.querySelector('.gallery-pagination');
        const requestedPageSize = Number.parseInt(this.dataset.itemsPerPage || '', 10) || DEFAULT_PAGED_GRID_PAGE_SIZE;
        const pageSize = Math.min(MAX_PAGED_GRID_PAGE_SIZE, Math.max(MIN_PAGED_GRID_PAGE_SIZE, requestedPageSize));
        const totalPages = Math.ceil(items.length / pageSize);
        if (!pagination || totalPages <= 1) {
            return;
        }
        let currentPage = 1;
        let isSliding = false;
        let measuredWidth = this.clientWidth;
        let maxPageHeight = 0;
        const host = this;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const preserveTallestPage = () => {
            maxPageHeight = Math.max(maxPageHeight, this.getBoundingClientRect().height);
            this.style.setProperty('--gallery-paged-grid-min-height', `${maxPageHeight}px`);
        };
        const list = pagination.querySelector('ul');
        const previousButton = list?.querySelector('li:first-child button');
        const nextButton = list?.querySelector('li:last-child button');
        const template = list?.querySelector('template[data-gallery-template="page"]');
        if (!previousButton || !nextButton || !template?.content?.firstElementChild) {
            throw new Error('Gallery page navigation template missing from component markup.');
        }
        const pageButtons = Array.from({ length: totalPages }, (_, index) => {
            const pageItem = template.content.firstElementChild.cloneNode(true);
            const pageButton = pageItem.querySelector('button');
            const pageNumber = index + 1;
            pageButton.textContent = String(pageNumber);
            list.insertBefore(pageItem, nextButton.parentElement);
            return pageButton;
        });
        function showPage(pageNumber) {
            currentPage = Math.max(1, Math.min(pageNumber, totalPages));
            const firstItemIndex = (currentPage - 1) * pageSize;
            items.forEach((item, index) => {
                const isVisible = index >= firstItemIndex && index < firstItemIndex + pageSize;
                item.toggleAttribute('hidden', !isVisible);
                item.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
            });
            requestAnimationFrame(preserveTallestPage);
            previousButton.disabled = currentPage === 1;
            nextButton.disabled = currentPage === totalPages;
            pageButtons.forEach((button, index) => {
                const isCurrent = index + 1 === currentPage;
                button.classList.toggle('is-current', isCurrent);
                if (isCurrent) {
                    button.setAttribute('aria-current', 'page');
                    button.setAttribute('aria-label', `Page ${index + 1}, current page`);
                }
                else {
                    button.removeAttribute('aria-current');
                    button.setAttribute('aria-label', `Go to page ${index + 1}`);
                }
            });
        }
        // slide current page out, swap, slide new page in; CSS keyframes read data-slide for direction
        function updatePage(pageNumber) {
            const targetPage = Math.max(1, Math.min(pageNumber, totalPages));
            if (isSliding) {
                return;
            }
            if (targetPage === currentPage || reducedMotion.matches) {
                showPage(targetPage);
                return;
            }
            host.dataset.slide = targetPage > currentPage ? 'next' : 'prev';
            const leaving = items.filter((item) => !item.hidden);
            leaving.forEach((item) => item.classList.add('is-leaving'));
            isSliding = true;
            window.setTimeout(() => {
                leaving.forEach((item) => item.classList.remove('is-leaving'));
                showPage(targetPage);
                items.filter((item) => !item.hidden).forEach((item) => {
                    item.classList.add('is-entering');
                    item.addEventListener('animationend', () => item.classList.remove('is-entering'), { once: true });
                });
                isSliding = false;
            }, SLIDE_MS);
        }
        previousButton.addEventListener('click', () => updatePage(currentPage - 1));
        nextButton.addEventListener('click', () => updatePage(currentPage + 1));
        pageButtons.forEach((button, index) => {
            button.addEventListener('click', () => updatePage(index + 1));
        });
        pagination.hidden = false;
        updatePage(currentPage);
        this.pagedGridResizeObserver = new ResizeObserver(() => {
            const width = this.clientWidth;
            if (width === measuredWidth) {
                return;
            }
            measuredWidth = width;
            maxPageHeight = 0;
            this.style.removeProperty('--gallery-paged-grid-min-height');
            requestAnimationFrame(preserveTallestPage);
        });
        this.pagedGridResizeObserver.observe(this);
    }
    connectedCallback() {
        if (this.dataset.upgraded === 'true') {
            return;
        }
        this.dataset.upgraded = 'true';
        this.classList.add('is-upgraded');
        void this.initPhotoSwipe();
        if (this.dataset.variant === 'paged-grid') {
            this.initPagedGrid();
            return;
        }
        if (!this.classList.contains('blaze-slider')) {
            return;
        }
        this.initSlider();
    }
    disconnectedCallback() {
        this.sliderCleanup?.();
        this.sliderCleanup = null;
        this.pagedGridResizeObserver?.disconnect();
        this.pagedGridResizeObserver = null;
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
