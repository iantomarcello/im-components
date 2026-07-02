import { html, css, type PropertyValues } from 'lit';
import { customElement, property, queryAll } from 'lit/decorators.js';
import 'element-internals-polyfill';
import { ImInputCheckbox } from './im-input-checkbox';

export interface ImOption {
  label: string,
  value: string,
  disabled?: boolean,
}

@customElement('im-input-radio')
export class ImInputRadio extends ImInputCheckbox {
  static styles = [
    ...super.styles,
    css`
      @property --display {
        syntax: "flex | grid";
        inherits: true;
        initial-value: flex;
      }

      :host {
        --radio_size_percent: 0.66;
        --display: flex;
        --cols: 2;
      }

      .input-container {
        display: flex; /* fallback */
        display: if(style(--display: flex): flex; else: grid);
        grid-template-columns: repeat(var(--cols), 1fr);
        flex-wrap: wrap;
      }

      .input-row {
        position: relative;

        &:has(:checked) {
          .checkbox-idle {
            background-color: transparent;
          }
        }
      }

      .checkbox-idle, .checkbox-checked {
        border-radius: 50%;
      }

      .checkbox-checked {
        width: calc(var(--radio_size_percent) * 100%);
        height: calc(var(--radio_size_percent) * 100%);
        background-color: var(--accent_color);
        transition: scale 0.1s ease-out;

        /* reset from ImInputCheckbox */
        border: 0;
        rotate: 0deg;
      }

    `,
  ];


  @property({ type: Array })
  options: ImOption[] = [];

  @queryAll('input[type="radio"]') $radioInputs!: NodeListOf<HTMLInputElement>;

  constructor() {
    super();
  }

  init() {
    /* Skip checkbox init(). */
  }

  protected affectsFormState(changedProperties: PropertyValues) {
    return super.affectsFormState(changedProperties) || changedProperties.has('options');
  }

  setValue(value = this.value) {
    const radios = [...this.$radioInputs];

    radios.forEach((radio) => {
      radio.checked = Boolean(value) && radio.value === value;
    });

    this.internals?.setFormValue(value || null);

    if (!radios.length) return;

    const anchor = radios.find((radio) => radio.value === value) ?? radios[0];

    this.validity = anchor.validity;
    this.internals?.setValidity(
      anchor.validity as any,
      anchor.validationMessage,
      anchor,
    );
    this.syncPresentationState();
  }

  handleInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    if (!input.checked) return;

    this.value = input.value;
    this.touched = true;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }

  render() {
    return html`<div class="field" part="field">
      <div class="label-wrapper" part="label-wrapper">
        <label class="label" part="label">
          <slot name="label"></slot>
          ${this.label}
        </label>
      </div>
      <div class="input-container" part="input-container">
        ${this.options.map((opt) => html`
          <div class="input-row">
            <div class="checkbox" part="checkbox">
              <div class="checkbox-idle"></div>
              <div class="checkbox-checked"></div>
            </div>

            <label for="input-${this.uid}-${opt.value}" class="label" part="input-label"
              .innerHTML=${opt.label}
            >
            </label>
            <div class="input-wrapper" part="input">
              <input
                ?required=${this.required}
                type="radio"
                novalidate
                name=${this.name}
                id="input-${this.uid}-${opt.value}"
                @click="${this.handleInput}"
                value=${opt.value}
                class="input"
                ?checked=${this.value === opt.value}
                />
            </div>
          </div>
        `
    )}
      </div>
      ${!this.internals?.validity?.valid && this.touched ?
        html`<p class="errors" part="errors">
          ${this.getError().length ? this.getError() : this.internals.validationMessage}
        </p>` : null
      }
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'im-input-radio': ImInputRadio
  }
}
