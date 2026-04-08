# Design Tokens

All design tokens are defined in a single `@theme` block using Tailwind CSS v4's configuration-in-CSS approach. This replaces the traditional `tailwind.config.js` file entirely.

## The @theme Block

```css [theme/frontend/styles/theme.css]
@theme {
  --color-primary: rgb(20 20 20);
  --color-contrast: rgb(250 250 249);
  --color-notice: rgb(191 72 0);
  --color-shop-pay: #5a31f4;

  --spacing-nav: var(--height-nav);
  --spacing-screen-no-nav: calc(var(--screen-height, 100vh) - var(--height-nav));
  --spacing-mobileGallery: calc(100vw - 3rem);
  --spacing-prose-narrow: 45ch;
  --spacing-prose-wide: 80ch;

  --font-body: var(--font-body-family);
  --font-heading: var(--font-heading-family);

  --text-display: var(--font-size-display);
  --text-display-line-height: 1.1;
  --text-heading: var(--font-size-heading);
  --text-heading-line-height: 1.25;
  --text-lead: var(--font-size-lead);
  --text-lead-line-height: 1.333;
  --text-copy: var(--font-size-copy);
  --text-copy-line-height: 1.5;
  --text-fine: var(--font-size-fine);
  --text-fine-line-height: 1.333;

  --font-weight-body-weight: var(--font-body-weight);
  --font-weight-body-weight-bold: var(--font-body-weight-bold);
  --font-weight-heading-weight: var(--font-heading-weight);

  --shadow-border: inset 0px 0px 0px 1px rgb(var(--color-primary) / 0.08);
  --shadow-dark-header: inset 0px -1px 0px 0px rgba(21, 21, 21, 0.4);
  --shadow-light-header: inset 0px -1px 0px 0px rgba(21, 21, 21, 0.05);
}
```

Every token declared here generates a corresponding Tailwind utility. For example, `--color-primary` produces `text-primary`, `bg-primary`, `border-primary`, and their opacity variants. `--font-heading` produces `font-heading`. `--spacing-nav` produces `p-nav`, `m-nav`, `gap-nav`, and so on.

Many tokens reference CSS custom properties (`var(--font-body-family)`, `var(--font-size-display)`) rather than hardcoded values. These properties are set at runtime by Shopify theme settings, which is how the theme editor controls the design system. See [Shopify Integration](./shopify-integration) for the full cascade.

## Token Categories

### Colors

| Token | Default | Tailwind Class | Usage |
|---|---|---|---|
| `--color-primary` | `rgb(20 20 20)` | `text-primary`, `bg-primary` | Main text, borders, buttons |
| `--color-contrast` | `rgb(250 250 249)` | `text-contrast`, `bg-contrast` | Backgrounds, inverted text |
| `--color-notice` | `rgb(191 72 0)` | `text-notice`, `bg-notice` | Warnings, sale badges |
| `--color-shop-pay` | `#5a31f4` | `text-shop-pay`, `bg-shop-pay` | Shop Pay branding |

### Spacing

| Token | Value | Usage |
|---|---|---|
| `--spacing-nav` | `var(--height-nav)` | Top padding below sticky nav |
| `--spacing-screen-no-nav` | `calc(100vh - nav)` | Full-height sections minus nav |
| `--spacing-mobileGallery` | `calc(100vw - 3rem)` | Product gallery width on mobile |
| `--spacing-prose-narrow` | `45ch` | Narrow content column |
| `--spacing-prose-wide` | `80ch` | Wide content column |

### Typography

Five text size tokens define the type scale. Each has a paired line-height token:

| Token | CSS Variable | Line Height |
|---|---|---|
| `--text-display` | `--font-size-display` | 1.1 |
| `--text-heading` | `--font-size-heading` | 1.25 |
| `--text-lead` | `--font-size-lead` | 1.333 |
| `--text-copy` | `--font-size-copy` | 1.5 |
| `--text-fine` | `--font-size-fine` | 1.333 |

Two font family tokens (`--font-body`, `--font-heading`) and three weight tokens (`--font-weight-body-weight`, `--font-weight-body-weight-bold`, `--font-weight-heading-weight`) round out the typography system.

### Shadows

| Token | Usage |
|---|---|
| `--shadow-border` | Subtle inset border effect (8% opacity) |
| `--shadow-dark-header` | Bottom border for dark header backgrounds |
| `--shadow-light-header` | Bottom border for light header backgrounds |

## The Four CSS Files

### 1. `theme.css` -- Design Tokens

Imported without a layer. Declares the `@theme` block that configures Tailwind's utility generation. This is the single source of truth for the design system.

### 2. `base.css` -- Layer: base

```css [theme/frontend/styles/base.css]
:root {
  --font-size-fine: 0.75rem;
  --font-size-copy: 1rem;
  --font-size-lead: 1.125rem;
  --font-size-heading: 2rem;
  --font-size-display: 3rem;
  --height-nav: 3rem;
  --screen-height: 100vh;

  @media (min-width: 32em) {
    --height-nav: 4rem;
  }
  @media (min-width: 48em) {
    --height-nav: 6rem;
    --font-size-heading: 2.25rem;
    --font-size-display: 3.75rem;
  }
  @supports (height: 100lvh) {
    --screen-height: 100lvh;
  }
}
```

Contains:
- **Root CSS variables** for the responsive type scale and nav height (these feed into `@theme` tokens via `var()`)
- **Body defaults** using Tailwind's `@apply` for background, text color, and antialiasing
- **Focus styles**: `outline: 2px solid currentColor` on `:focus-visible`, with a `forced-colors` override for Windows High Contrast Mode
- **Reduced motion**: `prefers-reduced-motion: reduce` disables all animations and transitions
- **Normalizations**: WebKit search input decorations, number input spinners, `<summary>` markers, `<model-viewer>` progress bar
- **Prose heading reset**: Removes top margin from first headings inside `.prose`

### 3. `components.css` -- Layer: components

Four component classes:

| Class | Purpose |
|---|---|
| `.icon` | Standard icon sizing (20x20px via `h-5 w-5`) |
| `.button` | Inline-block button with padding, rounded corners, bold text |
| `.article` | Rich text layout with prose typography, heading styles, full-bleed images |
| `.swimlane` | Horizontal scroll container with snap points and gap spacing |

### 4. `utilities.css` -- Layer: utilities

Three utility classes:

| Class | Purpose |
|---|---|
| `.absolute-center` | Absolute positioning with translate centering |
| `.strike` | Strikethrough line overlay via `::before` pseudo-element |
| `.hidden-scroll` | Hides scrollbars while preserving scroll functionality |

## Layer Ordering and Specificity

The layer import order in the entrypoint determines specificity:

```
base < components < utilities
```

This means utility classes always win over component classes, and component classes always win over base styles -- matching Tailwind's own specificity model. Tailwind's generated utilities sit above all three custom layers by default, so `@apply` directives within layers resolve correctly.

## Further Reading

- [CSS Overview](./index) -- Entrypoint structure and plugin configuration.
- [Shopify Integration](./shopify-integration) -- How runtime CSS variables from theme settings feed into the `@theme` tokens.
