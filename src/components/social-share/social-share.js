export class SocialShare extends HTMLElement {
  connectedCallback() {
    if (this.dataset.upgraded === 'true') {
      return;
    }

    this.dataset.upgraded = 'true';

    const actuator = this.querySelector('.social-links__actuator');
    const drawer = this.querySelector('.social-links__list');

    if (!(actuator instanceof HTMLElement) || !(drawer instanceof HTMLElement)) {
      return;
    }

    actuator.addEventListener('click', (event) => {
      event.preventDefault();
      const isActive = drawer.classList.contains('active');

      if (isActive) {
        drawer.classList.remove('active');
        actuator.setAttribute('aria-expanded', 'false');
      } else {
        drawer.classList.add('active');
        actuator.setAttribute('aria-expanded', 'true');
      }
    });
  }
}

if (!customElements.get('social-share')) {
  customElements.define('social-share', SocialShare);
}
