import { html, LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * Tooltop.
 *
 * @part anchor.
 * @part tooltip.
 * @example
```html
<im-tooltip>
  I am the tooltip
</im-tooltip>

<im-tooltip>
  <span slot="trigger">Hover me for tooltip</span>
  I am the tooltip
</im-tooltip>
```
 */
@customElement('im-tooltip')
export class ImTooltip extends LitElement {
  static styles = css`
    :host {
      display: contents;
      --position_area: center right;
      --position_try_fallbacks: flip-block, flip-inline;
    }

    .tooltip-wrapper {
      display: inline-flex;
      vertical-align: middle;
    }

    .anchor {
      display: inline-flex;
      border: 0;
      padding: 0;
      margin: 0;
      background: transparent;
      appearance: none;
      cursor: pointer;

      slot {
        display: contents;
      }

      &:where(:focus,:focus-within,:hover) + .tooltip {
        opacity: 1;
        pointer-events: auto;
      }
    }

    .default-trigger {
      width: 100%;
      aspect-ratio: 1;
      cursor: pointer;
    }

    .tooltip {
      position: absolute;
      position-area: var(--position_area);
      position-try-fallbacks: var(--position_try_fallbacks);
      background-color: grey;
      color: white;
      padding: 4px 8px;
      border: 0;
      border-radius: 4px;
      opacity: 0;
      pointer-events: none;
      transition: all 0.2s ease-in-out;
      box-shadow: 0 2px 2px 1px rgba(0, 0, 0, 0.2);
    }
  `;

  get anchor(): string {
    return '--anchor' + this?.id || crypto.getRandomValues(new Uint8Array(1))[0].toString();
  }

  render() {
    return html`
      <div class="tooltip-wrapper">
        <button type="button" class="anchor" aria-describedby="${this.anchor}"
        style="anchor-name: ${this.anchor};" part="anchor">
          <slot name="trigger">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" class="default-trigger"><path d="M513.5-254.5Q528-269 528-290t-14.5-35.5Q499-340 478-340t-35.5 14.5Q428-311 428-290t14.5 35.5Q457-240 478-240t35.5-14.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Zm4-172q25 0 43.5 16t18.5 40q0 22-13.5 39T502-525q-23 20-40.5 44T444-427q0 14 10.5 23.5T479-394q15 0 25.5-10t13.5-25q4-21 18-37.5t30-31.5q23-22 39.5-48t16.5-58q0-51-41.5-83.5T484-720q-38 0-72.5 16T359-655q-7 12-4.5 25.5T368-609q14 8 29 5t25-17q11-15 27.5-23t34.5-8Z"/></svg>
          </slot>
        </button>
        <div .id=${this.anchor} role="tooltip" style="position-anchor: ${this.anchor}"
          class="tooltip" part="tooltip"
        ><slot></slot></div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'im-tooltip': ImTooltip,
  }
}
