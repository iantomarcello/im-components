import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../src/form/im-select';
import type { ImOption } from '../src/form/im-input-radio';
import type { ImOptionGroup } from '../src/form/im-select';

async function nextFrame() {
  return new Promise((r) => setTimeout(r, 0));
}

function getInnerSelect(el: HTMLElement) {
  return el.shadowRoot?.querySelector('select') as HTMLSelectElement | null;
}

function getErrorText(el: HTMLElement) {
  return el.shadowRoot?.querySelector('.errors')?.textContent?.trim() ?? '';
}

function hasErrors(el: HTMLElement) {
  return Boolean(el.shadowRoot?.querySelector('.errors'));
}

function getInnerSelectOptions(el: HTMLElement) {
  return [...(getInnerSelect(el)?.querySelectorAll('option') ?? [])] as HTMLOptionElement[];
}

describe('ImSelect multiple form value', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('submits all selected values under the same name', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-select name="food" multiple id="s">
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
          <option value="cherry">Cherry</option>
        </im-select>
      </form>
    `;
    await customElements.whenDefined('im-select');
    await nextFrame();

    const select = getInnerSelect(document.getElementById('s')!)!;
    select.options[0].selected = true;
    select.options[1].selected = true;
    select.dispatchEvent(new Event('input', { bubbles: true }));
    await nextFrame();

    const formData = new FormData(document.getElementById('form') as HTMLFormElement);
    expect(formData.getAll('food')).toEqual(['apple', 'banana']);
    expect([...formData.entries()]).toEqual([
      ['food', 'apple'],
      ['food', 'banana'],
    ]);
  });

  it('submits all selected values with slotted optgroups', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-select name="food" multiple id="s">
          <optgroup label="Fruits">
            <option value="apple">Apple</option>
            <option value="banana">Banana</option>
          </optgroup>
        </im-select>
      </form>
    `;
    await customElements.whenDefined('im-select');
    await nextFrame();

    const select = getInnerSelect(document.getElementById('s')!)!;
    select.options[0].selected = true;
    select.options[1].selected = true;
    select.dispatchEvent(new Event('input', { bubbles: true }));
    await nextFrame();

    const formData = new FormData(document.getElementById('form') as HTMLFormElement);
    expect(formData.getAll('food')).toEqual(['apple', 'banana']);
  });
});

describe('ImSelect default value', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('defaults to the first light-DOM option when no value is provided', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-select name="pet" id="pet">
          <option value="cat">Cat</option>
          <option value="dog">Dog</option>
          <option value="hamster">Hamster</option>
        </im-select>
      </form>
    `;
    await customElements.whenDefined('im-select');
    await nextFrame();

    const im = document.getElementById('pet') as HTMLElement & { value: string };
    const select = getInnerSelect(im)!;
    const form = document.getElementById('form') as HTMLFormElement;

    expect(im.value).toBe('cat');
    expect(select.value).toBe('cat');
    expect(new FormData(form).get('pet')).toBe('cat');
  });

  it('defaults to the first JSON option when no value is provided', async () => {
    const im = document.createElement('im-select') as HTMLElement & {
      options: { value: string; label: string }[];
      value: string;
    };
    im.id = 'fruit';
    im.setAttribute('name', 'fruit');
    im.options = [
      { value: 'Apple', label: 'Apple' },
      { value: 'Orange', label: 'Orange' },
    ];
    document.body.innerHTML = '<form id="form"></form>';
    document.getElementById('form')!.appendChild(im);

    await customElements.whenDefined('im-select');
    await nextFrame();

    const select = getInnerSelect(im)!;
    const form = document.getElementById('form') as HTMLFormElement;

    expect(im.value).toBe('Apple');
    expect(select.value).toBe('Apple');
    expect(new FormData(form).get('fruit')).toBe('Apple');
  });

  it('keeps an explicit value instead of forcing the first option', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-select name="pet" id="pet" value="hamster">
          <option value="cat">Cat</option>
          <option value="dog">Dog</option>
          <option value="hamster">Hamster</option>
        </im-select>
      </form>
    `;
    await customElements.whenDefined('im-select');
    await nextFrame();

    const im = document.getElementById('pet') as HTMLElement & { value: string };
    const form = document.getElementById('form') as HTMLFormElement;

    expect(im.value).toBe('hamster');
    expect(new FormData(form).get('pet')).toBe('hamster');
  });
});

// ---------------------------------------------------------------------------
// Single-select interaction
// ---------------------------------------------------------------------------

