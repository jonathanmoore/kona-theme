# Accessibility

Kona Theme targets WCAG 2.2 Level AA compliance. This page documents the accessibility patterns enforced across Liquid templates, CSS, and island JavaScript.

## Focus Management

### :focus-visible Outlines

All interactive elements receive a `:focus-visible` outline via a global rule in `base.css`. The outline uses `currentColor` so it inherits the element's text color, guaranteeing contrast against its own background without hard-coding a value.

```css
:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```

### Forced-Colors Fallback

Windows High Contrast Mode can override `currentColor`. A `forced-colors` media query provides a fallback using the system `CanvasText` keyword:

```css
@media (forced-colors: active) {
  :focus-visible {
    outline: 3px solid CanvasText;
  }
}
```

This ensures focus indicators remain visible regardless of the user's forced-color scheme.

### Focus Trapping

Modal dialogs and drawers use the `trapFocus()` and `removeTrapFocus()` utilities from `@/lib/a11y.js` to constrain keyboard navigation within the open container. Focus is trapped on open and released on close.

## Motion Preferences

### Global prefers-reduced-motion Reset

A global animation/transition reset in `base.css` catches any element that may have been missed by individual variants:

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

This is a safety net. It uses `0.01ms` instead of `0s` to ensure `transitionend` and `animationend` events still fire, preventing JavaScript that depends on those events from breaking.

### motion-reduce: Tailwind Variants

Every element with `transition-*` or `animate-*` Tailwind classes must also have a `motion-reduce:` variant:

::: tip Do
```html
<div class="transition-transform duration-300 motion-reduce:transition-none">
<span class="animate-spin motion-reduce:animate-none">
```
:::

::: danger Don't
```html
<div class="transition-transform duration-300">
<span class="animate-spin">
```
:::

Both layers are required: the global reset as a safety net, and individual `motion-reduce:` variants for explicitness.

## Touch Targets

All interactive elements must meet the 44x44px minimum touch target size (WCAG 2.2 Success Criterion 2.5.8). Use Tailwind's `min-h-11 min-w-11` utilities (44px) so the element can grow but never shrink below the minimum.

::: tip Do
```html
<button class="min-h-11 min-w-11 flex items-center justify-center">
  {% render 'icon', icon: 'cart' %}
</button>
```
:::

::: danger Don't
```html
<!-- 32px is too small for touch targets -->
<button class="h-8 w-8 flex items-center justify-center">
  {% render 'icon', icon: 'cart' %}
</button>
```
:::

Elements that were corrected during the compliance audit:

| Element | Before | After | Files |
|---------|--------|-------|-------|
| Header search buttons | `h-8 w-8` (32px) | `min-h-11 min-w-11` (44px) | `header.liquid` |
| Account link | `h-8 w-8` (32px) | `min-h-11 min-w-11` (44px) | `header.liquid` |
| Cart link | `h-8 w-8` (32px) | `min-h-11 min-w-11` (44px) | `header.liquid` |
| Hamburger menu | `h-8 w-8` (32px) | `min-h-11 min-w-11` (44px) | `header-drawer.liquid` |
| Cart quantity buttons | `h-10 w-10` (40px) | `min-h-11 min-w-11` (44px) | `cart-drawer.liquid`, `cart-products.liquid` |

## Dialog Pattern

### Cart Drawer: div[role="dialog"], Not Native `<dialog>`

The cart drawer uses `<div role="dialog" aria-modal="true">` with manual focus trapping. A native `<dialog>` element was attempted but reverted because `showModal()` fundamentally conflicts with the drawer's CSS animation pattern.

**Why native `<dialog>` breaks the cart drawer:**

1. `showModal()` puts the element in the browser's **top layer**, removing it from its parent's flexbox flow. This breaks the `justify-end` positioning that slides the drawer in from the right.
2. The **UA styles** applied by `showModal()` (`margin: auto`, `background: white`, `color: black`) override theme styles and require extensive resets.
3. `close()` **immediately hides** the element, preventing exit animations. CSS transitions from `display: none` require frame-timing hacks that are unreliable across browsers.

