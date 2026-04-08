# Utilities

Three modules in `theme/frontend/lib/` provide shared functionality to all islands.

## events.js

**Path:** `theme/frontend/lib/events.js`

The event system for inter-component communication. See [Event System](./event-system) for architecture and the event catalog.

### `Events`

String constants for event type names. Use these instead of raw strings to catch typos at import time.

```js
import { Events } from '@/lib/events'
```

| Constant | Value | Scope |
|----------|-------|-------|
| `Events.CART_ADDED` | `'cart:added'` | Global (`document`) |
| `Events.CART_UPDATED` | `'cart:updated'` | Global (`document`) |
| `Events.CART_ERROR` | `'cart:error'` | Global (`document`) |
| `Events.VARIANT_CHANGED` | `'variant:changed'` | Local (bubbles) |

### `createEvent(type, detail)`

Creates a `CustomEvent` with `bubbles: true`.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | `string` | required | Event type, typically from `Events` |
| `detail` | `object` | `{}` | Payload on `event.detail` |

**Returns:** `CustomEvent`

```js
document.dispatchEvent(
  createEvent(Events.CART_ADDED, {
    source: 'product-form',
    productId: data.id,
    sections: data.sections,
    activeElement,
  })
)
```

### `listen(target, type, handler)`

Subscribes to an event with automatic `AbortController` wiring. Returns the controller for cleanup in `disconnectedCallback`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | `EventTarget` | Element or `document` to listen on |
| `type` | `string` | Event type |
| `handler` | `Function` | Event handler |

**Returns:** `AbortController`

```js
connectedCallback() {
  this.eventControllers = [
    listen(document, Events.CART_ADDED, this.onCartAdded.bind(this)),
    listen(document, Events.CART_UPDATED, this.onCartUpdated.bind(this)),
  ]
}

disconnectedCallback() {
  for (const c of this.eventControllers ?? []) {
    c.abort()
  }
}
```

---

## a11y.js

**Path:** `theme/frontend/lib/a11y.js`

Accessibility utilities for focus management, keyboard navigation, and ARIA attributes.

### `getFocusableElements(container)`

Returns all visible, focusable elements within a container.

| Parameter | Type | Description |
|-----------|------|-------------|
| `container` | `Element` | DOM element to search within |

**Returns:** `Element[]`

**Matched selectors:** `summary`, `a[href]`, `button:enabled`, `[tabindex]:not([tabindex^='-'])`, `[draggable]`, `area`, `input:not([type=hidden]):enabled`, `select:enabled`, `textarea:enabled`, `object`, `iframe`.

```js
const focusable = getFocusableElements(this.querySelector('.modal-content'))
if (focusable.length > 0) focusable[0].focus()
```

### `trapFocus(container, elementToFocus)`

Traps keyboard focus within a container. Tab wraps from last to first; Shift+Tab wraps from first to last. Only one trap can be active — calling `trapFocus` again removes the previous one.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `container` | `Element` | required | Element to trap focus within |
| `elementToFocus` | `Element` | `container` | Element to focus immediately |

```js
open() {
  this.detailsContainer.setAttribute('open', true)
  document.body.classList.add('overflow-hidden')
  trapFocus(
    this.detailsContainer.querySelector('[tabindex="-1"]'),
    this.detailsContainer.querySelector('input:not([type="hidden"])')
  )
}
```

### `removeTrapFocus(elementToFocus)`

Removes the active focus trap and optionally returns focus to a specific element.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `elementToFocus` | `Element \| null` | `null` | Element to focus after removing trap. `null` = don't move focus. |

```js
close(focusToggle = true) {
  removeTrapFocus(focusToggle ? this.summaryToggle : null)
  this.detailsContainer.removeAttribute('open')
  document.body.classList.remove('overflow-hidden')
}
```

### `onKeyUpEscape(event)`

Handles Escape on `<details>` elements. Closes the nearest open `<details>` ancestor, updates `aria-expanded`, and returns focus to `<summary>`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | `KeyboardEvent` | The `keyup` event |

```js
this.detailsContainer.addEventListener('keyup', onKeyUpEscape, { signal })
```

### `initDisclosureWidgets(summaries)`

Initializes ARIA attributes and keyboard behavior for `<summary>` elements. Sets `role="button"`, `aria-expanded`, `aria-controls`, and wires up click/keyup handlers.

| Parameter | Type | Description |
|-----------|------|-------------|
| `summaries` | `NodeList \| Element[]` | `<summary>` elements to initialize |

```js
// From theme.js entry point
const summaries = document.querySelectorAll('[id^="Details-"] summary')
initDisclosureWidgets(summaries)
```

---

## utils.js

**Path:** `theme/frontend/lib/utils.js`

### `fetchConfig(type)`

Returns a config object for `fetch()` POST requests with JSON headers.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | `string` | `'json'` | `Accept` header media subtype |

**Returns:**

```js
{
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
}
```

```js
const response = await fetch(window.routes.cart_change_url, {
  ...fetchConfig(),
  body: JSON.stringify({ line, quantity }),
  signal: this.controller.signal,
})
```

### `debounce(fn, wait)`

Returns a debounced function that delays invocation until `wait` ms after the last call.

| Parameter | Type | Description |
|-----------|------|-------------|
| `fn` | `Function` | Function to debounce |
| `wait` | `number` | Delay in milliseconds |

**Returns:** `Function`

```js
constructor() {
  super()
  this.debouncedOnChange = debounce((event) => {
    this.onChange(event)
  }, 300)
}

connectedCallback() {
  this.controller = new AbortController()
  this.addEventListener('change', this.debouncedOnChange, {
    signal: this.controller.signal,
  })
}
```

---

## Import summary

```js
// Event system
import { Events, createEvent, listen } from '@/lib/events'

// Accessibility
import {
  getFocusableElements,
  trapFocus,
  removeTrapFocus,
  onKeyUpEscape,
  initDisclosureWidgets,
} from '@/lib/a11y'

// Helpers
import { fetchConfig, debounce } from '@/lib/utils'
```

## Next steps

- [Event System](./event-system) — How events flow between components
- [Lifecycle](./lifecycle) — Where to use these utilities in the component lifecycle
- [Creating Islands](./creating-islands) — End-to-end island creation tutorial
