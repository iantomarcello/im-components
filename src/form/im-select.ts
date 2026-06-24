import { html, css, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import 'element-internals-polyfill';
import { ImInput } from './im-input';
import type { ImOption } from './im-input-radio';

export interface ImOptionGroup {
  label: string;
  options: ImOption[];
}

/**
 * Form-associated select web component with progressive enhancement
 * for customizable native `<select>` rendering.
 *
 * In Chromium browsers that support `appearance: base-select`, the select
 * opts into fully customizable styling of the button, picker, picker icon,
 * options, checkmark, and popover animation. All other browsers fall back
 * to a classic native select.
 *
 * @see https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select
 *
 * Slots:
 * - `label` — custom label content (the `label` attribute is a string alternative)
 * - `button` — optional extra content inside the closed select button
 * - default — optional light-DOM `<option>` / `<optgroup>` markup (replaces JSON props)
 *
 * CSS parts:
 * - `field`, `label`, `input-wrapper`, `input`, `errors` — inherited from `im-input`
 * - `select-button` — inner `<button>` of the customizable select
 * - `selected-content` — `<selectedcontent>` element
 * - `option` — each `<option>` rendered from JSON props
 *
 * CSS variables (inherited from `im-input`):
 * - `--font_color`, `--idle_bg_color`, `--border_color`, `--focus_color`
 * - `--error_color`, `--disabled_color`, `--accent_color`
 *
 * CSS variables (select-specific, enhanced mode only):
 * - `--select_button_padding` — closed select button padding (default: `0.4rem 0.5rem`)
 * - `--select_border_radius` — button and picker border radius (default: `0.375rem`)
 * - `--picker_bg_color` — picker background (default: `var(--idle_bg_color)`)
 * - `--picker_border_color` — picker border color (default: `var(--border_color)`)
 * - `--picker_gap` — anchor offset below the button (default: `1px`)
 * - `--picker_icon_color` — `::picker-icon` color (default: `var(--font_color)`)
 * - `--picker_icon_rotate_open` — icon rotation when open (default: `180deg`)
 * - `--option_padding` — option padding (default: `0.4rem 0.5rem`)
 * - `--option_hover_bg` — option hover/focus background (default: derived from `--focus_color`)
 * - `--option_checked_weight` — selected option font weight (default: `600`)
 * - `--checkmark_content` — `::checkmark` content (default: `"✓"`)
 * - `--picker_opacity_duration` — picker fade transition (default: `0.2s`)
 *
 * Options API:
 * - `options` — flat array of `{ value, label, disabled? }` objects
 * - `groups` — array of `{ label, options }` for grouped selects (takes precedence over `options`)
 * - `label` values may contain HTML for rich option content in supporting browsers
 * - Alternatively, place `<option>` / `<optgroup>` elements as light-DOM children
 *
 * @element im-select
 * @slot label - Content for the label
 * @slot button - Extra content inside the closed select button
 * @slot - Light-DOM `<option>` / `<optgroup>` markup
 * @csspart field
 * @csspart label
 * @csspart input-wrapper
 * @csspart input
 * @csspart select-button
 * @csspart selected-content
 * @csspart option
 * @csspart errors
 * @example
 * <im-select label="Pet" name="pet" value="cat"
 *   options='[{ "value": "cat", "label": "<span class=\"icon\">🐱</span> Cat" }]'
 * ></im-select>
 */
@customElement('im-select')
export class ImSelect extends ImInput {
  static styles = [
    ...super.styles,
    css`
      :host {
        --select_button_padding: 0.4rem 0.5rem;
        --select_border_radius: 0.375rem;
        --picker_bg_color: var(--idle_bg_color);
        --picker_border_color: var(--border_color);
        --picker_gap: 1px;
        --picker_icon_color: var(--font_color);
        --picker_icon_rotate_open: 180deg;
        --option_padding: 0.4rem 0.5rem;
        --option_hover_bg: hsl(from var(--focus_color) h s calc(l * 1.6));
        --option_checked_weight: 600;
        --checkmark_content: "✓";
        --picker_opacity_duration: 0.2s;
      }

      @supports not (appearance: base-select) {
        .input-wrapper {
          padding: 0;
        }

        .input {
          padding: var(--select_button_padding);
          appearance: none;
          background-color: var(--idle_bg_color);
          color: var(--font_color);
          border: 1px solid var(--border_color);
        }

        option:disabled {
          background-color: var(--disabled_color);
        }
      }

      @supports (appearance: base-select) {
        .input-wrapper {
          padding: 0;
          border: 0;
          box-shadow: none;
          background: transparent;
        }

        .input-wrapper:focus-within {
          outline: 0;
          box-shadow: none;
        }

        .input-wrapper:has(+ .errors) {
          border: 0;
          outline: 0;
          box-shadow: none;
          background: transparent;
        }

        select.input,
        ::picker(select) {
          appearance: base-select;
        }

        select.input {
          width: 100%;
          padding: var(--select_button_padding);
          border: 1px solid var(--border_color);
          border-radius: var(--select_border_radius);
          background-color: var(--idle_bg_color);
          color: var(--font_color);
          transition: background-color 0.2s;
        }

        select.input:hover,
        select.input:focus {
          background-color: hsl(from var(--idle_bg_color) h s calc(l * 0.95));
        }

        select.input:disabled {
          background-color: var(--disabled_color);
          border-color: hsl(from var(--disabled_color) h s calc(l * 0.6));
        }

        select.input::picker-icon {
          color: var(--picker_icon_color);
          transition: rotate var(--picker_opacity_duration);
        }

        select.input:open::picker-icon {
          rotate: var(--picker_icon_rotate_open);
        }

        ::picker(select) {
          border: 1px solid var(--picker_border_color);
          border-radius: var(--select_border_radius);
          background-color: var(--picker_bg_color);
          top: calc(anchor(bottom) + var(--picker_gap));
          opacity: 0;
          transition: all var(--picker_opacity_duration) allow-discrete;
        }

        select.input:open::picker(select) {
          opacity: 1;
        }

        @starting-style {
          select.input:open::picker(select) {
            opacity: 0;
          }
        }

        option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: var(--option_padding);
          background-color: var(--idle_bg_color);
          transition: background-color 0.2s;
        }

        option:hover,
        option:focus {
          background-color: var(--option_hover_bg);
        }

        option:checked {
          font-weight: var(--option_checked_weight);
        }

        option:disabled {
          background-color: var(--disabled_color);
        }

        option::checkmark {
          content: var(--checkmark_content);
        }

        selectedcontent .icon {
          display: none;
        }

        optgroup {
          margin-top: 0.25rem;
        }

        optgroup legend {
          font-weight: 600;
          padding: var(--option_padding);
          padding-block-end: 0.25rem;
        }
      }
    `,
  ];

  // @ts-ignore. We are simply using the query selector to get the select element.
  @query('select') $input!: HTMLSelectElement;

  @property({ type: Array })
  options: ImOption[] = [];

  @property({ type: Array })
  groups: ImOptionGroup[] = [];

  @state()
  private _hasSlottedOptions = false;

  constructor() {
    super();
  }

  firstUpdated() {
    super.firstUpdated();
    this.syncSlottedOptions();
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    if (this._hasSlottedOptions) {
      this.syncSlottedOptions();
    }
  }

  private onOptionsSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    const has = slot.assignedElements().some(
      (el) => el.tagName === 'OPTION' || el.tagName === 'OPTGROUP',
    );
    if (has !== this._hasSlottedOptions) {
      this._hasSlottedOptions = has;
    }
    this.syncSlottedOptions();
  }

  /**
   * Light-DOM <option>/<optgroup> cannot live inside a <slot> within <select>;
   * they must be real children of the select. Clone assigned slot content in.
   */
  private syncSlottedOptions() {
    const select = this.$input;
    const slot = this.renderRoot?.querySelector('slot[data-options]') as HTMLSlotElement | null;
    if (!select || !slot || !this._hasSlottedOptions) return;

    select.querySelectorAll(':scope > option, :scope > optgroup').forEach((el) => el.remove());

    slot.assignedElements().forEach((el) => {
      if (el.tagName === 'OPTION' || el.tagName === 'OPTGROUP') {
        select.appendChild(el.cloneNode(true));
      }
    });

    if (this.value) {
      select.value = this.value;
    }
  }

  private handleChange(event: Event) {
    this.handleInput(event as InputEvent);
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  private renderOption(opt: ImOption): TemplateResult {
    return html`
      <option
        value=${opt.value}
        ?disabled=${opt.disabled}
        part="option"
        .innerHTML=${opt.label}
      ></option>
    `;
  }

  private renderOptionsFromProps(): TemplateResult | TemplateResult[] {
    if (this.groups.length > 0) {
      return this.groups.map((group) => html`
        <optgroup>
          <legend>${group.label}</legend>
          ${group.options.map((opt) => this.renderOption(opt))}
        </optgroup>
      `);
    }
    return this.options.map((opt) => this.renderOption(opt));
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
        <div hidden aria-hidden="true">
          <slot data-options @slotchange=${this.onOptionsSlotChange}></slot>
        </div>
        <select
          novalidate
          id="input-${this.uid}"
          name=${this.name}
          @input="${this.handleInput}"
          @blur="${this.handleInput}"
          @change=${this.handleChange}
          class="input"
          part="input"
          .value=${this.value}
          ?disabled=${this.disabled}
          ?required=${this.required}
          ?readonly=${this.readonly}
        >
          <button type="button" part="select-button">
            <selectedcontent part="selected-content"></selectedcontent>
            <slot name="button"></slot>
          </button>
          ${this._hasSlottedOptions ? nothing : this.renderOptionsFromProps()}
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
