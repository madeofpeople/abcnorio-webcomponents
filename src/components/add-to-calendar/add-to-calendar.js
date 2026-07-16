import { downloadICS, generateGoogleLink, generateOutlookLink } from './utils/generate-links.js';
import { bindDrawer } from '../../util/drawer.js';

let drawerId = 0;

export class AddToCalendarButton extends HTMLElement {
  connectedCallback() {
    if (this.dataset.atcBound === 'true') {
      return;
    }

    const actuator = this.querySelector('.atc-actuator');
    const drawer = this.querySelector('.atc-drawer');
    const googleButton = this.querySelector('.act-google');
    const appleButton = this.querySelector('.act-apple');
    const outlookButton = this.querySelector('.act-outlook');

    if (!actuator || !drawer || !googleButton || !appleButton || !outlookButton) {
      return;
    }

    if (!drawer.id) {
      drawerId += 1;
      drawer.id = `atc-drawer-${drawerId}`;
    }

    actuator.setAttribute('aria-controls', drawer.id);
    this.cleanupDrawer = bindDrawer({
      root: this,
      actuator,
      drawer,
    });

    googleButton.addEventListener('click', (event) => {
      event.preventDefault();
      const calendarUrl = String(generateGoogleLink({ ...this.dataset }));
      window.open(calendarUrl, '_blank', 'noopener');
    });

    appleButton.addEventListener('click', (event) => {
      event.preventDefault();
      downloadICS({ ...this.dataset });
    });

    outlookButton.addEventListener('click', (event) => {
      event.preventDefault();
      const calendarUrl = String(generateOutlookLink({ ...this.dataset }));
      window.open(calendarUrl, '_blank', 'noopener');
    });

    this.dataset.atcBound = 'true';
  }

  disconnectedCallback() {
    this.cleanupDrawer?.();
    this.cleanupDrawer = undefined;
    this.dataset.atcBound = 'false';
  }
}

if (!customElements.get('add-to-calendar-button')) {
  customElements.define('add-to-calendar-button', AddToCalendarButton);
}