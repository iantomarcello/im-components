import { beforeEach, describe, expect, it } from 'vitest';
import '../src/form/im-select';

async function nextFrame() {
  return new Promise((r) => setTimeout(r, 0));
}

function getInnerSelect(el: HTMLElement) {
  return el.shadowRoot?.querySelector('select') as HTMLSelectElement | null;
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
