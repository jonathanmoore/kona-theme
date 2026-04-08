# Event System

Components communicate through typed `CustomEvent` dispatches on the DOM — no event bus, no pub/sub library, no runtime dependencies. The entire system is ~35 lines in `theme/frontend/lib/events.js`.

```js
import { Events, createEvent, listen } from '@/lib/events'
```

## Dispatch an event

```js
// Global — any component on the page can listen
document.dispatchEvent(
  createEvent(Events.CART_ADDED, {
    source: 'product-form',
    productId: data.id,
    sections: data.sections,
    activeElement,
  })
)

// Local — bubbles up through the DOM tree
this.dispatchEvent(
  createEvent(Events.VARIANT_CHANGED, {
    variant: this.currentVariant,
    available: this.currentVariant.available,
    sectionId: this.dataset.section,
  })
)
```

## Listen for an event

Set up in `connectedCallback`, tear down in `disconnectedCallback`:

```js
connectedCallback() {
  // Global
  this.eventControllers = [
    listen(document, Events.CART_ADDED, this.onCartAdded.bind(this)),
    listen(document, Events.CART_UPDATED, this.onCartUpdated.bind(this)),
  ]

  // Local — listen on a DOM ancestor for bubbling events
  const section = this.closest('section')
  if (section) {
    this.eventControllers.push(
      listen(section, Events.VARIANT_CHANGED, this.onVariantChanged.bind(this))
    )
  }
}

disconnectedCallback() {
  for (const c of this.eventControllers ?? []) {
    c.abort()
  }
}
```

Each `listen()` call returns an `AbortController`. Store them and abort in `disconnectedCallback` to prevent leaks.

## Two-tier scoping

**Global events** — Dispatched on `document`. Used for cart mutations that affect multiple unrelated UI regions (drawer, icon bubble, live region).

**Local events** — Dispatched on `this` with `bubbles: true`. Propagate up through the DOM tree. Ancestors catch them by listening on a shared container (typically the `<section>`). Used for communication between components in the same section (e.g., variant selects → product form).

## Event catalog

### `cart:added`

Fired after a product is successfully added to the cart.

| | |
|---|---|
| Constant | `Events.CART_ADDED` |
| Scope | Global (`document`) |
| Dispatched by | `product-form` |
| Consumed by | `cart-drawer` |

```js
{
  source: 'product-form',
  productId: 123456789,
  sections: { 'cart-drawer': '<html>...</html>' },
  activeElement: HTMLElement
}
```

**Flow:** User clicks "Add to cart" → `product-form` calls Cart API → dispatches `cart:added` → `cart-drawer` re-renders and opens.

---

### `cart:updated`

Fired after a cart line item quantity changes.

| | |
|---|---|
| Constant | `Events.CART_UPDATED` |
| Scope | Global (`document`) |
| Dispatched by | `cart-items`, `cart-drawer-items` |
| Consumed by | `cart-drawer` |

```js
{
  source: 'cart-items',
  itemCount: 3,
  sections: { ... }
}
```

**Flow:** User changes quantity → `cart-items` debounces → calls Cart Change API → dispatches `cart:updated` → `cart-drawer` toggles `is-empty` class.

---

### `cart:error`

Fired when a cart operation fails.

| | |
|---|---|
| Constant | `Events.CART_ERROR` |
| Scope | Global (`document`) |
| Dispatched by | `product-form` |

```js
{
  source: 'product-form',
  message: 'All 5 T-Shirt are in your cart.'
}
```

---

### `variant:changed`

Fired when a user selects a different product variant.

| | |
|---|---|
| Constant | `Events.VARIANT_CHANGED` |
| Scope | Local (`this`, bubbles) |
| Dispatched by | `variant-selects`, `variant-radios` |
| Consumed by | `product-form` (on closest `<section>`) |

```js
{
  variant: { id: 123, available: true, ... },  // null if no match
  available: true,
  sectionId: 'template--12345'
}
```

When `variant` is `null`, the option combination doesn't match any variant. `product-form` shows "Unavailable".

## Add a new event

1. Add a constant to `Events` in `theme/frontend/lib/events.js`:

```js
export const Events = {
  // ...existing
  WISHLIST_TOGGLED: 'wishlist:toggled',
}
```

2. Choose scope: **global** (dispatch on `document`) if any component on the page might care. **Local** (dispatch on `this`) if only ancestors in the same section care.

3. Dispatch in the producing component, listen in consumers using the `connectedCallback`/`disconnectedCallback` pattern above.

## Progressive enhancement

If a consumer hasn't hydrated when an event fires, the event is lost — there's no replay buffer. This is intentional. For example, if `cart-drawer` hasn't hydrated when `cart:added` fires, `product-form` falls back to `window.location = window.routes.cart_url` (page redirect to cart).

## Next steps

- [Lifecycle](./lifecycle) — AbortController patterns for cleanup
- [Utilities](./utilities#eventsjs) — Full API reference for events.js
