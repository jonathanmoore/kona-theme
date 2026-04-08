---
title: Accessibility
---

# Accessibility

The `/shopify-liquid-a11y` skill gives Claude WCAG 2.2 accessibility patterns tailored to Shopify e-commerce components — product cards, carousels, cart drawers, forms, filters, modals, and more.

## Invoke

```
/shopify-liquid-a11y
```

Also activates implicitly when you ask Claude to fix accessibility issues, add ARIA patterns, or review `.liquid` files for a11y compliance.

## Use it for these jobs

- Adding ARIA attributes and keyboard navigation to a new component
- Reviewing existing markup for a11y gaps (missing labels, broken focus order, missing live regions)
- Fixing a specific WCAG violation flagged by Lighthouse or axe
- Making interactive patterns accessible — drawers, modals, tabs, carousels, filter panels
- Ensuring touch targets meet 44px minimum size
- Adding `prefers-reduced-motion` support to animations

## What it knows

The skill loads patterns for every common e-commerce component:

- **Page structure** — landmarks, skip links, heading hierarchy, `<main>` placement
- **Product cards** — `<article>` semantics, `aria-labelledby`, clickable card patterns
- **Carousels** — `role="region"`, `aria-roledescription`, keyboard navigation, live regions
- **Cart drawer** — `role="dialog"`, focus trap, overlay click-to-close, live region for count
- **Forms** — labels, `aria-required`, `aria-invalid`, `aria-describedby` for errors
- **Product filters** — `<fieldset>`/`<legend>`, `aria-expanded` for disclosures
- **Modals** — `<dialog>` usage, focus management, escape key handling
- **Tabs** — `role="tablist/tab/tabpanel"`, keyboard arrow navigation
- **Price display** — `aria-label` for context, sale price announcements
- **Navigation** — dropdown menus, mega menus, mobile drawers
- **Touch targets** — 44px minimum, spacing requirements
- **Motion preferences** — `prefers-reduced-motion` patterns

## How it fits together

Liquid renders the server-side HTML structure (landmarks, headings, ARIA attributes). Islands add client-side interactivity (focus traps, keyboard handlers, live region updates). This skill covers both layers — the right markup to render in Liquid and the right behavior to wire up in islands.

## Example prompts

- "Make this product card accessible with proper ARIA attributes"
- "Add keyboard navigation to the carousel component"
- "Review this form for accessibility — are labels and error states correct?"
- "Add focus trap to the cart drawer"
- "What ARIA pattern should I use for a product filter sidebar?"

## Composes with

| Skill | Why |
|-------|-----|
| [`/shopify-liquid`](./liquid-reference) | Liquid syntax for rendering accessible markup |
| [`/shopify-liquid-kona-standards`](./coding-standards) | Kona's CSS patterns for focus-visible, motion preferences |
| [`/shopify-liquid-kona-new`](./component-creator) | New components get a11y patterns baked in from the start |

## Next steps

- [`/shopify-liquid-kona-standards`](./coding-standards) — Focus-visible styles, motion-reduce variants, touch target sizing
- [`/shopify-liquid-kona-new`](./component-creator) — Scaffold a component with accessibility built in
- [Assets Overview](../assets/) — CSS architecture for focus and motion styles
