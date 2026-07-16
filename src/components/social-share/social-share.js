import { bindDrawer } from '../../util/drawer.js';

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

    this.cleanupDrawer = bindDrawer({
      root: this,
      actuator,
      drawer,
    });
  }

  disconnectedCallback() {
    this.cleanupDrawer?.();
    this.cleanupDrawer = undefined;
    this.dataset.upgraded = 'false';
  }
}

if (!customElements.get('social-share')) {
  customElements.define('social-share', SocialShare);
}
