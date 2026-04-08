# Standards Compliance Sprint

A single pass to bring the theme into full compliance with the coding standards defined in the project's three Claude Code skills. Every change below was derived from auditing the codebase against those standards and fixing every violation found.

## What Are the Skills?

Three skill files live in `.claude/skills/` and teach Claude Code how to write code for this theme. They define the rules — this sprint enforces them.

### `liquid-theme-standards`

CSS, JavaScript, and HTML coding standards. Key rules that drove changes:

| Rule | Standard | What Was Violated |
|------|----------|-------------------|
| Loops | `for...of` | `.forEach()` used in 4 island files |
| Async | `async`/`await` | `.then()` chains in 5 island files |
| Imports | `@/` alias | 4 islands used relative `./` imports |
| Semicolons | Omit | Already compliant (no changes needed) |
| Modals | Native `<dialog>` or `role="dialog"` | Cart drawer kept as `<div role="dialog">` (native `<dialog>` conflicts with CSS animations) |
| Cleanup | `disconnectedCallback` | Zero islands had cleanup logic |
| AbortController | Signal on fetch + listeners | Zero fetch calls or listeners used signals |

### `liquid-theme-a11y`

WCAG 2.2 accessibility patterns for Shopify themes. Key rules that drove changes:

| Rule | Standard | What Was Violated |
|------|----------|-------------------|
| Focus indicators | `:focus-visible` outline | Zero focus-visible styles anywhere |
| Reduced motion | `motion-reduce:` variant | Zero motion-reduce classes on transitions |
| Reduced motion | `prefers-reduced-motion` media query | No global animation reset |
| Touch targets | 44x44px minimum (`min-h-11 min-w-11`) | Header icons 32px, cart buttons 40px |
| Nav landmarks | `aria-label` on `<nav>` | 3 nav elements missing labels |
| Product cards | `<article aria-labelledby>` | Product card used plain `<div>` |
| Cart drawer | Native `<dialog>` preferred | Kept `<div role="dialog">` — `showModal()` conflicts with CSS slide animation |

### `shopify-liquid-themes`

Shopify Liquid conventions for sections, blocks, snippets. Key rules that drove changes:

| Rule | Standard | What Was Violated |
|------|----------|-------------------|
| Translation keys | `"name": "t:sections.x.name"` | All 44 schema files had hardcoded English |
| Schema translations | `en.default.schema.json` | File didn't exist |
| LiquidDoc | `{% doc %}` on snippets/blocks | ~39 files missing doc tags |
| `@param` types | Document render parameters | No snippets had `@param` annotations |

---

## Phase 1: CSS & Accessibility

### 1.1 Global focus-visible styles

**File:** `frontend/styles/base.css`

Added a `:focus-visible` outline rule that applies to all focusable elements, with a `forced-colors` fallback for Windows High Contrast Mode:

```css
:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

@media (forced-colors: active) {
  :focus-visible {
    outline: 3px solid CanvasText;
  }
}
```

Uses `currentColor` so the outline inherits the element's text color, which guarantees contrast against its own background without hard-coding a color.

### 1.2 Global prefers-reduced-motion

**File:** `frontend/styles/base.css`

Added a global animation/transition reset for users who prefer reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This is a safety net. Individual elements also get `motion-reduce:` Tailwind variants (task 1.3), but this catches anything missed.

### 1.3 motion-reduce variants on Liquid elements

**Files:** `snippets/cart-drawer.liquid`, `blocks/cart-products.liquid`, `snippets/header-drawer.liquid`, `blocks/_header-menu-mobile.liquid`, `sections/header.liquid`

Every element with `transition-*` Tailwind classes got `motion-reduce:transition-none`. Every `animate-spin` spinner got `motion-reduce:animate-none`. Example:

```diff
- class="transition-transform duration-300"
+ class="transition-transform duration-300 motion-reduce:transition-none"
```

### 1.4 Touch targets — header (32px to 44px)

**Files:** `sections/header.liquid`, `snippets/header-drawer.liquid`, `blocks/_header-menu-mobile.liquid`

