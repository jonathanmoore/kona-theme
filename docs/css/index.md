# CSS Overview

Kona Theme uses **Tailwind CSS v4** with the `@tailwindcss/vite` plugin. There is no `tailwind.config.js` file. All design tokens are declared inline using Tailwind v4's `@theme` directive, and the build is handled entirely by Vite.

## Entrypoint

The CSS pipeline starts at a single entrypoint that imports Tailwind, the design tokens, and three layer files in order:

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

## Layer System

CSS is organized into three layers with increasing specificity:

| Layer | File | Purpose |
|---|---|---|
| **base** | `base.css` | Root variables, resets, focus styles, reduced-motion, normalizations |
| **components** | `components.css` | Reusable component classes (`.button`, `.article`, `.swimlane`, `.icon`) |
| **utilities** | `utilities.css` | One-off utility classes (`.absolute-center`, `.strike`, `.hidden-scroll`) |

The `@theme` tokens in `theme.css` are imported without a layer declaration because they configure Tailwind itself rather than producing output rules.

## How It Fits Together

The entrypoint is loaded in `theme/layout/theme.liquid` via the auto-generated `vite-tag` snippet:

```liquid
{%- liquid
  render 'vite-tag', entry: 'theme.css', preload_stylesheet: true
  render 'vite-tag', entry: 'theme.js'
-%}
```

In development, Vite serves the CSS with HMR on `localhost:5173`. In production, `pnpm run build` compiles it to `theme/assets/theme.css` and the `vite-tag` snippet points to the Shopify CDN URL via the build manifest.

## Tailwind Plugins

Two official Tailwind plugins are loaded:

- **`@tailwindcss/typography`** -- Provides the `prose` class used by the `.article` component for rich text content (blog posts, product descriptions).
- **`@tailwindcss/forms`** -- Normalizes form element styling across browsers for inputs, selects, textareas, and checkboxes.

## Further Reading

- [Design Tokens](./design-tokens) -- The `@theme` block, CSS variable categories, and what each style file contains.
- [Shopify Integration](./shopify-integration) -- How Shopify theme settings become CSS variables and feed into Tailwind utilities.
