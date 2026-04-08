---
name: shopify-liquid
description: "Shopify Liquid reference — syntax, filters, tags, objects, schema settings, LiquidDoc, and translation conventions. Use when writing or editing .liquid files, working with schema JSON, locale keys, or looking up Liquid objects/filters/tags."
---

# Shopify Liquid Reference

## Theme Architecture

```
sections/    # Full-width page modules with {% schema %} — hero, product grid, testimonials
blocks/      # Nestable components with {% schema %} — slides, feature items, text blocks
snippets/    # Reusable fragments via {% render %} — buttons, icons, image helpers
layout/      # Page wrappers (must include {{ content_for_header }} and {{ content_for_layout }})
templates/   # JSON files defining which sections appear on each page type
config/      # Global theme settings (settings_schema.json, settings_data.json)
locales/     # Translation files (en.default.json, fr.json, etc.)
assets/      # CSS, JS, images served via Shopify CDN
```

### When to use what

| Need | Use | Why |
|------|-----|-----|
| Full-width customizable module | **Section** | Has `{% schema %}`, appears in editor, renders blocks |
| Small nestable component with editor settings | **Block** | Has `{% schema %}`, can nest inside sections/blocks |
| Reusable logic, not editable by merchant | **Snippet** | No schema, rendered via `{% render %}`, takes params |
| Logic shared across blocks/snippets | **Snippet** | Blocks can't `{% render %}` other blocks |

## Liquid Syntax

### Delimiters

- `{{ ... }}` — Output (prints a value)
- `{{- ... -}}` — Output with whitespace trimming
- `{% ... %}` — Logic tag (if, for, assign) — prints nothing
- `{%- ... -%}` — Logic tag with whitespace trimming

### Operators

**Comparison:** `==`, `!=`, `>`, `<`, `>=`, `<=`
**Logical:** `and`, `or`, `contains`

### Critical Gotchas

1. **No parentheses** in conditions — use nested `{% if %}` instead
2. **No ternary** — always use `{% if cond %}value{% else %}other{% endif %}`
3. **`for` loops max 50 iterations** — use `{% paginate %}` for larger arrays
4. **`contains` only works with strings** — can't check objects in arrays
5. **Snippets can't access outer-scope variables** — pass them as render params
6. **`include` is deprecated** — always use `{% render 'snippet_name' %}`
7. **`{% liquid %}` tag** — multi-line logic without delimiters; use `echo` for output

### Variables

```liquid
{% assign my_var = 'value' %}
{% capture my_var %}computed {{ value }}{% endcapture %}
{% increment counter %}
{% decrement counter %}
```

## Filter Quick Reference

Filters are chained with `|`. Output type of one filter feeds input of next.

**Array:** `compact`, `concat`, `find`, `find_index`, `first`, `has`, `join`, `last`, `map`, `reject`, `reverse`, `size`, `sort`, `sort_natural`, `sum`, `uniq`, `where`
**String:** `append`, `capitalize`, `downcase`, `escape`, `handleize`, `lstrip`, `newline_to_br`, `prepend`, `remove`, `replace`, `rstrip`, `slice`, `split`, `strip`, `strip_html`, `truncate`, `truncatewords`, `upcase`, `url_decode`, `url_encode`
**Math:** `abs`, `at_least`, `at_most`, `ceil`, `divided_by`, `floor`, `minus`, `modulo`, `plus`, `round`, `times`
**Money:** `money`, `money_with_currency`, `money_without_currency`, `money_without_trailing_zeros`
**Color:** `color_brightness`, `color_darken`, `color_lighten`, `color_mix`, `color_modify`, `color_saturate`, `color_desaturate`, `color_to_hex`, `color_to_hsl`, `color_to_rgb`
**Media:** `image_url`, `image_tag`, `video_tag`, `external_video_tag`, `media_tag`, `model_viewer_tag`
**URL:** `asset_url`, `asset_img_url`, `file_url`, `shopify_asset_url`
**HTML:** `link_to`, `script_tag`, `stylesheet_tag`, `time_tag`, `placeholder_svg_tag`
**Localization:** `t` (translate), `format_address`, `currency_selector`
**Other:** `date`, `default`, `json`, `structured_data`, `font_face`, `font_url`, `payment_button`

> Full details: [language filters](references/filters-language.md), [HTML/media filters](references/filters-html-media.md), [commerce filters](references/filters-commerce.md)