Changed `h-8 w-8` (32px) to `min-h-11 min-w-11` (44px) on 6 interactive elements: both search buttons, account link, cart link, and both hamburger menu summaries. Uses `min-` prefixed utilities so the element can grow but never shrink below the touch target minimum.

### 1.5 Touch targets — cart quantity buttons (40px to 44px)

**Files:** `snippets/cart-drawer.liquid`, `blocks/cart-products.liquid`

Changed `h-10 w-10` (40px) to `min-h-11 min-w-11` (44px) on quantity minus, plus, and remove buttons in both cart contexts (drawer and full page).

### 1.6 Cart drawer — kept as `<div role="dialog">`

**Files:** `snippets/cart-drawer.liquid`, `frontend/islands/cart-drawer.js`

The cart drawer retains its original `<div role="dialog" aria-modal="true">` structure. A native `<dialog>` conversion was attempted but reverted because `showModal()` puts the element in the browser's top layer, which fundamentally conflicts with the drawer's CSS animation pattern:

- The top layer removes the element from its parent's flexbox flow (breaks `justify-end` positioning)
- `showModal()` UA styles (`margin: auto`, `background: white`, `color: black`) override theme styles
- `close()` immediately hides the element, preventing exit animations
- CSS transitions from `display: none` require frame-timing hacks that are unreliable across browsers

The existing pattern — `invisible`/`[.active&]:visible` with `transition-[visibility]` on the wrapper, `translate-x-full`/`[.active_&]:translate-x-0` with `transition-transform` on the panel — handles both enter and exit animations correctly. The `<div role="dialog">` with manual `aria-modal="true"` and the theme's `trapFocus()` utility provides equivalent accessibility.

Added `text-primary` to the panel div for explicit text color inheritance.

### 1.7 Nav aria-labels & landmark fixes

**Files:** `snippets/header-drawer.liquid`, `blocks/_header-menu-mobile.liquid`, `snippets/header-mega-menu.liquid`, `layout/password.liquid`

Added `aria-label="{{ 'accessibility.main_navigation' | t }}"` to 3 `<nav>` elements that were missing labels. Multiple `<nav>` elements on a page must have distinct labels so screen readers can differentiate them.

Added `role="main"` to the `<main>` element in `password.liquid` for older assistive technology that doesn't recognize the HTML5 element.

---

## Phase 2: JavaScript

### 2.1 async/await conversions

**Files:** `cart-items.js`, `variant-selects.js`, `product-form.js`, `product-recommendations.js`, `cart-note.js`

Converted all `.then()` chains to `async`/`await` with `try`/`catch`/`finally`. Every `catch` block checks for `AbortError` to avoid logging expected abort signals:

```js
async updateQuantity(line, quantity) {
  try {
    const response = await fetch(routes.cart_change_url, fetchConfig('javascript', { line, quantity }))
    const data = await response.json()
    // ...update DOM
  } catch (e) {
    if (e.name !== 'AbortError') console.error(e)
  } finally {
    this.classList.remove('loading')
  }
}
```

### 2.2 AbortController + disconnectedCallback

**Files:** All 9 island files with event listeners or fetch calls: `cart-items.js`, `cart-drawer.js`, `cart-note.js`, `variant-selects.js`, `product-form.js`, `product-recommendations.js`, `details-modal.js`, `sticky-header.js`, `localization-form.js`

Each island now creates an `AbortController` in `connectedCallback` and aborts it in `disconnectedCallback`. All `addEventListener` calls pass `{ signal: this.controller.signal }`, and all `fetch` calls pass `signal: this.controller.signal`.

Event listeners that were in constructors were moved to `connectedCallback` so they can use the signal and be properly cleaned up. This prevents memory leaks when Shopify's section rendering replaces DOM nodes.

```js
connectedCallback() {
  this.controller = new AbortController()
  this.addEventListener('change', this.onChange.bind(this), { signal: this.controller.signal })
}

disconnectedCallback() {
  this.controller?.abort()
}
```

