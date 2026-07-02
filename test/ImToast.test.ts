import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../src/im-toast';

async function nextFrame() {
  return new Promise((r) => setTimeout(r, 0));
}

type ImToastEl = HTMLElement & {
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number | null, hasClose?: boolean) => void;
  removeToast: (id: string) => void;
  toasts: { id: string; type: string; message: string; hasClose: boolean }[];
};

function mount() {
  const el = document.createElement('im-toast') as ImToastEl;
  document.body.appendChild(el);
  return el;
}

function getToasts(el: ImToastEl) {
  return [...(el.shadowRoot?.querySelectorAll('.toast') ?? [])] as HTMLElement[];
}

describe('ImToast', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders a toast when addToast is called', async () => {
    const el = mount();
    await customElements.whenDefined('im-toast');
    await nextFrame();

    el.addToast('Hello world', 'info', null);
    await nextFrame();

    const toasts = getToasts(el);
    expect(toasts).toHaveLength(1);
    expect(toasts[0].textContent).toContain('Hello world');
  });

  it('applies the correct type class to the toast element', async () => {
    const el = mount();
    await customElements.whenDefined('im-toast');
    await nextFrame();

    el.addToast('Success!', 'success', null);
    await nextFrame();

    expect(getToasts(el)[0].classList.contains('success')).toBe(true);
  });

  it('renders multiple toasts', async () => {
    const el = mount();
    await customElements.whenDefined('im-toast');
    await nextFrame();

    el.addToast('First', 'info', null);
    el.addToast('Second', 'error', null);
    await nextFrame();

    expect(getToasts(el)).toHaveLength(2);
  });

  it('removeToast removes the correct toast by id', async () => {
    const el = mount();
    await customElements.whenDefined('im-toast');
    await nextFrame();

    el.addToast('Keep me', 'info', null);
    el.addToast('Remove me', 'warning', null);
    await nextFrame();

    el.removeToast(el.toasts[1].id);
    await nextFrame();

    expect(getToasts(el)).toHaveLength(1);
    expect(getToasts(el)[0].textContent).toContain('Keep me');
  });

  it('renders a close button when hasClose is false', async () => {
    const el = mount();
    await customElements.whenDefined('im-toast');
    await nextFrame();

    el.addToast('Has close', 'info', null, false);
    await nextFrame();

    expect(el.shadowRoot?.querySelector('.close-button')).toBeTruthy();
  });

  it('close button removes the toast when clicked', async () => {
    const el = mount();
    await customElements.whenDefined('im-toast');
    await nextFrame();

    el.addToast('Click to close', 'info', null, false);
    await nextFrame();

    const closeBtn = el.shadowRoot?.querySelector('.close-button') as HTMLButtonElement;
    closeBtn.click();
    await nextFrame();

    expect(getToasts(el)).toHaveLength(0);
  });

  it('does not render a close button when hasClose is true', async () => {
    const el = mount();
    await customElements.whenDefined('im-toast');
    await nextFrame();

    el.addToast('No close btn', 'info', null, true);
    await nextFrame();

    expect(el.shadowRoot?.querySelector('.close-button')).toBeNull();
  });
});

describe('ImToast auto-dismiss', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('auto-dismisses after the specified duration', async () => {
    const el = mount();
    await customElements.whenDefined('im-toast');
    // With fake timers, use microtask-based flush instead of setTimeout
    await Promise.resolve();

    el.addToast('Goodbye soon', 'info', 2000);
    await Promise.resolve();

    expect(el.toasts).toHaveLength(1);

    vi.advanceTimersByTime(2000);
    await Promise.resolve();

    expect(el.toasts).toHaveLength(0);
  });

  it('does not auto-dismiss when duration is null', async () => {
    const el = mount();
    await customElements.whenDefined('im-toast');
    await Promise.resolve();

    el.addToast('Persistent', 'info', null);
    await Promise.resolve();

    vi.advanceTimersByTime(60000);
    await Promise.resolve();

    expect(el.toasts).toHaveLength(1);
  });
});
