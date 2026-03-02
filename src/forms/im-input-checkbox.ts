import { css } from 'lit';
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
        --check_offset_top: 3px;
        --accent_color: #3182ce;
      }

      .field {
        position: relative;
      }

      .label-wrapper {
        position: relative;
        display: flex;
        gap: 0.5rem;

        &::before, &::after {
          content: '';
          display: block;
          flex-shrink: 0;
          flex-grow: 0;
          margin-top: var(--check_offset_top);
        }

        &::before {
          width: var(--size);
          height: var(--size);
          outline: 1px solid #ccc;
          border-radius: 4px;
          will-change: background-color;
          transition: background-color 0.1s ease-out;
          pointer-events: none;
        }

        &::after {
          width: calc(var(--size) * 0.5);
          height: calc(var(--size) * 0.2);
          position: absolute;
          border-left: 2px solid white;
          border-bottom: 2px solid white;
          top: calc(var(--size) * 0.45);
          left: calc(var(--size) * 0.5);
          translate: -50% -50%;
          rotate: -45deg;
          scale: 0;
          will-change: scale;
          transition: scale 0.1s 0.05s ease-out;
          pointer-events: none;
        }

        &:has(~ .input-wrapper :checked) {
          &::before {
            background-color: var(--accent_color);
          }

          &::after {
            scale: 1;
          }
        }

        &:has(~ .input-wrapper:focus-within) {
          &::before {
            outline-color: var(--accent_color);
            box-shadow: 0 0 1px 4px var(--accent_color);
          }
        }
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

  firstUpdated(): void {
    super.firstUpdated();
    this.$input.setAttribute('type', 'checkbox');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'im-input-checkbox': ImInput
  }
}
