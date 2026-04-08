# Component Reference

All 16 production islands, grouped by function. Each entry documents the tag name, source file, purpose, hydration directive, events, public methods, and inheritance.

## Cart

### `cart-drawer`

| | |
|---|---|
| **File** | `theme/frontend/islands/cart-drawer.js` |
| **Hydration** | `client:idle` |
| **Extends** | `HTMLElement` |
| **Events consumed** | `cart:added`, `cart:updated` (global, via `listen()`) |
| **Events dispatched** | None |

The main cart drawer component. Listens for `cart:added` to re-render drawer contents and open. Listens for `cart:updated` to toggle the `is-empty` class. Manages focus trapping, overlay click-to-close, Escape key, and body scroll lock.

**Key methods:**

| Method | Description |
|--------|-------------|
| `open(triggeredBy?)` | Opens the drawer, traps focus, locks body scroll |
| `close()` | Closes the drawer, restores focus to the trigger element |
| `renderContents(sections)` | Parses Section Rendering API HTML and replaces drawer + icon bubble content |
| `setHeaderCartIconAccessibility()` | Converts the cart icon link to a button with `aria-haspopup="dialog"` |

---

### `cart-drawer-items`

| | |
|---|---|
| **File** | `theme/frontend/islands/cart-drawer-items.js` |
| **Hydration** | `client:idle` |
| **Extends** | `CartItems` |
| **Events dispatched** | `cart:updated` (inherited from `CartItems`) |

Extends `CartItems` with a different `getSectionsToRender()` that targets the drawer container (`#CartDrawer`) and icon bubble instead of the main cart page sections. All quantity update logic, live region announcements, and loading states are inherited.

---

### `cart-items`

| | |
|---|---|
| **File** | `theme/frontend/islands/cart-items.js` |
| **Hydration** | `client:idle` |
| **Extends** | `HTMLElement` |
| **Events dispatched** | `cart:updated` (global) |

Base cart management component. Listens for `change` events (debounced at 300ms) from child `quantity-input` elements. Calls the Shopify Cart Change API, re-renders sections, updates live regions for screen readers, and manages focus after DOM replacement.

**Key methods:**

| Method | Description |
|--------|-------------|
| `updateQuantity(line, quantity, name?)` | Sends quantity change to Shopify API, re-renders sections |
| `updateLiveRegions(line, itemCount)` | Announces quantity changes to assistive technology |
| `getSectionsToRender()` | Returns array of section IDs and selectors to re-render |
| `enableLoading(line)` / `disableLoading()` | Toggles loading overlay on the affected line item |

---

### `cart-remove-button`

| | |
|---|---|
| **File** | `theme/frontend/islands/cart-remove-button.js` |
| **Hydration** | `client:idle` |
| **Extends** | `HTMLElement` |
| **Events dispatched** | None (delegates to parent `cart-items`) |

Simple button that removes a cart line item by calling the parent `cart-items` or `cart-drawer-items` component's `updateQuantity()` method with quantity `0`.

::: warning
This component adds its click listener in the constructor rather than `connectedCallback`. It does not use AbortController cleanup. This is a known deviation from the standard pattern.
:::

---

### `cart-note`

| | |
|---|---|
| **File** | `theme/frontend/islands/cart-note.js` |
| **Hydration** | `client:idle` |
| **Extends** | `HTMLElement` |
| **Events dispatched** | None |

Wraps a textarea for cart notes. On `change`, sends the note value to the Shopify Cart Update API. Uses AbortController for both the event listener and the fetch call.

---

### `quantity-input`

| | |
|---|---|
| **File** | `theme/frontend/islands/quantity-input.js` |
| **Hydration** | `client:idle` |
| **Extends** | `HTMLElement` |
| **Events dispatched** | `change` (native, bubbles to parent `cart-items`) |

Plus/minus buttons that increment or decrement a number input. Uses the native `stepUp()` and `stepDown()` methods on the input element. Dispatches a native `change` event that bubbles up to the parent `cart-items` component.

