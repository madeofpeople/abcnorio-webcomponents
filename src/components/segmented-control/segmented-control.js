export class SegmentedControlElement extends HTMLElement {
  connectedCallback() {
    const pill = this.querySelector('.segmented-control__pill');

    const movePill = () => {
      const checked = this.querySelector("input[type='radio']:checked");
      const label = this.querySelector(`label[for="${checked.id}"]`);
      pill.style.width = `${label.offsetWidth}px`;
      pill.style.transform = `translateX(${label.offsetLeft}px)`;
    };

    this.classList.add('js-pill-active');
    this.querySelectorAll("input[type='radio']").forEach((input) => {
      input.addEventListener('change', movePill);
    });
    movePill();
  }
}

if (!customElements.get('segmented-control')) {
  customElements.define('segmented-control', SegmentedControlElement);
}
