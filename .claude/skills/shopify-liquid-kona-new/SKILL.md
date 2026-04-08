---
name: shopify-liquid-kona-new
description: "Interactive guided workflow for creating new Shopify theme components — sections, blocks, and snippets — with correct schema, translation keys, LiquidDoc, accessibility, and Kona conventions. Invoke with: /shopify-liquid-kona-new [section|block|snippet] [name]"
---

# Kona Component Creator

Guided workflow for creating new theme components (sections, blocks, snippets) that follow this project's conventions. Generates production-ready `.liquid` files with correct schema JSON, translation keys, LiquidDoc headers, accessible markup, and Tailwind styling.

## Invocation

```
/shopify-liquid-kona-new                          # Interactive — asks what to create
/shopify-liquid-kona-new section [type]           # Create a section (hero, faq, etc.)
/shopify-liquid-kona-new block [type]             # Create a block (testimonial, slide, etc.)
/shopify-liquid-kona-new snippet [name]           # Create a snippet (star-rating, badge, etc.)
```

**Composes with other skills** — load these for deep patterns rather than duplicating:
- `/shopify-liquid` — Schema syntax, filter/tag reference, setting types
- `/shopify-liquid-kona-standards` — Tailwind v4, island hydration, CSS variable cascade, JS rules
- `/shopify-liquid-a11y` — WCAG 2.2 patterns, focus management, ARIA
- `/shopify-liquid-translator` — Translation key generation and locale file insertion

## Decision Guide: Section vs Block vs Snippet

| Need | Create | Why |
|------|--------|-----|
| Full-width customizable page module | **Section** | Has `{% schema %}`, appears in theme editor sidebar, renders blocks |
| Nestable component with editor settings | **Block** | Has `{% schema %}`, sits inside sections or other blocks |
| Reusable logic fragment, not merchant-editable | **Snippet** | No schema, rendered via `{% render %}`, accepts params |
| Logic shared across blocks/snippets | **Snippet** | Blocks can't `{% render %}` other blocks |

---

## Section Workflow

### Section Type Catalog

| Type | Settings Pattern | Block Pattern | Needs Island? |
|------|-----------------|---------------|---------------|
| Hero / Image Banner | image_picker, checkbox | heading, text, button blocks | No |
| Featured Collection | collection, range | static product-card + heading | No |
| Rich Text | none (all blocks) | heading, text, button | No |
| Image with Text | image_picker, select (layout) | heading, text, button | No |
| Slideshow | range, checkbox | image slide blocks | Yes |
| FAQ / Accordion | none (all blocks) | details blocks | Optional |
| Testimonials | range (columns) | testimonial blocks | No |
| Multicolumn | range (columns) | column blocks | No |
| Newsletter / Email Signup | none (all blocks) | heading, text, email-signup | No |
| Tabs | none (all blocks) | tab blocks | Yes |
| Contact Form | none | uses `{% form 'contact' %}` | No |
| Configurable Layout | range (gap, padding), select (width) | any `@theme` blocks | No |

### Guided Steps

1. **Identify section type** — Match to catalog above or define custom
2. **Gather content requirements** — What content does it display? (headings, images, products, forms)
3. **Determine settings** — Which properties should be merchant-customizable?
4. **Check interactivity** — Does it need JavaScript? If yes, create a companion island
5. **Generate files:**
   - Section `.liquid` file in `theme/sections/`
   - Translation keys in `theme/locales/en.default.schema.json`
   - Companion blocks if needed (in `theme/blocks/`)
   - Companion island if interactive (in `theme/frontend/islands/`)
6. **Run quality checklist** — [references/checklist.md](references/checklist.md)

### Section Generation Rules

**File:** `theme/sections/{kebab-case-name}.liquid`

**Markup structure:**
```liquid
<div id="Section-{{ section.id }}" class="...Tailwind utilities...">
  {%- content_for 'blocks' -%}
</div>

{% schema %}
{
  "name": "t:sections.{snake_case_name}.name",
  "tag": "section",
  "settings": [...],
  "blocks": [{ "type": "@theme" }, { "type": "@app" }],
  "presets": [
    {
      "name": "t:sections.{snake_case_name}.presets.name",
      "category": "t:sections.{snake_case_name}.presets.category",
      "blocks": [...]
    }
  ]
}
{% endschema %}
```

