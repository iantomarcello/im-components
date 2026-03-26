import { LitElement, html, css, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import 'element-internals-polyfill';
import type { ElementInternals } from 'element-internals-polyfill/dist/element-internals';
import { ifDefined } from 'lit/directives/if-defined.js';

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
          .label::before {
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

  @property({ type: String, attribute: true })
  name: string = '';

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

  @state() internals: ElementInternals;

  uid: number = crypto.getRandomValues(new Uint8Array(1))[0];

  validity: Partial<ValidityState> = {};
  @state() touched = false;

  @property({ type: String, attribute: true })
  type: string = 'text';

  @property({ type: String, attribute: true })
  value: string = '';

  @property({ type: Number, attribute: true })
  maxlength: number | null = null;

  @property({ type: Number, attribute: true })
  minlength: number | null = null;

  @property({ type: Number, attribute: true })
  max: number | null = null;

  @property({ type: Number, attribute: true })
  min: number | null = null;

  @property({ type: Boolean, reflect: true })
  required: boolean = false;

  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  @property({ type: Boolean, reflect: true })
  readonly: boolean = false;

  @property({ type: String, attribute: true })
  placeholder: string = '';

  constructor() {
    super();
    this.internals = this.attachInternals && this.attachInternals();
  }

  setValue(value = this.$input.value) {
    this.internals?.setFormValue(value);
    this.validity = this.$input?.validity;
    this.internals?.setValidity(
      this.$input?.validity as any,
      this.$input?.validationMessage,
      this.$input
    );
  }

  handleInput(event: InputEvent) {
    this.value = (event.currentTarget as HTMLInputElement)?.value ?? this.value;
    this.setValue(this.value);
    this.touched = true;
    this.dispatchEvent(new Event('input', { bubbles: true }));
  }

  getError() {
    return Object.entries(this.errors)
      .filter(([key, value]) => this.internals?.validity[key as keyof ValidityState])
      .map(([key, value]) => {
        return value;
      });
  }

  // TODO: maxlength doesn't trigger validation

  init() {
    // NOTE: sets fields into form on connect.
    this.internals?.setFormValue(this.value);
  }

  firstUpdated() {
    this.init();
  }

  protected updated(changedProperties: PropertyValues) {
    if (changedProperties.has('value')) {
      if (this.$input && (this.$input as HTMLInputElement | HTMLTextAreaElement).value !== this.value) {
        (this.$input as HTMLInputElement | HTMLTextAreaElement).value = this.value;
      }
      this.setValue(this.value);
    }
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
          @change=${() => this.dispatchEvent(new Event('change', { bubbles: true }))}
          class="input"
          part="input"
          .type=${this.type}
          .value=${this.value}
          minlength=${ifDefined(this.minlength ? this.minlength : undefined)}
          maxlength=${ifDefined(this.maxlength ? this.maxlength : undefined)}
          min=${ifDefined(this.min ? this.min : undefined)}
          max=${ifDefined(this.max ? this.max : undefined)}
          .placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          ?required=${this.required}
          ?readonly=${this.readonly}
          />
      </div>
      ${ !this.validity?.valid && this.touched ?
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
