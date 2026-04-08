# CSS Standards

Kona Theme uses Tailwind CSS v4 with a utility-first approach. All design tokens are defined through the `@theme` directive, styles are organized into three cascade layers, and custom CSS is only written when no Tailwind utility exists.

## Tailwind Utility-First

If a Tailwind utility exists for a style, use it. Write custom CSS only for things Tailwind cannot express -- complex selectors, keyframe animations, or Shopify-specific patterns.

::: tip Do
```html
<div class="flex items-center gap-4 p-4 bg-primary text-primary">
```
:::

::: danger Don't
```html
<div class="cart-drawer-header" style="display: flex; align-items: center; gap: 1rem;">
```
:::

## Three-Layer Cascade

CSS is organized into three layers imported in order from the entrypoint (`theme/frontend/entrypoints/theme.css`):

```css
@import 'tailwindcss' source('../..');
@import '@/styles/theme.css';
@import '@/styles/base.css' layer(base);
@import '@/styles/components.css' layer(components);
@import '@/styles/utilities.css' layer(utilities);
```

| Layer | File | Purpose |
|-------|------|---------|
| **base** | `base.css` | Root variables, resets, focus styles, reduced-motion, normalizations |
| **components** | `components.css` | Reusable component classes (`.button`, `.article`, `.swimlane`, `.icon`) |
| **utilities** | `utilities.css` | One-off utility classes (`.absolute-center`, `.strike`, `.hidden-scroll`) |

The `@theme` tokens in `theme.css` sit outside any layer because they configure Tailwind itself rather than producing output rules.

### When to Add Custom CSS

- **base layer** -- Global resets, `:focus-visible` styles, `prefers-reduced-motion` query
- **components layer** -- Reusable patterns that need more than a utility string (e.g., `.article` prose styling)
- **utilities layer** -- One-off helpers that Tailwind does not provide (e.g., `.absolute-center` for centering with transforms)

If a pattern is used in only one place and can be expressed with Tailwind utilities, keep it in the template. Only extract to a layer file when the pattern is genuinely reusable.

## Design Tokens via @theme

All design tokens are declared in `theme/frontend/styles/theme.css` using Tailwind v4's `@theme` directive. These tokens generate Tailwind utilities automatically:

```css
@theme {
  --color-primary: var(--color-foreground);
  --color-secondary: var(--color-foreground);
  --color-accent: var(--color-accent-1);

  --font-heading: var(--font-heading-family);
  --font-body: var(--font-body-family);

  --spacing-gutter: var(--page-width-gutter);
}
```

The CSS custom properties (`--color-foreground`, `--font-heading-family`, etc.) are set in Liquid from Shopify theme settings, bridging the theme editor with Tailwind's utility system. See the [Design Tokens](/css/design-tokens) page for the full token reference.

## Data Attribute Variants

Use Tailwind's data attribute variants for state-driven styles instead of toggling classes with JavaScript. This keeps state management in HTML attributes and styling in Tailwind utilities.

::: tip Do
```html
<div data-open class="hidden data-[open]:block">
  Drawer content
</div>
```
:::

::: danger Don't
```html
<!-- Toggling a custom class with JS -->
<div class="drawer-panel drawer-panel--open">
  Drawer content
</div>
```
:::

Common patterns in the theme:

| Attribute | Usage | Example Classes |
|-----------|-------|-----------------|
| `data-open` | Drawer/modal visibility | `data-[open]:block`, `data-[open]:translate-x-0` |
| `aria-disabled` | Disabled button states | `aria-disabled:opacity-50`, `aria-disabled:pointer-events-none` |
| `aria-current` | Active navigation item | `aria-[current=page]:font-bold` |

## No Inline Styles

Never use inline `style` attributes except for Shopify-generated CSS variables. Shopify sets CSS custom properties on elements using `style` attributes in Liquid -- these are the only acceptable inline styles.

::: tip Do (Shopify-generated CSS variables)
```liquid
<div
  style="
    --color-foreground: {{ section.settings.color_foreground }};
    --color-background: {{ section.settings.color_background }};
  "
  class="bg-[var(--color-background)] text-[var(--color-foreground)]"
>
```
:::

::: danger Don't
```liquid
<div style="background: {{ section.settings.color_background }}; padding: 2rem;">
```
:::

## Focus Styles

All interactive elements must have `:focus-visible` outlines. The theme sets a global rule in `base.css`:

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

The `forced-colors` fallback ensures focus indicators remain visible in Windows High Contrast Mode, where `currentColor` may not provide sufficient contrast.

See [Accessibility](./accessibility) for the full focus management standard.

## Motion Preferences

Every element with `transition-*` or `animate-*` classes must also have a `motion-reduce:` variant:

::: tip Do
```html
<div class="transition-transform duration-300 motion-reduce:transition-none">
```
:::

::: danger Don't
```html
<div class="transition-transform duration-300">
```
:::

A global `prefers-reduced-motion` reset in `base.css` acts as a safety net, but individual `motion-reduce:` variants should still be applied for explicitness.

See [Accessibility](./accessibility) for the full motion preferences standard.

## Further Reading

- [Design Tokens](/css/design-tokens) -- Full reference for the `@theme` block and CSS variable categories
- [Shopify Integration](/css/shopify-integration) -- How theme settings become CSS variables
- [JavaScript Standards](./javascript-standards) -- Companion standards for island JavaScript
- [Accessibility](./accessibility) -- Focus and motion patterns that affect CSS
- [Compliance Audit](./compliance-audit) -- Record of all CSS violations found and fixed
