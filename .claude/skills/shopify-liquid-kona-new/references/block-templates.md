# Block Templates

3 annotated production templates extracted from this theme. Use these as the basis for generating new blocks.

---

## 1. Leaf Block

Based on `heading.liquid`. Simple block with settings that renders a single element. No child blocks.

```liquid
{%- doc -%}
  Displays a heading element with configurable level and size.

  @param {string} [wrapper_class]
{%- enddoc -%}

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

<{{ heading_tag }}
  class="{{ wrapper_class }} font-heading font-heading-weight data-[size=xl]:text-display data-[size=lg]:text-heading data-[size=md]:text-lead"
  data-slot="heading"
  data-size="{{ block.settings.heading_size }}"
  {{ block.shopify_attributes }}
>
  {{- block.settings.heading | escape -}}
</{{ heading_tag }}>

{% schema %}
{
  "name": "t:blocks.{name}.name",
  "tag": null,
  "settings": [
    {
      "type": "inline_richtext",
      "id": "heading",
      "label": "t:blocks.{name}.settings.heading.label",
      "default": "t:blocks.{name}.settings.heading.default"
    },
    {
      "type": "select",
      "id": "heading_size",
      "options": [
        {
          "value": "",
          "label": "t:blocks.{name}.settings.heading_size.options__default.label"
        },
        {
          "value": "md",
          "label": "t:blocks.{name}.settings.heading_size.options__md.label"
        },
        {
          "value": "lg",
          "label": "t:blocks.{name}.settings.heading_size.options__lg.label"
        },
        {
          "value": "xl",
          "label": "t:blocks.{name}.settings.heading_size.options__xl.label"
        }
      ],
      "default": "",
      "label": "t:blocks.{name}.settings.heading_size.label"
    },
    {
      "type": "select",
      "id": "heading_level",
      "options": [
        {
          "value": "div",
          "label": "t:blocks.{name}.settings.heading_level.options__div.label"
        },
        {
          "value": "h1",
          "label": "t:blocks.{name}.settings.heading_level.options__h1.label"
        },
        {
          "value": "h2",
          "label": "t:blocks.{name}.settings.heading_level.options__h2.label"
        },
        {
          "value": "h3",
          "label": "t:blocks.{name}.settings.heading_level.options__h3.label"
        }
      ],
      "default": "div",
      "label": "t:blocks.{name}.settings.heading_level.label"
    }
  ],
  "presets": [
    {
      "name": "t:blocks.{name}.presets.name",
      "category": "t:blocks.{name}.presets.category"
    }
  ]
}
{% endschema %}
```

**Key patterns:**
- `{%- doc -%}` with `@param` for documenting accepted params
- `"tag": null` — prevents Shopify from wrapping in an extra element
- `{{ block.shopify_attributes }}` — required for theme editor highlighting
- `data-slot` attribute for CSS styling hooks from parent context
- `data-[size=value]:` Tailwind variants for setting-driven styling
- `case`/`when` for mapping select values to HTML tags
- `| escape` on user-entered text for XSS safety
- Select `"default": ""` with a "Default" option for "no override" pattern

### Leaf block variant: delegating to a snippet

Based on `button.liquid`. When a block's rendering logic is reusable, delegate to a snippet:

```liquid
{% doc %}
  Renders a button or link using the button snippet.
{% enddoc %}

{%- render 'button',
  content: block.settings.button_label,
  href: block.settings.button_link,
  size: block.settings.button_size,
  variant: block.settings.button_variant,
  shopify_attributes: block.shopify_attributes
-%}

{% schema %}
{
  "name": "t:blocks.{name}.name",
  "tag": null,
  "settings": [
    {
      "type": "text",
      "id": "button_label",
      "default": "t:blocks.{name}.settings.button_label.default",
      "label": "t:blocks.{name}.settings.button_label.label",
      "info": "t:blocks.{name}.settings.button_label.info"
    },
    {
      "type": "url",
      "id": "button_link",
      "label": "t:blocks.{name}.settings.button_link.label"
    },
    {
      "type": "select",
      "id": "button_variant",
      "options": [
        {
          "value": "",
          "label": "t:blocks.{name}.settings.button_variant.options__default.label"
        },
        {
          "value": "link",
          "label": "t:blocks.{name}.settings.button_variant.options__link.label"
        }
      ],
      "default": "",
      "label": "t:blocks.{name}.settings.button_variant.label"
    }
  ],
  "presets": [
    {
      "name": "t:blocks.{name}.presets.name",
      "category": "t:blocks.{name}.presets.category"
    }
  ]
}
{% endschema %}
```

