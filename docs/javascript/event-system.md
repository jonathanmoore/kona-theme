# Event System

The event system is a global `CustomEvent`-based communication layer for decoupling inter-component data flow across the theme's island architecture. No pub/sub library, no event bus object, no runtime dependencies.

## Why Events

Without the event system, components communicate through direct DOM queries and method calls -- `product-form` grabs `document.querySelector('cart-drawer')` and calls its methods directly. This makes components fragile, impossible to test in isolation, and tightly coupled to each other's internal APIs.

The event system replaces direct references with typed `CustomEvent` dispatches. Components announce what happened (e.g., "an item was added to cart") and other components react independently.

## Source File

`theme/frontend/lib/events.js` -- the entire system is approximately 35 lines.

Three exports:

| Export | Purpose |
|--------|---------|
| `Events` | Object of string constants for event type names |
| `createEvent(type, detail)` | Factory that returns a `CustomEvent` with `bubbles: true` |
| `listen(target, type, handler)` | Subscribe with automatic `AbortController` -- returns the controller for cleanup |

```js
import { Events, createEvent, listen } from '@/lib/events'
```

See the [Utilities](./utilities#eventsjs) page for full API signatures.

## Two-Tier Scoping

### Global Events

Dispatched on `document`. Any component anywhere on the page can listen. Used for cart mutations that affect multiple unrelated UI regions (drawer, icon bubble, live region text).

```js
// Dispatching a global event
document.dispatchEvent(
  createEvent(Events.CART_ADDED, {
    source: 'product-form',
    productId: data.id,
    sections: data.sections,
    activeElement,
  })
)
```

### Local Events

Dispatched on `this` (the component element) with `bubbles: true`. They propagate up through the DOM tree. Ancestors catch them by listening on a shared container, typically the `<section>` element. Used for communication between components that share a Liquid section (e.g., variant selects and product form).

```js
// Dispatching a local event (bubbles up from the component)
this.dispatchEvent(
  createEvent(Events.VARIANT_CHANGED, {
    variant: this.currentVariant,
    available: this.currentVariant.available,
    sectionId: this.dataset.section,
  })
)

// Listening on an ancestor for the bubbling event
const section = this.closest('section')
if (section) {
  this.variantController = listen(
    section,
    Events.VARIANT_CHANGED,
    this.onVariantChanged.bind(this)
  )
}
```

## AbortController Cleanup

Every listener created via `listen()` returns an `AbortController`. Store it in `connectedCallback`, call `.abort()` in `disconnectedCallback`. This prevents memory leaks when islands are removed from the DOM (e.g., Shopify Section Rendering replaces HTML).

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

See the [Lifecycle](./lifecycle) page for the full AbortController pattern including DOM event listeners.

## Event Catalog

### `cart:added`

Fired after a product is successfully added to the cart via the Shopify Cart API.

| Field | Value |
|-------|-------|
| Constant | `Events.CART_ADDED` |
| Scope | Global (`document`) |
| Dispatched by | `product-form` |
| Consumed by | `cart-drawer`, `cart-icon-bubble` (via section rendering) |

**Detail payload:**

```js
{
  source: 'product-form',    // string -- component that fired the event
  productId: 123456789,       // number -- Shopify product variant ID
  sections: {                 // object -- Shopify Section Rendering API response
    'cart-drawer': '<html>...</html>',
    'cart-icon-bubble': '<html>...</html>'
  },
  activeElement: HTMLElement   // element -- the element that had focus when submit started
}
```

**Flow:** User clicks "Add to cart" in `product-form` --> form submits to Cart API --> on success, `product-form` dispatches `cart:added` on `document` --> `cart-drawer` receives the event, re-renders its contents with the new section HTML, and opens.

---

### `cart:updated`

Fired after a cart line item quantity changes (increment, decrement, or removal).

| Field | Value |
|-------|-------|
| Constant | `Events.CART_UPDATED` |
| Scope | Global (`document`) |
| Dispatched by | `cart-items`, `cart-drawer-items` (inherits from `cart-items`) |
| Consumed by | `cart-drawer` |

**Detail payload:**

```js
{
  source: 'cart-items',       // or 'cart-drawer-items'
  itemCount: 3,               // number -- total items remaining in cart
  sections: { ... }           // object -- Section Rendering API response
}
```

**Flow:** User changes quantity in `quantity-input` --> `cart-items` debounces the change event --> calls Shopify Cart Change API --> on success, dispatches `cart:updated` on `document` --> `cart-drawer` toggles its `is-empty` class based on `itemCount`.

---

### `cart:error`

Fired when a cart operation fails (add to cart returns an error status).

| Field | Value |
|-------|-------|
| Constant | `Events.CART_ERROR` |
| Scope | Global (`document`) |
| Dispatched by | `product-form` |
| Consumed by | Any error UI (currently `product-form` handles its own inline error) |

**Detail payload:**

```js
{
  source: 'product-form',
  message: 'All 5 T-Shirt are in your cart.'  // string -- error description from Shopify
}
```

---

### `variant:changed`

Fired when a user selects a different product variant.

| Field | Value |
|-------|-------|
| Constant | `Events.VARIANT_CHANGED` |
| Scope | Local (`this`, bubbles) |
| Dispatched by | `variant-selects`, `variant-radios` (inherits from `variant-selects`) |
| Consumed by | `product-form` (listens on closest `<section>`) |

**Detail payload:**

```js
{
  variant: { id: 123, available: true, ... },  // object | null -- full Shopify variant, null if no match
  available: true,                              // boolean -- shorthand for variant.available
  sectionId: 'template--12345'                  // string -- dataset.section from the variant-selects element
}
```

When `variant` is `null`, the selected option combination does not match any variant (unavailable state). `product-form` disables the add button and shows "Unavailable".

## Dispatching an Event

Import `Events` and `createEvent`, then call `dispatchEvent` on the appropriate target:

```js
import { Events, createEvent } from '@/lib/events'

// Global event -- dispatch on document
document.dispatchEvent(
  createEvent(Events.CART_ADDED, {
    source: 'product-form',
    productId: data.id,
    sections: data.sections,
    activeElement,
  })
)

// Local event -- dispatch on this (bubbles up through DOM)
this.dispatchEvent(
  createEvent(Events.VARIANT_CHANGED, {
    variant: this.currentVariant,
    available: this.currentVariant.available,
    sectionId: this.dataset.section,
  })
)
```

## Listening for an Event

Import `Events` and `listen`, set up in `connectedCallback`, tear down in `disconnectedCallback`:

```js
import { Events, listen } from '@/lib/events'

connectedCallback() {
  // Listen on document for global events
  this.cartAddedController = listen(
    document,
    Events.CART_ADDED,
    this.onCartAdded.bind(this)
  )

  // Listen on a DOM ancestor for local bubbling events
  const section = this.closest('section')
  if (section) {
    this.variantController = listen(
      section,
      Events.VARIANT_CHANGED,
      this.onVariantChanged.bind(this)
    )
  }
}

disconnectedCallback() {
  this.cartAddedController?.abort()
  this.variantController?.abort()
}
```

## Adding a New Event

1. Add a constant to the `Events` object in `theme/frontend/lib/events.js`:

```js
export const Events = {
  // ...existing events
  WISHLIST_TOGGLED: 'wishlist:toggled',
}
```

2. Decide the scope:
   - **Global** (dispatch on `document`) -- if any component anywhere on the page might care.
   - **Local** (dispatch on `this` with bubbles) -- if only ancestors in the same section care.

3. Dispatch in the producing component:

```js
document.dispatchEvent(
  createEvent(Events.WISHLIST_TOGGLED, {
    source: 'wishlist-button',
    productId: this.dataset.productId,
    added: true,
  })
)
```

4. Listen in consuming components using the `connectedCallback` / `disconnectedCallback` pattern shown above.

5. Document the event in the catalog section above with its scope, producer, consumers, and detail payload shape.

## Progressive Enhancement

If a consumer has not hydrated when an event fires, the event is simply lost -- there is no replay buffer. This is intentional. The theme is designed so that server-rendered HTML is functional without JavaScript.

For example, if `cart-drawer` has not hydrated when `cart:added` fires, `product-form` falls back to `window.location = window.routes.cart_url` (a full page redirect to the cart page).

## Further Reading

- [Lifecycle](./lifecycle) -- AbortController patterns for event listener cleanup
- [Component Reference](./component-reference) -- which events each island dispatches and consumes
- [Utilities](./utilities#eventsjs) -- full API reference for events.js
- [Creating Islands](./creating-islands) -- how to wire events into a new component
