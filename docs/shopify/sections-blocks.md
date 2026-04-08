# Sections & Blocks

Sections and blocks are the composable building blocks of Shopify OS 2.0 themes. Sections define page-level components; blocks are content units that nest inside them.

## Sections

A section is a self-contained Liquid file in `theme/sections/` that combines markup with a `{% schema %}` definition. Kona has 24 sections:

**Layout sections** (loaded by `theme.liquid` directly):
- `header` -- site header with navigation, search, cart icon
- `footer` -- site footer with menus, social links, country selector

**Cart sections:**
- `cart-drawer` -- slide-out cart drawer
- `cart-icon-bubble` -- cart count badge in the header
- `cart-live-region-text` -- screen reader announcements for cart updates
- `cart-subtotal` -- cart total display

**Main content sections** (one per template type):
- `main-product`, `main-collection`, `main-search`, `main-blog`, `main-article`, `main-page`, `main-cart`, `main-list-collections`, `main-password-header`, `main-password-footer`

**Composable sections** (can be added to any template via the editor):
- `image-banner`, `featured-collection`, `collection-list`, `email-signup-banner`, `contact-form`, `product-recommendations`, `section.liquid`, `islands-demo`

### How Sections Are Referenced

JSON templates reference sections by their filename (without `.liquid`):

```json
{
  "sections": {
    "main": {
      "type": "main-product"
    },
    "product-recommendations": {
      "type": "product-recommendations"
    }
  },
  "order": ["main", "product-recommendations"]
}
```

The key (e.g., `"main"`) is an arbitrary identifier used in the `order` array to control rendering sequence. The `"type"` value must match a filename in `theme/sections/`.

Layout sections are loaded differently -- they use the `{% section %}` tag directly in the layout file:

```liquid
{%- comment -%} In theme/layout/theme.liquid {%- endcomment -%}
{% section 'header' %}
<main role="main" id="MainContent" tabindex="-1">
  {{ content_for_layout }}
</main>
{% section 'footer' %}
```

## Blocks

Blocks are defined as separate Liquid files in `theme/blocks/`. Each block has its own `{% schema %}` and can be nested inside any section that accepts it. This is a key OS 2.0 pattern -- blocks are reusable across sections.

### Theme Blocks (`@theme`)

When a section declares `"blocks": [{ "type": "@theme" }]` in its schema, it accepts any block that has a `presets` entry in its schema. These are called "theme blocks" and include:

- `heading` -- configurable heading element (h1-h3 or div)
- `text` -- rich text content
- `button` -- link or button with variant/size options
- `image` -- responsive image display
- `price` -- product price with sale/compare-at support
- `product-card` -- product card with nested blocks for image, title, price
- `collection-card` -- collection card with image and title
- `article-card` -- blog article card
- `tab` -- collapsible tab/accordion
- `details` -- expandable details element
- And more (variant-picker, buy-buttons, email-signup, etc.)

### Rendering Blocks in Sections

Sections render their blocks using two approaches:

**Render all blocks** with `content_for 'blocks'`:

```liquid
{%- comment -%} In theme/sections/image-banner.liquid {%- endcomment -%}
<div class="flex flex-col items-baseline gap-4 px-6 py-8">
  {%- content_for 'blocks' -%}
</div>
```

This renders every block assigned to the section, in the order defined by the template or merchant.

**Render a specific block** by type and ID:

```liquid
{%- comment -%} In theme/sections/featured-collection.liquid {%- endcomment -%}
{%- content_for 'block', type: 'heading', id: 'heading' -%}
```

This approach is used when a section needs precise control over where individual blocks appear in its layout.

**Pass data to blocks** using the `closest` mechanism:

```liquid
{%- for product in section.settings.collection.products limit: section.settings.products_to_show -%}
  {%- content_for 'block',
    type: 'product-card',
    id: 'static-product-card',
    closest.product: product,
    lazy_load: lazy_load,
    wrapper_class: 'w-80'
  -%}
{%- endfor -%}
```

The `closest.product` parameter passes the current product to the block, which can then reference it in its settings as <code v-pre>{{ closest.product }}</code>.

### Static Blocks

Blocks can be marked as `"static": true` in JSON templates. Static blocks cannot be removed or reordered by merchants in the theme editor -- they are fixed parts of the section's structure:

```json
{
  "type": "main-search",
  "blocks": {
    "heading": {
      "type": "heading",
      "static": true,
      "id": "heading",
      "settings": {
        "heading": "Search",
        "heading_level": "h1"
      }
    }
  }
}
```

This is useful for structural blocks like page headings that should always be present.

### Nested Blocks

Blocks can contain other blocks, creating a tree structure. For example, a `product-card` block contains `image`, `text`, and `price` blocks:

