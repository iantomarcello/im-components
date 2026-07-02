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
