export class SegmentedControlElement extends HTMLElement {
  connectedCallback() {
    const pill = this.querySelector('.segmented-control__pill');
    const fieldset = this.querySelector('fieldset');

    if (!(pill instanceof HTMLElement) || !(fieldset instanceof HTMLElement)) {
      return;
    }

    const movePill = () => {
      const checked = this.querySelector("input[type='radio']:checked");
      if (!(checked instanceof HTMLInputElement)) {
        return;
      }

      const label = this.querySelector(`label[for="${checked.id}"]`);
      if (!(label instanceof HTMLElement)) {
        return;
      }

      pill.style.width = `${label.offsetWidth}px`;
      pill.style.transform = `translateX(${label.offsetLeft}px)`;
    };

    fieldset.classList.add('js-pill-active');
    this.querySelectorAll("input[type='radio']").forEach((input) => {
      input.addEventListener('change', movePill);
    });
    movePill();
  }
}

if (!customElements.get('segmented-control')) {
  customElements.define('segmented-control', SegmentedControlElement);
}
