import { LitElement, html, css } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import 'element-internals-polyfill';

@customElement('im-input')
export class ImInput extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        width: 100%;
        --error_color: #e93535;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .label-wrapper {
        &:has(+ .input-wrapper [required]) {
          .label::after {
            content: '*';
            color: var(--error_color, #e53e3e);
          }
        }
      }

      .label {
        font-size: 1rem;
      }

      .input-wrapper {
        padding: 0.25rem 0.5rem;
        border: 1px solid #cbcbcb;
        border-radius: 0.375rem;
        background-color: #fff;
        font-size: 0.75rem;
        color: #565656;

        &:focus-within {
          outline: 2px solid #3182ce;
          box-shadow: 0 0 0 1px #3182ce;
        }

        &:has(+  .errors) {
          border-color: var(--error_color, #e53e3e);
          outline: 1px solid var(--error_color, #e53e3e);
          box-shadow: 0 0 0 1px var(--error_color, #e53e3e);
          background-color: hsl(from var(--error_color, #e53e3e) h s calc(l * 1.6));
        }
      }

      .input {
        width: 100%;
        font-size: inherit;
        background-color: inherit;
        color: inherit;
        border: 0;
        padding: 0;
        margin: 0;

        &:focus {
          outline: 0;
        }
      }

      .errors {
        margin-block: 0;
        font-size: 0.75rem;
        color: var(--error_color, #e53e3e);
      }
    `,
  ];

  static get formAssociated() {
    return true;
  }

  @query('input') $input!: HTMLInputElement;
  @property({ type: String, attribute: true })
  label: string = '';

  /**
   * Custom validation messages.
   * Keys are ValidityState
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
   * @example ```json
   {
     "valueMissing": "This field is required.",
     "typeMismatch": "Please enter a valid email address."
   }
   * ```
   */
  @property({ type: Object, attribute: true })
  errors: Record<string, string> = {};

  @property()
  internals: any;

  @property({ type: Boolean })
  invalid?: boolean = false;

  @state()
  uid: number = crypto.getRandomValues(new Uint8Array(1))[0];

  constructor() {
    super();
    this.internals = this.attachInternals && this.attachInternals();
  }

  protected setValue() {
    this.internals.setFormValue(this.$input.value ?? '');
    this.internals.setValidity(
      this.$input.validity,
      this.$input.validationMessage,
      this.$input
    );
    this.internals.checkValidity();
  }

  handleInput() {
    this.setValue();
    this.requestUpdate();
  }

  inheritAttributes() {
    Object.keys(this.attributes).forEach((keyAsString: string) => {
      const key = parseFloat(keyAsString);

      // Skips @properties
      if (['label', 'class'].includes(this.attributes[key].name)) {
        return;
      }

      if (typeof key === 'number')
        this.$input.setAttribute(this.attributes[key].name, this.attributes[key].value);
    })
  }

  firstUpdated() {
    this.inheritAttributes();
    this.setValue();
    this.internals.setFormValue(this.getAttribute('value') ?? '');
  }

  protected render() {
    const errorMessage = Object.entries(this.errors)
      .filter(([key, value]) => this.internals?.validity[key])
      .map(([key, value]) => {
        return value;
      });

    return html`<div class="field" part="field">
      <div class="label-wrapper" part="label">
        <label for="input-${this.uid}" class="label">
          <slot name="label"></slot>
          ${this.label}
        </label>
      </div>
      <div class="input-wrapper" part="input">
        <input
          novalidate
          id="input-${this.uid}"
          @input="${this.handleInput}"
          @blur="${this.handleInput}"
          class="input"
          />
      </div>
      ${ !this.internals?.validity?.valid ?
        html`<p class="errors" part="errors">
          ${ errorMessage.length ? errorMessage : this.internals.validationMessage }
        </p>` : null
      }
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'im-input': ImInput
  }
}
