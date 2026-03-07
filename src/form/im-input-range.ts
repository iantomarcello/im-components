import { html, css } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import 'element-internals-polyfill';
import { ImInput } from './im-input';

@customElement('im-input-range')
export class ImInputRange extends ImInput {
  static styles = [
    ...super.styles,
    css`
      :host {
        --track_border_radius: 50px;
        --track_height: 0.5rem;
        --track_foreground_color: var(--accent_color);
        --track_background_color: hsl(from var(--accent_color) h calc(s * 0.7) calc(l * 1.7));

        --thumb_color: var(--accent_color);
        --thumb_width: 1rem;
        --thumb_height: 1rem;
        --thumb_border_radius: 50%;
        --thumb_border: 1px solid white;
        --thumb_shadow: 0 2px 2px 2px rgba(0,0,0,0.2);

        /* Centers thumb on the track */
        --thumb_offset_top: -0.25rem;

        --thumb_focus_outline: 3px solid var(--accent_color);
        --thumb_focus_offset: 0.125rem;
      }

      .input-wrapper {
        --range: calc(var(--max) - var(--min));
        --ratio: calc((var(--value) - var(--min))/var(--range));
        --sx: calc(.5 * var(--thumb_width) + var(--ratio) * (100% - var(--thumb_width)));
        --track_linear_gradient: linear-gradient(var(--track_foreground_color), var(--track_foreground_color))
          0/var(--sx) 100% no-repeat var(--track_background_color);
        display: contents;
      }

      .input {
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;
        accent-color: var(--accent_color);

        /* ----- */
        /* Track */
        /* ----- */
        &::-webkit-slider-runnable-track {
          background: var(--track_linear_gradient);
          border-radius: var(--track_border_radius);
          height: var(--track_height);
        }

        &::-moz-range-track {
          background: var(--track_linear_gradient);
          border-radius: var(--track_border_radius);
          height: var(--track_height);
        }

        /* ----- */
        /* Thumb */
        /* ----- */
        &::-webkit-slider-thumb {
          -webkit-appearance: none; /* Override default look */
          appearance: none;
          width: var(--thumb_width);
          height: var(--thumb_height);
          margin-top: var(--thumb_offset_top); 
          background-color: var(--thumb_color);
          border: var(--thumb_border);
          border-radius: var(--thumb_border_radius);
          box-shadow: var(--thumb_shadow);
        }

        &::-moz-range-thumb {
          width: var(--thumb_width);
          height: var(--thumb_height);
          background-color: var(--thumb_color);
          border: var(--thumb_border);
          border-radius: var(--thumb_border_radius);
          box-shadow: var(--thumb_shadow);
        }

        &:focus::-webkit-slider-thumb {
          outline: var(--thumb_focus_outline);
          outline-offset: var(--thumb_focus_offset);
        }

        &:focus::-moz-range-thumb {
          outline: var(--thumb_focus_outline);
          outline-offset: var(--thumb_focus_offset);
        }
      }

      /* --------- */
      /*  Tooltip  */
      /* --------- */
      .tooltip-anchor {
        display: inline-block;
        position: absolute;
        left: var(--sx);
        margin-top: calc(1lh);
        anchor-name: --tooltip-anchor;
        pointer-events: none;
      }

      .tooltip {
        position: absolute;
        padding: 0.5rem;
        background-color: var(--thumb_color);
        color: white;
        border-radius: 0.25rem;
        position-anchor: --tooltip-anchor;
        position-area: top center;
        pointer-events: none;
        box-sizing: border-box;
        opacity: 0;
        will-change: opacity;
        transition: opacity 0.1s ease-in-out;
        font: inherit;

        :focus-within &, :hover & {
          opacity: 1;
        }
      }
    `,
  ];

  @property({ type: Boolean })
  showTooltip = false;

  @query('.input-wrapper') $inputWrapper!: HTMLDivElement;

  constructor() {
    super();
  }

  get attributesNotInherited() {
    return [...super.attributesNotInherited, 'type'];
  }

  setValue() {
    super.setValue();
    this.$inputWrapper.style.setProperty('--value', this.$input.value);
  }

  firstUpdated(): void {
    super.firstUpdated();
    this.$inputWrapper.style.setProperty('--min', this.$input.min);
    this.$inputWrapper.style.setProperty('--max', this.$input.max);
    this.$inputWrapper.style.setProperty('--value', this.$input.value);
  }

  protected render() {
    return html`<div class="field" part="field">
      <div class="label-wrapper" part="label">
        <label for="input-${this.uid}" class="label">
          <slot name="label"></slot>
          ${this.label}
        </label>
      </div>
      <div class="input-wrapper" part="input-wrapper">
        <!-- defaults min max to 0 and 100 -->
        <input
          type="range"
          novalidate
          id="input-${this.uid}"
          @input="${this.handleInput}"
          @blur="${this.handleInput}"
          class="input"
          min="0"
          max="100"
          value="1"
          part="input"
          />

          ${ !this.showTooltip ? '' : html`<span class="tooltip-anchor"></span>
            <span class="tooltip" part="tooltip">${this.$input?.value ?? 1 }</span>` }
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
    'im-input-range': ImInputRange
  }
}
