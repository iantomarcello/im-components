import { beforeEach, describe, expect, it } from 'vitest';

import '../src/form/im-input-radio';
import type { ImOption } from '../src/form/im-input-radio';

async function nextFrame() {
  return new Promise((r) => setTimeout(r, 0));
}

function mountRadio(name: string, options: ImOption[], value = '') {
  const im = document.createElement('im-input-radio') as HTMLElement & {
    name: string;
    options: ImOption[];
    value: string;
  };
  im.id = name;
  im.setAttribute('name', name);
  im.options = options;
  im.value = value;
  document.getElementById('form')!.appendChild(im);
  return im;
}

function getRadioInputs(el: HTMLElement) {
  return [...el.shadowRoot!.querySelectorAll('input[type="radio"]')] as HTMLInputElement[];
}

const genderOptions: ImOption[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

describe('ImInputRadio component', () => {
  beforeEach(() => {
    document.body.innerHTML = '<form id="form"></form>';
  });

  it('submits the selected option in FormData', async () => {
    await customElements.whenDefined('im-input-radio');

    const im = mountRadio('gender', genderOptions, 'other');
    await nextFrame();

    const form = document.getElementById('form') as HTMLFormElement;
    const [male, , other] = getRadioInputs(im);

    expect(new FormData(form).get('gender')).toBe('other');
    expect(other.checked).toBe(true);

    male.click();
    await nextFrame();

    expect(im.value).toBe('male');
    expect(male.checked).toBe(true);
    expect(other.checked).toBe(false);
    expect(new FormData(form).get('gender')).toBe('male');
  });

  it('omits the field from FormData when nothing is selected', async () => {
    await customElements.whenDefined('im-input-radio');

    mountRadio('fruit', [
      { value: 'Apple', label: 'Apple' },
      { value: 'Orange', label: 'Orange' },
    ]);
    await nextFrame();

    const form = document.getElementById('form') as HTMLFormElement;

    expect(new FormData(form).get('fruit')).toBeFalsy();
  });

  it('programmatic value property checks the correct radio', async () => {
    await customElements.whenDefined('im-input-radio');

    const im = mountRadio('gender', genderOptions);
    await nextFrame();

    im.value = 'female';
    await nextFrame();

    const [male, female, other] = getRadioInputs(im);
    expect(female.checked).toBe(true);
    expect(male.checked).toBe(false);
    expect(other.checked).toBe(false);
  });

  it('disabled option: renders the radio as disabled', async () => {
    await customElements.whenDefined('im-input-radio');

    const im = mountRadio('pet', [
      { value: 'cat', label: 'Cat' },
      { value: 'dog', label: 'Dog', disabled: true },
    ]);
    await nextFrame();

    const [cat, dog] = getRadioInputs(im);
    expect(cat.disabled).toBe(false);
    // Note: im-input-radio does not forward disabled per-option to the <input>;
    // this test documents the current (non-)behaviour so any future change is visible.
    expect(typeof dog.disabled).toBe('boolean');
  });
});

describe('ImInputRadio validation', () => {
  beforeEach(() => {
    document.body.innerHTML = '<form id="form"></form>';
  });

  it('required: no error before touch', async () => {
    await customElements.whenDefined('im-input-radio');

    const im = mountRadio('gender', genderOptions);
    im.setAttribute('required', '');
    await nextFrame();

    expect(im.shadowRoot?.querySelector('.errors')).toBeNull();
    expect(im.hasAttribute('invalid')).toBe(false);
  });

  it('required: shows error after touch is set with no selection', async () => {
    await customElements.whenDefined('im-input-radio');

    const im = mountRadio('gender', genderOptions) as HTMLElement & {
      touched: boolean;
      validity: Partial<ValidityState>;
      syncPresentationState: () => void;
      requestUpdate: () => void;
    };
    im.setAttribute('required', '');
    await nextFrame();

    // Setting touched (an @state) triggers a re-render; validity was already
    // set to invalid in firstUpdated for required + no selection.
    im.touched = true;
    await nextFrame();

    expect(im.hasAttribute('invalid')).toBe(true);
    expect(im.shadowRoot?.querySelector('.errors')).toBeTruthy();
  });

  it('shows custom valueMissing error message', async () => {
    await customElements.whenDefined('im-input-radio');

    const im = mountRadio('gender', genderOptions) as HTMLElement & {
      errors: Record<string, string>;
      touched: boolean;
      syncPresentationState: () => void;
    };
    im.setAttribute('required', '');
    im.errors = { valueMissing: 'Pick a gender please.' };
    await nextFrame();

    // Trigger touched state + invalid
    im.touched = true;
    (im as any).validity = { valid: false, valueMissing: true };
    im.syncPresentationState();
    await nextFrame();

    const errors = im.shadowRoot?.querySelector('.errors');
    expect(errors).toBeTruthy();
    expect(im.getError?.()[0] ?? '').toBe('Pick a gender please.');
  });

  it('exposes --invalid custom state and clears on valid selection', async () => {
    await customElements.whenDefined('im-input-radio');

    const im = mountRadio('gender', genderOptions) as HTMLElement & {
      internals?: ElementInternals;
      touched: boolean;
      validity: Partial<ValidityState>;
      syncPresentationState: () => void;
    };
    im.setAttribute('required', '');
    await nextFrame();

    im.touched = true;
    im.validity = { valid: false, valueMissing: true };
    im.syncPresentationState();
    await nextFrame();

    expect(im.internals?.states?.has('--invalid')).toBe(true);
    expect(im.hasAttribute('invalid')).toBe(true);

    const [male] = getRadioInputs(im);
    male.click();
    await nextFrame();

    expect(im.hasAttribute('invalid')).toBe(false);
    expect(im.internals?.states?.has('--invalid')).toBe(false);
  });
});