::: warning
This component adds its click listeners in the constructor rather than `connectedCallback`. It does not use AbortController cleanup. This is a known deviation from the standard pattern.
:::

## Product

### `product-form`

| | |
|---|---|
| **File** | `theme/frontend/islands/product-form.js` |
| **Hydration** | `client:idle` |
| **Extends** | `HTMLElement` |
| **Events consumed** | `variant:changed` (local, via `listen()` on closest `<section>`) |
| **Events dispatched** | `cart:added` (global), `cart:error` (global) |

Product add-to-cart form. Intercepts form submission, calls the Shopify Cart Add API, dispatches `cart:added` on success or `cart:error` on failure. Listens for `variant:changed` to update the submit button state (enabled, disabled/sold out, disabled/unavailable) and clear error messages.

If no cart drawer exists in the DOM, falls back to a full page redirect to the cart.

**Key methods:**

| Method | Description |
|--------|-------------|
| `onSubmitHandler(event)` | Handles form submission, calls Cart Add API |
| `onVariantChanged(event)` | Updates button text and disabled state based on variant availability |
| `handleErrorMessage(message?)` | Shows or hides the inline error message element |

---

### `product-recommendations`

| | |
|---|---|
| **File** | `theme/frontend/islands/product-recommendations.js` |
| **Hydration** | `client:visible` |
| **Extends** | `HTMLElement` |
| **Events dispatched** | None |

Dynamically loads product recommendations via fetch when the component enters the viewport. Reads the URL from `data-url`, fetches the section HTML, and replaces its own `innerHTML` with the response content.

---

### `variant-selects`

| | |
|---|---|
| **File** | `theme/frontend/islands/variant-selects.js` |
| **Hydration** | `client:idle` |
| **Extends** | `HTMLElement` |
| **Events dispatched** | `variant:changed` (local, bubbles) |

Base variant selection component for `<select>` dropdowns. On `change`, determines the selected variant from embedded JSON data, updates the URL with `history.replaceState`, updates hidden form inputs in `product-form`, fetches and renders updated price HTML, and dispatches `variant:changed`.

**Key methods:**

| Method | Description |
|--------|-------------|
| `onVariantChange()` | Orchestrates the full update flow |
| `updateOptions()` | Reads selected values from `<select>` elements |
| `updateMasterId()` | Finds the matching variant in the JSON data |
| `updateURL()` | Updates the browser URL with the variant ID |
| `updateVariantInput()` | Sets the hidden `input[name="id"]` in the product form |
| `renderProductInfo()` | Fetches section HTML and updates the price display |
| `getVariantData()` | Parses the embedded `application/json` script tag |

---

### `variant-radios`

| | |
|---|---|
| **File** | `theme/frontend/islands/variant-radios.js` |
| **Hydration** | `client:idle` |
| **Extends** | `VariantSelects` |
| **Events dispatched** | `variant:changed` (inherited) |

Extends `VariantSelects` with a single override: `updateOptions()` reads the selected value from radio button fieldsets instead of `<select>` elements. All other behavior (URL update, price render, event dispatch) is inherited.

## Navigation / UI

### `sticky-header`

| | |
|---|---|
| **File** | `theme/frontend/islands/sticky-header.js` |
| **Hydration** | `client:idle` |
| **Extends** | `HTMLElement` |
| **Events dispatched** | None |

Scroll-aware header that hides on scroll down and reveals on scroll up. Uses an `IntersectionObserver` to measure header bounds, then applies Tailwind translate/sticky/transition classes via `requestAnimationFrame`.

**Key methods:**

| Method | Description |
|--------|-------------|
| `onScroll()` | Main scroll handler -- decides whether to hide, reveal, or reset |
| `hide()` | Adds `-translate-y-full` and `sticky` classes |
| `reveal()` | Removes translate, adds transition |
| `reset()` | Removes all sticky/translate/transition classes |

---

### `localization-form`

| | |
|---|---|
| **File** | `theme/frontend/islands/localization-form.js` |
| **Hydration** | `client:visible` |
| **Extends** | `HTMLElement` |
| **Events dispatched** | None |

