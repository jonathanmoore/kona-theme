# CSS

Style components with Tailwind CSS v4 utility classes in Liquid templates. For custom styles, add them to the appropriate CSS layer file.

## Entry point

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

## Layer system

CSS is organized into three layers with increasing specificity:

| Layer | File | Purpose |
|---|---|---|
| **base** | `base.css` | Root variables, resets, focus styles, reduced-motion |
| **components** | `components.css` | Reusable classes (`.button`, `.article`, `.swimlane`, `.icon`) |
| **utilities** | `utilities.css` | One-off helpers (`.absolute-center`, `.strike`, `.hidden-scroll`) |

Utility classes always beat component classes, which always beat base styles — matching Tailwind's specificity model.

The `@theme` tokens in `theme.css` are imported without a layer because they configure Tailwind itself rather than producing output rules.

## Tailwind plugins

- **`@tailwindcss/typography`** — The `prose` class for rich text content (blog posts, product descriptions)
- **`@tailwindcss/forms`** — Normalized form element styling across browsers

## Next steps

- [Creating Islands](./creating-islands) — Build a new island end-to-end
- [Coding Standards](/claude-code/coding-standards) — Tailwind utility-first patterns and the layer system