**Key rules:**
- Section ID in wrapper: `id="SectionName-{{ section.id }}"`
- Render child blocks via `{%- content_for 'blocks' -%}`
- For static/inline blocks: `{%- content_for 'block', type: 'name', id: 'name' -%}`
- Responsive padding: `px-6 md:px-8 lg:px-12` (standard page-width pattern)
- All schema strings use `t:` prefix
- Presets define the default block configuration merchants see
- `"blocks": [{ "type": "@theme" }, { "type": "@app" }]` — accepts all theme and app blocks

**CRITICAL — `content_for 'block'` constraint:**

`content_for 'block'` requires **static, compile-time** `type:` and `id:` values. You CANNOT pass dynamic variables from a `for` loop:

```liquid
{%- comment -%} WRONG — causes Liquid syntax error {%- endcomment -%}
{%- for block in section.blocks -%}
  {%- content_for 'block', id: block.id -%}
{%- endfor -%}

{%- comment -%} CORRECT — use content_for 'blocks' to render all dynamic blocks {%- endcomment -%}
{%- content_for 'blocks' -%}

{%- comment -%} CORRECT — static type and id known at compile time {%- endcomment -%}
{%- content_for 'block', type: 'heading', id: 'heading' -%}
```

If you need to wrap each block in extra markup (e.g., slide containers for a carousel), put that wrapping markup inside the **block file itself**, not in the section's loop.

**Templates:** See [references/section-templates.md](references/section-templates.md) for 5 annotated production examples.

---

## Block Workflow

### Block Type Catalog

| Block Pattern | Example | Has Child Blocks? | `tag` |
|--------------|---------|-------------------|-------|
| Leaf block | heading, text, button, price, image | No | `null` |
| Container block | product-card, product-details | Yes — renders `{%- content_for 'blocks' -%}` | `null` |
| Group block | _header-logo, _footer-menu | Yes — prefixed with `_` for internal use | `null` |

### Guided Steps

1. **Identify block type and purpose** — What content does it represent?
2. **Determine settings** — Text fields, pickers, selects, ranges
3. **Decide if container or leaf** — Does it need child blocks?
4. **Check if it delegates to a snippet** — Many blocks call `{% render %}` for code reuse
5. **Generate files:**
   - Block `.liquid` file in `theme/blocks/`
   - Translation keys in `theme/locales/en.default.schema.json`
   - Companion snippet if it delegates rendering
6. **Run quality checklist** — [references/checklist.md](references/checklist.md)

### Block Generation Rules

**File:** `theme/blocks/{kebab-case-name}.liquid` (prefix with `_` for group blocks)

**Markup structure:**
```liquid
{%- doc -%}
  Brief description of what this block renders.

  @param {string} [wrapper_class]
{%- enddoc -%}

<{tag}
  class="{{ wrapper_class }} ...Tailwind utilities..."
  data-slot="{name}"
  {{ block.shopify_attributes }}
>
  {{- block.settings.content -}}
</{tag}>

{% schema %}
{
  "name": "t:blocks.{snake_case_name}.name",
  "tag": null,
  "settings": [...],
  "presets": [
    {
      "name": "t:blocks.{snake_case_name}.presets.name",
      "category": "t:blocks.{snake_case_name}.presets.category"
    }
  ]
}
{% endschema %}
```

**Key rules:**
- ALL blocks MUST have `{%- doc -%}` tag documenting params
- Outer element MUST include `{{ block.shopify_attributes }}` for theme editor
- `"tag": null` — blocks should not render a wrapper element (Shopify adds one otherwise)
- Use `data-slot="{name}"` for CSS styling hooks
- Use `data-[attr=value]:` Tailwind variants for setting-driven styling
- Container blocks render children via `{%- content_for 'blocks' -%}`

**Translation key pattern:**
```
blocks.{snake_case_name}.name
blocks.{snake_case_name}.settings.{setting_id}.label
blocks.{snake_case_name}.settings.{setting_id}.default    (text types only)
blocks.{snake_case_name}.settings.{setting_id}.options__{value}.label
blocks.{snake_case_name}.presets.name
blocks.{snake_case_name}.presets.category
```