## Tags Quick Reference

| Category | Tags |
|----------|------|
| **Theme** | `content_for`, `layout`, `section`, `sections`, `schema`, `style` |
| **Control** | `if`, `elsif`, `else`, `unless`, `case`, `when` |
| **Iteration** | `for`, `break`, `continue`, `cycle`, `tablerow`, `paginate` |
| **Variable** | `assign`, `capture`, `increment`, `decrement`, `echo` |
| **HTML** | `form`, `render`, `raw`, `comment`, `liquid` |
| **Documentation** | `doc` |

> Full details with syntax and parameters: [references/tags.md](references/tags.md)

## Objects Quick Reference

### Global objects (available everywhere)

`cart`, `collections`, `customer`, `localization`, `pages`, `request`, `routes`, `settings`, `shop`, `template`, `theme`, `linklists`, `images`, `blogs`, `articles`, `all_products`, `metaobjects`, `canonical_url`, `content_for_header`, `content_for_layout`, `page_title`, `page_description`, `handle`, `current_page`

### Page-specific objects

| Template | Objects |
|----------|---------|
| `/product` | `product`, `remote_product` |
| `/collection` | `collection`, `current_tags` |
| `/cart` | `cart` |
| `/article` | `article`, `blog` |
| `/blog` | `blog`, `current_tags` |
| `/page` | `page` |
| `/search` | `search` |
| `/customers/*` | `customer`, `order` |

> Full reference: [commerce objects](references/objects-commerce.md), [content objects](references/objects-content.md), [tier 2](references/objects-tier2.md), [tier 3](references/objects-tier3.md)

## Schema Tag

Sections and blocks require `{% schema %}` with a valid JSON object. Sections use `section.settings.*`, blocks use `block.settings.*`.

### Section schema structure

```json
{
  "name": "t:sections.hero.name",
  "tag": "section",
  "class": "hero-section",
  "limit": 1,
  "settings": [],
  "max_blocks": 16,
  "blocks": [{ "type": "@theme" }],
  "presets": [{ "name": "t:sections.hero.name" }],
  "enabled_on": { "templates": ["index"] },
  "disabled_on": { "templates": ["password"] }
}
```

### Block schema structure

```json
{
  "name": "t:blocks.slide.name",
  "tag": "div",
  "class": "slide",
  "settings": [],
  "blocks": [{ "type": "@theme" }],
  "presets": [{ "name": "t:blocks.slide.name" }]
}
```

### Setting type decision table

| Need | Setting Type | Key Fields |
|------|-------------|------------|
| On/off toggle | `checkbox` | `default: true/false` |
| Short text | `text` | `placeholder` |
| Long text | `textarea` | `placeholder` |
| Rich text (with `<p>`) | `richtext` | — |
| Inline rich text (no `<p>`) | `inline_richtext` | — |
| Number input | `number` | `placeholder` |
| Slider | `range` | `min`, `max`, `default` (all required), `step`, `unit` |
| Dropdown/segmented | `select` | `options: [{value, label}]` |
| Radio buttons | `radio` | `options: [{value, label}]` |
| Text alignment | `text_alignment` | `default: "left"/"center"/"right"` |
| Color picker | `color` | `default: "#000000"` |
| Image upload | `image_picker` | — |
| Video upload | `video` | — |
| External video URL | `video_url` | `accept: ["youtube", "vimeo"]` |
| Product picker | `product` | — |
| Collection picker | `collection` | — |
| Page picker | `page` | — |
| Blog picker | `blog` | — |
| Article picker | `article` | — |
| URL entry | `url` | — |
| Menu picker | `link_list` | — |
| Font picker | `font_picker` | `default` (required) |
| Editor header | `header` | `content` (no `id` needed) |
| Editor description | `paragraph` | `content` (no `id` needed) |

### `visible_if` pattern

```json
{
  "visible_if": "{{ block.settings.layout == 'vertical' }}",
  "type": "select",
  "id": "alignment",
  "label": "t:labels.alignment",
  "options": [...]
}
```

Conditionally shows/hides a setting in the editor based on other setting values.

### Block entry types

- `{ "type": "@theme" }` — Accept any theme block
- `{ "type": "@app" }` — Accept app blocks
- `{ "type": "slide" }` — Accept only the `slide` block type

> Full schema details and all 33 setting types: [references/schema-and-settings.md](references/schema-and-settings.md)

