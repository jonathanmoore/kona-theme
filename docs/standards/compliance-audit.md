# Compliance Audit

A three-phase audit that brought the entire codebase into compliance with the coding standards defined in the project's Claude Code skill files. Every violation was identified by auditing against the [JavaScript](./javascript-standards), [CSS](./css-standards), and [Accessibility](./accessibility) standards, then fixed and verified.

## Audit Source

Three skill files in `.claude/skills/` define the rules:

| Skill | Scope |
|-------|-------|
| `liquid-theme-standards` | CSS, JavaScript, and HTML coding standards |
| `liquid-theme-a11y` | WCAG 2.2 accessibility patterns |
| `shopify-liquid-themes` | Shopify Liquid conventions for sections, blocks, snippets |

## Summary of Violations Found

| Category | Rule | Violation |
|----------|------|-----------|
| JavaScript | `for...of` loops | `.forEach()` used in 4 island files |
| JavaScript | `async`/`await` | `.then()` chains in 5 island files |
| JavaScript | `@/` alias imports | 4 islands used relative `./` imports |
| JavaScript | AbortController | Zero fetch calls or listeners used signals |
| JavaScript | `disconnectedCallback` | Zero islands had cleanup logic |
| CSS | `:focus-visible` | Zero focus-visible styles anywhere |
| CSS | `motion-reduce:` variant | Zero motion-reduce classes on transitions |
| CSS | `prefers-reduced-motion` | No global animation reset |
| CSS | Touch targets | Header icons 32px, cart buttons 40px |
| Accessibility | Nav landmarks | 3 nav elements missing `aria-label` |
| Accessibility | Product card | Used plain `<div>` instead of `<article>` |
| Liquid | Translation keys | All 44 schema files had hardcoded English |
| Liquid | Schema translations | `en.default.schema.json` did not exist |
| Liquid | LiquidDoc | ~39 files missing `{% doc %}` tags |

---

## Phase 1: CSS & Accessibility

### 1.1 Global focus-visible styles

**File:** `frontend/styles/base.css`

Added a `:focus-visible` outline rule for all focusable elements with a `forced-colors` fallback for Windows High Contrast Mode:

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

Uses `currentColor` so the outline inherits the element's text color, guaranteeing contrast against its own background.

### 1.2 Global prefers-reduced-motion

**File:** `frontend/styles/base.css`

Added a global animation/transition reset for users who prefer reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Uses `0.01ms` instead of `0s` so `transitionend` and `animationend` events still fire. This is a safety net -- individual elements also get `motion-reduce:` Tailwind variants.

### 1.3 motion-reduce variants on Liquid elements

**Files:** `snippets/cart-drawer.liquid`, `blocks/cart-products.liquid`, `snippets/header-drawer.liquid`, `blocks/_header-menu-mobile.liquid`, `sections/header.liquid`

Every element with `transition-*` Tailwind classes received `motion-reduce:transition-none`. Every `animate-spin` spinner received `motion-reduce:animate-none`.

```diff
- class="transition-transform duration-300"
+ class="transition-transform duration-300 motion-reduce:transition-none"
```

### 1.4 Touch targets -- header (32px to 44px)

**Files:** `sections/header.liquid`, `snippets/header-drawer.liquid`, `blocks/_header-menu-mobile.liquid`

Changed `h-8 w-8` (32px) to `min-h-11 min-w-11` (44px) on 6 interactive elements: both search buttons, account link, cart link, and both hamburger menu summaries. Uses `min-` prefixed utilities so elements can grow but never shrink below the touch target minimum.

### 1.5 Touch targets -- cart quantity buttons (40px to 44px)

**Files:** `snippets/cart-drawer.liquid`, `blocks/cart-products.liquid`

Changed `h-10 w-10` (40px) to `min-h-11 min-w-11` (44px) on quantity minus, plus, and remove buttons in both cart contexts (drawer and full page).

### 1.6 Cart drawer -- kept as div[role="dialog"]

**Files:** `snippets/cart-drawer.liquid`, `frontend/islands/cart-drawer.js`

The cart drawer retains its `<div role="dialog" aria-modal="true">` structure. A native `<dialog>` conversion was attempted but reverted because `showModal()` puts the element in the browser's top layer, which conflicts with the drawer's CSS animation pattern:

- The top layer removes the element from its parent's flexbox flow (breaks `justify-end` positioning)
- `showModal()` UA styles (`margin: auto`, `background: white`, `color: black`) override theme styles
- `close()` immediately hides the element, preventing exit animations
- CSS transitions from `display: none` require frame-timing hacks that are unreliable across browsers

