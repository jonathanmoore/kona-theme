# CSS Patterns for Tailwind v4 Shopify Theme

## Complete Section Example

```liquid
<section
  class="section-{{ section.id }} py-12 md:py-20"
  style="--columns: {{ section.settings.columns | default: 4 }};"
>
  {% if section.settings.heading != blank %}
    <h2 class="mb-8 text-center font-heading text-heading leading-heading text-primary">
      {{ section.settings.heading }}
    </h2>
  {% endif %}

  <div class="mx-auto grid max-w-7xl gap-4 px-6" style="grid-template-columns: repeat(var(--columns), 1fr);">
    {% for product in collection.products limit: section.settings.limit %}
      {% render 'product-card', product: product %}
    {% endfor %}
  </div>
</section>

{% style %}
  @media (max-width: 767px) {
    .section-{{ section.id }} div {
      grid-template-columns: repeat(2, 1fr);
    }
  }
{% endstyle %}
```

## Layout Patterns

### Grid Layouts

```html
<!-- Responsive product grid -->
<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">

<!-- Auto-fit grid (fills available space) -->
<div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">

<!-- Two-column content layout -->
<div class="grid gap-8 md:grid-cols-2">
```

### Flexbox for Component Layouts

```html
<!-- Vertical stack with gap -->
<div class="flex flex-col gap-2">

<!-- Horizontal with space between -->
<div class="flex items-center justify-between">

<!-- Centered content -->
<div class="flex items-center justify-center min-h-screen">
```

### Page-Width Container

```html
<div class="mx-auto w-full max-w-7xl px-6">
```

### Full-Bleed with Content Constraint

```html
<!-- Full-width background, constrained content -->
<section class="bg-primary text-contrast">
  <div class="mx-auto max-w-7xl px-6 py-16">
    <!-- Content -->
  </div>
</section>
```

## Responsive Images

```html
<div class="aspect-4/3 overflow-hidden rounded bg-primary/5">
  <img
    src="{{ image | image_url: width: 800 }}"
    alt="{{ image.alt | escape }}"
    class="size-full object-cover"
    loading="lazy"
    width="{{ image.width }}"
    height="{{ image.height }}"
  >
</div>
```

## Component Class Extraction

Only extract to `components.css` when truly reused. Use `@apply`:

```css
/* theme/frontend/styles/components.css */

/* Reused button pattern */
.button {
  @apply font-body-weight-bold inline-block rounded px-6 py-3 text-center;
}

/* Horizontal scroll container */
.swimlane {
  @apply grid w-full snap-x snap-mandatory scroll-px-6 grid-flow-col justify-start gap-4 overflow-x-scroll px-6 pb-4;
}

/* Article prose styling */
.article {
  @apply prose font-body text-primary mx-auto mb-12 grid justify-center;
}
```

## CSS Variable Cascade

CSS variables flow through three tiers, each more specific:

```
@theme (build-time defaults)
  └── :root in base.css (responsive overrides)
       └── :root in theme.liquid {% style %} (Shopify settings at runtime)
            └── inline style="" or {% style %} scoped to section/block ID
```

The `@theme` block defines fallbacks (`--color-primary: rgb(20 20 20)`). The `base.css` `:root` sets responsive values (`--font-size-heading` changes at breakpoints). The `theme.liquid` `{% style %}` overrides colors/fonts from merchant settings. Section/block-level `style` attributes scope values to individual components.

## Settings → Styling Patterns

### Pattern 1: Data attributes for enumerated settings (preferred)

For select, radio, or any fixed-option setting, emit a `data-*` attribute and style with Tailwind's `data-[attr=value]:` variant:

```liquid
{%- comment -%}
  Schema: { "type": "select", "id": "heading_size",
            "options": [{"value": "md"}, {"value": "lg"}, {"value": "xl"}] }
{%- endcomment -%}
<h2
  class="font-heading data-[size=md]:text-lead data-[size=lg]:text-heading data-[size=xl]:text-display"
  data-size="{{ block.settings.heading_size }}"
>
  {{ block.settings.heading }}
</h2>
```

```liquid
{%- comment -%}
  Schema: { "type": "select", "id": "button_variant",
            "options": [{"value": "default"}, {"value": "link"}] }
{%- endcomment -%}
<a
  class="button data-[variant=link]:bg-transparent data-[variant=link]:p-0 data-[variant=link]:text-inherit"
  data-variant="{{ block.settings.button_variant }}"
  href="{{ block.settings.link }}"
>
  {{ block.settings.label }}
</a>
```

