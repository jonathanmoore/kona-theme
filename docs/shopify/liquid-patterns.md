# Liquid Patterns

This page covers the Liquid conventions and patterns used throughout Kona. For Shopify's Liquid language reference, see [shopify.dev/docs/api/liquid](https://shopify.dev/docs/api/liquid).

## LiquidDoc

Snippets and blocks use `{% doc %}` tags (also written `{%- doc -%}` with whitespace trimming) to document their interface. LiquidDoc is Shopify's annotation system for Liquid files -- it declares what parameters a snippet accepts, their types, and whether they are optional.

### Snippet Example

```liquid
{%- doc -%}
  Displays a button or link.

  @param {string} content
  @param {string} [href]
  @param {string} [type]
  @param {string} [variant]
  @param {string} [size]
  @param {string} [shopify_attributes]
{%- enddoc -%}

{%- liquid
  assign button_tag = 'button'
  if href != blank
    assign button_tag = 'a'
  endif
-%}

{%- if content != blank -%}
  <{{ button_tag }}
    class="button bg-primary text-contrast flex items-center gap-2"
    {% if href != blank %}href="{{ href }}"{% endif %}
  >
    {{- content -}}
  </{{ button_tag }}>
{%- endif -%}
```

### Block Example

```liquid
{%- doc -%}
  Renders a product card

  @param {boolean} [lazy_load]
  @param {string} [wrapper_class]
  @param {string} [media_aspect_ratio]
{%- enddoc -%}

{%- liquid
  assign card_product = block.settings.product
-%}
```

### Annotation Syntax

| Annotation | Meaning |
|-----------|---------|
| `@param {string} content` | Required string parameter named `content` |
| `@param {string} [href]` | Optional string parameter (brackets = optional) |
| `@param {boolean} [lazy_load]` | Optional boolean parameter |
| `@param {product} product` | Required parameter typed as a Shopify product object |

Parameters declared in `{% doc %}` map directly to arguments passed via `{% render %}` or `{%- content_for 'block' -%}`:

```liquid
{%- render 'button',
  content: block.settings.button_label,
  href: block.settings.button_link,
  size: block.settings.button_size,
  variant: block.settings.button_variant
-%}
```

### Icon Snippets

Icon snippets use a simpler `{% doc %}` form with just a description and no `@param` tags, since they take no parameters:

```liquid
{% doc %}
  Renders a right-pointing arrow icon.
{% enddoc %}

<svg viewBox="0 0 14 10" fill="none" aria-hidden="true" focusable="false" role="presentation" class="icon icon-arrow" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="..." fill="currentColor">
</svg>
```

## Translation Conventions

Translations appear in two contexts with different syntax:

### In Schemas (`t:` prefix)

Schema strings use the `t:` prefix to reference translation keys. These are resolved by the theme editor:

```json
{
  "name": "t:sections.header.name",
  "label": "t:sections.header.settings.enable_sticky_header.label",
  "info": "t:sections.header.settings.enable_sticky_header.info",
  "default": "t:blocks.heading.settings.heading.default"
}
```

The keys map to entries in `theme/locales/` JSON files. For example, `t:sections.header.name` resolves to the value at `sections.header.name` in the locale file.

### In Templates (`| t` filter)

Liquid templates use the `| t` translation filter to output localized strings at render time:

```liquid
{{ 'general.search.search' | t }}
{{ 'products.product.price.sale_price' | t }}
{{ 'gift_cards.issued.title' | t: value: formatted_initial_value, shop: shop.name }}
```

The `| t` filter can accept named parameters for interpolation (e.g., `value:`, `shop:`).

### Where Each Syntax Is Used