**Templates:** See [references/block-templates.md](references/block-templates.md) for 3 annotated production examples.

---

## Snippet Workflow

### Snippet Pattern Catalog

| Pattern | Example | When to Use |
|---------|---------|-------------|
| Utility snippet | button, price, badge | Reused across many blocks/sections |
| Icon snippet | icon-arrow, icon-search, icon-bag | SVG icon rendered via `{% render 'icon-name' %}` |
| Component snippet | header-drawer, cart-drawer | Complex UI fragment with island integration |

### Guided Steps

1. **Identify snippet purpose** — What does it render? Where will it be used?
2. **Define parameters** — Name, type, required/optional
3. **Check if interactive** — Needs a companion island with hydration directive?
4. **Generate files:**
   - Snippet `.liquid` file in `theme/snippets/`
   - Template translation keys in `theme/locales/en.default.json` (if any user-facing strings)
   - Companion island if interactive (in `theme/frontend/islands/`)
5. **Run quality checklist** — [references/checklist.md](references/checklist.md)

### Snippet Generation Rules

**File:** `theme/snippets/{kebab-case-name}.liquid`

**Markup structure:**
```liquid
{%- doc -%}
  Brief description of what this snippet renders.

  @param {string} content - Description of required param
  @param {string} [optional_param] - Description of optional param
{%- enddoc -%}

{%- if content != blank -%}
  <div class="...Tailwind utilities...">
    {{- content -}}
  </div>
{%- endif -%}
```

