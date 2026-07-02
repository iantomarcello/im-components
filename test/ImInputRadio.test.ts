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
});
