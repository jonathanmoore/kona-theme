# Section Templates

5 annotated production templates extracted from this theme. Use these as the basis for generating new sections.

---

## 1. Content Section (blocks-only)

Based on `email-signup-banner.liquid`. Section has no settings of its own — all content comes from blocks. Good for: rich text areas, signup banners, content modules.

```liquid
<div id="Section-{{ section.id }}" class="relative flex w-full flex-wrap">
  <div class="relative flex min-h-[34rem] w-full items-center justify-center">
    <div class="flex h-fit w-full flex-col items-center gap-4 px-6 text-center md:px-8 lg:px-12">
      {%- content_for 'blocks' -%}
    </div>
  </div>
</div>

{% schema %}
{
  "name": "t:sections.{name}.name",
  "tag": "section",
  "blocks": [{ "type": "@theme" }, { "type": "@app" }],
  "presets": [
    {
      "name": "t:sections.{name}.presets.name",
      "blocks": [
        {
          "type": "heading",
          "settings": {
            "heading": "t:sections.{name}.presets.blocks.heading.heading",
            "heading_level": "h2",
            "heading_size": "lg"
          }
        },
        {
          "type": "text",
          "settings": {
            "text": "t:sections.{name}.presets.blocks.text.text"
          }
        }
      ]
    }
  ]
}
{% endschema %}
```

**Key patterns:**
- No `"settings"` array — section is pure blocks container
- `{%- content_for 'blocks' -%}` renders all child blocks
- Preset defines the default block configuration (heading + text)
- Preset block setting values use `t:` keys for translatable defaults
- Centered layout with flex, responsive padding

---

## 2. Data-Driven Section

Based on `featured-collection.liquid`. Section has settings for data selection (collection picker, range) and uses static blocks for structured rendering.

```liquid
<div class="grid w-full gap-4 py-6 md:gap-8 md:py-8 lg:py-12">
  <div class="px-6 md:px-8 lg:px-12">
    {%- content_for 'block', type: 'heading', id: 'heading' -%}
  </div>
  <div class="swimlane hidden-scroll -mt-1 pt-1 md:scroll-px-8 md:px-8 md:pb-8 lg:scroll-px-12 lg:px-12">
    {%- for item in section.settings.collection.products limit: section.settings.products_to_show -%}
      {%- liquid
        assign lazy_load = true
        if section.index == 0 and forloop.first
          assign lazy_load = false
        endif
      -%}
      {%- content_for 'block',
        type: 'product-card',
        id: 'static-product-card',
        closest.product: item,
        lazy_load: lazy_load,
        wrapper_class: 'w-80'
      -%}
    {%- endfor -%}
  </div>
  {%- content_for 'blocks' -%}
</div>

{% schema %}
{
  "name": "t:sections.{name}.name",
  "blocks": [{ "type": "@theme" }, { "type": "@app" }],
  "settings": [
    {
      "type": "collection",
      "id": "collection",
      "label": "t:sections.{name}.settings.collection.label"
    },
    {
      "type": "range",
      "id": "products_to_show",
      "label": "t:sections.{name}.settings.products_to_show.label",
      "default": 5,
      "min": 5,
      "max": 15,
      "step": 1
    }
  ],
  "presets": [
    {
      "name": "t:sections.{name}.presets.name",
      "category": "t:sections.{name}.presets.category",
      "blocks": [
        {
          "type": "heading",
          "static": true,
          "id": "heading",
          "settings": {
            "heading": "t:sections.{name}.presets.blocks.heading.heading",
            "heading_level": "h2",
            "heading_size": "md"
          }
        },
        {
          "type": "product-card",
          "static": true,
          "id": "static-product-card",
          "settings": {
            "product": "{{ closest.product }}"
          }
        }
      ]
    }
  ]
}
{% endschema %}
```

**Key patterns:**
- `content_for 'block'` with `type:` and `id:` renders a specific static block inline
- `closest.product: product` passes loop context to nested blocks
- `lazy_load` optimization — eager loading for first-section first-item
- `swimlane hidden-scroll` — horizontal scrolling container (defined in `components.css`)
- Mixes static blocks (heading, product-card) with dynamic `{%- content_for 'blocks' -%}` for additional blocks

---

## 3. Media Section

Based on `image-banner.liquid`. Section with image picker settings, responsive aspect ratios, and content overlay.