**Key rules:**
- ALL snippets MUST have `{%- doc -%}` tag with `@param` entries
- Rendered via `{% render 'name', param1: value1, param2: value2 %}`
- **Cannot access outer scope** — all data must be passed as params
- No `{% schema %}` — snippets have no schema
- Template strings use `| t` filter (not `t:` prefix — that's for schema only)
- Guard against blank params: `{%- if content != blank -%}`
- Use conditional attributes: `{% if size != blank %}data-size="{{ size }}"{% endif %}`
- For dynamic tag selection: `assign tag = 'button'` / `if href != blank` / `assign tag = 'a'`

**Component snippet with island:**
```liquid
{%- doc -%}
  Description.

  @param {string} shopify_attributes
{%- enddoc -%}

<my-component client:visible {{ shopify_attributes }}>
  <!-- No-JS fallback markup -->
</my-component>
```

The island file goes in `theme/frontend/islands/my-component.js` and follows the Web Component pattern from `/shopify-liquid-kona-standards`.

**Icon snippet (Phosphor Icons):**

This theme uses [Phosphor Icons](https://phosphoricons.com/) **regular** weight exclusively. The package `@phosphor-icons/core` is installed as a devDependency — SVG sources are at `node_modules/@phosphor-icons/core/assets/regular/`.

Before creating an icon, **check if one already exists** — there are 22+ icon snippets in `theme/snippets/icon-*.liquid`. List them with: `ls theme/snippets/icon-*.liquid`

To create a new icon snippet:

1. Find the SVG source: `ls node_modules/@phosphor-icons/core/assets/regular/ | grep {name}`
2. Read the SVG file to get the `<path>` data
3. Create `theme/snippets/icon-{name}.liquid`:

```liquid
{% doc %}
  Renders a {name} icon.
{% enddoc %}

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 256 256"
  fill="currentColor"
  aria-hidden="true"
  focusable="false"
  role="presentation"
  class="icon icon-{name}"
>
  <path d="...path data from Phosphor source..."/>
</svg>
```

**Icon conversion rules:**
- Keep `viewBox="0 0 256 256"` and `fill="currentColor"` from Phosphor source
- Add `aria-hidden="true" focusable="false" role="presentation"` (decorative icons)
- Add `class="icon icon-{name}"`
- If the icon IS the only content (icon-only button), drop `aria-hidden`/`focusable`/`role` and use `aria-label` on the parent button instead
- Size icons via Tailwind on the parent: `<span class="block h-5 w-5">{% render 'icon-star' %}</span>` — the `block` is required since `<span>` is inline and ignores height/width
- Never mix icon weights — this theme uses **regular** weight only

See [docs/icons.md](/docs/icons.md) for the full icon system reference.

**Templates:** See [references/snippet-templates.md](references/snippet-templates.md) for 2 annotated production examples.

---

## Shared Generation Rules

### Naming

| Context | Convention | Example |
|---------|-----------|---------|
| File names | kebab-case | `image-banner.liquid`, `product-card.liquid` |
| Schema `name` key path | snake_case | `sections.image_banner.name` |
| Setting `id` | snake_case | `heading_size`, `button_label` |
| Translation keys | snake_case, hierarchical | `blocks.heading.settings.heading.label` |
| CSS data attributes | kebab-case values | `data-size="lg"`, `data-variant="link"` |
| Island file names | kebab-case matching tag | `cart-drawer.js` → `<cart-drawer>` |

### Translation Keys

**Schema strings** — go in `theme/locales/en.default.schema.json` with `t:` prefix in schema:

```json
{
  "sections": {
    "my_section": {
      "name": "My section",
      "settings": {
        "heading": { "label": "Heading" }
      },
      "presets": {
        "name": "My section",
        "category": "Content"
      }
    }
  }
}
```

**Template strings** — go in `theme/locales/en.default.json` with `| t` filter in markup:

```json
{
  "sections": {
    "my_section": {
      "empty_state": "No content yet"
    }
  }
}
```

**Insertion method:** Use `jq` for surgical JSON edits to locale files:

```bash
# Add schema translations
jq '.sections.my_section = {"name": "My section", "settings": {"heading": {"label": "Heading"}}, "presets": {"name": "My section"}}' \
  theme/locales/en.default.schema.json > /tmp/out && mv /tmp/out theme/locales/en.default.schema.json

# Add template translations
jq '.sections.my_section = {"empty_state": "No content yet"}' \
  theme/locales/en.default.json > /tmp/out && mv /tmp/out theme/locales/en.default.json
```

### Markup Conventions

- **Tailwind utility classes** — directly in markup, mobile-first responsive (`md:`, `lg:`)
- **Responsive padding** — `px-6 md:px-8 lg:px-12` for page-width sections
- **CSS variables** — for dynamic values from settings: `style="--gap: {{ section.settings.gap }}px"`
- **Data attributes** — for enumerated setting values: `data-size="{{ block.settings.size }}"` + `data-[size=lg]:text-heading`
- **Images** — `image_url` + `image_tag` with `loading: 'lazy'`, `width`, `height`, responsive `widths`
- **Lazy loading** — disable for first section: `if section.index0 > 0` → `loading: 'lazy'`

### Accessibility

Every generated component must include:
- **Semantic HTML** — `<article>`, `<nav>`, `<section>`, `<details>`, `<dialog>` as appropriate
- **Heading levels** — configurable via select setting (h1/h2/h3/div), never skip levels
- **Focus indicators** — `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`
- **Touch targets** — `min-h-11 min-w-11` (44px minimum)
- **Motion** — `motion-reduce:transition-none` on all transitions
- **Color** — never rely solely on color; pair with text/icons
- **Alt text** — via `image.alt | escape` or `aria-label` for icon buttons
- **ARIA labels** — translated via `{{ 'key' | t }}` filter

### After Generation

1. Run the quality checklist: [references/checklist.md](references/checklist.md)
2. If new translation keys were added, suggest running `/shopify-liquid-translator sync` to generate translations for other languages
3. If a new island was created, run `pnpm run lint` to check for JS issues

## Related Skills

- `/shopify-liquid` — Liquid syntax, filters, tags, objects, schema reference
- `/shopify-liquid-kona-standards` — CSS/JS/HTML coding standards for this theme
- `/shopify-liquid-a11y` — WCAG 2.2 accessibility patterns
- `/shopify-liquid-translator` — Translation generation and locale management

## References

- [Section templates (5 examples)](references/section-templates.md)
- [Block templates (3 examples)](references/block-templates.md)
- [Snippet templates (2 examples)](references/snippet-templates.md)
- [Quality checklist](references/checklist.md)