**Key patterns:**
- Passes `shopify_attributes: block.shopify_attributes` to the snippet so the editor can highlight it
- `"info"` field on settings adds a help note below the input in the editor
- `"default"` on text settings uses `t:` key for translatable default value

---

## 2. Container Block

Based on `product-card.liquid`. Block that contains nested child blocks rendered via `content_for 'block'`.

```liquid
{%- doc -%}
  Renders a product card with nested blocks for image, title, and price.

  @param {boolean} [lazy_load]
  @param {string} [wrapper_class]
{%- enddoc -%}

{%- liquid
  assign card_product = block.settings.product
-%}

{%- if card_product and card_product != empty -%}
  <article
    class="relative"
    aria-labelledby="ProductTitle-{{ block.id }}"
    {{ block.shopify_attributes }}
  >
    <a href="{{ card_product.url }}" class="absolute inset-0 overflow-hidden">
      <span class="sr-only" id="ProductTitle-{{ block.id }}">{{ card_product.title }}</span>
    </a>
    <div class="grid snap-start gap-6 {% if wrapper_class != blank %} {{ wrapper_class }}{% endif %}">
      <div class="bg-primary/5 aspect-[4/5] overflow-hidden rounded">
        {%- content_for 'block', type: 'image', id: 'image', lazy_load: lazy_load -%}
      </div>
      <div class="grid gap-1">
        {%- content_for 'block', type: 'text', id: 'heading' -%}
        {%- content_for 'block', type: 'price', id: 'price' -%}
      </div>
    </div>
  </article>
{%- else -%}
  <div class="relative" {{ block.shopify_attributes }}>
    <div class="grid w-80 snap-start gap-6">
      <div class="bg-primary/5 aspect-[4/5] overflow-hidden rounded"></div>
      <div class="grid gap-1">
        <h3 class="text-copy">
          <a role="link" aria-disabled="true">
            {{ 'onboarding.product_title' | t }}
          </a>
        </h3>
        <div class="text-copy relative z-0 flex gap-4">
          <span>{{ 1999 | money_without_trailing_zeros }}</span>
        </div>
      </div>
    </div>
  </div>
{%- endif -%}

{% schema %}
{
  "name": "t:blocks.{name}.name",
  "tag": null,
  "settings": [
    {
      "type": "product",
      "id": "product",
      "label": "t:blocks.{name}.settings.product.label"
    }
  ],
  "presets": [
    {
      "name": "t:blocks.{name}.presets.name",
      "category": "t:blocks.{name}.presets.category",
      "settings": {
        "product": "{{ closest.product }}"
      }
    }
  ]
}
{% endschema %}
```

**Key patterns:**
- Nested blocks rendered with `{%- content_for 'block', type: 'image', id: 'image' -%}`
- `{{ closest.product }}` in preset — inherits product context from parent section loop
- Empty state fallback (placeholder content when no product selected)
- `<article>` with `aria-labelledby` for accessible product card
- Absolute link overlay pattern: `<a class="absolute inset-0">` over the card
- `sr-only` title inside the overlay link for screen readers
- `lazy_load` param passed through to child image block
- Aspect ratio container prevents layout shift: `aspect-[4/5]`

---

## 3. Group Block

Based on `_header-logo.liquid`. Internal block prefixed with `_` for use in specific sections. Minimal schema, typically no settings.

```liquid
{%- doc -%}
  Displays a logo in the header.
{%- enddoc -%}

{%- if request.page_type == 'index' -%}
  <h1 class="w-full lg:w-auto">
{%- endif %}
<a
  href="{{ routes.root_url }}"
  class="font-heading font-heading-weight flex h-full w-full flex-grow items-center justify-center self-stretch leading-[3rem] md:leading-[4rem] lg:inline lg:h-auto lg:w-auto lg:leading-none"
  {{ block.shopify_attributes }}
>
  {{ shop.name }}
</a>
{%- if request.page_type == 'index' -%}
  </h1>
{%- endif %}

{% schema %}
{
  "name": "t:blocks.{name}.name",
  "tag": null
}
{% endschema %}
```

**Key patterns:**
- Filename prefixed with `_` (e.g., `_header-logo.liquid`) — marks it as internal/group block
- Minimal schema: just `name` and `tag: null`, no settings or presets
- Conditional `<h1>` wrapping based on page type (SEO: only h1 on homepage)
- Uses `request.page_type` for context-aware rendering
- `routes.root_url` for safe linking to homepage
- `shop.name` for dynamic brand name
- Group blocks are referenced by specific sections, not added freely by merchants
