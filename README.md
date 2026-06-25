# im-components

A small collection of lightweight web components for personal use.

Includes simple custom inputs used across personal projects (checkbox, radio, text input).

Usage

- Open `index.html` in a browser to view a demo.
- Import or bundle the files from `src/` into your project as needed.

Notes

- Intended for personal use; no formal API guarantees.
- Feel free to open an issue or PR if you'd like to collaborate.

## `im-form` — work in progress

`im-form` (`src/form/im-form.ts`) is intended to become a **swap-in replacement for `<form>` / `HTMLFormElement`**, wrapping form-associated custom elements (`im-input`, `im-select`, etc.) that participate via `ElementInternals`.

### Current implementation

On `connectedCallback`, `im-form`:

1. Sets `display: contents` on the host so layout is not broken.
2. Forwards `class` from the host to an inner native `<form>` (e.g. `class="form"` grid styles in `index.html`).
3. **Reparents** all light-DOM children into that inner `<form>`.

Reparenting is required. An earlier shadow-DOM + `<slot>` approach was abandoned because:

- Slotted children stay in the light DOM; they are **not** DOM descendants of the inner `<form>`.
- The `form="…"` attribute **does not resolve across shadow boundaries** — a control in light DOM cannot reference a `<form id="…">` inside a shadow root.
- As a result, `button.form` and `control.internals.form` were both `null`, so submit never fired and `FormData` was empty.

Demo usage: `index.html` lines ~226–297 (`<im-form class="form …">` with `im-select` children).

On submit, the inner form’s handler calls `preventDefault()`, builds a plain object from `FormData`, and dispatches a **custom** `submit` event on the host with `{ detail: data }`.

### Goal (not yet done)

Make `<im-form>` behave like a native `<form>` for typical consumer code:

```js
form.addEventListener('submit', (e) => { … });
new FormData(form);
form.requestSubmit();
form.reset();
form.checkValidity();
form.elements.namedItem('food');
```

Today, only the **inner** `imForm.form` (`HTMLFormElement`) has most of that behavior. The host `<im-form>` is still a plain `HTMLElement`.

### What is missing (gap analysis)

#### Identity / type

- `im-form instanceof HTMLFormElement` → `false`
- `new FormData(imForm)` → wrong target (must use `imForm.form` or delegate)
- `document.querySelectorAll('form')` finds the inner form, not `<im-form>` hosts

#### Attributes not forwarded to inner `<form>`

If set on `<im-form>`, these are currently **ignored**:

| Attribute | Purpose |
|-----------|---------|
| `action` | Submission URL |
| `method` | `get` / `post` / `dialog` |
| `enctype` | Encoding (`application/x-www-form-urlencoded`, `multipart/form-data`, …) |
| `target` | Browsing context for submission |
| `name` | Form name (`document.forms`) |
| `id` | **Critical** — `form="…"` on external controls must reference a real `<form id>` |
| `novalidate` | Skip validation on submit |
| `autocomplete` | Form-wide autocomplete |
| `accept-charset` | Character encoding |

`id` on `<im-form>` stays on the host, not the inner form, so `form="myId"` association breaks unless `id` is mirrored inward.

#### Properties / collections (on host)

- `elements` — `HTMLFormControlsCollection`
- `length` — number of associated controls
- `action`, `method`, `enctype`, `target`, `name`, `noValidate`, `autocomplete`, `rel`, `acceptCharset`

#### Methods (on host)

| Method | Native behavior |
|--------|-----------------|
| `requestSubmit(submitter?)` | Validate, then fire `submit` |
| `submit()` | Programmatic submit (does not fire `submit` event) |
| `reset()` | Reset controls; fire `reset` |
| `checkValidity()` | Form-level validity |
| `reportValidity()` | Show validation UI; return boolean |

#### Events

| Event | Gap |
|-------|-----|
| `submit` | Inner handler always `preventDefault()`; host gets `CustomEvent`, not native `SubmitEvent` with `submitter` |
| `reset` | Not forwarded to host |
| `formdata` | `FormDataEvent` not fired on host |

#### Other behavior

- Native navigation on submit (`action` + `method`) is always blocked.
- `method="dialog"` + `<dialog>` not supported on host.
- CSS `form { … }` styles the inner form, not `<im-form>`.
- Host has no implicit `form` accessibility role (inner `<form>` does).

#### Known interaction with `index.html`

The page script at the bottom uses `document.querySelectorAll('form')` and attaches `submit` listeners there. That works for plain `<form>` and for `im-form`’s **inner** form, but not for listeners attached directly to `<im-form>` unless delegation is added.

### Suggested implementation tiers (pick up here)

**Tier A — Wrapper with delegation (recommended next step)**  
Keep `<im-form>` as an autonomous custom element. Forward attributes via `observedAttributes` / `attributeChangedCallback`, delegate methods and key properties to `this.form`, re-dispatch native `submit` / `reset` / `formdata` to the host. Still not `instanceof HTMLFormElement`.

**Tier B — API-compatible autonomous CE**  
Tier A plus: mirror `id` and `name`, expose `elements` / `length` getters, document that `new FormData(imForm)` requires a custom approach (e.g. `FormData(imForm.form)` or a documented helper) since `FormData` cannot be hooked.

**Tier C — True semantic `<form>`**  
Customized built-in: `<form is="im-form">` extending `HTMLFormElement`. Genuinely is a form, but tag name stays `form`, not `im-form`.

### Priority order (when implementing)

1. Attribute forwarding — especially `id`, `name`, `action`, `method`, `novalidate`
2. Method delegation — `requestSubmit`, `reset`, `checkValidity`, `reportValidity`
3. Native `submit` semantics — do not always `preventDefault`; let consumers decide; preserve `submitter` if possible
4. `elements` / `length` getters
5. `reset` event (for `<button type="reset">`)
6. `formdata` event (fetch / progressive-enhancement patterns)

### Files to touch when continuing

- `src/form/im-form.ts` — main implementation
- `index.html` — demo block ~226–297; bottom `querySelectorAll('form')` script
- `src/index.ts` — already imports `im-form`
- Tests — add `test/ImForm.test.ts` (none exists yet); follow patterns in `test/ImInput.test.ts` / `test/ImSelect.test.ts`

### TODO
