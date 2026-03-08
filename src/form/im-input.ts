import { LitElement, html, css } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import 'element-internals-polyfill';
import type { ElementInternals } from 'element-internals-polyfill/dist/element-internals';

/**
 * Form-associated input web component.
 *
 * A lightweight wrapper around a native `<input>` that participates in forms
 * using `ElementInternals`. Attributes (such as `name`, `type`, `required`,
 * `placeholder`, and `value`) are forwarded to the internal input element so
 * consumers can use standard input attributes on the custom element.
 *
 * Slots:
 * - `label` — slot for custom label content. The `label` attribute provides
 *   a simple string alternative.
 *
 * CSS parts:
 * - `field` — top-level wrapper
 * - `label` — label wrapper
 * - `input` — input wrapper
 * - `errors` — errors block
 *
 * Form behaviour:
 * - The element is form-associated (`static formAssociated = true`) and uses
 *   `ElementInternals` to set the form value and validity state.
 *
 * Events:
 * - Native `input`/`change` events from the inner `<input>` are exposed as
 *   usual; the component updates the form value/validity on `input` and `blur`.
 *
 * @element im-input
 * @slot label - Content for the label
 * @csspart field
 * @csspart label
 * @csspart input
 * @csspart errors
 * @example
 * <im-input label="Email" name="email" type="email" required></im-input>
 */
@customElement('im-input')
export class ImInput extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        width: 100%;
        --font_color: #565656;
        --idle_bg_color: #fff;
        --border_color: hsl(from var(--idle_bg_color) h s calc(l * 0.5));
        --focus_color: #3182ce;
        --error_color: #e93535;
        --disabled_color: #d7d7d7;
        --accent_color: var(--focus_color);
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
        padding: 0.35rem 0.5rem;
        border: 1px solid var(--border_color);
        border-radius: 0.375rem;
        background-color: var(--idle_bg_color);
        font-size: 1rem;
        color: var(--font_color);
        position: relative;
        box-shadow: 0 1px 2px 1px rgba(0, 0, 0, 0.15);

        &:focus-within {
          outline: 2px solid var(--focus_color);
          box-shadow: 0 1px 1px 2px var(--focus_color);
        }

        &:has(:disabled, :read-only) {
          background-color: var(--disabled_color);
          border: 1px solid hsl(from var(--disabled_color) h s calc(l * 0.6));

          input::placeholder {
            color: hsl(from var(--disabled_color) h s calc(l * 0.6));
          }
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
        font-family: inherit;
        background-color: inherit;
        color: inherit;
        border: 0;
        padding: 0;
        margin: 0;

        &:focus {
          outline: 0;
        }

        &::placeholder {
          color: hsl(from var(--font_color) h s calc(l * 1.7));
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

  @query('input,textarea') $input!: HTMLInputElement | HTMLTextAreaElement;
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

  internals: ElementInternals;

  @property({ type: Boolean })
  invalid?: boolean = false;

  @state()
  uid: number = crypto.getRandomValues(new Uint8Array(1))[0];

  constructor() {
    super();
    this.internals = this.attachInternals && this.attachInternals();
  }

  setValue(value = this.$input.value) {
    this.internals.setFormValue(value);
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

  get attributesNotInherited() {
    return ['label', 'class'];
  }

  inheritAttributes() {
    Object.keys(this.attributes).forEach((keyAsString: string) => {
      const key = parseFloat(keyAsString);

      // Skips @properties
      if ([...this.attributesNotInherited].includes(this.attributes[key].name)) {
        return;
      }

      if (typeof key === 'number')
        this.$input.setAttribute(this.attributes[key].name, this.attributes[key].value);
    })
  }

  getError() {
    return Object.entries(this.errors)
      .filter(([key, value]) => this.internals?.validity[key as keyof ValidityState])
      .map(([key, value]) => {
        return value;
      });
  }

  static get observedAttributes() {
    return [...super.observedAttributes, 'value']; // Include Lit's and custom attributes
  }

  firstUpdated() {
    this.inheritAttributes();
    this.setValue();
    const value = this.getAttribute('value') ?? '';
    this.$input.value = value;
    this.internals.setFormValue(value);
  }

  attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null) {
    super.attributeChangedCallback(name, oldVal, newVal); 
  }

  protected render() {
    return html`<div class="field" part="field">
      <div class="label-wrapper" part="label">
        <label for="input-${this.uid}" class="label">
          <slot name="label"></slot>
          ${this.label}
        </label>
      </div>
      <div class="input-wrapper" part="input-wrapper">
        <input
          novalidate
          id="input-${this.uid}"
          @input="${this.handleInput}"
          @blur="${this.handleInput}"
          class="input"
          part="input"
          />
      </div>
      ${ !this.internals?.validity?.valid ?
        html`<p class="errors" part="errors">
          ${ this.getError().length ? this.getError() : this.internals.validationMessage }
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
