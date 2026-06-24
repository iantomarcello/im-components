import { html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import 'element-internals-polyfill';
import { ImInput } from './im-input';
import type { ImOption } from './im-input-radio';

@customElement('im-select')
export class ImSelect extends ImInput {
  static styles = [
    ...super.styles,
    css`
      .input-wrapper {
        padding: 0;
      }

      .input {
        padding: 0.4rem 0.5rem;
        appearance: none;
        background-color: var(--idle_bg_color);
        color: var(--font_color);
        border: 1px solid var(--border_color);
      }

      option:disabled {
        background-color: var(--disabled_color);
      }
    `,
  ];

  // @ts-ignore. We are simply using the query selector to get the select element.
  @query('select') $input!: HTMLSelectElement;

  @property({ type: Array })
  options: ImOption[] = [];

  constructor() {
    super();
  }

  render() {
    return html`<div class="field" part="field">
      <div class="label-wrapper" part="label">
        <label for="input-${this.uid}" class="label">
          <slot name="label"></slot>
          ${this.label}
        </label>
      </div>
      <div class="input-wrapper" part="input-wrapper">
        <select
          novalidate
          id="input-${this.uid}"
          @input="${this.handleInput}"
          @blur="${this.handleInput}"
          @change=${() => this.dispatchEvent(new Event('change', { bubbles: true }))}
          class="input"
          part="input"
          .value=${this.value}
          ?disabled=${this.disabled}
          ?required=${this.required}
          ?readonly=${this.readonly}
        >
          ${this.options.map((opt) => html`
            <option value="${opt.value}" ?disabled=${opt?.disabled}>${opt.label}</option>
          `)}
        </select>
        
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
    'im-select': ImSelect
  }
}
