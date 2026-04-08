# Assets Overview

Vite compiles JavaScript and CSS from `theme/frontend/` into `theme/assets/`. No runtime npm packages ship to the browser — every byte is vanilla, hand-written code.

## JavaScript

All interactive behavior lives in Web Components under `theme/frontend/islands/`, loaded on demand by the [hydration runtime](/architecture/islands).

### Import pattern

The `@/` alias resolves to `theme/frontend/`:

```js
import { trapFocus, removeTrapFocus } from '@/lib/a11y'
import { fetchConfig } from '@/lib/utils'
import { Events, createEvent, listen } from '@/lib/events'
import DetailsModal from '@/islands/details-modal'
```

### Inheritance hierarchy

Three base classes provide shared behavior:

```
DetailsModal          → HeaderDrawer, PasswordModal
CartItems             → CartDrawerItems
VariantSelects        → VariantRadios
```

- **DetailsModal** — Focus trapping, keyboard escape, overlay click-to-close, open/close via `<details>`
- **CartItems** — Quantity updates, Section Rendering API calls, live region announcements
- **VariantSelects** — Option changes, URL updates, price rendering, variant data parsing

### Code conventions

| Convention | Example |
|------------|---------|
| No semicolons | `const x = 1` |
| `async`/`await` | `const res = await fetch(url)` |
| `for...of` loops | `for (const item of items)` |
| AbortController cleanup | Created in `connectedCallback`, aborted in `disconnectedCallback` |
| Minimal constructors | Only `super()` and static property reads |

### Production islands (16)

| Group | Islands |
|-------|---------|
| **Cart** | `cart-drawer`, `cart-drawer-items`, `cart-items`, `cart-remove-button`, `cart-note`, `quantity-input` |
| **Product** | `product-form`, `product-recommendations`, `variant-selects`, `variant-radios` |
| **Navigation / UI** | `sticky-header`, `localization-form`, `details-disclosure` |
| **Modals** | `details-modal`, `header-drawer`, `password-modal` |

### Key files

| File | Purpose |
|------|---------|
| `entrypoints/theme.js` | Main entry — imports revive, initializes disclosure widgets |
| `lib/events.js` | [Event system](./event-system) — typed CustomEvent constants and helpers |
| `lib/a11y.js` | [Accessibility](./utilities#a11yjs) — focus trapping, disclosure widgets |
| `lib/utils.js` | [Helpers](./utilities#utilsjs) — fetchConfig, debounce |

## CSS

Style components with Tailwind CSS v4 utility classes in Liquid templates. For custom styles, add them to the appropriate CSS layer file. See [CSS](./css) for the full reference.

### Entry point

Everything starts from a single file that imports Tailwind, design tokens, and three layer files:

```css [theme/frontend/entrypoints/theme.css]
@import 'tailwindcss' source('../..');
@import '@/styles/theme.css';
@import '@/styles/base.css' layer(base);
@import '@/styles/components.css' layer(components);
@import '@/styles/utilities.css' layer(utilities);

@plugin '@tailwindcss/typography';
@plugin '@tailwindcss/forms';
```

The `source('../..')` directive tells Tailwind to scan from the project root so it picks up class names in Liquid templates under `theme/`.

### Layer system

CSS is organized into three layers with increasing specificity:

| Layer | File | Purpose |
|---|---|---|
| **base** | `base.css` | Root variables, resets, focus styles, reduced-motion |
| **components** | `components.css` | Reusable classes (`.button`, `.article`, `.swimlane`, `.icon`) |
| **utilities** | `utilities.css` | One-off helpers (`.absolute-center`, `.strike`, `.hidden-scroll`) |

Utility classes always beat component classes, which always beat base styles — matching Tailwind's specificity model.

The `@theme` tokens in `theme.css` are imported without a layer because they configure Tailwind itself rather than producing output rules.

## Next steps

- [CSS](./css) — Layer system, plugins, and the `@theme` role
- [Creating Islands](./creating-islands) — Build a new island end-to-end
- [Event System](./event-system) — Inter-component communication
- [Lifecycle](./lifecycle) — Callback patterns and AbortController cleanup
- [Utilities](./utilities) — API reference for a11y.js, events.js, utils.js
