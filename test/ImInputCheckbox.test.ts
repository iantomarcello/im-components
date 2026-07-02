import { beforeEach, describe, expect, it } from 'vitest';

import '../src/form/im-input-checkbox';

async function nextFrame() {
  return new Promise((r) => setTimeout(r, 0));
}

function getInnerInput(el: HTMLElement) {
  return el.shadowRoot?.querySelector('input') as HTMLInputElement | null;
}

describe('ImInputCheckbox component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('omits unchecked checkboxes from FormData and submits on when checked', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-input-checkbox id="cb" name="tnc"></im-input-checkbox>
      </form>
    `;
    await customElements.whenDefined('im-input-checkbox');
    await nextFrame();

    const im = document.getElementById('cb') as HTMLElement;
    const input = getInnerInput(im)!;
    const form = document.getElementById('form') as HTMLFormElement;

    expect(new FormData(form).get('tnc')).toBeFalsy();

    input.checked = true;
    input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    await nextFrame();

    expect((im as any).value).toBe('on');
    expect(new FormData(form).get('tnc')).toBe('on');

    input.checked = false;
    input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    await nextFrame();

    expect((im as any).value).toBe('');
    expect(new FormData(form).get('tnc')).toBeFalsy();
  });

  it('keeps form value in sync when toggled via label click', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-input-checkbox id="cb" name="agree" label="I agree"></im-input-checkbox>
      </form>
    `;
    await customElements.whenDefined('im-input-checkbox');
    await nextFrame();

    const im = document.getElementById('cb') as HTMLElement;
    const input = getInnerInput(im)!;
    const form = document.getElementById('form') as HTMLFormElement;

    input.click();
    await nextFrame();

    expect(input.checked).toBe(true);
    expect(new FormData(form).get('agree')).toBe('on');

    input.click();
    await nextFrame();

    expect(input.checked).toBe(false);
    expect(new FormData(form).get('agree')).toBeFalsy();
  });
});
