import { beforeEach, describe, expect, it } from 'vitest';
import '../src/form/im-input-range';

async function nextFrame() {
  return new Promise((r) => setTimeout(r, 0));
}

function getInnerRange(el: HTMLElement) {
  return el.shadowRoot?.querySelector('input[type="range"]') as HTMLInputElement | null;
}

function getWrapper(el: HTMLElement) {
  return el.shadowRoot?.querySelector('.input-wrapper') as HTMLElement | null;
}

function getCSSVar(el: HTMLElement, name: string) {
  return getWrapper(el)?.style.getPropertyValue(name) ?? '';
}

function mountRange(attrs: Record<string, string> = {}) {
  const im = document.createElement('im-input-range') as HTMLElement & {
    value: string;
    min: number | null;
    max: number | null;
    step: number;
    showControls: boolean;
  };
  im.setAttribute('name', 'vol');
  for (const [k, v] of Object.entries(attrs)) {
    im.setAttribute(k, v);
  }
  document.getElementById('form')!.appendChild(im);
  return im;
}

function getControlBtn(el: HTMLElement, sign: '+' | '-') {
  return [...el.shadowRoot!.querySelectorAll('button[value]')].find(
    (b) => (b as HTMLButtonElement).value === sign,
  ) as HTMLButtonElement | undefined;
}

describe('ImInputRange form value', () => {
  beforeEach(() => {
    document.body.innerHTML = '<form id="form"></form>';
  });

  it('submits the current range value in FormData', async () => {
    const im = mountRange({ value: '40', min: '0', max: '100' });
    await customElements.whenDefined('im-input-range');
    await nextFrame();

    const fd = new FormData(document.getElementById('form') as HTMLFormElement);
    expect(fd.get('vol')).toBe('40');
  });

  it('renders the inner range input', async () => {
    const im = mountRange({ value: '50', min: '0', max: '100' });
    await customElements.whenDefined('im-input-range');
    await nextFrame();

    const range = getInnerRange(im);
    expect(range).not.toBeNull();
    expect(range!.value).toBe('50');
  });

  it('updates form value when user drags slider', async () => {
    const im = mountRange({ value: '20', min: '0', max: '100' });
    await customElements.whenDefined('im-input-range');
    await nextFrame();

    const range = getInnerRange(im)!;
    range.value = '60';
    range.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await nextFrame();

    expect((im as any).value).toBe('60');
    const fd = new FormData(document.getElementById('form') as HTMLFormElement);
    expect(fd.get('vol')).toBe('60');
  });
});

describe('ImInputRange CSS variable sync', () => {
  beforeEach(() => {
    document.body.innerHTML = '<form id="form"></form>';
  });

  it('sets --value CSS var after firstUpdated', async () => {
    const im = mountRange({ value: '30', min: '0', max: '100' });
    await customElements.whenDefined('im-input-range');
    await nextFrame();
    await nextFrame(); // second frame for firstUpdated to propagate

    expect(getCSSVar(im, '--value')).toBe('30');
  });

  it('updates --value CSS var when value property changes', async () => {
    const im = mountRange({ value: '10', min: '0', max: '100' });
    await customElements.whenDefined('im-input-range');
    await nextFrame();

    (im as any).value = '75';
    await nextFrame();
    await nextFrame();

    expect(getCSSVar(im, '--value')).toBe('75');
  });

  it('sets --min and --max CSS vars matching attributes', async () => {
    const im = mountRange({ value: '5', min: '2', max: '50' });
    await customElements.whenDefined('im-input-range');
    await nextFrame();
    await nextFrame();

    expect(getCSSVar(im, '--min')).toBe('2');
    expect(getCSSVar(im, '--max')).toBe('50');
  });

  it('updates --max CSS var when max property changes', async () => {
    const im = mountRange({ value: '10', min: '0', max: '100' });
    await customElements.whenDefined('im-input-range');
    await nextFrame();

    (im as any).max = 200;
    await nextFrame();
    await nextFrame();

    expect(getCSSVar(im, '--max')).toBe('200');
  });
});

describe('ImInputRange showControls buttons', () => {
  beforeEach(() => {
    document.body.innerHTML = '<form id="form"></form>';
  });

  it('renders + and - buttons when showControls is set', async () => {
    const im = mountRange({ value: '50', min: '0', max: '100' });
    await customElements.whenDefined('im-input-range');
    (im as any).showControls = true;
    await nextFrame();

    expect(getControlBtn(im, '+')).toBeTruthy();
    expect(getControlBtn(im, '-')).toBeTruthy();
  });

  it('+ button increments value by step', async () => {
    const im = mountRange({ value: '50', min: '0', max: '100' });
    await customElements.whenDefined('im-input-range');
    (im as any).showControls = true;
    await nextFrame();

    const btn = getControlBtn(im, '+')!;
    btn.dispatchEvent(new PointerEvent('click', { bubbles: true }));
    await nextFrame();

    expect((im as any).value).toBe('51');
  });

  it('- button decrements value by step', async () => {
    const im = mountRange({ value: '50', min: '0', max: '100' });
    await customElements.whenDefined('im-input-range');
    (im as any).showControls = true;
    await nextFrame();

    const btn = getControlBtn(im, '-')!;
    btn.dispatchEvent(new PointerEvent('click', { bubbles: true }));
    await nextFrame();

    expect((im as any).value).toBe('49');
  });

  it('+ button does not exceed max', async () => {
    const im = mountRange({ value: '100', min: '0', max: '100' });
    await customElements.whenDefined('im-input-range');
    (im as any).showControls = true;
    await nextFrame();

    const btn = getControlBtn(im, '+')!;
    btn.dispatchEvent(new PointerEvent('click', { bubbles: true }));
    await nextFrame();

    expect((im as any).value).toBe('100');
  });

  it('- button does not go below min', async () => {
    const im = mountRange({ value: '0', min: '0', max: '100' });
    await customElements.whenDefined('im-input-range');
    (im as any).showControls = true;
    await nextFrame();

    const btn = getControlBtn(im, '-')!;
    btn.dispatchEvent(new PointerEvent('click', { bubbles: true }));
    await nextFrame();

    expect((im as any).value).toBe('0');
  });

  it('Ctrl key multiplies step by 10', async () => {
    const im = mountRange({ value: '50', min: '0', max: '100' });
    await customElements.whenDefined('im-input-range');
    (im as any).showControls = true;
    await nextFrame();

    const btn = getControlBtn(im, '+')!;
    btn.dispatchEvent(new PointerEvent('click', { bubbles: true, ctrlKey: true }));
    await nextFrame();

    expect((im as any).value).toBe('60');
  });

  it('Shift key multiplies step by 100; result clamped to max so value is unchanged', async () => {
    const im = mountRange({ value: '50', min: '0', max: '100' });
    await customElements.whenDefined('im-input-range');
    (im as any).showControls = true;
    await nextFrame();

    const btn = getControlBtn(im, '+')!;
    btn.dispatchEvent(new PointerEvent('click', { bubbles: true, shiftKey: true }));
    await nextFrame();

    // 50 + 100 = 150 > max(100) → clamped, value stays 50
    expect((im as any).value).toBe('50');
  });

  it('disabled: + and - buttons are disabled', async () => {
    const im = mountRange({ value: '50', min: '0', max: '100', disabled: '' });
    await customElements.whenDefined('im-input-range');
    (im as any).showControls = true;
    await nextFrame();

    expect(getControlBtn(im, '+')!.disabled).toBe(true);
    expect(getControlBtn(im, '-')!.disabled).toBe(true);
  });
});
