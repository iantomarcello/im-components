import { LitElement, html, css } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import 'element-internals-polyfill';

@customElement('im-input')
export class ImInput extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        width: 100%;
      }
    `,
  ];

  static get formAssociated() {
    return true;
  }

  @property({ type: String, attribute: true })
  type: string = 'text';

  @property({ type: String, attribute: true })
  name: string = '';

  @property({ type: String, attribute: true })
  label: string = '';

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

  @property({ type: String, attribute: true })
  placeholder: string = '';

  @property({ type: String, attribute: true })
  description: string = '';

  @property({ type: Object, attribute: true })
  validationMessages = {
    valueMissing: 'This field is required.',
    typeMismatch: null, // NOTE: if `null`, will use native input validation message
  };

  @property()
  internals: any;

  @property({ type: Boolean })
  invalid?: boolean = false;

  @state()
  uid: number = crypto.getRandomValues(new Uint8Array(1))[0];

  // @ts-ignore
  @query('input')
  _input!: HTMLInputElement;

  constructor() {
    super();
    this.internals = this.attachInternals && this.attachInternals();
  }

  protected _onInput(event: InputEvent) {
    this.value = this._input.value;
    this.internals.setFormValue(this.value);
    this._manageRequired();
    this.invalid = false;
  }

  protected _onInvalid(event: InputEvent) {
    event.preventDefault();
    this.invalid = true;
    this.internals.setValidity({
      typeMismatch: true
    }, this.validationMessages?.typeMismatch ?? this._input.validationMessage);
  }

  protected _manageRequired() {
    if (this.value === '' && this.required) {
      this.internals.setValidity({
        valueMissing: true
      }, this.validationMessages.valueMissing, this._input);
    } else {
      this.internals.setValidity({});
    }
  }

  firstUpdated() {
    /** This ensures our element always participates in the form */
    this.internals.setFormValue(this.value);

    /** Make sure validations are set up */
    this._manageRequired();
  }

  protected render() {
    return html`<div class="field">
      <div class="label-wrapper">
        <label for="input-${this.uid}" class="label">${this.label}</label>
      </div>
      <div class="input-wrapper">
        <input
          novalidate
          id="input-${this.uid}"
          .type="${this.type}"
          minlength=${ifDefined(this.minlength ? this.minlength : undefined)}
          maxlength=${ifDefined(this.maxlength ? this.maxlength : undefined)}
          min=${ifDefined(this.min ? this.min : undefined)}
          max=${ifDefined(this.max ? this.max : undefined)}
          value="${this.value ?? ''}"
          @input="${this._onInput}"
          @invalid="${this._onInvalid}"
          .placeholder="${this.placeholder}"
          ?required="${this.required}"
          class="input"
          />
      </div>
      ${ this.invalid && this.description ? html`
        <div class="errors">
          ${this.invalid ? html`<span>${this.internals.validationMessage}</span>` : html`<span>${this.description}</span>`}
          ${this.maxlength ? html`<span>${this.value.length} / ${this.maxlength}</span>` : ''}
        </div>
        ` : null}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'im-inputim': ImInput
  }
}