**The working pattern:**

- Wrapper: `invisible` / `[.active&]:visible` with `transition-[visibility]`
- Panel: `translate-x-full` / `[.active_&]:translate-x-0` with `transition-transform`
- Both enter and exit animations work correctly
- `trapFocus()` from `@/lib/a11y.js` provides equivalent keyboard containment

::: warning
Do not convert the cart drawer to a native `<dialog>` element. The CSS animation pattern is incompatible with the top layer. See the [Compliance Audit](./compliance-audit#_1-6-cart-drawer-kept-as-div-role-dialog) for the full investigation.
:::

## Skip Link

The theme includes a skip-to-main-content link as the first focusable element in `theme.liquid`. It becomes visible on focus and jumps keyboard users past the header navigation.

## Landmarks

The theme uses HTML5 landmark elements with supplemental attributes for older assistive technology:

| Landmark | Element | Notes |
|----------|---------|-------|
| Banner | `<header>` | Site header with navigation |
| Navigation | `<nav aria-label="...">` | Each `<nav>` has a distinct `aria-label` so screen readers can differentiate them |
| Main | `<main role="main">` | `role="main"` added for older AT that does not recognize HTML5 elements |
| Footer | `<footer>` | Site footer |

When multiple `<nav>` elements exist on the same page, each must have a unique `aria-label`. The theme uses translation keys (<code v-pre>{{ 'accessibility.main_navigation' | t }}</code>) so labels are localized.

## Live Regions

Cart updates announce changes to screen readers using `aria-live` regions. When a product is added or a quantity changes, the cart count and status messages are updated in elements with `aria-live="polite"` or `role="status"`.

## Form Accessibility

All form inputs must follow these patterns:

| Requirement | Implementation |
|-------------|----------------|
| Labels | Every `<input>`, `<select>`, and `<textarea>` has an associated `<label>` element with a matching `for`/`id` pair |
| Required fields | `aria-required="true"` on required inputs |
| Validation errors | `aria-invalid="true"` on invalid inputs, `aria-describedby` pointing to the error message element |
| Error messages | Error text in a `<div>` or `<span>` with an `id` that matches the input's `aria-describedby` |

::: tip Do
```liquid
<label for="email-{{ section.id }}">{{ 'customer.email' | t }}</label>
<input
  type="email"
  id="email-{{ section.id }}"
  aria-required="true"
  aria-invalid="{% if form.errors contains 'email' %}true{% else %}false{% endif %}"
  aria-describedby="email-error-{{ section.id }}"
>
<span id="email-error-{{ section.id }}" class="text-error">
  {{ form.errors.messages.email }}
</span>
```
:::

## Image Attributes

All `<img>` elements must include:

| Attribute | Requirement |
|-----------|-------------|
| `alt` | Descriptive text for content images; empty `alt=""` for decorative images |
| `width` | Intrinsic width to prevent layout shift |
| `height` | Intrinsic height to prevent layout shift |
| `loading` | `loading="lazy"` for below-the-fold images; omit for above-the-fold |

Shopify's `image_tag` filter handles `width` and `height` automatically. Always pass an `alt` value.

## Product Card Semantics

Product cards use `<article>` with `aria-labelledby` pointing to the product title element. This gives each card a named landmark for screen reader navigation.

```liquid
<article aria-labelledby="ProductTitle-{{ block.id }}">
  <!-- product image, price, etc. -->
  <h3 id="ProductTitle-{{ block.id }}">{{ product.title }}</h3>
</article>
```

## Further Reading

- [CSS Standards](./css-standards) -- Focus styles, motion preferences, and the layer system
- [JavaScript Standards](./javascript-standards) -- AbortController cleanup and lifecycle patterns
- [Compliance Audit](./compliance-audit) -- Full record of accessibility violations found and fixed
