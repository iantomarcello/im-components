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
 * CSS variables (listbox mode, `multiple`):
 * - `--listbox_height` — listbox height (default: `130px`)
 * - `--listbox_collapsed_height` — collapsed height when `collapsible` (default: `2.2rem`)
 * - `--listbox_expand_duration` — expand/collapse transition (default: `0.6s`)
 * - `--listbox_expand_max_height` — max overlay height when expanded (default: `20rem`)
 * - `--listbox_overlay_z_index` — z-index when expanded over other content (default: `10`)
 *
 * Listbox mode:
 * - Set the `multiple` attribute to render a customizable listbox instead of a dropdown.
 * - Use `collapsible` with `multiple` for an expanding listbox that overlays content below instead of shifting layout.
 * - `min` / `max` constrain how many options may be selected when `multiple` is set.
 *   `min` defaults to `1` when unset and `required` is set; optional fields allow zero
 *   selections unless `min` is explicitly set (then `min` applies once the user selects).
 * - The `value` property is a comma-separated list of selected option values.
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
        --listbox_height: 150px;
        --listbox_collapsed_height: 2.2rem;
        --listbox_expand_duration: 0.6s;
        --listbox_expand_max_height: 20rem;
        --listbox_overlay_z_index: 10;
      }

      /* Reset inherited styles from ImInput */
      .input-wrapper {
        &:has(:disabled, :read-only) {
          background-color: initial;
          border: initial;
        }
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

        :host([multiple][collapsible]) .input-wrapper {
          position: relative;
          height: var(--listbox_collapsed_height);
          overflow: visible;
        }

        :host([multiple][collapsible]) .input {
          position: absolute;
          inset: 0 auto auto 0;
          width: 100%;
          height: var(--listbox_collapsed_height);
          overflow: hidden;
          z-index: 1;
        }

        :host([multiple][collapsible]) .input:hover,
        :host([multiple][collapsible]) .input:focus-within {
          height: fit-content;
          max-height: var(--listbox_expand_max_height);
          overflow-y: auto;
          z-index: var(--listbox_overlay_z_index);
          box-shadow: 0 4px 12px hsl(from var(--font_color) h s l / 0.15);
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

        :host(:not([multiple])) select.input,
        :host(:not([multiple])) ::picker(select) {
          appearance: base-select;
        }

        :host([multiple]:not([collapsible])) select.input {
          height: var(--listbox_height);
        }

        :host(:not([multiple])) select.input {
          width: 100%;
          padding: var(--select_button_padding);
          border: 1px solid var(--border_color);
          border-radius: var(--select_border_radius);
          background-color: var(--idle_bg_color);
          color: var(--font_color);
          transition: background-color 0.2s;
        }

        :host(:not([multiple])) select.input:hover,
        :host(:not([multiple])) select.input:focus {
          background-color: hsl(from var(--idle_bg_color) h s calc(l * 0.95));
        }

        :host(:not([multiple])) select.input:disabled {
          background-color: var(--disabled_color);
          border-color: hsl(from var(--disabled_color) h s calc(l * 0.6));
        }

        :host(:not([multiple])) select.input::picker-icon {
          color: var(--picker_icon_color);
          transition: rotate var(--picker_opacity_duration);
        }

        :host(:not([multiple])) select.input:open::picker-icon {
          rotate: var(--picker_icon_rotate_open);
        }

        :host(:not([multiple])) ::picker(select) {
          border: 1px solid var(--picker_border_color);
          border-radius: var(--select_border_radius);
          background-color: var(--picker_bg_color);
          top: calc(anchor(bottom) + var(--picker_gap));
          opacity: 0;
          transition: all var(--picker_opacity_duration) allow-discrete;
        }

        :host(:not([multiple])) select.input:open::picker(select) {
          opacity: 1;
        }

        @starting-style {
          :host(:not([multiple])) select.input:open::picker(select) {
            opacity: 0;
          }
        }

        :host([multiple]) select.input {
          appearance: base-select;
          width: 100%;
          max-height: var(--listbox_expand_max_height);
          padding: 0;
          border: 1px solid var(--border_color);
          border-radius: var(--select_border_radius);
          background-color: var(--idle_bg_color);
          color: var(--font_color);
          scrollbar-gutter: stable;
          scrollbar-width: thin;
          scroll-behavior: smooth;
        }

        :host([multiple]) select.input:disabled {
          background-color: var(--disabled_color);
          border-color: hsl(from var(--disabled_color) h s calc(l * 0.6));
        }

        :host([multiple][collapsible]) .input-wrapper {
          position: relative;
          height: var(--listbox_collapsed_height);
          overflow: visible;
        }

        :host([multiple][collapsible]) select.input {
          position: absolute;
          inset: 0 auto auto 0;
          width: 100%;
          height: var(--listbox_collapsed_height);
          overflow: hidden;
          z-index: 1;
          transition:
            height var(--listbox_expand_duration),
            box-shadow var(--listbox_expand_duration);
          interpolate-size: allow-keywords;
        }

        :host([multiple][collapsible]) select.input:hover,
        :host([multiple][collapsible]) select.input:has(option:focus) {
          height: fit-content;
          max-height: var(--listbox_expand_max_height);
          overflow-y: auto;
          z-index: var(--listbox_overlay_z_index);
          box-shadow: 0 4px 12px hsl(from var(--font_color) h s l / 0.15);
        }

        :host([multiple]) option::checkmark {
          order: 1;
          margin-left: auto;
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

  @property({ type: Boolean, reflect: true })
  multiple = false;

  @property({ type: Boolean, reflect: true })
  collapsible = false;

  @state()
  private _hasSlottedOptions = false;

  constructor() {
    super();
  }

  init() {
    if (this.multiple && this.$input && this.value) {
      this.applyMultipleValue(this.value);
    }
    this.setValue();
  }

  private getMultipleMin(): number {
    if (this.min != null) return this.min;
    return this.required ? 1 : 0;
  }

  private applyMultipleValidity() {
    const count = this.$input.selectedOptions.length;
    const min = this.getMultipleMin();
    const flags: Record<string, boolean> = {};

    if (this.required && count === 0) {
      flags.valueMissing = true;
    } else if (count > 0 && count < min) {
      flags.rangeUnderflow = true;
    }

    if (this.max != null && count > this.max) {
      flags.rangeOverflow = true;
    }

    const valid = !flags.valueMissing && !flags.rangeUnderflow && !flags.rangeOverflow;
    const message = valid ? '' : this.getMultipleValidationMessage(flags);

    this.validity = valid ? ({ valid: true } as ValidityState) : flags;
    this.internals?.setValidity(
      valid ? {} : flags,
      message,
      this.$input,
    );
  }

  private getMultipleValidationMessage(flags: Record<string, boolean>): string {
    if (flags.rangeOverflow && this.max != null) {
      return this.errors.rangeOverflow
        ?? `Please select at most ${this.max} option${this.max === 1 ? '' : 's'}.`;
    }
    if (flags.rangeUnderflow) {
      const min = this.getMultipleMin();
      return this.errors.rangeUnderflow
        ?? `Please select at least ${min} option${min === 1 ? '' : 's'}.`;
    }
    if (flags.valueMissing) {
      return this.errors.valueMissing ?? 'Please select at least one option.';
    }
    return '';
  }

  setValue() {
    if (!this.$input) return;

    if (this.multiple) {
      const formData = new FormData();
      Array.from(this.$input.selectedOptions).forEach((opt) => {
        formData.append(this.name || '', opt.value);
      });
      this.internals?.setFormValue(formData);
      this.applyMultipleValidity();
      return;
    }

    this.internals?.setFormValue(this.$input.value);
    this.validity = this.$input.validity;
    this.internals?.setValidity(
      this.$input.validity as any,
      this.$input.validationMessage,
      this.$input,
    );
  }

  handleInput(event: InputEvent) {
    if (this.multiple) {
      const select = event.currentTarget as HTMLSelectElement;
      const newValue = Array.from(select.selectedOptions).map((opt) => opt.value).join(',');
      if (newValue !== this.value) {
        this.value = newValue;
      }
      this.setValue();
      this.touched = true;
      this.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }
    super.handleInput(event);
  }

  firstUpdated() {
    super.firstUpdated();
    this.syncSlottedOptions();
    this.$input?.addEventListener('transitionend', this.onListboxTransitionEnd);
  }

  disconnectedCallback() {
    this.$input?.removeEventListener('transitionend', this.onListboxTransitionEnd);
    super.disconnectedCallback();
  }

  private onListboxTransitionEnd = (event: TransitionEvent) => {
    if (!this.multiple || !this.collapsible) return;
    if (event.target !== this.$input || event.propertyName !== 'height') return;

    const select = this.$input;
    if (!select.matches(':hover') && !select.querySelector('option:focus')) {
      select.scrollTop = 0;
    }
  };

  protected updated(changedProperties: PropertyValues) {
    if (
      changedProperties.has('value')
      || changedProperties.has('min')
      || changedProperties.has('max')
      || changedProperties.has('required')
    ) {
      if (this.multiple && this.$input) {
        if (changedProperties.has('value') && !this.selectionMatchesValue(this.value)) {
          this.applyMultipleValue(this.value);
        }
        this.setValue();
      } else if (changedProperties.has('value')) {
        if (this.$input && this.$input.value !== this.value) {
          this.$input.value = this.value;
        }
        this.setValue();
      } else if (this.multiple) {
        this.setValue();
      }
    }
  }

  private selectionMatchesValue(value: string): boolean {
    const expected = this.parseMultipleValue(value);
    const selected = Array.from(this.$input.selectedOptions).map((opt) => opt.value);
    if (expected.length !== selected.length) return false;
    return expected.every((v) => selected.includes(v));
  }

  private parseMultipleValue(value: string): string[] {
    return value ? value.split(',').map((v) => v.trim()).filter(Boolean) : [];
  }

  private applyMultipleValue(value: string) {
    const values = this.parseMultipleValue(value);
    this.$input.querySelectorAll('option').forEach((opt) => {
      opt.selected = values.includes(opt.value);
    });
  }

  private syncSelectValue() {
    if (!this.$input || !this.value) return;

    if (this.multiple) {
      this.applyMultipleValue(this.value);
    } else {
      this.$input.value = this.value;
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

    const scrollTop = select.scrollTop;
    const activeValue = (document.activeElement as HTMLOptionElement | null)?.value;

    select.querySelectorAll(':scope > option, :scope > optgroup').forEach((el) => el.remove());

    slot.assignedElements().forEach((el) => {
      if (el.tagName === 'OPTION' || el.tagName === 'OPTGROUP') {
        select.appendChild(el.cloneNode(true));
      }
    });

    this.syncSelectValue();
    select.scrollTop = scrollTop;

    if (activeValue) {
      const option = select.querySelector(`option[value="${CSS.escape(activeValue)}"]`);
      (option as HTMLOptionElement | null)?.focus({ preventScroll: true });
    }
  }

  private handleChange(event: Event) {
    if (this.multiple) {
      const select = event.currentTarget as HTMLSelectElement;
      const newValue = Array.from(select.selectedOptions).map((opt) => opt.value).join(',');
      if (newValue !== this.value) {
        this.value = newValue;
      }
      this.setValue();
      this.touched = true;
    } else {
      this.handleInput(event as InputEvent);
    }
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

  private renderSelectOptions() {
    return html`
      ${this.multiple ? nothing : html`
        <button type="button" part="select-button">
          <selectedcontent part="selected-content"></selectedcontent>
          <slot name="button"></slot>
        </button>
      `}
      ${this._hasSlottedOptions ? nothing : this.renderOptionsFromProps()}
    `;
  }

  private renderSelect() {
    if (this.multiple) {
      return html`<select
        id="input-${this.uid}"
        @input="${this.handleInput}"
        @blur="${this.handleInput}"
        @change=${this.handleChange}
        class="input"
        part="input"
        ?multiple=${this.multiple}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
      >${this.renderSelectOptions()}</select>`;
    }

    return html`<select
      id="input-${this.uid}"
      @input="${this.handleInput}"
      @blur="${this.handleInput}"
      @change=${this.handleChange}
      class="input"
      part="input"
      .value=${this.value}
      ?disabled=${this.disabled}
      ?required=${this.required}
      ?readonly=${this.readonly}
    >${this.renderSelectOptions()}</select>`;
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
        ${this.renderSelect()}
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