Language/country selector dropdown. Manages `aria-expanded` state, keyboard escape to close, click-outside to close, and focus-out behavior. On item click, sets a hidden input value and submits the form to change locale.

**Key methods:**

| Method | Description |
|--------|-------------|
| `toggleList()` | Opens or closes the dropdown list |
| `hideList()` | Closes the dropdown and resets ARIA attributes |
| `onItemClick(event)` | Sets the hidden input value and submits the form |

---

### `details-disclosure`

| | |
|---|---|
| **File** | `theme/frontend/islands/details-disclosure.js` |
| **Hydration** | `client:idle` |
| **Extends** | `HTMLElement` |
| **Events dispatched** | None |

Controls the open/close animation of a `<details>` element. Plays CSS animations when the detail opens and cancels them on close. Auto-closes when focus leaves the component.

**Key methods:**

| Method | Description |
|--------|-------------|
| `onToggle()` | Plays or cancels content animations based on open state |
| `onFocusOut()` | Closes the disclosure when focus leaves the element |
| `close()` | Removes the `open` attribute and updates `aria-expanded` |

::: warning
This component adds its listeners in the constructor rather than `connectedCallback`. It does not use AbortController cleanup. This is a known deviation from the standard pattern.
:::

## Modals

### `details-modal`

| | |
|---|---|
| **File** | `theme/frontend/islands/details-modal.js` |
| **Hydration** | varies (depends on usage context) |
| **Extends** | `HTMLElement` |
| **Events dispatched** | None |

Base modal class built on the `<details>` element. Provides focus trapping (via `trapFocus` / `removeTrapFocus` from a11y.js), Escape key handling, overlay click-to-close, and body scroll lock. Exported as `default` so child classes can import and extend it.

**Key methods:**

| Method | Description |
|--------|-------------|
| `open(event)` | Opens the details element, traps focus, locks body scroll |
| `close(focusToggle?)` | Closes the modal, removes focus trap, restores scroll |
| `isOpen()` | Returns whether the details element has the `open` attribute |
| `onSummaryClick(event)` | Toggles open/close on summary click |
| `onBodyClick(event)` | Closes when clicking outside or on the overlay |

---

### `header-drawer`

| | |
|---|---|
| **File** | `theme/frontend/islands/header-drawer.js` |
| **Hydration** | `client:media="(max-width: 1023px)"` |
| **Extends** | `DetailsModal` |
| **Events dispatched** | None |

Mobile navigation drawer. Extends `DetailsModal` with a custom `open()` that adds a `menu-opening` class for CSS animation, and a custom `close()` that waits 400ms via `requestAnimationFrame` before removing the `open` attribute (allowing CSS exit transitions to complete).

---

### `password-modal`

| | |
|---|---|
| **File** | `theme/frontend/islands/password-modal.js` |
| **Hydration** | `client:idle` |
| **Extends** | `DetailsModal` |
| **Events dispatched** | None |

Password page modal. Extends `DetailsModal` with a single addition: if the form contains an `input[aria-invalid="true"]` (server-side validation error), the modal auto-opens in the constructor.

## Inheritance Summary

```
HTMLElement
  +-- CartItems
  |     +-- CartDrawerItems
  +-- VariantSelects
  |     +-- VariantRadios
  +-- DetailsModal (exported default)
  |     +-- HeaderDrawer
  |     +-- PasswordModal
  +-- CartDrawer
  +-- ProductForm
  +-- ProductRecommendations
  +-- StickyHeader
  +-- LocalizationForm
  +-- CartNote
  +-- CartRemoveButton
  +-- QuantityInput
  +-- DetailsDisclosure
```

## Further Reading

- [Creating Islands](./creating-islands) -- how to build a new island
- [Event System](./event-system) -- full event catalog with payload shapes
- [Lifecycle](./lifecycle) -- callback patterns used across all islands
- [Utilities](./utilities) -- helper functions imported by islands
