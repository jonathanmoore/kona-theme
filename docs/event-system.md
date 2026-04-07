# Global Event System

A native `CustomEvent`-based communication layer for decoupling inter-component data flow across the theme's island architecture. No pub/sub library, no event bus object, no runtime dependencies.

## Why

Before this change, components communicated through direct DOM queries and method calls. `product-form.js` grabbed `document.querySelector('cart-drawer')` and called its methods (`renderContents`, `getSectionsToRender`, `setActiveElement`). `variant-selects.js` reached into product-form's DOM to toggle the add button and clear error messages. This made components fragile, impossible to test in isolation, and tightly coupled to each other's internal APIs.

The event system replaces these direct references with typed `CustomEvent` dispatches. Components announce what happened (e.g. "an item was added to cart") and other components react independently. The approach follows Shopify's Horizon theme pattern, adapted to our smaller codebase with a factory function instead of class-per-event.

## Architecture

### Source file

`frontend/lib/events.js` — the entire system is ~35 lines.

Three exports:

| Export | Purpose |
|--------|---------|
| `Events` | Object of string constants for event type names |
| `createEvent(type, detail)` | Factory that returns a `CustomEvent` with `bubbles: true` |
| `listen(target, type, handler)` | Subscribe with automatic `AbortController` — returns the controller for cleanup |

### Two-tier scoping

**Global events** are dispatched on `document`. Any component anywhere in the page can listen. Used for cart mutations that affect multiple unrelated UI regions (drawer, icon bubble, etc).

**Local events** are dispatched on `this` (the component element) with `bubbles: true`. They propagate up through the DOM tree. Ancestors catch them by listening on a shared container (typically the `<section>` element). Used for communication between components that share a Liquid section (e.g. variant selects and product form).

### AbortController cleanup

Every listener created via `listen()` returns an `AbortController`. Store it in `connectedCallback`, call `.abort()` in `disconnectedCallback`. This prevents memory leaks when islands are removed from the DOM (e.g. section rendering replaces HTML).

```js
connectedCallback() {
  this.controllers = [
    listen(document, Events.CART_ADDED, this.onCartAdded.bind(this)),
  ]
}

disconnectedCallback() {
  this.controllers?.forEach((c) => c.abort())
}
```

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
  source: 'product-form',   // string — component that fired the event
  productId: 123456789,      // number — Shopify product variant ID
  sections: {                // object — Shopify Section Rendering API response
    'cart-drawer': '<html>...</html>',
    'cart-icon-bubble': '<html>...</html>'
  },
  activeElement: HTMLElement  // element — the element that had focus when submit started
}
```

### `cart:updated`

Fired after a cart line item quantity changes (increment, decrement, or removal).

| Field | Value |
|-------|-------|
| Constant | `Events.CART_UPDATED` |
| Scope | Global (`document`) |
| Dispatched by | `cart-items`, `cart-drawer-items` (inherits) |
| Consumed by | `cart-drawer` |

**Detail payload:**

```js
{
  source: 'cart-items',      // or 'cart-drawer-items'
  itemCount: 3,              // number — total items remaining in cart
  sections: { ... }          // object — Section Rendering API response
}
```

### `cart:error`

Fired when a cart operation fails (add to cart returns an error status).

| Field | Value |
|-------|-------|
| Constant | `Events.CART_ERROR` |
| Scope | Global (`document`) |
| Dispatched by | `product-form` |
| Consumed by | Any error UI (currently product-form handles its own inline error) |

**Detail payload:**

```js
{
  source: 'product-form',
  message: 'All 5 T-Shirt are in your cart.'  // string — error description from Shopify
}
```

### `variant:changed`

Fired when a user selects a different product variant.

| Field | Value |
|-------|-------|
| Constant | `Events.VARIANT_CHANGED` |
| Scope | Local (`this`, bubbles) |
| Dispatched by | `variant-selects`, `variant-radios` (inherits) |
| Consumed by | `product-form` (listens on closest `<section>`) |

**Detail payload:**

```js
{
  variant: { id: 123, available: true, ... },  // object | null — full Shopify variant object, null if no match
  available: true,                              // boolean — shorthand for variant.available
  sectionId: 'template--12345'                  // string — dataset.section from the variant-selects element
}
```

When `variant` is `null`, the selected combination doesn't match any variant (unavailable state). Product-form disables the add button and shows "Unavailable".

## How Components Use Events

### Dispatching an event

Import `Events` and `createEvent`, then call `dispatchEvent` on the appropriate target:

```js
import { Events, createEvent } from '@/lib/events'

// Global event — dispatch on document
document.dispatchEvent(
  createEvent(Events.CART_ADDED, {
    source: 'product-form',
    productId: data.id,
    sections: data.sections,
    activeElement,
  })
)

// Local event — dispatch on this (bubbles up through DOM)
this.dispatchEvent(
  createEvent(Events.VARIANT_CHANGED, {
    variant: this.currentVariant,
    available: this.currentVariant.available,
    sectionId: this.dataset.section,
  })
)
```

### Listening for an event

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

1. Add a constant to the `Events` object in `frontend/lib/events.js`:

```js
export const Events = {
  // ...existing events
  WISHLIST_TOGGLED: 'wishlist:toggled',
}
```

2. Decide the scope:
   - If any component anywhere on the page might care, dispatch on `document` (global).
   - If only ancestors in the same section care, dispatch on `this` and it will bubble (local).

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

5. Document the event in this file's catalog section with its scope, producer, consumers, and detail payload shape.

## Progressive Enhancement

If a consumer hasn't hydrated when an event fires, the event is simply lost — there is no replay buffer. This is intentional. The theme is designed so that server-rendered HTML is functional without JavaScript. For example, if `cart-drawer` hasn't hydrated when `cart:added` fires, `product-form` falls back to `window.location = window.routes.cart_url` (a full page redirect to the cart).

## What Changed From the Previous Architecture

| Before | After |
|--------|-------|
| `product-form` calls `this.cart.renderContents(response)` | `product-form` dispatches `cart:added`, `cart-drawer` listens and renders |
| `product-form` calls `this.cart.getSectionsToRender()` | Section IDs are hard-coded in `CART_SECTIONS` constant (they're static) |
| `product-form` calls `this.cart.setActiveElement()` | `activeElement` passed in event detail, `cart-drawer` sets it in handler |
| `product-form` toggles `cart-drawer`'s `is-empty` class | `cart-drawer` manages its own `is-empty` state via `cart:added` and `cart:updated` listeners |
| `cart-items` toggles `cart-drawer`'s `is-empty` class | `cart-drawer` handles via `cart:updated` listener |
| `variant-selects` calls `productForm.handleErrorMessage()` | `product-form` clears errors in its `onVariantChanged` handler |
| `variant-selects` owns `toggleAddButton()` / `setUnavailable()` | `product-form` owns its button state via `onVariantChanged` handler |

### What stayed the same

- `cart-items` still queries `cart-drawer` for `trapFocus` calls — focus trapping depends on DOM hierarchy, which is a structural relationship, not a data-flow concern
- `variant-selects` still writes to product-form's hidden `input[name="id"]` via `updateVariantInput()` — direct parent-child form relationship
- `variant-selects` still owns price rendering via `renderProductInfo()` — it fetches section HTML and updates the price display
- `cart-remove-button` still uses `this.closest('cart-items')` — legitimate parent-child DOM traversal
- Subclasses (`cart-drawer-items`, `variant-radios`) inherit event behavior from their parents automatically
