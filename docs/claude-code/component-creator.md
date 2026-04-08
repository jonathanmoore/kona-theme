---
title: Component Creator
---

# Component Creator

The `/shopify-liquid-kona-new` skill runs an interactive guided workflow for creating new Shopify theme components — sections, blocks, and snippets — with correct schema, translation keys, LiquidDoc, accessibility, and Kona conventions.

## Invoke

```
/shopify-liquid-kona-new                          # Interactive — asks what to create
/shopify-liquid-kona-new section hero-banner       # Create a section
/shopify-liquid-kona-new block testimonial          # Create a block
/shopify-liquid-kona-new snippet badge              # Create a snippet
```

## What it knows

The skill loads a complete component creation workflow:

- **Decision guide** — when to use a section vs block vs snippet, based on editability and nesting needs
- **Section type catalog** — hero, featured collection, rich text, image with text, slideshow, FAQ, testimonials, multicolumn, newsletter, custom HTML, video
- **Block patterns** — heading, text, button, image, slide, testimonial, FAQ item, column, email signup
- **Snippet conventions** — LiquidDoc params, render syntax, when a snippet needs an island
- **Schema generation** — correct JSON structure, setting types, `t:` prefixed labels, block entries, presets
- **Translation keys** — automatic generation of `en.default.json` and `en.default.schema.json` entries
- **File creation** — puts files in the right directories with correct naming conventions

### The workflow

1. **Choose component type** — section, block, or snippet (or specify in the command)
2. **Gather requirements** — what the component does, what settings it needs
3. **Generate files** — `.liquid` file with schema, markup, and styles
4. **Generate translations** — locale keys for all user-facing strings
5. **Generate island** (if interactive) — Web Component in `theme/frontend/islands/`

## Example prompts

- "Create a new testimonial section with star ratings and author photos"
- "Add a FAQ block with accordion behavior"
- "Create a snippet for rendering a badge with variant colors"
- "Build a newsletter signup section with email validation"

## Composes with

| Skill | Why |
|-------|-----|
| [`/shopify-liquid`](./liquid-reference) | Schema syntax, setting types, filter reference |
| [`/shopify-liquid-kona-standards`](./coding-standards) | Tailwind classes, island lifecycle, CSS patterns |
| [`/shopify-liquid-a11y`](./accessibility) | Accessible markup baked into every new component |
| [`/shopify-liquid-translator`](./translator) | Generate translations for new locale keys |

## Next steps

- [`/shopify-liquid-translator`](./translator) — Translate the locale keys your new component generates
- [`/shopify-liquid-kona-standards`](./coding-standards) — CSS and JS conventions the creator follows
- [Project Layout](../architecture/project-layout) — Where generated files land in the theme