```liquid
{%- liquid
  assign banner_class = 'aspect-[4/5] sm:aspect-square md:aspect-[5/4] lg:aspect-[3/2] xl:aspect-[2/1]'
  if section.settings.full_page_height_enable
    assign banner_class = 'h-screen-no-nav'
  endif

  assign preload = true
  assign loading = 'eager'
  assign fetchpriority = 'high'
  if section.index0 > 0
    assign loading = 'lazy'
    assign preload = false
    assign fetchpriority = 'auto'
  endif
-%}

<div id="Banner-{{ section.id }}" class="relative flex w-full flex-col justify-end {{ banner_class }}">
  <div class="pointer-events-none absolute inset-0 -z-10 grid flex-grow auto-cols-fr grid-flow-col content-stretch overflow-clip">
    {%- if section.settings.image != blank -%}
      <div>
        {%- liquid
          assign image_height = section.settings.image.width | divided_by: section.settings.image.aspect_ratio
          assign sizes = '100vw'
        -%}
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
      </div>
    {%- else -%}
      <div>
        {{ 'lifestyle-2' | placeholder_svg_tag: 'w-full h-full object-cover fill-primary/20' }}
      </div>
    {%- endif -%}
  </div>
  <div class="from-contrast/60 to-contrast/0 text-primary flex flex-col items-baseline gap-4 bg-gradient-to-t px-6 py-8 sm:px-8 md:px-12">
    {%- content_for 'blocks' -%}
  </div>
</div>

{% schema %}
{
  "name": "t:sections.{name}.name",
  "tag": "section",
  "settings": [
    {
      "type": "image_picker",
      "id": "image",
      "label": "t:sections.{name}.settings.image.label"
    },
    {
      "type": "checkbox",
      "id": "full_page_height_enable",
      "default": true,
      "label": "t:sections.{name}.settings.full_page_height_enable.label"
    }
  ],
  "blocks": [{ "type": "@theme" }],
  "presets": [
    {
      "name": "t:sections.{name}.presets.name",
      "category": "t:sections.{name}.presets.category",
      "blocks": {
        "heading": {
          "type": "heading",
          "settings": {
            "heading": "t:sections.{name}.presets.blocks.heading.heading",
            "heading_size": "xl",
            "heading_level": "h2"
          }
        },
        "text": {
          "type": "text",
          "settings": {
            "text": "t:sections.{name}.presets.blocks.text.text"
          }
        },
        "button": {
          "type": "button",
          "settings": {
            "button_label": "t:sections.{name}.presets.blocks.button.button_label",
            "button_variant": "link",
            "button_size": "lg"
          }
        }
      },
      "block_order": ["heading", "text", "button"]
    }
  ]
}
{% endschema %}
```

**Key patterns:**
- Conditional class assignment in `{% liquid %}` block for clean logic
- Image optimization: `image_url: width: 1500` + responsive `widths` + `fetchpriority`
- Eager loading for first section (`section.index0 > 0` check)
- Placeholder SVG fallback when no image selected
- Gradient overlay: `from-contrast/60 to-contrast/0 bg-gradient-to-t`
- Preset uses object-keyed blocks with `block_order` for explicit ordering

---

## 4. Configurable Layout Section

Based on `section.liquid`. Generic container with layout settings (gap, padding, width). Perfect for merchants who want a flexible blank section.

