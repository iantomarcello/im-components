import { html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import 'element-internals-polyfill';
import { ImInput } from './im-input';
import { ifDefined } from 'lit/directives/if-defined.js';

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

      .field {
        display: grid;
        /* For \`showControls\` */
        grid-template-columns: 1fr max-content;
      }

      .label-wrapper, .errors {
        grid-column: span 2;
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

      /* -------------- */
      /*  With Buttons  */
      /* -------------- */

      .control {
        display: flex;
        gap: 0.5rem;

        button, input {
          background-color: var(--idle_bg_color);
          border: 0;
          outline: 1px solid var(--border_color);
          border-radius: 4px;
          box-shadow: 0 1px 2px 1px rgba(0, 0, 0, 0.2);

          &:focus-within {
            outline: 2px solid var(--focus_color);
            box-shadow: 0 0 2px 2px var(--focus_color);
          }
        }

        button {
          flex-shrink: 0;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          cursor: pointer;

          &:active {
            background-color: hsl(from var(--idle_bg_color) h s calc(l * 0.9));
          }
        }

        input {
          -moz-appearance: textfield;
          appearance: textfield;
          min-width: 2ch;
          field-sizing: content;
          margin: 0;
          padding: 2px;
          text-align: center;

          &::-webkit-outer-spin-button,
          &::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
        }
      }

    `,
  ];

  /** Similar to HTMLInputElement range `step` attribute */
  @property({ type: Number}) step = 1;

  /** Displays a tooltip that shows the current value. */
  @property({ type: Boolean })
  showTooltip = false;

  /** Shows buttons to increment or decrement the value. */
  @property({ type: Boolean })
  showControls = false;

  @query('.input-wrapper') $inputWrapper!: HTMLDivElement;

  constructor() {
    super();
  }

  setValue(value = this.$input.value) {
    super.setValue(value);
    // Keep CSS var in sync with the inner input's current value
    this.$inputWrapper.style.setProperty('--value', this.$input.value);
  }

  /* ----------------------- */
  /*  showControl attribute  */
  /* ----------------------- */

  /**
   * Increment or decrement the values.
   * Holding keyboard Control Shift and Alt keys have will have multiplier effect -
   * 10, 100 and 0.1 respectively.
   */
  onControlButtonClick(event: PointerEvent) {
    const button = event.currentTarget as HTMLButtonElement;
    if (!button) return;

    let step = this.step ?? 1;
    step *= event.ctrlKey ? 10 : 1;
    step *= event.shiftKey ? 100 : 1;
    step *= event.altKey ? 0.1 : 1;
    const significantPlaces = step.toString()?.split('.')[1]?.length ?? 0;
    if (button.value === '+') {
      this.value = (parseFloat(this.value) + step).toFixed(significantPlaces);
    } else {
      this.value = (parseFloat(this.value) - step).toFixed(significantPlaces);
    }
    this.setValue();
    this.requestUpdate();
  }

  /* ------------ */
  /*  LitElement  */
  /* ------------ */

  firstUpdated(): void {
    super.firstUpdated();
    // Use explicit default of '1' when no `value` attribute is provided
    const $input = this.$input as HTMLInputElement;
    this.$inputWrapper.style.setProperty('--min', $input.min);
    this.$inputWrapper.style.setProperty('--max', $input.max);
    this.$inputWrapper.style.setProperty('--value', $input.value);
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
          step=${ifDefined(this.step ? this.step : 1)}
          min=${ifDefined(this.min ? this.min : 1)}
          max=${ifDefined(this.max ? this.max : 100)}
          .value=${this.value}
          part="input"
          />

          ${ !this.showTooltip ? '' : html`<span class="tooltip-anchor"></span>
            <span class="tooltip" part="tooltip">${this.value ?? '1' }</span>` }
          ${ !this.showControls ? '' : html`
            <div class="control" part="control">
              <button part="control_button decrement" value="-" @click=${this.onControlButtonClick}>
                <slot name="control_button_decrement">-</slot>
              </button>
              <input
                id="input-${this.uid}-control"
                type="number"
                .value=${this.value ?? '1'}
                @input="${this.handleInput}"
                @blur="${this.handleInput}"
                part="control_input"
              >
              <button part="control_button increment" value="+" @click=${this.onControlButtonClick}>
                <slot name="control_button_increment">+</slot>
              </button>
            </div>
          `}
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
