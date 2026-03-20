import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
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
      :host {
        --radio_size_percent: 0.66;
        --layout: 'horizontal';
      }

      .input-container {
        flex-direction: if(style(--layout: 'horizontal'): row; else: column);
      }

      .input-row {
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

  constructor() {
    super();
  }

  render() {
    return html`<div class="field" part="field">
      <div class="label-wrapper" part="label">
        <label class="label">
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
      ${!this.internals?.validity?.valid ?
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
