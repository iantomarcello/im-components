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

describe('ImInputCheckbox validation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('required: no error shown before touch', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-input-checkbox id="cb" name="tnc" required></im-input-checkbox>
      </form>
    `;
    await customElements.whenDefined('im-input-checkbox');
    await nextFrame();

    const im = document.getElementById('cb') as HTMLElement;
    expect(im.shadowRoot?.querySelector('.errors')).toBeNull();
    expect(im.hasAttribute('invalid')).toBe(false);
  });

  it('required: shows error after touch when unchecked', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-input-checkbox id="cb" name="tnc" required></im-input-checkbox>
      </form>
    `;
    await customElements.whenDefined('im-input-checkbox');
    await nextFrame();

    const im = document.getElementById('cb') as HTMLElement;
    const input = getInnerInput(im)!;

    input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    await nextFrame();

    expect(im.shadowRoot?.querySelector('.errors')).toBeTruthy();
    expect(im.hasAttribute('invalid')).toBe(true);
  });

  it('required: error clears after checking the box', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-input-checkbox id="cb" name="tnc" required></im-input-checkbox>
      </form>
    `;
    await customElements.whenDefined('im-input-checkbox');
    await nextFrame();

    const im = document.getElementById('cb') as HTMLElement;
    const input = getInnerInput(im)!;

    input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    await nextFrame();
    expect(im.shadowRoot?.querySelector('.errors')).toBeTruthy();

    input.checked = true;
    input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    await nextFrame();

    expect(im.shadowRoot?.querySelector('.errors')).toBeNull();
    expect(im.hasAttribute('invalid')).toBe(false);
  });

  it('shows custom valueMissing error message', async () => {
    const im = document.createElement('im-input-checkbox') as HTMLElement & {
      errors: Record<string, string>;
    };
    im.setAttribute('name', 'tnc');
    im.setAttribute('required', '');
    im.errors = { valueMissing: 'You must accept the terms.' };
    document.body.appendChild(im);

    await customElements.whenDefined('im-input-checkbox');
    await nextFrame();

    const input = getInnerInput(im)!;
    input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    await nextFrame();

    const errorText = im.shadowRoot?.querySelector('.errors')?.textContent?.trim() ?? '';
    expect(errorText).toBe('You must accept the terms.');
  });

  it('disabled: inner checkbox is disabled', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-input-checkbox id="cb" name="tnc" disabled></im-input-checkbox>
      </form>
    `;
    await customElements.whenDefined('im-input-checkbox');
    await nextFrame();

    const im = document.getElementById('cb') as HTMLElement;
    const input = getInnerInput(im)!;
    expect(input.disabled).toBe(true);
  });

  it('exposes --invalid custom state after touch and clears it when valid', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-input-checkbox id="cb" name="tnc" required></im-input-checkbox>
      </form>
    `;
    await customElements.whenDefined('im-input-checkbox');
    await nextFrame();

    const im = document.getElementById('cb') as HTMLElement & { internals?: ElementInternals };
    const input = getInnerInput(im)!;

    input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    await nextFrame();

    expect(im.internals?.states?.has('--invalid')).toBe(true);

    input.checked = true;
    input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    await nextFrame();

    expect(im.internals?.states?.has('--invalid')).toBe(false);
  });
});