```liquid
<div
  class="pt-(--padding-block-start) pb-(--padding-block-end) gap-(--gap) grid w-full justify-items-start px-6 data-[width=full-width]:px-0 md:px-8 lg:px-12"
  data-width="{{ section.settings.section_width }}"
  style="
    --padding-block-start: {{ section.settings.padding-block-start | default: 0 }}px;
    --padding-block-end: {{ section.settings.padding-block-end | default: 0 }}px;
    --gap: {{ section.settings.gap | default: 0 }}px;
  "
>
  {%- content_for 'blocks' -%}
</div>

{% schema %}
{
  "name": "t:sections.{name}.name",
  "blocks": [{ "type": "@theme" }, { "type": "@app" }],
  "settings": [
    {
      "type": "header",
      "content": "t:sections.{name}.settings.header__layout.content"
    },
    {
      "type": "range",
      "id": "gap",
      "label": "t:sections.{name}.settings.gap.label",
      "min": 0,
      "max": 100,
      "step": 1,
      "unit": "px",
      "default": 12
    },
    {
      "type": "header",
      "content": "t:sections.{name}.settings.header__size.content"
    },
    {
      "type": "select",
      "id": "section_width",
      "label": "t:sections.{name}.settings.section_width.label",
      "options": [
        {
          "value": "page-width",
          "label": "t:sections.{name}.settings.section_width.options__page.label"
        },
        {
          "value": "full-width",
          "label": "t:sections.{name}.settings.section_width.options__full.label"
        }
      ],
      "default": "page-width"
    },
    {
      "type": "header",
      "content": "t:sections.{name}.settings.header__padding.content"
    },
    {
      "type": "range",
      "id": "padding-block-start",
      "label": "t:sections.{name}.settings.padding_block_start.label",
      "min": 0,
      "max": 100,
      "step": 1,
      "unit": "px",
      "default": 0
    },
    {
      "type": "range",
      "id": "padding-block-end",
      "label": "t:sections.{name}.settings.padding_block_end.label",
      "min": 0,
      "max": 100,
      "step": 1,
      "unit": "px",
      "default": 0
    }
  ],
  "presets": [
    {
      "name": "t:sections.{name}.presets.name"
    }
  ]
}
{% endschema %}
```

**Key patterns:**
- CSS variables via inline `style` for dynamic range values
- Tailwind arbitrary property syntax: `pt-(--padding-block-start)`, `gap-(--gap)`
- Data attribute for select values: `data-width` + `data-[width=full-width]:px-0`
- `header` setting type for visual grouping in the editor (no `id` needed)
- `| default: 0` filter for safe fallback values

---

## 5. Form Section

Based on `contact-form.liquid`. Section with `{% form %}` tag for Shopify form handling.

```liquid
<div class="mb-24 grid w-full gap-4 border-none px-6 md:gap-8 md:px-8 lg:px-12">
  <div class="mx-auto w-full max-w-prose">
    <h2 class="sr-only">{{ 'sections.{name}.form.title' | t }}</h2>
    {%- form 'contact', id: 'ContactForm', class: '' -%}
      {%- if form.posted_successfully? -%}
        <h2 class="text-lead mb-12" tabindex="-1" autofocus>
          {{ 'sections.{name}.form.post_success' | t }}
        </h2>
      {%- elsif form.errors -%}
        <div>
          <h2 class="text-lead text-notice" role="alert" tabindex="-1" autofocus>
            {{ 'sections.{name}.form.error_heading' | t }}
          </h2>
        </div>
      {%- endif -%}
      <div class="grid gap-6">
        <div class="grid gap-2">
          <label class="text-fine font-body-weight-bold" for="Form-{{ section.id }}-email">
            {{- 'sections.{name}.form.email' | t }}
            <span aria-hidden="true">*</span>
          </label>
          <input
            type="email"
            id="Form-{{ section.id }}-email"
            name="contact[email]"
            required
            aria-required="true"
            autocomplete="email"
            aria-describedby="FormError-{{ section.id }}-email"
            class="appearance-none rounded border border-primary/10 px-4 py-3 focus-visible:outline-2 focus-visible:outline-primary"
          >
          {%- if form.errors contains 'email' -%}
            <p id="FormError-{{ section.id }}-email" role="alert" class="text-notice text-fine">
              <span class="sr-only">{{ 'accessibility.error' | t }}</span>
              {{ form.errors.translated_fields.email | capitalize }}
              {{ form.errors.messages.email }}
            </p>
          {%- endif -%}
        </div>
        <button type="submit" class="button bg-primary text-contrast mt-4 w-full">
          {{ 'sections.{name}.form.submit' | t }}
        </button>
      </div>
    {%- endform -%}
  </div>
</div>

{% schema %}
{
  "name": "t:sections.{name}.name",
  "tag": "section",
  "presets": [
    {
      "name": "t:sections.{name}.presets.name"
    }
  ]
}
{% endschema %}
```

**Key patterns:**
- `{% form 'contact' %}` — Shopify form tag (also: `'product'`, `'customer_login'`, `'create_customer'`, etc.)
- `form.posted_successfully?` and `form.errors` for state handling
- `role="alert"` on error messages for screen reader announcement
- `tabindex="-1" autofocus` on success/error headings for focus management
- `aria-required="true"` + `required` on required fields
- `aria-describedby` linking input to its error message
- `autocomplete` attributes on common fields
- Form template strings go in `en.default.json` (not schema.json — these are customer-facing)
