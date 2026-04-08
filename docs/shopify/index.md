# Shopify Overview

Kona is a Shopify Online Store 2.0 (OS 2.0) theme. OS 2.0 introduces JSON templates and a composable section/block architecture that gives merchants full control over page layout through the theme editor -- without touching code.

This section covers the Shopify-specific patterns used in Kona. For the Vite build pipeline and islands hydration system, see the [Architecture](/architecture/) docs.

## OS 2.0 Architecture

The core data flow in an OS 2.0 theme follows a strict hierarchy:

```
Layout (theme.liquid)
  -> JSON Template (e.g., product.json)
    -> Sections (e.g., main-product, product-recommendations)
      -> Blocks (e.g., heading, price, buy-buttons)
        -> Snippets (reusable partials rendered via {% render %})
```

Each layer has a specific role:

| Layer | Location | Purpose |
|-------|----------|---------|
| **Layout** | `theme/layout/` | HTML shell (`<html>`, `<head>`, `<body>`), loads global sections (header, footer), entry points |
| **Templates** | `theme/templates/` | JSON files that define which sections appear on a page and in what order |
| **Sections** | `theme/sections/` | Self-contained page components with their own schema, settings, and markup |
| **Blocks** | `theme/blocks/` | Composable content units that nest inside sections (headings, text, buttons, etc.) |
| **Snippets** | `theme/snippets/` | Reusable Liquid partials (icons, price display, meta tags) |

## JSON Templates vs. Liquid Templates

OS 2.0 themes use **JSON templates** for most pages. A JSON template contains no markup -- it only declares which sections to render and what their default settings are. The actual HTML lives in the section files.

Kona has 13 JSON templates and 1 Liquid template:

- **JSON:** `product.json`, `collection.json`, `index.json`, `cart.json`, `article.json`, `blog.json`, `search.json`, `page.json`, `page.contact.json`, `list-collections.json`, `404.json`, `password.json`
- **Liquid:** `gift_card.liquid` -- uses `{% layout none %}` because gift card pages are standalone documents outside the normal theme layout

See [Templates](./templates) for details on each template.

## Sections and the Theme Editor

Sections are the building blocks of every page. Each section file contains:

1. **Liquid/HTML markup** -- the rendered output
2. **A `{% schema %}` block** -- a JSON definition that registers the section with the theme editor

The schema declares the section's name, settings, accepted block types, and presets. All names and labels use `t:` translation key references so they appear localized in the theme editor:

```liquid
{% schema %}
{
  "name": "t:sections.image_banner.name",
  "settings": [
    {
      "type": "image_picker",
      "id": "image",
      "label": "t:sections.image_banner.settings.image.label"
    }
  ],
  "blocks": [{ "type": "@theme" }],
  "presets": [
    {
      "name": "t:sections.image_banner.presets.name"
    }
  ]
}
{% endschema %}
```

When a section declares `"blocks": [{ "type": "@theme" }]`, it accepts any theme-level block (heading, text, button, etc.) -- giving merchants the flexibility to compose content in the editor.

See [Sections & Blocks](./sections-blocks) for the full breakdown.

## How Sections Connect to Islands

Sections render custom elements with hydration directives. The [islands architecture](/architecture/islands) picks up these elements and loads their JavaScript on demand:

```liquid
{%- comment -%} In theme/sections/header.liquid {%- endcomment -%}
<sticky-header client:idle>
  <header role="banner">
    ...
  </header>
</sticky-header>
```

The section provides the complete HTML (functional without JS), and the island (`theme/frontend/islands/sticky-header.js`) adds interactivity after hydration.

## Key Conventions

- **Schema translation keys:** All `name`, `label`, `info`, and `default` values in schemas use `t:` prefixed keys (e.g., `"label": "t:sections.header.settings.enable_sticky_header.label"`)
- **`{% render %}` over `{% include %}`:** Snippets are always loaded with `{% render %}`, which provides better encapsulation (no variable leakage)
- **LiquidDoc annotations:** Snippets and blocks use `{% doc %}` / `{%- doc -%}` tags with `@param` to document their interface
- **`content_for 'blocks'`:** Sections use `{%- content_for 'blocks' -%}` to render all their blocks, or `{%- content_for 'block', type: '...', id: '...' -%}` for targeted block rendering

## Section Pages

| Page | What It Covers |
|------|---------------|
| [Sections & Blocks](./sections-blocks) | Section schemas, block nesting, `@theme` blocks, presets |
| [Liquid Patterns](./liquid-patterns) | LiquidDoc, translation conventions, `{% render %}`, common patterns |
| [Templates](./templates) | All 14 templates, JSON structure, the gift_card.liquid exception |
| [Icons](./icons) | Phosphor Icons system, conversion process, sizing, accessibility |
