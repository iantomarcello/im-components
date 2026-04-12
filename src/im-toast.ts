import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import 'element-internals-polyfill';
import { when } from 'lit/directives/when.js';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  hasClose: boolean;
}


@customElement('im-toast')
export class ImToast extends LitElement {
  static styles = [
    css`
      :host {
        --position-x: center;
        --position-y: top;
        --max-width: 600px;
        width: 100%;
        height: 100dvh;
        display: block;
        pointer-events: none;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 10000;
        container-type: size;
      }

      .wrapper {
        width: max-content;
        position: fixed;
        padding: 0.5rem;
        display: grid;
        gap: 0.5rem;
        max-height: 100dvh;
        overflow: auto;
        --translate-x: 0;
        --translate-y: 0;
        translate: var(--translate-x) var(--translate-y);

        @container style(--position-x: center) {
          left: 50%;
          --translate-x: -50%;
        }

        @container style(--position-x: left) {
          left: 0;
          --translate-x: 0;
        }

        @container style(--position-x: right) {
          left: 100%;
          --translate-x: -100%;
        }

        @container style(--position-y: center) {
          top: 50%;
          --translate-y: -50%;
        }

        @container style(--position-y: top) {
          top: 0%;
          --translate-y: 0%;
        }

        @container style(--position-y: bottom) {
          top: 100%;
          --translate-y: -100%;
        }
      }

      .toast {
        max-width: var(--max-width);
        display: flex;
        gap: 0.5rem;
        padding: 0.5em 0.75rem;
        border-radius: 4px;
        border: 2px solid hsl(from var(--color) h calc(s * 1.8) calc(l * 1.3));
        background-color: var(--color);
        box-shadow:
          0 2px 8px hsla(from var(--color) h calc(s * 1.6) calc(l * 1.4) / 0.8);
        pointer-events: auto;
        transition: opacity 0.3s ease-out, margin-top 0.3s ease-out, display 0.3s allow-discrete;
        opacity: 1;
        margin-top: 0px;

        @starting-style {
          opacity: 0;
          margin-top: 0.5rem;

          @container style(--position-y: bottom) {
            margin-top: -0.5rem;
          }
        }
      }

      .close-button {
        display: flex;
        align-items: center;
        border: 0;
        padding: 0;
        background: transparent;
        color: white;
        margin-left: auto;
        border-radius: 4px;
        cursor: pointer;

        &:where(:focus, :hover) {
          background: hsla(from var(--color) h calc(s * 1.6) calc(l * 1.4) / 0.4);
        }
      }

      .info {
        --color: #0367b7;
      }

      .success {
        --color: #29872d;
      }
      .error {
        --color: #a90e02;
      }
      .warning {
        --color: #a36913;
      }
    `,
  ];

  @state() toasts: Toast[] = [];

  addToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number | null = 3000, hasClose = false) {
    const id = crypto.randomUUID();
    const toast: Toast = { id, type, message, hasClose };
    this.toasts = [...this.toasts, toast];

    if (duration) {
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    }
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
  }

  render() {
    return html`
    <div class="wrapper" part="wrapper">
      ${ this.toasts.map(toast => html`
        <div id="${toast.id}" class="toast ${toast.type}" part="toast ${toast.type}">
          <div .innerHTML=${toast.message}></div>
          ${ when(!toast.hasClose, () => html`
            <button @click=${() => this.removeToast(toast.id)} class="close-button" part="close-button">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z"/></svg>
            </button>
          `) }
        </div>
      `) }
    </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'im-toast': ImToast
  }
}