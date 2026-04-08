# Utilities

Three utility modules provide shared functionality to all islands. They live in `theme/frontend/lib/` and are imported via the `@/` alias.

## events.js

**Path:** `theme/frontend/lib/events.js`

The event system for inter-component communication. See the [Event System](./event-system) page for full architectural documentation, the event catalog, and usage patterns.

### `Events`

An object of string constants for event type names.

```js
import { Events } from '@/lib/events'
```

| Constant | Value | Scope |
|----------|-------|-------|
| `Events.CART_ADDED` | `'cart:added'` | Global (`document`) |
| `Events.CART_UPDATED` | `'cart:updated'` | Global (`document`) |
| `Events.CART_ERROR` | `'cart:error'` | Global (`document`) |
| `Events.VARIANT_CHANGED` | `'variant:changed'` | Local (bubbles from component) |

Always use the constants instead of raw strings to catch typos at import time.

### `createEvent(type, detail)`

Creates a `CustomEvent` with `bubbles: true`.

```js
import { createEvent, Events } from '@/lib/events'
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | `string` | (required) | Event type, typically from `Events` constants |
| `detail` | `object` | `{}` | Payload attached to `event.detail` |

**Returns:** `CustomEvent`

**Example:**

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

Subscribes to an event with automatic `AbortController` wiring. Returns the controller so callers can abort the listener in `disconnectedCallback`.

```js
import { listen, Events } from '@/lib/events'
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | `EventTarget` | Element or `document` to listen on |
| `type` | `string` | Event type |
| `handler` | `Function` | Event handler function |

**Returns:** `AbortController` -- call `.abort()` to remove the listener.

**Example:**

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

Returns all visible, focusable elements within a container. Uses the same visibility check as jQuery's `:visible` selector (checks `offsetWidth`, `offsetHeight`, and `getClientRects().length`).

```js
import { getFocusableElements } from '@/lib/a11y'
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `container` | `Element` | DOM element to search within |

**Returns:** `Element[]` -- array of visible focusable elements.

**Matched selectors:** `summary`, `a[href]`, `button:enabled`, `[tabindex]:not([tabindex^='-'])`, `[draggable]`, `area`, `input:not([type=hidden]):enabled`, `select:enabled`, `textarea:enabled`, `object`, `iframe`.

**Example:**

```js
const focusable = getFocusableElements(this.querySelector('.modal-content'))
if (focusable.length > 0) {
  focusable[0].focus()
}
```

### `trapFocus(container, elementToFocus)`

Traps keyboard focus within a container. When the user tabs past the last focusable element, focus wraps to the first. When they shift-tab before the first, focus wraps to the last. Only one focus trap can be active at a time -- calling `trapFocus` again automatically removes the previous trap.

```js
import { trapFocus } from '@/lib/a11y'
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `container` | `Element` | (required) | The element to trap focus within |
| `elementToFocus` | `Element` | `container` | The element to focus immediately |

**Returns:** `void`

**Example:**

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

```js
import { removeTrapFocus } from '@/lib/a11y'
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `elementToFocus` | `Element \| null` | `null` | Element to focus after removing the trap. Pass `null` to not move focus. |

**Returns:** `void`

**Example:**

```js
close(focusToggle = true) {
  removeTrapFocus(focusToggle ? this.summaryToggle : null)
  this.detailsContainer.removeAttribute('open')
  document.body.classList.remove('overflow-hidden')
}
```

### `onKeyUpEscape(event)`

Handles the Escape key on `<details>` elements. Closes the nearest open `<details>` ancestor, updates `aria-expanded`, and returns focus to the `<summary>`.

```js
import { onKeyUpEscape } from '@/lib/a11y'
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | `KeyboardEvent` | The `keyup` event |

**Returns:** `void`

**Behavior:**

1. Returns early if the key is not Escape.
2. Finds the closest `details[open]` ancestor of the event target.
3. Removes the `open` attribute.
4. Sets `aria-expanded="false"` on the summary.
5. Focuses the summary element.

**Example:**

```js
this.detailsContainer.addEventListener('keyup', onKeyUpEscape, { signal })
```

### `initDisclosureWidgets(summaries)`

Initializes ARIA attributes and keyboard behavior for a set of `<summary>` elements. Sets `role="button"` and `aria-expanded` on each summary, adds `aria-controls` if the next sibling has an `id`, and wires up click handlers to toggle `aria-expanded` and keyup handlers for Escape.

```js
import { initDisclosureWidgets } from '@/lib/a11y'
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `summaries` | `NodeList \| Element[]` | Collection of `<summary>` elements to initialize |

**Returns:** `void`

**Example (from theme.js entry point):**

```js
import { initDisclosureWidgets } from '@/lib/a11y'

const summaries = document.querySelectorAll('[id^="Details-"] summary')
initDisclosureWidgets(summaries)
```

---

## utils.js

**Path:** `theme/frontend/lib/utils.js`

General-purpose helper functions.

### `fetchConfig(type)`

Returns a configuration object for `fetch()` POST requests with JSON headers.

```js
import { fetchConfig } from '@/lib/utils'
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | `string` | `'json'` | The `Accept` header media subtype (e.g., `'json'` produces `application/json`) |

**Returns:** `object`

```js
{
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'  // or 'application/javascript', etc.
  }
}
```

**Example:**

```js
const body = JSON.stringify({ line, quantity })
const response = await fetch(window.routes.cart_change_url, {
  ...fetchConfig(),
  body,
  signal: this.controller.signal,
})
```

With a different accept type:

```js
const config = fetchConfig('javascript')
config.headers['X-Requested-With'] = 'XMLHttpRequest'
delete config.headers['Content-Type']
config.body = new FormData(this.form)

const response = await fetch(window.routes.cart_add_url, {
  ...config,
  signal: this.controller.signal,
})
```

### `debounce(fn, wait)`

Returns a debounced version of a function that delays invocation until `wait` milliseconds have elapsed since the last call.

```js
import { debounce } from '@/lib/utils'
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `fn` | `Function` | The function to debounce |
| `wait` | `number` | Delay in milliseconds |

**Returns:** `Function` -- the debounced wrapper.

**Example:**

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

## Import Summary

Quick reference for all available imports:

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

## Further Reading

- [Event System](./event-system) -- how events flow between components
- [Lifecycle](./lifecycle) -- where to use these utilities in the component lifecycle
- [Creating Islands](./creating-islands) -- end-to-end island creation tutorial
- [Component Reference](./component-reference) -- which islands use which utilities
