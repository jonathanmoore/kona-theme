# Lifecycle

Web Components define a set of lifecycle callbacks that the browser invokes at specific moments. Kona Theme uses these callbacks with a consistent pattern centered on `AbortController` for clean resource management.

## Lifecycle Callbacks

### `constructor()`

Called when the element is created (either by the parser or `document.createElement()`). At this point the element may not be in the DOM yet and has no parent or children in the document tree.

**Rules:**

- Always call `super()` first.
- Only set up static properties and read attributes that do not depend on the document context.
- Never add event listeners here (the element is not in the DOM; cleanup is unreliable).
- Never traverse the DOM beyond the element's own shadow/light DOM children.

```js
constructor() {
  super()
  this.form = this.querySelector('form')
  this.hasCartDrawer = !!document.querySelector('cart-drawer')
}
```

::: tip
Querying `this.querySelector()` in the constructor works because the browser upgrades elements after their children are parsed. However, querying `document.querySelector()` for elements outside the component is fragile -- they may not exist yet. Prefer moving such queries to `connectedCallback`.
:::

### `connectedCallback()`

Called when the element is inserted into the document. This is where all setup belongs: creating AbortControllers, adding event listeners, initializing state, starting observers.

```js
connectedCallback() {
  this.controller = new AbortController()
  const { signal } = this.controller

  this.addEventListener('change', this.onChange.bind(this), { signal })

  window.addEventListener('scroll', this.onScroll.bind(this), { signal })
}
```

### `disconnectedCallback()`

Called when the element is removed from the document. This happens frequently in Shopify themes because the Section Rendering API replaces entire sections of HTML. Any listeners or controllers not cleaned up will leak.

```js
disconnectedCallback() {
  this.controller?.abort()
}
```

The optional chaining (`?.`) guards against the case where `connectedCallback` was never called.

## The AbortController Pattern

Every island follows the same pattern for event listener and fetch cleanup:

```js
class MyIsland extends window.HTMLElement {
  connectedCallback() {
    // 1. Create the controller
    this.controller = new AbortController()
    const { signal } = this.controller

    // 2. Pass signal to every addEventListener
    this.addEventListener('click', this.onClick.bind(this), { signal })
    document.addEventListener('keydown', this.onKeyDown.bind(this), { signal })
    window.addEventListener('scroll', this.onScroll.bind(this), { signal })

    // 3. Pass signal to every fetch
    this.loadData()
  }

  disconnectedCallback() {
    // 4. One call aborts ALL listeners and in-flight fetches
    this.controller?.abort()
  }

  async loadData() {
    try {
      const response = await fetch(this.dataset.url, {
        signal: this.controller.signal,
      })
      const html = await response.text()
      this.innerHTML = html
    } catch (e) {
      // 5. Always handle AbortError -- it's expected, not a bug
      if (e.name !== 'AbortError') console.error(e)
    }
  }

  onClick(event) { /* ... */ }
  onKeyDown(event) { /* ... */ }
  onScroll() { /* ... */ }
}

window.customElements.define('my-island', MyIsland)
```

### Why One Controller Per Component

A single `AbortController` handles all listeners and fetch calls for the component. When `disconnectedCallback` fires, one `this.controller.abort()` call tears down everything at once. There is no need to track individual listener references or call `removeEventListener` manually.

### Multiple Controllers for Event System Listeners

When using the `listen()` helper from `@/lib/events`, each call returns its own `AbortController`. Store them separately and abort each one:

```js
import { Events, listen } from '@/lib/events'

connectedCallback() {
  this.controller = new AbortController()

  // DOM event listeners use the component controller
  this.addEventListener('keyup', this.onKeyUp.bind(this), {
    signal: this.controller.signal,
  })

  // Event system listeners return their own controllers
  this.eventControllers = [
    listen(document, Events.CART_ADDED, this.onCartAdded.bind(this)),
    listen(document, Events.CART_UPDATED, this.onCartUpdated.bind(this)),
  ]
}

disconnectedCallback() {
  this.controller?.abort()
  for (const c of this.eventControllers ?? []) {
    c.abort()
  }
}
```

## Signal on Fetch Calls

Always pass `signal: this.controller.signal` to `fetch()`. This ensures that in-flight network requests are cancelled when the component is removed from the DOM:

```js
async updateQuantity(line, quantity) {
  const body = JSON.stringify({ line, quantity })

  try {
    const response = await fetch(window.routes.cart_change_url, {
      ...fetchConfig(),
      body,
      signal: this.controller.signal,
    })
    const data = await response.json()
    // handle success
  } catch (e) {
    if (e.name === 'AbortError') return
    // handle real errors
  }
}
```

Without the signal, a fetch that completes after the component is removed will try to update DOM elements that no longer exist, causing errors.

## Anti-Patterns

### Adding Listeners in the Constructor

```js
// BAD -- no cleanup path, fires before element is in the DOM
constructor() {
  super()
  this.addEventListener('click', this.onClick)
  document.addEventListener('scroll', this.onScroll)
}
```

Listeners added in the constructor cannot be cleaned up with AbortController because the controller does not exist yet. Move all listener setup to `connectedCallback`.

### Missing disconnectedCallback

```js
// BAD -- listeners and fetch calls leak when the element is removed
connectedCallback() {
  this.controller = new AbortController()
  window.addEventListener('scroll', this.onScroll, {
    signal: this.controller.signal,
  })
}
// No disconnectedCallback -- controller is never aborted
```

Always implement `disconnectedCallback` to abort the controller. Shopify's Section Rendering API frequently replaces HTML, removing and re-inserting elements.

### Missing Signal on Fetch

```js
// BAD -- fetch continues after component removal
async loadData() {
  const response = await fetch(this.dataset.url)
  this.innerHTML = await response.text()
}
```

Always pass `{ signal: this.controller.signal }` to `fetch()`. Without it, the response handler runs after the element is removed, updating detached DOM nodes.

### Ignoring AbortError

```js
// BAD -- AbortError logged as a real error
async loadData() {
  try {
    const response = await fetch(url, { signal: this.controller.signal })
    // ...
  } catch (e) {
    console.error(e)  // Will log AbortError when component is removed
  }
}
```

Always check for `AbortError` before logging:

```js
catch (e) {
  if (e.name === 'AbortError') return
  console.error(e)
}
```

Or with an early return:

```js
catch (e) {
  if (e.name !== 'AbortError') console.error(e)
}
```

### Storing State on `this` in the Constructor That Depends on DOM Context

```js
// FRAGILE -- document.getElementById may return null if the target
// element hasn't been parsed yet
constructor() {
  super()
  this.header = document.getElementById('shopify-section-header')
  this.headerBounds = this.header.getBoundingClientRect()
}
```

Move document-level queries and measurements to `connectedCallback` where the full DOM is available.

## Lifecycle Timing Summary

| Callback | When | Use For |
|----------|------|---------|
| `constructor` | Element created | `super()`, reading own static attributes, creating simple property defaults |
| `connectedCallback` | Element inserted into DOM | AbortController, event listeners, observers, fetch calls, DOM queries |
| `disconnectedCallback` | Element removed from DOM | `this.controller?.abort()`, clearing timers |

## Real-World Example: CartDrawer

The `cart-drawer` island demonstrates the full lifecycle pattern:

```js
import { trapFocus, removeTrapFocus } from '@/lib/a11y'
import { Events, listen } from '@/lib/events'

class CartDrawer extends window.HTMLElement {
  connectedCallback() {
    // Component's own controller for DOM listeners
    this.controller = new AbortController()
    const { signal } = this.controller

    this.addEventListener(
      'keyup',
      (evt) => evt.code === 'Escape' && this.close(),
      { signal }
    )
    this.querySelector('#CartDrawer-Overlay').addEventListener(
      'click',
      this.close.bind(this),
      { signal }
    )
    this.setHeaderCartIconAccessibility()

    // Event system listeners return separate controllers
    this.eventControllers = [
      listen(document, Events.CART_ADDED, this.onCartAdded.bind(this)),
      listen(document, Events.CART_UPDATED, this.onCartUpdated.bind(this)),
    ]
  }

  disconnectedCallback() {
    this.controller?.abort()
    for (const c of this.eventControllers ?? []) {
      c.abort()
    }
  }

  // ... methods
}
```

## Further Reading

- [Creating Islands](./creating-islands) -- step-by-step guide including lifecycle setup
- [Event System](./event-system) -- AbortController cleanup for event listeners
- [Component Reference](./component-reference) -- lifecycle patterns in each production island
- [Utilities](./utilities) -- helper functions used during lifecycle callbacks