The existing pattern (`invisible`/`[.active&]:visible` with `transition-[visibility]`, `translate-x-full`/`[.active_&]:translate-x-0` with `transition-transform`) handles both enter and exit animations correctly. Manual `aria-modal="true"` and `trapFocus()` provide equivalent accessibility.

Added `text-primary` to the panel div for explicit text color inheritance.

### 1.7 Nav aria-labels and landmark fixes

**Files:** `snippets/header-drawer.liquid`, `blocks/_header-menu-mobile.liquid`, `snippets/header-mega-menu.liquid`, `layout/password.liquid`

Added <code v-pre>aria-label="{{ 'accessibility.main_navigation' | t }}"</code> to 3 `<nav>` elements missing labels. Multiple `<nav>` elements on a page must have distinct labels so screen readers can differentiate them.

Added `role="main"` to the `<main>` element in `password.liquid` for older assistive technology.

---

## Phase 2: JavaScript

### 2.1 async/await conversions

**Files:** `cart-items.js`, `variant-selects.js`, `product-form.js`, `product-recommendations.js`, `cart-note.js`

Converted all `.then()` chains to `async`/`await` with `try`/`catch`/`finally`. Every `catch` block checks for `AbortError` to avoid logging expected abort signals:

```js
async updateQuantity(line, quantity) {
  try {
    const response = await fetch(
      routes.cart_change_url,
      fetchConfig('javascript', { line, quantity })
    )
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
  this.addEventListener('change', this.onChange.bind(this), {
    signal: this.controller.signal,
  })
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

The `@/` alias resolves to `frontend/` via `jsconfig.json` and Vite config. Relative imports between islands break if file structure changes and are inconsistent with the rest of the codebase.

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

Contains every `name`, `label`, `info`, `content`, and option `label` string from all 44 section and block schema definitions. Organized under `sections` and `blocks` top-level keys. Key naming conventions:

| Pattern | Convention | Example |
|---------|------------|---------|
| Filenames | Lowercase, hyphens to underscores | `main-product` becomes `main_product` |
| Block filenames | Leading underscores stripped | `_footer-menu` becomes `footer_menu` |
| Settings | Keyed by `id` field | `settings.sticky.label` |
| Options | Keyed as `options__<value>` | `options__small` |
| Headers (no `id`) | Keyed as `header__<content_slug>` | `header__layout` |

### 3.2 Schema strings to translation keys

**Files:** All 20 sections and 24 blocks with `{% schema %}` tags

Every hardcoded `"name"`, `"label"`, `"info"`, and `"content"` string was replaced with a `t:` prefixed translation key:

```diff
- "name": "Header",
- "label": "Sticky header"
+ "name": "t:sections.header.name",
+ "label": "t:sections.header.settings.sticky.label"
```

Preset `name` values were also converted. `default` values (demo content) and `category` values were left as hardcoded strings per Shopify convention.

### 3.3 LiquidDoc tags

**Files:** 12 block files and 27 snippet files (39 total)

Added `{% doc %}` / `{% enddoc %}` tags with descriptions and `@param` annotations. For snippets, parameters were determined by examining `{% render %}` calls throughout the codebase and the variables used within each snippet. Icon snippets received simple descriptions. Complex snippets like `cart-drawer.liquid` received full `@param` lists with types.

Skipped: files that already had `{% doc %}` or `{%- doc -%}` tags, and the auto-generated `vite-tag.liquid` and `importmap.liquid`.

### 3.4 Miscellaneous Liquid fixes

| Fix | File | Change |
|-----|------|--------|
| Typo | `blocks/product-media-gallery.liquid` | `"Produc media"` changed to `"Product media"` (then converted to `t:` key) |
| `for` attribute | `sections/main-password-header.liquid` | Changed from translation key to `for="Password"` matching `id="Password"` on the input |
| Accessibility key | `locales/en.default.json` | Added `"main_navigation": "Main navigation"` to the `accessibility` section |
| Product card semantics | `blocks/product-card.liquid` | Outer `<div>` changed to <code v-pre>&lt;article aria-labelledby="ProductTitle-{{ block.id }}"&gt;</code>, title received matching `id` |

---

## Verification

All changes pass:

- **`pnpm run build`** -- 23 modules, no errors
- **`pnpm run lint`** -- no ESLint violations
- **`en.default.schema.json`** -- valid JSON, all `t:` keys resolve correctly
