# Lifecycle

Use these callback patterns to set up and tear down islands cleanly. The core idea: create one `AbortController` in `connectedCallback`, pass its signal to every listener and fetch call, and abort it in `disconnectedCallback`.

## Callbacks at a glance

| Callback | When | Use for |
|----------|------|---------|
| `constructor` | Element created | `super()`, reading own static attributes, simple property defaults |
| `connectedCallback` | Inserted into DOM | AbortController, event listeners, observers, fetch, DOM queries |
| `disconnectedCallback` | Removed from DOM | `this.controller?.abort()`, clearing timers |

## The AbortController pattern

```js
class MyIsland extends window.HTMLElement {
  connectedCallback() {
    this.controller = new AbortController()
    const { signal } = this.controller

    // All addEventListener calls use signal
    this.addEventListener('click', this.onClick.bind(this), { signal })
    document.addEventListener('keydown', this.onKeyDown.bind(this), { signal })
    window.addEventListener('scroll', this.onScroll.bind(this), { signal })

    this.loadData()
  }

  disconnectedCallback() {
    // One call tears down ALL listeners and in-flight fetches
    this.controller?.abort()
  }

  async loadData() {
    try {
      const response = await fetch(this.dataset.url, {
        signal: this.controller.signal,
      })
      this.innerHTML = await response.text()
    } catch (e) {
      if (e.name !== 'AbortError') console.error(e)
    }
  }

  onClick(event) { /* ... */ }
  onKeyDown(event) { /* ... */ }
  onScroll() { /* ... */ }
}

window.customElements.define('my-island', MyIsland)
```

One controller handles all listeners and fetch calls. When `disconnectedCallback` fires, `this.controller.abort()` tears down everything at once — no need to track individual references or call `removeEventListener`.

### Multiple controllers for event system listeners

When using `listen()` from `@/lib/events`, each call returns its own `AbortController`:

```js
import { Events, listen } from '@/lib/events'

connectedCallback() {
  this.controller = new AbortController()

  // DOM listeners use the component controller
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

## Signal on fetch calls

Always pass `signal: this.controller.signal` to `fetch()`. Without it, a fetch that completes after the component is removed will try to update DOM elements that no longer exist.

```js
async updateQuantity(line, quantity) {
  try {
    const response = await fetch(window.routes.cart_change_url, {
      ...fetchConfig(),
      body: JSON.stringify({ line, quantity }),
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

Always check for `AbortError` — it's expected when a component unmounts during a fetch, not a bug.

## Constructor rules

The constructor runs before the element is in the DOM. Only use it for `super()` and static property reads:

```js
constructor() {
  super()
  this.form = this.querySelector('form')
  this.hasCartDrawer = !!document.querySelector('cart-drawer')
}
```

`this.querySelector()` works because the browser upgrades elements after children are parsed. But `document.querySelector()` for elements outside the component is fragile — they may not exist yet. Move document-level queries to `connectedCallback`.

## Anti-patterns

### Listeners in the constructor

```js
// BAD — no cleanup path, fires before element is in DOM
constructor() {
  super()
  this.addEventListener('click', this.onClick)
}
```

Move all listeners to `connectedCallback` with AbortController.

### Missing disconnectedCallback

```js
// BAD — listeners and fetches leak when element is removed
connectedCallback() {
  this.controller = new AbortController()
  window.addEventListener('scroll', this.onScroll, {
    signal: this.controller.signal,
  })
}
// No disconnectedCallback
```

Always implement `disconnectedCallback`. Shopify's Section Rendering API frequently replaces HTML, removing and re-inserting elements.

### Fetch without signal

```js
// BAD — fetch continues after component removal
async loadData() {
  const response = await fetch(this.dataset.url)
  this.innerHTML = await response.text()
}
```

Always pass `{ signal: this.controller.signal }`.

## Real-world example: CartDrawer

```js
import { trapFocus, removeTrapFocus } from '@/lib/a11y'
import { Events, listen } from '@/lib/events'

class CartDrawer extends window.HTMLElement {
  connectedCallback() {
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

## Next steps

- [Creating Islands](./creating-islands) — Step-by-step guide including lifecycle setup
- [Event System](./event-system) — AbortController cleanup for event listeners