## CSS & JavaScript in Liquid

### `{% style %}` tag (Liquid-aware CSS)

For dynamic CSS that needs Liquid values (e.g., color settings that live-update in editor):

```liquid
{% style %}
  .section-{{ section.id }} {
    --section-bg: {{ section.settings.bg_color }};
    --section-padding: {{ section.settings.padding }}px;
  }
{% endstyle %}
```

### CSS patterns for settings

**Single CSS property** — use CSS variables via inline style:
```liquid
<div style="--gap: {{ block.settings.gap }}px" class="flex flex-col">
```

**Multiple CSS properties** — use CSS classes as select values:
```liquid
<div class="{{ block.settings.layout }}">
```

## LiquidDoc (`{% doc %}`)

**Required for:** snippets (always), blocks (when statically rendered via `{% content_for 'block' %}`)

```liquid
{% doc %}
  Brief description of what this file renders.

  @param {type} name - Description of required parameter
  @param {type} [name] - Description of optional parameter (brackets = optional)

  @example
  {% render 'snippet-name', name: value %}
{% enddoc %}
```

**Param types:** `string`, `number`, `boolean`, `image`, `object`, `array`

## Translations

### Every user-facing string must use the `t` filter

```liquid
<!-- Correct -->
<h2>{{ 'sections.hero.heading' | t }}</h2>
<button>{{ 'products.add_to_cart' | t }}</button>

<!-- Wrong — never hardcode strings -->
<h2>Welcome to our store</h2>
```

### Variable interpolation

```liquid
{{ 'products.price_range' | t: min: product.price_min | money, max: product.price_max | money }}
```

Locale file:
```json
{
  "products": {
    "price_range": "From {{ min }} to {{ max }}"
  }
}
```

### Locale file structure

```
locales/
├── en.default.json          # English translations (required)
├── en.default.schema.json   # Editor setting translations (required)
├── fr.json                  # French translations
└── fr.schema.json           # French editor translations
```

### Key naming conventions

- Use **snake_case** and **hierarchical keys** (max 3 levels)
- Use **sentence case** for all text (capitalize first word only)
- Schema labels use `t:` prefix: `"label": "t:labels.heading"`
- Group by component: `sections.hero.heading`, `blocks.slide.title`

## JSON Template & Config Files

Theme templates (`templates/*.json`), section groups (`sections/*.json`), and config files (`config/settings_data.json`) are all JSON. Use `jq` via the `bash` tool to make surgical edits — it's safer and more reliable than string-based find-and-replace for structured data.

### Common patterns

```bash
# Add a section to a template
jq '.sections.new_section = {"type": "hero", "settings": {"heading": "Welcome"}}' templates/index.json > /tmp/out && mv /tmp/out templates/index.json

# Update a setting value
jq '.current.sections.header.settings.logo_width = 200' config/settings_data.json > /tmp/out && mv /tmp/out config/settings_data.json

# Reorder sections
jq '.order += ["new_section"]' templates/index.json > /tmp/out && mv /tmp/out templates/index.json

# Remove a section
jq 'del(.sections.old_banner) | .order -= ["old_banner"]' templates/index.json > /tmp/out && mv /tmp/out templates/index.json

# Read a nested value
jq '.sections.header.settings' templates/index.json
```

**Prefer `jq` over `edit`** for any `.json` file modification — it validates structure, handles escaping, and avoids whitespace/formatting issues.

## Related Skills

- `/shopify-liquid-a11y` — WCAG 2.2 accessibility patterns for Liquid theme components
- `/shopify-liquid-translator` — Locale translation generation and hardcoded string auditing
- `/shopify-liquid-kona-standards` — CSS/JS/HTML coding standards (Kona theme-specific)
- `/shopify-liquid-kona-new` — Guided component creation workflow (Kona theme-specific)

## References

- Filters: [language](references/filters-language.md) (77), [HTML/media](references/filters-html-media.md) (45), [commerce](references/filters-commerce.md) (30)
- [Tag reference (30 tags)](references/tags.md)
- Objects: [commerce](references/objects-commerce.md) (5), [content](references/objects-content.md) (10), [tier 2](references/objects-tier2.md) (69), [tier 3](references/objects-tier3.md) (53)
- [Schema & settings reference (33 types)](references/schema-and-settings.md)
- [Complete examples (snippet, block, section)](references/examples.md)