### Pattern 2: Conditional Tailwind classes for boolean toggles

```liquid
{%- liquid
  assign banner_class = 'aspect-4/5 sm:aspect-square md:aspect-5/4 lg:aspect-3/2'
  if section.settings.full_page_height_enable
    assign banner_class = 'h-screen-no-nav'
  endif
-%}

<div class="relative flex w-full flex-col justify-end {{ banner_class }}">
```

```liquid
<div class="
  flex flex-col gap-4
  {% if section.settings.layout == 'horizontal' %}md:flex-row{% endif %}
  {% if section.settings.full_width %}w-full{% else %}mx-auto max-w-7xl{% endif %}
">
```

### Pattern 3: Inline `style` CSS variables for dynamic values

For colors, pixel values, opacity, or any value that can't map to a predefined class:

```liquid
{%- comment -%} Inline style scoped to the element {%- endcomment -%}
<section
  style="
    --section-bg: {{ section.settings.bg_color }};
    --section-text: {{ section.settings.text_color }};
    --section-padding: {{ section.settings.padding }}px;
  "
>

{%- comment -%} Or {% style %} scoped to the section ID {%- endcomment -%}
{% style %}
  .section-{{ section.id }} {
    --section-bg: {{ section.settings.bg_color }};
    --section-padding: {{ section.settings.padding }}px;
  }
{% endstyle %}

<section class="section-{{ section.id }}">

{%- comment -%} Block-level scoping {%- endcomment -%}
<div style="--block-opacity: {{ block.settings.opacity }}; --block-gap: {{ block.settings.gap }}px;">
```

### When to use which pattern

| Setting type | Pattern | Example |
|-------------|---------|---------|
| Select/radio (fixed options) | Data attr + `data-[val]:` | Size: sm/md/lg |
| Boolean toggle | Conditional class | `show_border`, `full_width` |
| Color picker | Inline `style` CSS var | `bg_color`, `text_color` |
| Range slider (px, %, opacity) | Inline `style` CSS var | `padding`, `opacity` |
| Font picker | `{% style %}` scoped to ID | `heading_font` |

**Never use dynamic values in class strings** — `class="text-[{{ size }}px]"` won't work because Tailwind can't see runtime values at build time.

## Focus Styles

```css
/* In base.css */
:focus-visible {
  @apply outline-2 outline-offset-2 outline-primary;
}

@media (forced-colors: active) {
  :focus-visible {
    outline: 3px solid LinkText;
  }
}
```

Or inline with Tailwind:

```html
<button class="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
```

## Animation Patterns

```html
<!-- Safe hover animation (transform + opacity only) -->
<div class="transition-transform duration-200 hover:-translate-y-0.5">

<!-- Fade in/out -->
<div class="transition-opacity duration-200 opacity-0 group-hover:opacity-100">

<!-- With reduced motion support -->
<div class="transition-transform duration-200 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:transform-none">
```

## View Transitions

This theme uses the View Transition API. Key classes in `components.css`:

```css
/* Persistent header across navigations */
.section-header {
  view-transition-name: header;
}

/* Main content fade */
#MainContent {
  view-transition-name: main-content;
}
```

## Print Styles

```html
<!-- Hide interactive elements from print -->
<nav class="print:hidden">
<cart-drawer class="print:hidden">

<!-- Show URLs in print -->
<a href="{{ url }}" class="print:after:content-['_('_attr(href)_')']">
```

## Opacity Patterns for Text

The theme uses opacity on `text-primary` for text hierarchy:

```html
<h2 class="text-primary">Full opacity heading</h2>
<p class="text-primary/90">Body text (90%)</p>
<span class="text-primary/60">Secondary text (60%)</span>
<small class="text-primary/40">Tertiary/muted text (40%)</small>
```

## Using `group` and `peer` for Interactive States

```html
<!-- Show child on parent hover -->
<div class="group relative">
  <img src="{{ image }}" class="transition-transform group-hover:scale-105">
  <div class="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20">
  </div>
</div>

<!-- Input validation styling -->
<input class="peer" type="email" required>
<p class="hidden text-notice peer-invalid:block">Invalid email</p>
```
