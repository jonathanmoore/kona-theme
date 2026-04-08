# JavaScript Overview

Kona Theme ships zero runtime npm dependencies. Every byte of JavaScript that reaches the browser is vanilla, hand-written code -- no frameworks, no bundled libraries, no polyfills beyond Vite's modulepreload shim.

## Web Components as the Foundation

All interactive behavior is encapsulated in **Web Components** (custom elements extending `HTMLElement`). Each component lives in its own file under `theme/frontend/islands/` and is registered with `customElements.define()`.

Liquid renders the HTML server-side. When the page loads, the [hydration runtime](./creating-islands#how-revive-discovers-islands) scans the DOM for custom elements matching island filenames and dynamically imports them based on hydration directives (`client:idle`, `client:visible`, `client:media`).

```
Server (Liquid)              Client (JS)
+-----------------+          +------------------+
| Renders HTML    |  ---->   | revive.js scans  |
| with custom     |          | for custom       |
| element tags    |          | elements, loads   |
| and hydration   |          | matching island   |
| directives      |          | files on demand   |
+-----------------+          +------------------+
```

## Import Patterns

The `@/` alias resolves to `theme/frontend/`. All imports between island files and utility modules use this alias:

```js
import { trapFocus, removeTrapFocus } from '@/lib/a11y'
import { fetchConfig } from '@/lib/utils'
import { Events, createEvent, listen } from '@/lib/events'
import DetailsModal from '@/islands/details-modal'
```

## Inheritance Hierarchy

Three base classes provide shared behavior that child components extend:

### DetailsModal

The base modal class handles focus trapping, keyboard escape, overlay click-to-close, and open/close state via the `<details>` element.

```
DetailsModal
  +-- HeaderDrawer    (mobile menu, adds close animation)
  +-- PasswordModal   (auto-opens when validation errors are present)
```

### CartItems

The base cart management class handles quantity updates, Shopify Section Rendering API calls, live region announcements, and loading states.

```
CartItems
  +-- CartDrawerItems (renders cart drawer sections instead of main cart sections)
```

### VariantSelects

The base variant selection class handles option changes, URL updates, price rendering, and variant data parsing.

```
VariantSelects
  +-- VariantRadios   (reads selected option from radio fieldsets instead of <select> elements)
```

## Code Conventions

| Convention | Example |
|------------|---------|
| No semicolons | `const x = 1` not `const x = 1;` |
| `async`/`await` | `const res = await fetch(url)` not `fetch(url).then(...)` |
| `for...of` loops | `for (const item of items)` not `items.forEach(...)` |
| AbortController cleanup | Every `connectedCallback` creates a controller; every `disconnectedCallback` aborts it |
| Minimal constructors | Only `super()` and static property reads; no listeners, no DOM queries that depend on parent context |

## Production Islands (16)

The theme ships 16 production islands grouped by function:

| Group | Islands |
|-------|---------|
| **Cart** | `cart-drawer`, `cart-drawer-items`, `cart-items`, `cart-remove-button`, `cart-note`, `quantity-input` |
| **Product** | `product-form`, `product-recommendations`, `variant-selects`, `variant-radios` |
| **Navigation / UI** | `sticky-header`, `localization-form`, `details-disclosure` |
| **Modals** | `details-modal`, `header-drawer`, `password-modal` |

See the full [Component Reference](./component-reference) for details on each island.

## Key Files

| File | Purpose |
|------|---------|
| `theme/frontend/entrypoints/theme.js` | Main entry point -- imports revive and initializes disclosure widgets |
| `theme/frontend/lib/events.js` | [Event system](./event-system) -- typed CustomEvent constants, factory, and listener helper |
| `theme/frontend/lib/a11y.js` | [Accessibility utilities](./utilities#a11yjs) -- focus trapping, disclosure widgets, escape handling |
| `theme/frontend/lib/utils.js` | [Shared helpers](./utilities#utilsjs) -- fetch config, debounce |

## Further Reading

- [Creating Islands](./creating-islands) -- end-to-end tutorial for building a new island
- [Event System](./event-system) -- inter-component communication via CustomEvents
- [Component Reference](./component-reference) -- every production island documented
- [Lifecycle](./lifecycle) -- Web Component lifecycle patterns and AbortController cleanup
- [Utilities](./utilities) -- API reference for a11y.js, utils.js, and events.js
