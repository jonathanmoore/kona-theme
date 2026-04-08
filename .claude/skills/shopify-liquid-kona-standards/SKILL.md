---
name: shopify-liquid-kona-standards
description: "CSS, JavaScript, and HTML coding standards for this Kona theme. Covers Tailwind CSS v4 utility-first patterns, Vite build pipeline, island hydration architecture, design tokens via @theme, Web Components, defensive CSS, and progressive enhancement. Use when writing CSS/JS/HTML in .liquid files or theme frontend source files."
---

# CSS, JS & HTML Standards

## Core Principles

1. **Progressive enhancement** — semantic HTML first, CSS second, JS third
2. **Tailwind utility-first** — use utility classes directly in markup; extract to `@apply` only when reused
3. **Island hydration** — zero JS by default; interactive components hydrate on demand
4. **Design tokens** — all values flow through Tailwind's `@theme` block or CSS custom properties
5. **No external JS dependencies** — native browser APIs only

## CSS Architecture

### Where CSS Lives

| Location | Purpose |
|----------|---------|
| `theme/frontend/styles/theme.css` | `@theme` block — design tokens (colors, spacing, fonts) |
| `theme/frontend/styles/base.css` | `@layer base` — element resets and global styles |
| `theme/frontend/styles/components.css` | `@layer components` — reusable component classes via `@apply` |
| `theme/frontend/styles/utilities.css` | `@layer utilities` — custom utility classes |
| `theme/frontend/entrypoints/theme.css` | Entry point — imports all layers (don't add styles here) |
| Inline `class=""` in Liquid | Primary styling method — Tailwind utility classes |
| `{% style %}` in Liquid | Dynamic CSS needing Liquid values (section settings) |

**No `{% stylesheet %}` tags** — this theme uses Vite + Tailwind, not Shopify's built-in bundling.

### Tailwind Utility-First Approach

```liquid
{%- comment -%} Do: Tailwind utilities directly in markup {%- endcomment -%}
<div class="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
  {% for product in collection.products %}
    <article class="group relative flex flex-col gap-2">
      <img
        src="{{ product.featured_image | image_url: width: 400 }}"
        alt="{{ product.featured_image.alt | escape }}"
        class="aspect-square w-full rounded object-cover"
        loading="lazy"
      >
      <h3 class="font-heading text-copy leading-copy text-primary">
        <a href="{{ product.url }}" class="after:absolute after:inset-0">
          {{ product.title }}
        </a>
      </h3>
      <span class="text-fine text-primary/60">{{ product.price | money }}</span>
    </article>
  {% endfor %}
</div>
```

### When to Extract Component Classes

Only extract to `components.css` when a pattern is reused across multiple Liquid files:

```css
/* theme/frontend/styles/components.css */
.button {
  @apply font-body-weight-bold inline-block rounded px-6 py-3 text-center;
}

.swimlane {
  @apply grid w-full snap-x snap-mandatory scroll-px-6 grid-flow-col justify-start gap-4 overflow-x-scroll px-6 pb-4;
}
```

**Don't extract** single-use patterns — leave them as inline utilities.

### CSS Variable Cascade — Three Tiers

CSS custom properties flow through three layers, each more specific:

**Tier 1: `@theme` block** — Build-time defaults in `theme/frontend/styles/theme.css`

```css
@theme {
  --color-primary: rgb(20 20 20);
  --color-contrast: rgb(250 250 249);
  --color-notice: rgb(191 72 0);

  --font-body: var(--font-body-family);
  --font-heading: var(--font-heading-family);

  --text-display: var(--font-size-display);
  --text-heading: var(--font-size-heading);
  --text-copy: var(--font-size-copy);
  --text-fine: var(--font-size-fine);
}
```

These register as Tailwind utilities: `text-primary`, `bg-contrast`, `font-heading`, `text-display`, etc.

**Tier 2: `:root` in `base.css`** — Responsive values and computed sizes

```css
:root {
  --font-size-fine: 0.75rem;
  --font-size-copy: 1rem;
  --font-size-heading: 2rem;
  --font-size-display: 3rem;
  --height-nav: 3rem;
  --screen-height: 100vh;

  @media (min-width: 48em) {
    --height-nav: 6rem;
    --font-size-heading: 2.25rem;
    --font-size-display: 3.75rem;
  }
}
```

The `@theme` block references these (e.g., `--text-heading: var(--font-size-heading)`), so responsive overrides in `:root` automatically flow through to Tailwind classes.

**Tier 3: `theme.liquid` `{% style %}`** — Shopify settings override at runtime

```liquid
{% style %}
  :root {
    --font-body-family: {{ settings.type_body_font.family }}, {{ settings.type_body_font.fallback_families }};
    --font-body-weight: {{ settings.type_body_font.weight }};
    --font-heading-family: {{ settings.type_header_font.family }}, {{ settings.type_header_font.fallback_families }};
    --color-primary: {{ settings.colors_primary }};
    --color-contrast: {{ settings.colors_contrast }};
    --color-accent: {{ settings.colors_accent }};
  }
{% endstyle %}
```

Merchant color/font choices override the `@theme` defaults. The `@theme` block values are fallbacks for when settings aren't configured.

### Styling from Section & Block Settings

Settings that affect appearance should flow through one of three patterns, chosen by the type of value:

#### 1. Data attributes + Tailwind arbitrary variants (preferred for enumerated values)

For settings with a fixed set of options (select, radio, size pickers), use `data-*` attributes and Tailwind's `data-[attr=value]:` variants:

```liquid
{%- comment -%} Schema: { "type": "select", "id": "heading_size", "options": ["md", "lg", "xl"] } {%- endcomment -%}
<h2
  class="font-heading data-[size=xl]:text-display data-[size=lg]:text-heading data-[size=md]:text-lead"
  data-size="{{ block.settings.heading_size }}"
>
  {{ block.settings.heading }}
</h2>
```

```liquid
{%- comment -%} Schema: { "type": "select", "id": "button_variant", "options": ["default", "link"] } {%- endcomment -%}
<a
  class="button data-[variant=link]:bg-transparent data-[variant=link]:p-0 data-[variant=link]:text-inherit"
  data-variant="{{ block.settings.button_variant }}"
  href="{{ block.settings.link }}"
>
  {{ block.settings.label }}
</a>
```

**Why:** Keeps all styling in Tailwind classes (visible, scannable, PurgeCSS-safe). Settings are pure data, styling is declarative.

#### 2. Conditional Tailwind classes (for boolean toggles and layout switches)

For checkbox toggles or settings that swap between two class sets:

```liquid
{%- liquid
  assign banner_class = 'aspect-4/5 sm:aspect-square md:aspect-5/4 lg:aspect-3/2 xl:aspect-2/1'
  if section.settings.full_page_height_enable
    assign banner_class = 'h-screen-no-nav'
  endif
-%}

<div class="relative flex w-full flex-col justify-end {{ banner_class }}">
```

#### 3. Inline `style` CSS variables (for truly dynamic values)

For colors, pixel values from range sliders, or any value that can't map to a predefined class — set as CSS custom properties on the element's `style` attribute or in a `{% style %}` block scoped to the section/block ID:

```liquid
{%- comment -%} Inline style — scoped to the element {%- endcomment -%}
<section
  style="
    --section-bg: {{ section.settings.bg_color }};
    --section-text: {{ section.settings.text_color }};
    --section-padding: {{ section.settings.padding }}px;
  "
  class="py-(--section-padding)"
>
```

```liquid
{%- comment -%} {% style %} block — scoped to section ID {%- endcomment -%}
{% style %}
  .section-{{ section.id }} {
    --section-bg: {{ section.settings.bg_color }};
    --section-padding: {{ section.settings.padding }}px;
  }
{% endstyle %}

<section class="section-{{ section.id }}">
```

```liquid
{%- comment -%} Block-level scoping {%- endcomment -%}
<div
  class="block-{{ block.id }}"
  style="--block-opacity: {{ block.settings.opacity }};"
>
```

**Decision guide:**

| Setting type | Pattern | Example |
|-------------|---------|---------|
| Select/radio with fixed options | Data attribute + `data-[val]:` | Size: sm/md/lg, variant: default/link |
| Boolean toggle | Conditional class | `full_width`, `show_border` |
| Color picker | Inline `style` CSS var | `bg_color`, `text_color` |
| Range slider (px, %, opacity) | Inline `style` CSS var | `padding`, `opacity`, `gap` |
| Font picker | `{% style %}` scoped to ID | `heading_font` |

**Never hardcode setting values into class strings** — `class="text-[{{ size }}px]"` won't work because Tailwind can't see dynamic values at build time.

### Responsive Design

Use Tailwind's responsive prefixes (mobile-first):

```html
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
```

For container queries:

```css
/* In components.css */
.product-grid {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .product-card-inner {
    @apply grid grid-cols-2;
  }
}
```

### Logical Properties (RTL Support)

Tailwind v4 uses logical properties by default in many utilities. Prefer:

```html
{%- comment -%} Do: logical utilities {%- endcomment -%}
<div class="ps-4 pe-2 ms-auto text-start">

{%- comment -%} Don't: physical direction {%- endcomment -%}
<div class="pl-4 pr-2 ml-auto text-left">
```

### Defensive CSS with Tailwind

```html
<div class="min-w-0 max-w-full break-words isolate">
  <!-- min-w-0: allow flex items to shrink -->
  <!-- max-w-full: constrain media -->
  <!-- break-words: prevent text overflow -->
  <!-- isolate: create stacking context -->
</div>

<div class="aspect-[4/3] bg-primary/5">
  <!-- aspect ratio prevents layout shift -->
  <!-- background as fallback for missing images -->
</div>
```

### Modern CSS Features

```html
{%- comment -%} Fluid spacing with clamp {%- endcomment -%}
<section style="padding: clamp(1rem, 4vw, 3rem);">

{%- comment -%} Intrinsic sizing {%- endcomment -%}
<div class="mx-auto w-full max-w-prose">
```

### Performance

- Animate only `transform` and `opacity`: `transition-transform duration-200`
- Use `will-change-transform` sparingly — remove after animation
- Use `contain-content` for isolated rendering
- Prefer `motion-reduce:` variant for reduced motion

### Reduced Motion

```html
<div class="transition-transform duration-200 motion-reduce:transition-none">
```

## JavaScript Architecture

### Where JS Lives

| Location | Purpose |
|----------|---------|
| `theme/frontend/islands/*.js` | Interactive components — lazy-loaded by revive.js |
| `theme/frontend/lib/*.js` | Shared utilities (a11y, revive, view-transitions) |
| `theme/frontend/entrypoints/theme.js` | Entry point — initializes revive and global setup |

**No `{% javascript %}` tags** — all JS goes through Vite.

### Island Hydration Pattern

Islands are custom elements in `theme/frontend/islands/` that are lazy-loaded when detected in the DOM. The `revive.js` system watches for elements with kebab-case tag names matching files in `islands/`.

**Hydration directives** (attributes on the custom element):

| Directive | When it hydrates |
|-----------|-----------------|
| `client:visible` | Element enters viewport (IntersectionObserver) |
| `client:idle` | Browser idle time (requestIdleCallback / 200ms) |
| `client:media="(query)"` | Media query matches |
| *(none)* | Immediately on DOM insertion |

```liquid
{%- comment -%} Liquid renders the markup; JS loads lazily {%- endcomment -%}
<cart-drawer client:visible>
  <div id="CartDrawer">
    <!-- Cart drawer content works without JS (links, forms) -->
    <!-- JS enhances with drawer behavior -->
  </div>
</cart-drawer>
```

### Island Component Template

```javascript
// theme/frontend/islands/my-component.js

class MyComponent extends HTMLElement {
  constructor() {
    super()
    // Bind event listeners, set up initial state
  }

  // Called by browser when element is added to DOM
  connectedCallback() {
    // Safe place for DOM queries and setup
  }

  disconnectedCallback() {
    // Clean up event listeners, abort controllers, observers
  }
}

customElements.define('my-component', MyComponent)
```

### Island with AbortController

```javascript
class DataLoader extends HTMLElement {
  #controller = null

  async load(url) {
    this.#controller?.abort()
    this.#controller = new AbortController()

    try {
      const response = await fetch(url, { signal: this.#controller.signal })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      if (error.name !== 'AbortError') throw error
      return null
    }
  }

  disconnectedCallback() {
    this.#controller?.abort()
  }
}

customElements.define('data-loader', DataLoader)
```

### JavaScript Rules

| Rule | Do | Don't |
|------|-----|-------|
| Semicolons | Omit (no semicolons) | Add semicolons |
| Quotes | Single quotes `'text'` | Double quotes |
| Loops | `for (const item of items)` | `items.forEach()` |
| Async | `async`/`await` | `.then()` chains |
| Variables | `const` by default | `let` unless reassigning |
| Conditionals | Early returns | Nested `if/else` |
| URLs | `new URL()` + `URLSearchParams` | String concatenation |
| Dependencies | Native browser APIs | External libraries |
| Private methods | `#methodName()` | `_methodName()` |
| Types | JSDoc `@typedef`, `@param`, `@returns` | Untyped |
| Imports | `import { fn } from '@/lib/module'` | Relative paths from islands |

### Component Communication

**Parent -> Child:** Call public methods
```javascript
this.querySelector('child-component')?.publicMethod(data)
```

**Child -> Parent:** Dispatch custom events
```javascript
this.dispatchEvent(new CustomEvent('cart:item-added', {
  detail: { id: variantId, quantity: 1 },
  bubbles: true
}))
```

**Event naming:** Use `namespace:action` format:
- `cart:item-added`, `cart:updated`, `cart:emptied`
- `variant:selected`, `variant:unavailable`

## HTML Standards

### Native Elements First

| Need | Use | Not |
|------|-----|-----|
| Expandable | `<details>/<summary>` | Custom accordion with JS |
| Dialog/modal | `<dialog>` | Custom overlay div |
| Tooltip/popup | `popover` attribute | Custom positioned div |
| Search form | `<search>` | `<div class="search">` |
| Form results | `<output>` | `<span class="result">` |

### Progressive Enhancement

Content works without JS. Islands enhance existing markup:

```liquid
{%- comment -%} Works without JS — native details/summary {%- endcomment -%}
<details class="border-b border-primary/10">
  <summary class="cursor-pointer py-3 font-heading">
    {{ block.settings.heading }}
  </summary>
  <div class="pb-4 text-primary/70">
    {{ block.settings.content }}
  </div>
</details>

{%- comment -%} If JS enhancement is needed, wrap in an island {%- endcomment -%}
<details-disclosure client:idle>
  <details>
    <summary>{{ block.settings.heading }}</summary>
    <div>{{ block.settings.content }}</div>
  </details>
</details-disclosure>
```

### Images

```liquid
{{ image | image_url: width: 800 | image_tag:
  loading: 'lazy',
  alt: image.alt | escape,
  width: image.width,
  height: image.height,
  class: 'w-full object-cover'
}}
```

- `loading="lazy"` on all below-fold images
- Always set `width` and `height` to prevent layout shift
- Descriptive `alt` text; empty `alt=""` for decorative images

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

- `/shopify-liquid` — Liquid syntax, filters, tags, objects, and schema reference
- `/shopify-liquid-a11y` — WCAG 2.2 accessibility patterns for theme components
- `/shopify-liquid-kona-new` — Guided component creation using these standards

## References

- [CSS patterns and examples](references/css-patterns.md)
- [JavaScript patterns and examples](references/javascript-patterns.md)