describe('ImSelect single-select interaction', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('reflects new selection in FormData when user changes option via options prop', async () => {
    const im = document.createElement('im-select') as HTMLElement & {
      options: ImOption[];
      value: string;
    };
    im.setAttribute('name', 'pet');
    im.options = [
      { value: 'cat', label: 'Cat' },
      { value: 'dog', label: 'Dog' },
      { value: 'hamster', label: 'Hamster' },
    ];
    document.body.innerHTML = '<form id="form"></form>';
    document.getElementById('form')!.appendChild(im);

    await customElements.whenDefined('im-select');
    await nextFrame();

    const select = getInnerSelect(im)!;
    const form = document.getElementById('form') as HTMLFormElement;

    expect(im.value).toBe('cat');
    expect(new FormData(form).get('pet')).toBe('cat');

    select.value = 'dog';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await nextFrame();

    expect(im.value).toBe('dog');
    expect(new FormData(form).get('pet')).toBe('dog');
  });

  it('syncs inner select when value property is set programmatically', async () => {
    const im = document.createElement('im-select') as HTMLElement & {
      options: ImOption[];
      value: string;
    };
    im.setAttribute('name', 'pet');
    im.options = [
      { value: 'cat', label: 'Cat' },
      { value: 'dog', label: 'Dog' },
    ];
    document.body.innerHTML = '<form id="form"></form>';
    document.getElementById('form')!.appendChild(im);

    await customElements.whenDefined('im-select');
    await nextFrame();

    const form = document.getElementById('form') as HTMLFormElement;
    expect(im.value).toBe('cat');

    im.value = 'dog';
    await nextFrame();

    const select = getInnerSelect(im)!;
    expect(select.value).toBe('dog');
    expect(new FormData(form).get('pet')).toBe('dog');
  });

  it('dispatches a change event on the host element when selection changes', async () => {
    const im = document.createElement('im-select') as HTMLElement & {
      options: ImOption[];
      value: string;
    };
    im.setAttribute('name', 'pet');
    im.options = [
      { value: 'cat', label: 'Cat' },
      { value: 'dog', label: 'Dog' },
    ];
    document.body.appendChild(im);

    await customElements.whenDefined('im-select');
    await nextFrame();

    const changeHandler = vi.fn();
    im.addEventListener('change', changeHandler);

    const select = getInnerSelect(im)!;
    select.value = 'dog';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await nextFrame();

    expect(changeHandler).toHaveBeenCalledTimes(1);
  });

  it('disabled: inner select is disabled', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-select name="pet" id="pet" disabled>
          <option value="cat">Cat</option>
          <option value="dog">Dog</option>
        </im-select>
      </form>
    `;
    await customElements.whenDefined('im-select');
    await nextFrame();

    const im = document.getElementById('pet') as HTMLElement;
    const select = getInnerSelect(im)!;

    expect(select.disabled).toBe(true);
    // Note: element-internals-polyfill does not exclude disabled custom
    // form-associated elements from FormData; real browsers do.
  });

  it('required: no error before touch; error shown after touch; clears after valid selection', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-select name="pet" id="pet" required>
          <option value="">Pick one…</option>
          <option value="cat">Cat</option>
          <option value="dog">Dog</option>
        </im-select>
      </form>
    `;
    await customElements.whenDefined('im-select');
    await nextFrame();

    const im = document.getElementById('pet') as HTMLElement;
    const select = getInnerSelect(im)!;

    expect(hasErrors(im)).toBe(false);

    select.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await nextFrame();

    expect(hasErrors(im)).toBe(true);
    expect(getErrorText(im).length).toBeGreaterThan(0);

    select.value = 'cat';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await nextFrame();

    expect(hasErrors(im)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Multiple-select validation
// ---------------------------------------------------------------------------

describe('ImSelect multiple-select validation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('required: shows valueMissing error after touch with no selection', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-select name="food" id="s" multiple required>
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
        </im-select>
      </form>
    `;
    await customElements.whenDefined('im-select');
    await nextFrame();

    const im = document.getElementById('s') as HTMLElement;
    const select = getInnerSelect(im)!;

    expect(hasErrors(im)).toBe(false);

    select.dispatchEvent(new Event('input', { bubbles: true }));
    await nextFrame();

    expect(hasErrors(im)).toBe(true);
    expect(getErrorText(im)).toContain('Please select at least one option.');
  });

  it('min: shows rangeUnderflow error when fewer than min options are selected', async () => {
    const im = document.createElement('im-select') as HTMLElement & {
      multiple: boolean;
      min: number;
      options: ImOption[];
    };
    im.setAttribute('name', 'food');
    im.multiple = true;
    im.min = 2;
    im.options = [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry' },
    ];
    document.body.innerHTML = '<form id="form"></form>';
    document.getElementById('form')!.appendChild(im);

    await customElements.whenDefined('im-select');
    await nextFrame();

    const select = getInnerSelect(im)!;
    select.options[0].selected = true;
    select.dispatchEvent(new Event('input', { bubbles: true }));
    await nextFrame();

    expect(hasErrors(im)).toBe(true);
    expect(getErrorText(im)).toContain('Please select at least 2 options.');
  });

  it('max: shows rangeOverflow error when more than max options are selected', async () => {
    const im = document.createElement('im-select') as HTMLElement & {
      multiple: boolean;
      max: number;
      options: ImOption[];
    };
    im.setAttribute('name', 'food');
    im.multiple = true;
    im.max = 1;
    im.options = [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry' },
    ];
    document.body.innerHTML = '<form id="form"></form>';
    document.getElementById('form')!.appendChild(im);

    await customElements.whenDefined('im-select');
    await nextFrame();

    const select = getInnerSelect(im)!;
    select.options[0].selected = true;
    select.options[1].selected = true;
    select.dispatchEvent(new Event('input', { bubbles: true }));
    await nextFrame();

    expect(hasErrors(im)).toBe(true);
    expect(getErrorText(im)).toContain('Please select at most 1 option.');
  });

  it('custom errors prop overrides default validation messages', async () => {
    const im = document.createElement('im-select') as HTMLElement & {
      multiple: boolean;
      required: boolean;
      errors: Record<string, string>;
      options: ImOption[];
    };
    im.setAttribute('name', 'food');
    im.multiple = true;
    im.required = true;
    im.errors = { valueMissing: 'You must pick at least one!' };
    im.options = [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
    ];
    document.body.innerHTML = '<form id="form"></form>';
    document.getElementById('form')!.appendChild(im);

    await customElements.whenDefined('im-select');
    await nextFrame();

    const select = getInnerSelect(im)!;
    select.dispatchEvent(new Event('input', { bubbles: true }));
    await nextFrame();

    expect(hasErrors(im)).toBe(true);
    expect(getErrorText(im)).toBe('You must pick at least one!');
  });

  it('does not show errors before the field is touched', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-select name="food" id="s" multiple required>
          <option value="apple">Apple</option>
        </im-select>
      </form>
    `;
    await customElements.whenDefined('im-select');
    await nextFrame();

    const im = document.getElementById('s') as HTMLElement;

    expect(hasErrors(im)).toBe(false);
    expect(im.hasAttribute('invalid')).toBe(false);
  });

  it('exposes invalid attribute and --invalid custom state after touch; clears when valid', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-select name="food" id="s" multiple required>
          <option value="apple">Apple</option>
        </im-select>
      </form>
    `;
    await customElements.whenDefined('im-select');
    await nextFrame();

    const im = document.getElementById('s') as HTMLElement & { internals?: ElementInternals };
    const select = getInnerSelect(im)!;

    expect(im.hasAttribute('invalid')).toBe(false);

    select.dispatchEvent(new Event('input', { bubbles: true }));
    await nextFrame();

    expect(im.hasAttribute('invalid')).toBe(true);
    expect(im.internals?.states?.has('--invalid')).toBe(true);

    select.options[0].selected = true;
    select.dispatchEvent(new Event('input', { bubbles: true }));
    await nextFrame();

    expect(im.hasAttribute('invalid')).toBe(false);
    expect(im.internals?.states?.has('--invalid')).toBe(false);
  });

  it('programmatic comma-separated value syncs the inner selection', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-select name="food" id="s" multiple>
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
          <option value="cherry">Cherry</option>
        </im-select>
      </form>
    `;
    await customElements.whenDefined('im-select');
    await nextFrame();

    const im = document.getElementById('s') as HTMLElement & { value: string };
    const select = getInnerSelect(im)!;

    expect(select.selectedOptions.length).toBe(0);

    im.value = 'apple,cherry';
    await nextFrame();

    const selectedValues = [...select.selectedOptions].map((o) => o.value);
    expect(selectedValues).toContain('apple');
    expect(selectedValues).toContain('cherry');
    expect(selectedValues).not.toContain('banana');
  });

  it('deselect all: FormData has no entries for the field name', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-select name="food" id="s" multiple>
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
        </im-select>
      </form>
    `;
    await customElements.whenDefined('im-select');
    await nextFrame();

    const im = document.getElementById('s') as HTMLElement;
    const select = getInnerSelect(im)!;
    const form = document.getElementById('form') as HTMLFormElement;

    select.options[0].selected = true;
    select.options[1].selected = true;
    select.dispatchEvent(new Event('input', { bubbles: true }));
    await nextFrame();

    expect(new FormData(form).getAll('food')).toHaveLength(2);

    select.options[0].selected = false;
    select.options[1].selected = false;
    select.dispatchEvent(new Event('input', { bubbles: true }));
    await nextFrame();

    expect(new FormData(form).getAll('food')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Options & groups props
// ---------------------------------------------------------------------------

describe('ImSelect options & groups props', () => {
  beforeEach(() => {
    document.body.innerHTML = '<form id="form"></form>';
  });

  it('flat options prop: renders all options and auto-selects the first', async () => {
    const im = document.createElement('im-select') as HTMLElement & {
      options: ImOption[];
      value: string;
    };
    im.setAttribute('name', 'color');
    im.options = [
      { value: 'red', label: 'Red' },
      { value: 'green', label: 'Green' },
      { value: 'blue', label: 'Blue' },
    ];
    document.getElementById('form')!.appendChild(im);

    await customElements.whenDefined('im-select');
    await nextFrame();

    const opts = getInnerSelectOptions(im);
    expect(opts).toHaveLength(3);
    expect(opts[0].value).toBe('red');
    expect(opts[1].value).toBe('green');
    expect(opts[2].value).toBe('blue');
    expect(im.value).toBe('red');
    expect(new FormData(document.getElementById('form') as HTMLFormElement).get('color')).toBe('red');
  });

  it('flat options prop: user can pick a different option and form value updates', async () => {
    const im = document.createElement('im-select') as HTMLElement & {
      options: ImOption[];
      value: string;
    };
    im.setAttribute('name', 'color');
    im.options = [
      { value: 'red', label: 'Red' },
      { value: 'green', label: 'Green' },
    ];
    document.getElementById('form')!.appendChild(im);

    await customElements.whenDefined('im-select');
    await nextFrame();

    const select = getInnerSelect(im)!;
    select.value = 'green';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await nextFrame();

    expect(im.value).toBe('green');
    expect(new FormData(document.getElementById('form') as HTMLFormElement).get('color')).toBe('green');
  });

  it('flat options prop: disabled option is not selectable', async () => {
    const im = document.createElement('im-select') as HTMLElement & { options: ImOption[]; value: string };
    im.setAttribute('name', 'color');
    im.options = [
      { value: 'red', label: 'Red' },
      { value: 'green', label: 'Green', disabled: true },
    ];
    document.getElementById('form')!.appendChild(im);

    await customElements.whenDefined('im-select');
    await nextFrame();

    const opts = getInnerSelectOptions(im);
    expect(opts[1].disabled).toBe(true);
    expect(im.value).toBe('red');
  });

  it('groups prop: renders optgroups with correct labels and options inside each group', async () => {
    const im = document.createElement('im-select') as HTMLElement & {
      groups: ImOptionGroup[];
      value: string;
    };
    im.setAttribute('name', 'animal');
    im.groups = [
      { label: 'Cats', options: [{ value: 'cat', label: 'Cat' }, { value: 'lion', label: 'Lion' }] },
      { label: 'Dogs', options: [{ value: 'dog', label: 'Dog' }] },
    ];
    document.getElementById('form')!.appendChild(im);

    await customElements.whenDefined('im-select');
    await nextFrame();

    const select = getInnerSelect(im)!;
    const optgroups = [...select.querySelectorAll('optgroup')];
    expect(optgroups).toHaveLength(2);

    const allOptions = getInnerSelectOptions(im);
    expect(allOptions).toHaveLength(3);
    expect(allOptions[0].value).toBe('cat');
    expect(allOptions[1].value).toBe('lion');
    expect(allOptions[2].value).toBe('dog');

    expect(im.value).toBe('cat');
  });

  it('dynamic options update: auto-selects first new option when value was unset', async () => {
    const im = document.createElement('im-select') as HTMLElement & {
      options: ImOption[];
      value: string;
    };
    im.setAttribute('name', 'fruit');
    document.getElementById('form')!.appendChild(im);

    await customElements.whenDefined('im-select');
    await nextFrame();

    expect(im.value).toBe('');

    im.options = [
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry' },
    ];
    await nextFrame();

    expect(im.value).toBe('banana');
    expect(new FormData(document.getElementById('form') as HTMLFormElement).get('fruit')).toBe('banana');
  });
});

// ---------------------------------------------------------------------------
// Collapsible listbox behavior
// ---------------------------------------------------------------------------

type ImSelectRaw = HTMLElement & {
  value: string;
  multiple: boolean;
  collapsible: boolean;
  options: ImOption[];
  $inputWrapper: HTMLElement;
  $input: HTMLSelectElement;
  _listboxExpandMaxHeightPx: number | undefined;
};

describe('ImSelect collapsible listbox behavior', () => {
  const CONFIGURED_MAX_PX = 200;

  beforeEach(() => {
    document.body.innerHTML = '<form id="form"></form>';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
  });

  async function mountCollapsible(): Promise<ImSelectRaw> {
    const im = document.createElement('im-select') as ImSelectRaw;
    im.setAttribute('name', 'food');
    im.multiple = true;
    im.collapsible = true;
    im.options = [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
    ];
    document.getElementById('form')!.appendChild(im);
    await customElements.whenDefined('im-select');
    await nextFrame();
    return im;
  }

  function setupLayout(
    im: ImSelectRaw,
    wrapperRect: Partial<DOMRect>,
    innerHeight: number,
  ) {
    im._listboxExpandMaxHeightPx = CONFIGURED_MAX_PX;
    vi.spyOn(im.$inputWrapper, 'getBoundingClientRect').mockReturnValue({
      top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0,
      toJSON: () => {},
      ...wrapperRect,
    } as DOMRect);
    Object.defineProperty(window, 'innerHeight', { value: innerHeight, configurable: true });
  }

  it('does not set expand-up when there is sufficient space below', async () => {
    const im = await mountCollapsible();
    // spaceBelow = 800 - 100 - 0(margin) = 700 >= 200(configuredMax) → no expand-up
    setupLayout(im, { top: 50, bottom: 100 }, 800);

    im.$inputWrapper.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await nextFrame();

    expect(im.hasAttribute('expand-up')).toBe(false);
    expect(im.style.getPropertyValue('--listbox_expand_max_block_size')).not.toBe('');
  });

  it('sets expand-up when there is more space above than below', async () => {
    const im = await mountCollapsible();
    // spaceBelow = 800 - 700 = 100 < 200(configuredMax); spaceAbove = 650 > 100 → expand-up
    setupLayout(im, { top: 650, bottom: 700 }, 800);

    im.$inputWrapper.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await nextFrame();

    expect(im.hasAttribute('expand-up')).toBe(true);
  });

  it('sets --listbox_expand_max_block_size clamped to available space above when expand-up', async () => {
    const im = await mountCollapsible();
    // spaceAbove = 400, configuredMax = 200 → min(200, 400) = 200
    setupLayout(im, { top: 400, bottom: 450 }, 500);

    im.$inputWrapper.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await nextFrame();

    expect(im.hasAttribute('expand-up')).toBe(true);
    expect(im.style.getPropertyValue('--listbox_expand_max_block_size')).toBe('200px');
  });

  it('removes expand-up and CSS var on pointer leave when listbox is not expanded', async () => {
    const im = await mountCollapsible();
    setupLayout(im, { top: 650, bottom: 700 }, 800);

    im.$inputWrapper.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await nextFrame();
    expect(im.hasAttribute('expand-up')).toBe(true);

    // jsdom does not track :hover, so isCollapsibleListboxExpanded() returns false
    im.$inputWrapper.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
    await nextFrame();

    expect(im.hasAttribute('expand-up')).toBe(false);
    expect(im.style.getPropertyValue('--listbox_expand_max_block_size')).toBe('');
  });

  it('clears expand-up and CSS var when element is disconnected', async () => {
    const im = await mountCollapsible();
    setupLayout(im, { top: 650, bottom: 700 }, 800);

    im.$inputWrapper.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await nextFrame();
    expect(im.hasAttribute('expand-up')).toBe(true);

    im.remove();
    await nextFrame();

    expect(im.hasAttribute('expand-up')).toBe(false);
    expect(im.style.getPropertyValue('--listbox_expand_max_block_size')).toBe('');
  });
});
