# Templates

Templates define which sections appear on each page type and their default configuration. Kona has 14 templates: 13 JSON templates and 1 Liquid template.

## JSON Template System

A JSON template contains no HTML or Liquid markup. It is a pure data file that declares:

1. **Which sections** to render (by referencing section filenames)
2. **What blocks** each section contains and their default settings
3. **The rendering order** of sections

When a customer visits a page, Shopify reads the matching JSON template, instantiates the listed sections, and renders them in order within the layout.

### Structure

Every JSON template follows this shape:

```json
{
  "sections": {
    "<section-key>": {
      "type": "<section-filename>",
      "settings": { ... },
      "blocks": { ... },
      "block_order": [ ... ]
    }
  },
  "order": ["<section-key>", ...]
}
```

| Property | Purpose |
|----------|---------|
| `sections` | Object mapping arbitrary keys to section configurations |
| `sections.<key>.type` | The section filename (without `.liquid`) from `theme/sections/` |
| `sections.<key>.settings` | Override values for the section's schema settings |
| `sections.<key>.blocks` | Object mapping block keys to block configurations |
| `sections.<key>.block_order` | Array controlling the render order of blocks (optional -- defaults to object key order) |
| `order` | Array controlling the render order of sections on the page |

### Minimal Example

The simplest template references a single section with no block overrides:

```json
{
  "sections": {
    "main": {
      "type": "main-page"
    }
  },
  "order": ["main"]
}
```

### Full Example

A more complex template with multiple sections, nested blocks, and settings:

```json
{
  "sections": {
    "image_banner": {
      "type": "image-banner",
      "blocks": {
        "heading": {
          "type": "heading",
          "settings": {
            "heading": "Image banner",
            "heading_size": "xl",
            "heading_level": "h2"
          }
        },
        "text": {
          "type": "text",
          "settings": {
            "text": "<p><strong>Banner description text.</strong></p>",
            "text_size": "lg"
          }
        },
        "button": {
          "type": "button",
          "settings": {
            "button_label": "Shop all",
            "button_variant": "link",
            "button_size": "lg",
            "button_link": "shopify://collections/all"
          }
        }
      },
      "block_order": ["heading", "text", "button"],
      "settings": {
        "full_page_height_enable": true,
        "lazy_load_enable": false
      }
    },
    "featured_collection": {
      "type": "featured-collection",
      "settings": {
        "collection": "all",
        "products_to_show": 8
      }
    }
  },
  "order": ["image_banner", "featured_collection"]
}
```

### The `closest` Mechanism

Several templates use <code v-pre>{{ closest.product }}</code>, <code v-pre>{{ closest.collection }}</code>, or <code v-pre>{{ closest.article }}</code> in block settings. This is Shopify's way of passing contextual data from a parent to nested blocks:

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
      "settings": {
        "product": "{{ closest.product }}"
      }
    }
  }
}
```

When a section iterates over products and renders a `product-card` block with `closest.product: product`, all child blocks inherit that product context through <code v-pre>{{ closest.product }}</code>.

### The `layout` Override

Most templates use the default layout (`theme/layout/theme.liquid`). Templates can specify an alternate layout:

```json
{
  "layout": "password",
  "sections": { ... },
  "order": [ ... ]
}
```

The `password.json` template uses this to load `theme/layout/password.liquid` instead of the default layout.

## Template Reference

### Product Pages

**`product.json`** -- Individual product pages. Contains `main-product` (with nested product-details, heading, vendor, price, variant-picker, buy-buttons, and tab blocks) and `product-recommendations`.

### Collection Pages

**`collection.json`** -- Collection listing pages. Contains a `section` (generic section with heading and description blocks) for the collection header, and `main-collection` with nested product-card blocks.

### Homepage

**`index.json`** -- The store homepage. Contains `image-banner`, `featured-collection`, `collection-list`, and `islands-demo` sections. This is the most section-rich template -- merchants typically customize it heavily in the editor.

### Cart

**`cart.json`** -- The cart page. Contains `main-cart` with a static heading block. Note: cart drawer functionality is separate (loaded from the layout via `{%- render 'cart-drawer' -%}`).

### Blog

**`blog.json`** -- Blog listing page. Contains `main-blog` with a static heading and article-card blocks with nested heading and image blocks.

**`article.json`** -- Individual blog article pages. Contains `main-article` with static heading and image blocks.

### Pages

**`page.json`** -- Standard CMS pages. Contains `main-page` with static heading and page-content blocks.

**`page.contact.json`** -- Contact page (alternate template). Contains `main-page` and `contact-form` sections. Shopify uses the `page.<name>.json` convention for alternate templates that merchants can assign to specific pages.

### Search

**`search.json`** -- Search results page. Contains `main-search` with static heading and product-card blocks (with nested text, price, and image).

### Collections List

**`list-collections.json`** -- Page showing all collections. Contains `main-list-collections` with static heading and collection-card blocks (with nested image and heading).

### Error Page

**`404.json`** -- Page not found. Uses the generic `section` section type with heading, text, and button blocks. The button links to `shopify://collections/all`.

### Password Page

**`password.json`** -- Store password/coming-soon page. Uses `"layout": "password"` to load an alternate layout. Contains `email-signup-banner` with heading, text, and email-signup blocks.

### Gift Card

**`gift_card.liquid`** -- The only Liquid template. Gift card pages are standalone documents that bypass the normal theme layout entirely via `{% layout none %}`. This template renders its own `<html>` document with:

- QR code generation (via `vendor/qrcode.js`)
- Gift card value display with currency formatting
- Copy-to-clipboard for the gift card code
- Apple Wallet integration link
- Print functionality

Gift card pages use the `vite-tag` snippet for CSS but do not load the theme JavaScript entry point, since they need minimal interactivity.

```liquid
{% layout none %}

<!doctype html>
<html class="h-full" lang="{{ request.locale.iso_code }}">
  <head>
    <script src="{{ 'vendor/qrcode.js' | shopify_asset_url }}" defer></script>
    ...
    {%- liquid
      render 'vite-tag', entry: 'theme.css'
    -%}
  </head>
  <body>
    ...
  </body>
</html>
```

## Template and Section Relationship

This table shows which sections each template uses:

| Template | Sections |
|----------|----------|
| `index.json` | image-banner, featured-collection, collection-list, islands-demo |
| `product.json` | main-product, product-recommendations |
| `collection.json` | section, main-collection |
| `cart.json` | main-cart |
| `blog.json` | main-blog |
| `article.json` | main-article |
| `page.json` | main-page |
| `page.contact.json` | main-page, contact-form |
| `search.json` | main-search |
| `list-collections.json` | main-list-collections |
| `404.json` | section |
| `password.json` | email-signup-banner |
| `gift_card.liquid` | (none -- standalone document) |

Note: The `header` and `footer` sections are loaded by the layout (`theme.liquid`), not by templates. They appear on every page.

## Also See

- [Sections & Blocks](./sections-blocks) -- how sections and blocks are defined
- [Liquid Patterns](./liquid-patterns) -- Liquid conventions used in templates and sections
- [Shopify Overview](./) -- the full OS 2.0 architecture
