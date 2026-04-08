# Snippet Templates

2 annotated production templates extracted from this theme. Use these as the basis for generating new snippets.

---

## 1. Utility Snippet

Based on `button.liquid`. Reusable UI element rendered from multiple blocks/sections. No island integration.

```liquid
{%- doc -%}
  Displays a button or link.

  @param {string} content - Button text content
  @param {string} [href] - Link URL (renders as <a> instead of <button>)
  @param {string} [type] - Button type attribute (submit, reset, button)
  @param {string} [variant] - Visual variant (link)
  @param {string} [size] - Size modifier (lg)
  @param {string} [shopify_attributes] - Block shopify_attributes for editor
{%- enddoc -%}

{%- liquid
  assign button_tag = 'button'
  if href != blank
    assign button_tag = 'a'
  endif
-%}

{%- if content != blank -%}
  <{{ button_tag }}
    class="button data-[size=lg]:text-lead bg-primary text-contrast flex items-center gap-2 data-[variant=link]:bg-transparent data-[variant=link]:p-0 data-[variant=link]:text-inherit"
    data-slot="button"
    {% if size != blank -%}
      data-size="{{ size }}"
    {%- endif %}
    {% if variant != blank -%}
      data-variant="{{ variant }}"
    {%- endif %}
    {% if href != blank -%}
      href="{{ href }}"
    {%- endif %}
    {% if type != blank and href == blank -%}
      type="{{ type }}"
    {%- endif %}
    {% if shopify_attributes != blank -%}
      {{ shopify_attributes }}
    {%- endif %}
  >
    {{- content -}}
  </{{ button_tag }}>
{%- endif -%}
```

**Key patterns:**
- `{%- doc -%}` documents ALL params with types and `[]` for optional
- Guard clause: `{%- if content != blank -%}` — renders nothing if no content
- Dynamic tag: `button` or `a` based on whether `href` is provided
- Conditional attributes: `{% if size != blank %}data-size="{{ size }}"{% endif %}`
- `data-slot`, `data-size`, `data-variant` for CSS styling hooks
- `data-[variant=link]:` Tailwind arbitrary variant for setting-driven styles
- `shopify_attributes` passed through from parent block for theme editor integration
- No schema (snippets never have schema)
- No `| t` calls — this snippet receives already-translated content from its callers

### Calling pattern from a block:

```liquid
{%- render 'button',
  content: block.settings.button_label,
  href: block.settings.button_link,
  size: block.settings.button_size,
  variant: block.settings.button_variant,
  shopify_attributes: block.shopify_attributes
-%}
```

---

## 2. Component Snippet (with Island)

Based on `header-drawer.liquid`. Complex UI fragment that wraps a Web Component for interactive behavior.

```liquid
{%- doc -%}
  Displays a header drawer menu for mobile.

  @param {string} shopify_attributes - Block shopify_attributes for editor
  @param {linklist} linklist - Navigation menu to render
{%- enddoc -%}

<header-drawer client:media="(max-width: 1023px)" {{ shopify_attributes }}>
  <details>
    <summary
      class="min-h-11 min-w-11 [.menu-opening_&]:before:absolute [.menu-opening_&]:before:inset-0 [.menu-opening_&]:before:h-screen [.menu-opening_&]:before:bg-black/25 [.no-js_details[open]_&]:absolute [.no-js_details[open]_&]:left-1/2 [.no-js_details[open]_&]:z-50 [.no-js_details[open]_&]:-translate-x-1/2 [.no-js_details[open]_&]:-translate-y-1/2"
      aria-haspopup="dialog"
      aria-label="{{ 'sections.header.menu' | t }}"
    >
      <span class="flex h-full w-full items-center justify-center [.no-js_details[open]_&]:hidden">
        {% render 'icon-menu' %}
      </span>
      <span class="hidden h-full w-full items-center justify-center [.no-js_details[open]_&]:flex">
        {%- render 'icon-close' -%}
      </span>
    </summary>
    <div
      id="menu-drawer"
      class="bg-contrast fixed inset-0 z-20 h-screen max-w-lg overflow-y-auto [.js_&]:-translate-x-full [.js_&]:transition [.js_&]:duration-300 motion-reduce:transition-none [.js_.menu-opening_&]:translate-x-0"
      role="dialog"
      aria-modal="true"
      aria-label="{{ 'sections.header.menu' | t }}"
      tabindex="-1"
    >
      <div class="h-nav flex items-center justify-between px-6 sm:px-8 md:px-12">
        <h2 class="text-lead font-body-weight-bold max-w-prose">{{ 'sections.header.menu' | t }}</h2>
        <button
          type="button"
          class="text-primary hover:text-primary/50 -m-4 p-4 transition motion-reduce:transition-none [.no-js_details[open]_&]:hidden"
          aria-label="{{ 'accessibility.close' | t }}"
        >
          {%- render 'icon-close' -%}
        </button>
      </div>
      <nav class="text-copy after:h-nav grid gap-4 px-6 py-6 after:block after:content-[''] sm:gap-6 sm:px-12 sm:py-8" aria-label="{{ 'accessibility.main_navigation' | t }}">
        {%- for link in linklist.links -%}
          <a
            href="{{ link.url }}"
            {% if link.current %}
              aria-current="page"
            {% endif %}
          >
            {{ link.title | escape }}
          </a>
        {%- endfor -%}
      </nav>
    </div>
  </details>
</header-drawer>
```

**Key patterns:**

**Island integration:**
- Custom element `<header-drawer>` wraps the entire snippet
- `client:media="(max-width: 1023px)"` — JS only loads on mobile viewports
- Companion island file: `theme/frontend/islands/header-drawer.js`

**Progressive enhancement:**
- `<details>/<summary>` provides no-JS fallback (native open/close)
- `.no-js_details[open]_&` selectors style the no-JS open state
- `.js_&` selectors apply JS-enhanced styles (transitions, transforms)
- `motion-reduce:transition-none` respects reduced motion preference

**Accessibility:**
- `aria-haspopup="dialog"` on trigger
- `role="dialog" aria-modal="true"` on drawer panel
- `aria-label="{{ 'sections.header.menu' | t }}"` — translated label
- `tabindex="-1"` on dialog for programmatic focus
- `aria-label="{{ 'accessibility.close' | t }}"` on close button
- `aria-current="page"` on active nav link
- `min-h-11 min-w-11` — 44px minimum touch target

**Drawer animation pattern:**
- Default: `[.js_&]:-translate-x-full` (hidden off-screen left)
- Open: `[.js_.menu-opening_&]:translate-x-0` (slide in)
- Transition: `[.js_&]:transition [.js_&]:duration-300`
- Parent adds `.menu-opening` class via JS to trigger animation
- `motion-reduce:transition-none` disables animation for reduced motion

**Template strings:**
- Uses `| t` filter for all user-facing text
- Translation keys reference parent section: `'sections.header.menu' | t`
- Accessibility strings: `'accessibility.close' | t`, `'accessibility.main_navigation' | t`