```json
{
  "type": "product-card",
  "static": true,
  "settings": {
    "product": "{{ closest.product }}"
  },
  "blocks": {
    "heading": {
      "type": "text",
      "static": true,
      "settings": {
        "text": "<p>{{ closest.product.title }}</p>"
      }
    },
    "price": {
      "type": "price",
      "static": true,
      "id": "price",
      "settings": {
        "product": "{{ closest.product }}"
      }
    },
    "image": {
      "type": "image",
      "static": true,
      "id": "image",
      "settings": {
        "image": "{{ closest.product.featured_image }}"
      }
    }
  }
}
```

The parent block renders its children using the same `content_for 'block'` mechanism:

```liquid
{%- comment -%} In theme/blocks/product-card.liquid {%- endcomment -%}
<div class="grid snap-start gap-6">
  <div class="bg-primary/5 aspect-[4/5] overflow-hidden rounded">
    {%- content_for 'block', type: 'image', id: 'image', lazy_load: lazy_load -%}
  </div>
  <div class="grid gap-1">
    {%- content_for 'block', type: 'text', id: 'heading' -%}
    {%- content_for 'block', type: 'price', id: 'price' -%}
  </div>
</div>
```

## Schema Structure

Every section and block has a `{% schema %}` tag containing a JSON object. The schema registers the component with the Shopify theme editor.

### Section Schema

```liquid
{% schema %}
{
  "name": "t:sections.image_banner.name",
  "tag": "section",
  "settings": [
    {
      "type": "image_picker",
      "id": "image",
      "label": "t:sections.image_banner.settings.image.label"
    },
    {
      "type": "checkbox",
      "id": "full_page_height_enable",
      "default": true,
      "label": "t:sections.image_banner.settings.full_page_height_enable.label"
    }
  ],
  "blocks": [{ "type": "@theme" }],
  "presets": [
    {
      "name": "t:sections.image_banner.presets.name",
      "category": "t:sections.image_banner.presets.category"
    }
  ]
}
{% endschema %}
```

Key properties:

| Property | Purpose |
|----------|---------|
| `name` | Display name in the theme editor (uses `t:` translation key) |
| `tag` | HTML wrapper element (e.g., `"section"`, or `null` for no wrapper) |
| `settings` | Array of configurable settings (types: `image_picker`, `checkbox`, `text`, `select`, `range`, `collection`, `url`, etc.) |
| `blocks` | What block types the section accepts (`@theme` for any theme block, `@app` for app blocks, or specific types) |
| `presets` | Default configurations that appear in the "Add section" picker in the editor |

### Block Schema

```liquid
{% schema %}
{
  "name": "t:blocks.heading.name",
  "tag": null,
  "settings": [
    {
      "type": "inline_richtext",
      "id": "heading",
      "label": "t:blocks.heading.settings.heading.label",
      "default": "t:blocks.heading.settings.heading.default"
    }
  ],
  "presets": [
    {
      "name": "t:blocks.heading.presets.name",
      "category": "t:blocks.heading.presets.category"
    }
  ]
}
{% endschema %}
```

Blocks use `"tag": null` so they render without a wrapper element, giving the parent section full control over markup structure.

### Translation Keys in Schemas

All human-readable strings in schemas use `t:` prefixed translation keys instead of hardcoded text. This ensures the theme editor is localized for all languages Shopify supports:

```json
{
  "name": "t:sections.featured_collection.name",
  "label": "t:sections.featured_collection.settings.collection.label"
}
```

These keys resolve to values defined in `theme/locales/` JSON files. See [Liquid Patterns](./liquid-patterns) for more on translation conventions.

### Presets

Presets define default configurations for sections and blocks. When a merchant adds a new section from the theme editor, the preset determines the initial blocks and settings:

```json
"presets": [
  {
    "name": "t:sections.image_banner.presets.name",
    "category": "t:sections.image_banner.presets.category",
    "blocks": {
      "heading": {
        "type": "heading",
        "settings": {
          "heading": "t:sections.image_banner.presets.blocks.heading.heading",
          "heading_size": "xl",
          "heading_level": "h2"
        }
      },
      "text": {
        "type": "text",
        "settings": {
          "text": "t:sections.image_banner.presets.blocks.text.text",
          "text_size": "lg"
        }
      },
      "button": {
        "type": "button",
        "settings": {
          "button_label": "t:sections.image_banner.presets.blocks.button.button_label",
          "button_variant": "link",
          "button_size": "lg"
        }
      }
    },
    "block_order": ["heading", "text", "button"]
  }
]
```

Presets can include `block_order` to control the initial ordering of blocks.

## Also See

- [Templates](./templates) -- how JSON templates reference sections
- [Liquid Patterns](./liquid-patterns) -- LiquidDoc, `{% render %}`, and translation conventions
- [Architecture Overview](/architecture/) -- how sections connect to the islands hydration system
