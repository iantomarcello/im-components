import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import 'element-internals-polyfill';
import { ImInputCheckbox } from './im-input-checkbox';
import { ifDefined } from 'lit/directives/if-defined.js';

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
      }

      .input-row {
        display: flex;
        gap: 0.5rem;

        &:has(.input-wrapper :checked) {
          .checkbox-idle {
            background-color: transparent
          }

          .checkbox-checked {
            scale: 1;
          }
        }

        &:has(.input-wrapper:focus-within) {
          .checkbox-idle {
            outline-color: var(--accent_color);
            box-shadow: 0 0 1px 4px var(--accent_color);
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

  @property({ type: String })
  name = '';

  @property({ type: Boolean })
  required = false;

  @property({ type: Array })
  options: ImOption[] = [];

  constructor() {
    super();
  }

  init() {}

  inheritAttributes(): void {
    // disable inheriting attributes from ImInputCheckbox, since radio buttons have different styling and behaviour
    return;
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

            <label for="input-${this.uid}-${opt.value}" class="label" part="label"
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
                @input="${this.handleInput}"
                @blur="${this.handleInput}"
                value=${opt.value}
                class="input"
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
