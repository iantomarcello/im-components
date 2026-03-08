import { html, css } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { ImInput } from './im-input';

@customElement('im-textarea')
export class ImTextarea extends ImInput {
  static styles = [
    ...super.styles,
    css`
      textarea {
        min-height: 2lh;
        field-sizing: content;
      }
    `
  ];

  protected render() {
    return html`<div class="field" part="field">
      <div class="label-wrapper" part="label">
        <label for="input-${this.uid}" class="label">
          <slot name="label"></slot>
          ${this.label}
        </label>
      </div>
      <div class="input-wrapper" part="input-wrapper">
        <textarea
          novalidate
          id="input-${this.uid}"
          @input="${this.handleInput}"
          @blur="${this.handleInput}"
          class="input"
          part="input"
        ></textarea>
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
    'im-textarea': ImTextarea
  }
}
