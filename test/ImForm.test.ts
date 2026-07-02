import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../src/form/im-form';

async function nextFrame() {
  return new Promise((r) => setTimeout(r, 0));
}

/**
 * Triggers the inner form's submit handler. jsdom does not implement
 * requestSubmit(), so we dispatch the submit event directly on the form.
 */
function submitForm(form: HTMLFormElement) {
  form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
}

/**
 * ImForm dispatches a CustomEvent('submit', { detail: ... }) on the host.
 * The native SubmitEvent also bubbles to the host as it propagates through
 * the DOM. We only care about the custom one with the parsed data.
 */
function captureCustomSubmit(el: HTMLElement) {
  const calls: CustomEvent[] = [];
  el.addEventListener('submit', (e) => {
    if (e instanceof CustomEvent && e.detail != null) {
      calls.push(e as CustomEvent);
    }
  });
  return calls;
}

describe('ImForm', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('moves light-DOM children into a native <form> on connect', async () => {
    document.body.innerHTML = `
      <im-form id="f">
        <input name="x" value="hello">
      </im-form>
    `;
    await nextFrame();

    const imForm = document.getElementById('f') as any;
    const form = imForm.form as HTMLFormElement;

    expect(form.tagName).toBe('FORM');
    expect(form.querySelector('input[name="x"]')).toBeTruthy();
  });

  it('prevents the native submit default action', async () => {
    document.body.innerHTML = `
      <im-form id="f">
        <input name="x" value="hello">
      </im-form>
    `;
    await nextFrame();

    const imForm = document.getElementById('f') as any;
    const form = imForm.form as HTMLFormElement;

    let prevented = false;
    form.addEventListener('submit', (e) => { prevented = e.defaultPrevented; });
    submitForm(form);

    expect(prevented).toBe(true);
  });

  it('dispatches a custom submit event on the host with parsed form data', async () => {
    document.body.innerHTML = `
      <im-form id="f">
        <input name="username" value="alice">
      </im-form>
    `;
    await nextFrame();

    const imForm = document.getElementById('f') as HTMLElement;
    const calls = captureCustomSubmit(imForm);

    submitForm((imForm as any).form);
    await nextFrame();

    expect(calls).toHaveLength(1);
    expect(calls[0].detail).toEqual({ username: 'alice' });
  });

  it('scalar value for single-entry fields', async () => {
    document.body.innerHTML = `
      <im-form id="f">
        <input name="color" value="red">
      </im-form>
    `;
    await nextFrame();

    const imForm = document.getElementById('f') as HTMLElement;
    const calls = captureCustomSubmit(imForm);
    submitForm((imForm as any).form);
    await nextFrame();

    expect(typeof calls[0].detail.color).toBe('string');
    expect(calls[0].detail.color).toBe('red');
  });

  it('array value for multi-entry fields (same name)', async () => {
    document.body.innerHTML = `
      <im-form id="f">
        <select name="fruit" multiple id="s">
          <option value="apple" selected>Apple</option>
          <option value="banana" selected>Banana</option>
        </select>
      </im-form>
    `;
    await nextFrame();

    const imForm = document.getElementById('f') as HTMLElement;
    const calls = captureCustomSubmit(imForm);
    submitForm((imForm as any).form);
    await nextFrame();

    expect(Array.isArray(calls[0].detail.fruit)).toBe(true);
    expect(calls[0].detail.fruit).toEqual(['apple', 'banana']);
  });

  it('multiple named fields each appear in the detail object', async () => {
    document.body.innerHTML = `
      <im-form id="f">
        <input name="first" value="John">
        <input name="last" value="Doe">
      </im-form>
    `;
    await nextFrame();

    const imForm = document.getElementById('f') as HTMLElement;
    const calls = captureCustomSubmit(imForm);
    submitForm((imForm as any).form);
    await nextFrame();

    expect(calls[0].detail).toEqual({ first: 'John', last: 'Doe' });
  });

  it('empty form submits with an empty detail object', async () => {
    document.body.innerHTML = `<im-form id="f"></im-form>`;
    await nextFrame();

    const imForm = document.getElementById('f') as HTMLElement;
    const calls = captureCustomSubmit(imForm);
    submitForm((imForm as any).form);
    await nextFrame();

    expect(calls).toHaveLength(1);
    expect(calls[0].detail).toEqual({});
  });

  it('no longer dispatches custom submit after disconnectedCallback removes the listener', async () => {
    document.body.innerHTML = `<im-form id="f"><input name="x" value="y"></im-form>`;
    await nextFrame();

    const imForm = document.getElementById('f') as HTMLElement;
    const form = (imForm as any).form as HTMLFormElement;
    const calls = captureCustomSubmit(imForm);

    imForm.remove();
    await nextFrame();

    submitForm(form);
    await nextFrame();

    // #onSubmit listener was removed in disconnectedCallback, so no CustomEvent
    expect(calls).toHaveLength(0);
  });
});
