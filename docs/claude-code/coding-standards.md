---
title: Coding Standards
---

# Coding Standards

The `/shopify-liquid-kona-standards` skill gives Claude the CSS, JavaScript, and HTML rules specific to the Kona theme — Tailwind CSS v4, Vite build pipeline, island hydration, design tokens, and progressive enhancement.

## Invoke

```
/shopify-liquid-kona-standards
```

Also activates implicitly when you ask Claude to write CSS, JavaScript, or HTML in `.liquid` files or `theme/frontend/` source files.

## What it knows

The skill loads Kona's full coding conventions:

- **CSS architecture** — three-tier layer system (`base` / `components` / `utilities`), where each type of CSS belongs, no `{% stylesheet %}` tags
- **Tailwind v4** — `@theme` block for design tokens, utility-first approach, when to extract `@apply`, data attribute variants
- **Design tokens** — CSS custom properties set in Liquid from Shopify settings, bridged into Tailwind's `@theme` block
- **`{% style %}` patterns** — dynamic CSS for section settings (colors, padding, layout)
- **Island JavaScript** — Web Component lifecycle, `connectedCallback`/`disconnectedCallback`, AbortController for cleanup, no external dependencies
- **Event system** — custom events, `islands:load` tracking, event delegation
- **Defensive CSS** — handling unknown content lengths, empty states, overflow
- **Progressive enhancement** — semantic HTML first, CSS second, JS third
- **Formatting** — no semicolons, Prettier-managed, import aliases (`@/` and `~/`)

## Example prompts

- "Write the CSS for a section with configurable background color and padding"
- "Create an island component that fetches product data with proper cleanup"
- "How should I structure the `{% style %}` tag for a multi-column layout?"
- "Convert this inline style to use the design token cascade"
- "What's the correct layer for a reusable card component class?"

## Composes with

| Skill | Why |
|-------|-----|
| [`/shopify-liquid`](./liquid-reference) | Liquid syntax for `{% style %}` tags and schema settings |
| [`/shopify-liquid-a11y`](./accessibility) | Focus-visible styles, motion preferences, touch targets |
| [`/shopify-liquid-kona-new`](./component-creator) | New components follow these standards automatically |

## Tier

**Project** — specific to Kona's Tailwind v4 + Vite + islands architecture. The patterns assume Kona's file structure and build pipeline.
