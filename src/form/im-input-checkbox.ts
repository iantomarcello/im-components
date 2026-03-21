import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import 'element-internals-polyfill';
import { ImInput } from './im-input';


@customElement('im-input-checkbox')
export class ImInputCheckbox extends ImInput {
  static styles = [
    ...super.styles,
    css`
      :host {
        --size: 20px;
        --check_offset_top: 0;
      }

      :host([required]) {
        .label-wrapper {
          .label::before {
            content: '*';
            color: var(--error_color, #e53e3e);
          }
        }
      }

      .field {
        position: relative;
      }

      .input-container {
        display: flex;
        gap: 0.5rem 1rem;
      }

      .input-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        &:has(:checked) {
          .checkbox-idle {
            background-color: var(--accent_color);
          }

          .checkbox-checked {
            scale: 1;
          }
        }

        &:has(:focus-within) {
          .checkbox-idle {
            outline-color: var(--accent_color);
            box-shadow: 0 0 1px 4px var(--accent_color);
          }
        }

        &:has(:disabled) {
          .label {
            color: var(--disabled_color);
          }

          .checkbox-idle {
            background-color: var(--disabled_color);
            outline-color: hsl(from var(--disabled_color) h s calc(l* 0.7));
          }
        }
      }

      .checkbox-idle, .checkbox-checked {
        width: 100%;
        height: 100%;
        margin-top: var(--check_offset_top);
      }

      .checkbox-idle {
        outline: 1px solid var(--idle_bg_color);
        border-radius: 4px;
        will-change: background-color;
        transition: background-color 0.1s ease-out;
        pointer-events: none;
        box-shadow: 0 1px 1px 2px rgba(0, 0, 0, 0.25);
      }

      .checkbox-checked {
        width: 50%;
        height: 20%;
        position: absolute;
        border-left: 2px solid white;
        border-bottom: 2px solid white;
        top: 50%;
        left: 50%;
        translate: -50% -50%;
        rotate: -45deg;
        scale: 0;
        will-change: scale;
        transition: scale 0.1s 0.05s ease-out;
        pointer-events: none;
      }

      .checkbox {
        width: var(--size);
        height: var(--size);
        position: relative;
        flex-shrink: 0;
        pointer-events: none;
      }

      .input-wrapper {
        width: var(--size);
        height: var(--size);
        background-color: transparent;
        border: 0;
        padding: 0;
        position: absolute;
        left: 0;
        top: var(--check_offset_top);
        opacity: 0;

        &:focus-within {
          outline: none;
          box-sizing: none;
        }
      }
      .input {
        width: 100%;
        height: 100%;
        cursor: pointer;
      }
    `,
  ];

  constructor() {
    super();
  }

  init() {
    this.$input.setAttribute('type', 'checkbox');
  }

  firstUpdated(): void {
    super.firstUpdated();
    this.init();
  }

  protected render() {
    return html`<div class="field" part="field">
      <div class="input-container" part="input-container">
        <div class="input-row">
          <div class="checkbox" part="checkbox">
            <div class="checkbox-idle"></div>
            <div class="checkbox-checked"></div>
          </div>

          <label for="input-${this.uid}" class="label" part="label">
            <slot name="label"></slot>
            ${this.label}
          </label>

          <div class="input-wrapper" part="input">
            <input
              novalidate
              id="input-${this.uid}"
              @input="${this.handleInput}"
              @blur="${this.handleInput}"
              class="input"
              />
          </div>
        </div>
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
    'im-input-checkbox': ImInputCheckbox
  }
}
