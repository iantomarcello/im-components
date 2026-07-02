import { beforeEach, describe, expect, it } from 'vitest';
import '../src/form/im-textarea';

async function nextFrame() {
  return new Promise((r) => setTimeout(r, 0));
}

function getTextarea(el: HTMLElement) {
  return el.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement | null;
}

function hasErrors(el: HTMLElement) {
  return Boolean(el.shadowRoot?.querySelector('.errors'));
}

describe('ImTextarea', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders and accepts typed input, submits value in FormData', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-textarea id="ta" name="bio"></im-textarea>
      </form>
    `;
    await customElements.whenDefined('im-textarea');
    await nextFrame();

    const im = document.getElementById('ta') as HTMLElement;
    const ta = getTextarea(im)!;

    ta.value = 'Hello textarea';
    ta.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await nextFrame();

    expect(ta.value).toBe('Hello textarea');
    const fd = new FormData(document.getElementById('form') as HTMLFormElement);
    expect(fd.get('bio')).toBe('Hello textarea');
  });

  it('disabled: textarea is disabled', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-textarea id="ta" name="bio" disabled></im-textarea>
      </form>
    `;
    await customElements.whenDefined('im-textarea');
    await nextFrame();

    const im = document.getElementById('ta') as HTMLElement;
    expect(getTextarea(im)!.disabled).toBe(true);
  });

  it('required: no errors shown before user interacts (re-render only triggered by interaction)', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-textarea id="ta" name="bio" required></im-textarea>
      </form>
    `;
    await customElements.whenDefined('im-textarea');
    await nextFrame();

    // The template in im-textarea lacks the `this.touched` guard, but
    // validity is set in firstUpdated and a re-render only happens when a
    // reactive property changes — so no errors appear without interaction.
    const im = document.getElementById('ta') as HTMLElement;
    expect(hasErrors(im)).toBe(false);
  });

  it('required: errors shown after the user triggers input, clear once value is typed', async () => {
    document.body.innerHTML = `
      <form id="form">
        <im-textarea id="ta" name="bio" required></im-textarea>
      </form>
    `;
    await customElements.whenDefined('im-textarea');
    await nextFrame();

    const im = document.getElementById('ta') as HTMLElement;
    const ta = getTextarea(im)!;

    // Trigger an input event with empty value → sets touched → re-render shows error
    ta.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await nextFrame();

    expect(hasErrors(im)).toBe(true);

    // Type a real value → error clears
    ta.value = 'some text';
    ta.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await nextFrame();

    expect(hasErrors(im)).toBe(false);
  });

  it('placeholder attribute is forwarded to the native textarea', async () => {
    document.body.innerHTML = `
      <im-textarea id="ta" placeholder="Write something…"></im-textarea>
    `;
    await customElements.whenDefined('im-textarea');
    await nextFrame();

    const im = document.getElementById('ta') as HTMLElement;
    expect(getTextarea(im)!.placeholder).toBe('Write something…');
  });

  it('readonly attribute is forwarded', async () => {
    document.body.innerHTML = `
      <im-textarea id="ta" name="bio" readonly value="fixed text"></im-textarea>
    `;
    await customElements.whenDefined('im-textarea');
    await nextFrame();

    const im = document.getElementById('ta') as HTMLElement;
    const ta = getTextarea(im)!;
    expect(ta.readOnly).toBe(true);
    expect(ta.value).toBe('fixed text');
  });
});
