import { customElement } from 'lit/decorators.js';
import 'element-internals-polyfill';

/**
 * Form wrapper that moves light-DOM children into a native `<form>`.
 *
 * A shadow-DOM form + slot cannot associate slotted controls or submit
 * buttons (the `form` attribute does not resolve across that boundary).
 */
@customElement('im-form')
export class ImForm extends HTMLElement {
  form = document.createElement('form');

  constructor() {
    super();
    this.form.addEventListener('submit', this.#onSubmit);
  }

  connectedCallback() {
    this.style.display = 'contents';

    if (!this.form.isConnected) {
      if (this.className) {
        this.form.className = this.className;
        this.className = '';
      }

      while (this.firstChild) {
        this.form.appendChild(this.firstChild);
      }
      this.appendChild(this.form);
    }
  }

  disconnectedCallback() {
    this.form.removeEventListener('submit', this.#onSubmit);
  }

  #onSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    const formData = new FormData(this.form);
    const data = Object.fromEntries(
      [...formData.keys()].map((key) => {
        const values = formData.getAll(key);
        return [key, values.length > 1 ? values : values[0]];
      }),
    );
    this.dispatchEvent(new CustomEvent('submit', { detail: data, bubbles: true, composed: true }));
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'im-form': ImForm;
  }
}