| Context | Syntax | Example |
|---------|--------|---------|
| Schema `name`, `label`, `info` | `t:` prefix | `"name": "t:sections.header.name"` |
| Schema `default` values | `t:` prefix | `"default": "t:blocks.heading.settings.heading.default"` |
| Preset block settings | `t:` prefix | `"heading": "t:sections.image_banner.presets.blocks.heading.heading"` |
| Liquid template output | `\| t` filter | <code v-pre>{{ 'accessibility.skip_to_text' \| t }}</code> |
| JavaScript strings via Liquid | `\| t` filter | <code v-pre>addToCart: \`{{ 'products.product.add_to_cart' \| t }}\`</code> |

## `{% render %}` for Snippets

Kona uses `{% render %}` exclusively for loading snippets. The older `{% include %}` tag is not used because `{% render %}` provides better encapsulation -- variables from the parent template do not leak into the snippet's scope.

### Basic Usage

```liquid
{% render 'icon-search' %}
{% render 'meta-tags' %}
{%- render 'cart-drawer' -%}
```

### With Parameters

```liquid
{%- render 'button',
  content: block.settings.button_label,
  href: block.settings.button_link,
  size: block.settings.button_size,
  variant: block.settings.button_variant,
  shopify_attributes: block.shopify_attributes
-%}
```

```liquid
{%- render 'price',
  product: card_product,
  use_variant: true,
  price_class: 'text-sm'
-%}
```

### Whitespace Control

Use the `{%-` and `-%}` delimiters to trim surrounding whitespace. This is important for inline elements like icons:

```liquid
{%- render 'icon-search' -%}
{%- render 'cart-icon-bubble' -%}
```

## Common Liquid Patterns

### Conditional Assignment with `{%- liquid %}`

Multi-line logic blocks use the `{%- liquid %}` tag to avoid scattering `{% assign %}` and `{% if %}` throughout the markup:

```liquid
{%- liquid
  assign banner_class = 'aspect-[4/5] sm:aspect-square'
  if section.settings.full_page_height_enable
    assign banner_class = 'h-screen-no-nav'
  endif

  assign preload = true
  assign loading = 'eager'
  if section.index0 > 0
    assign loading = 'lazy'
    assign preload = false
  endif
-%}
```

### Dynamic HTML Tags

Several components use dynamic tag names for semantic flexibility:

```liquid
{%- liquid
  assign heading_tag = 'div'
  case block.settings.heading_level
    when 'h1'
      assign heading_tag = 'h1'
    when 'h2'
      assign heading_tag = 'h2'
    when 'h3'
      assign heading_tag = 'h3'
  endcase
-%}

<{{ heading_tag }} class="font-heading font-heading-weight" {{ block.shopify_attributes }}>
  {{- block.settings.heading | escape -}}
</{{ heading_tag }}>
```

This pattern appears in the heading block, where merchants choose the heading level, and in the button snippet, which renders as `<a>` or `<button>` depending on whether an `href` is provided.

### Image Rendering

Images use Shopify's `image_url` and `image_tag` filters for responsive loading:

```liquid
{{
  section.settings.image
  | image_url: width: 1500
  | image_tag:
    loading: loading,
    preload: preload,
    fetchpriority: fetchpriority,
    width: section.settings.image.width,
    height: image_height,
    class: 'block object-cover w-full h-full',
    sizes: sizes,
    widths: '375, 550, 750, 1100, 1500, 1780, 2000, 3000, 3840',
    alt: section.settings.image.alt
  | escape
}}
```

The `widths` parameter generates a `srcset` for responsive images. The `loading` and `fetchpriority` values depend on the section's position -- above-the-fold images use `eager` loading; below-the-fold use `lazy`.

### CSS Variables from Theme Settings

The layout file bridges Shopify's theme settings with CSS custom properties, which Tailwind's `@theme` block then consumes:

```liquid
{% style %}
  :root {
    --font-body-family: {{ settings.type_body_font.family }}, {{ settings.type_body_font.fallback_families }};
    --font-body-weight: {{ settings.type_body_font.weight }};
    --color-primary: {{ settings.colors_primary }};
    --color-contrast: {{ settings.colors_contrast }};
    --color-accent: {{ settings.colors_accent }};
  }
{% endstyle %}
```

This pattern is covered in detail in the [CSS documentation](/css/).

### Placeholder Content

When a setting is empty (e.g., no image selected), sections render placeholder SVGs:

```liquid
{%- if section.settings.image != blank -%}
  {{ section.settings.image | image_url: width: 1500 | image_tag: ... }}
{%- else -%}
  {{ 'lifestyle-2' | placeholder_svg_tag: 'w-full h-full object-cover fill-primary/20' }}
{%- endif -%}
```

Shopify provides a set of placeholder SVGs (`lifestyle-1`, `lifestyle-2`, `product-1`, etc.) that render in the theme editor when merchants have not yet selected real content.

## Also See

- [Sections & Blocks](./sections-blocks) -- schema structure, block nesting, presets
- [Templates](./templates) -- how JSON templates wire sections together
- [Icons](./icons) -- icon snippet conventions and LiquidDoc patterns
- [Architecture Overview](/architecture/) -- how Liquid output connects to client-side hydration