`sticky-header.js` also clears its scroll debounce timeout in `disconnectedCallback`.

### 2.3 forEach to for...of

**Files:** `cart-items.js`, `cart-drawer.js`, `variant-selects.js`, `localization-form.js`

Replaced all `.forEach()` calls with `for (const x of y)` loops:

```diff
- this.getSectionsToRender().forEach((section) => {
-   // ...
- })
+ for (const section of this.getSectionsToRender()) {
+   // ...
+ }
```

### 2.4 Import path fixes

**Files:** `cart-drawer-items.js`, `header-drawer.js`, `password-modal.js`, `variant-radios.js`

Changed relative imports to the `@/` alias:

```diff
- import CartItems from './cart-items'
+ import CartItems from '@/islands/cart-items'
```

The `@/` alias resolves to `frontend/` via jsconfig.json and Vite config. Relative imports between islands break if file structure changes and are inconsistent with the rest of the codebase.

### 2.5 Bug fix: aria-disabled comparison

**File:** `frontend/islands/product-form.js`

Fixed a bug where `getAttribute('aria-disabled')` was compared with `=== true` (boolean). `getAttribute` returns a string, so the comparison always failed. Changed to `=== 'true'`.

```diff
- if (submitButton.getAttribute('aria-disabled') === true) return
+ if (submitButton.getAttribute('aria-disabled') === 'true') return
```

---

## Phase 3: Liquid & Shopify

### 3.1 Schema translation file

**Created:** `locales/en.default.schema.json`

Contains every `name`, `label`, `info`, `content`, and option `label` string from all 44 section and block schema definitions. Organized under `sections` and `blocks` top-level keys. Key naming convention:

- Filenames: lowercase, hyphens replaced with underscores (`main-product` becomes `main_product`)
- Block filenames: leading underscores stripped (`_footer-menu` becomes `footer_menu`)
- Settings: keyed by their `id` field
- Options: keyed as `options__<value>`
- Headers (no `id`): keyed as `header__<content_slug>`

### 3.2 Schema string to translation key conversion

**Files:** All 20 sections and 24 blocks with `{% schema %}` tags

Every hardcoded `"name"`, `"label"`, `"info"`, and `"content"` string was replaced with a `t:` prefixed translation key pointing to the corresponding entry in `en.default.schema.json`:

```diff
- "name": "Header",
- "label": "Sticky header"
+ "name": "t:sections.header.name",
+ "label": "t:sections.header.settings.sticky.label"
```

Preset `name` values were also converted. `default` values (demo content) and `category` values were left as hardcoded strings per Shopify convention.

### 3.3 LiquidDoc tags

**Files:** 12 block files and 27 snippet files

Added `{% doc %}` / `{% enddoc %}` tags with descriptions and `@param` annotations. For snippets, parameters were determined by examining `{% render %}` calls throughout the codebase and the variables used within each snippet. Icon snippets got simple descriptions. Complex snippets like `cart-drawer.liquid` got full `@param` lists with types.

Skipped: files that already had `{% doc %}` or `{%- doc -%}` tags, and the auto-generated `vite-tag.liquid` and `importmap.liquid`.

### 3.4 Misc Liquid fixes

| Fix | File | Change |
|-----|------|--------|
| Typo | `blocks/product-media-gallery.liquid` | `"Produc media"` changed to `"Product media"` (then converted to `t:` key) |
| `for` attribute | `sections/main-password-header.liquid` | Changed from translation key to `for="Password"` matching `id="Password"` on the input |
| Accessibility key | `locales/en.default.json` | Added `"main_navigation": "Main navigation"` to the `accessibility` section |
| Product card semantics | `blocks/product-card.liquid` | Outer `<div>` changed to `<article aria-labelledby="ProductTitle-{{ block.id }}">`, title got matching `id` |

---

## Verification

All changes pass:
- `pnpm run build` — 23 modules, no errors
- `pnpm run lint` — no ESLint violations
- `en.default.schema.json` — valid JSON
