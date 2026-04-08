# Icon System

## Overview

Icons in this theme are inline SVG snippets at `theme/snippets/icon-{name}.liquid`. Each icon is a self-contained file rendered via `{% render 'icon-{name}' %}`.

**Icon source:** [Phosphor Icons](https://phosphoricons.com/) — regular weight. The package `@phosphor-icons/core` is installed as a devDependency. SVG source files are at `node_modules/@phosphor-icons/core/assets/regular/`.

**Exception:** `icon-star-fill` uses the Phosphor **fill** weight (from `assets/fill/`) for solid star ratings. The regular (outline) `icon-star` is used for empty stars. This is the only fill-weight icon.

## Existing Icons (28)

Before creating a new icon, check if one already exists:

```
icon-account     icon-arrow       icon-bag          icon-caret
icon-caret-left  icon-caret-right icon-check        icon-close
icon-discount    icon-error       icon-facebook     icon-instagram
icon-menu        icon-padlock     icon-pause        icon-pinterest
icon-play        icon-remove      icon-search       icon-snapchat
icon-star        icon-star-fill   icon-success      icon-tiktok
icon-tumblr      icon-twitter     icon-vimeo        icon-youtube
```

## Converting a Phosphor Icon to a Snippet

### 1. Find the icon

Browse [phosphoricons.com](https://phosphoricons.com/) or look in the package:

```bash
ls node_modules/@phosphor-icons/core/assets/regular/ | grep star
# star-and-crescent.svg  star-four.svg  star-half.svg  star-of-david.svg  star.svg
```

### 2. Read the source SVG

```bash
cat node_modules/@phosphor-icons/core/assets/regular/star.svg
```

Output:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
  <path d="M239.18,97.26A16.38,16.38,0,0,..."/>
</svg>
```

### 3. Create the snippet

Create `theme/snippets/icon-star.liquid`:

```liquid
{% doc %}
  Renders a star icon.
{% enddoc %}

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 256 256"
  fill="currentColor"
  aria-hidden="true"
  focusable="false"
  role="presentation"
  class="icon icon-star"
>
  <path d="M239.18,97.26A16.38,16.38,0,0,..."/>
</svg>
```

### Conversion rules

| Phosphor source | Theme snippet |
|----------------|---------------|
| `viewBox="0 0 256 256"` | Keep as-is (256x256 is the Phosphor standard) |
| `fill="currentColor"` | Keep — inherits text color from parent |
| No accessibility attrs | Add `aria-hidden="true" focusable="false" role="presentation"` |
| No class | Add `class="icon icon-{name}"` |
| Inline `<svg>` | Wrap in `{% doc %}...{% enddoc %}` with description |

### When an icon needs an accessible label

Most icons are decorative (next to visible text). Use `aria-hidden="true"`. But if the icon IS the only content (e.g., a close button with no text), use `aria-label` instead:

```liquid
{% doc %}
  Renders a close (X) icon.
{% enddoc %}

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 256 256"
  fill="currentColor"
  aria-label="{{ 'accessibility.close' | t }}"
  class="icon icon-close"
>
  <path d="..."/>
</svg>
```

Drop `aria-hidden`, `focusable`, and `role` when using `aria-label`.

## Sizing

Icons have no intrinsic size — they fill their parent container. Wrap them in a `<span>` with `block` + size classes:

```liquid
{%- comment -%} Icon next to text — block span for sizing {%- endcomment -%}
<button class="flex items-center gap-2">
  <span class="block h-5 w-5">{% render 'icon-arrow' %}</span>
  Next
</button>

{%- comment -%} Icon-only button — flex + center on button, block span for icon {%- endcomment -%}
<button class="flex items-center justify-center min-h-11 min-w-11 p-2">
  <span class="block h-5 w-5">{% render 'icon-caret-right' %}</span>
</button>
```

**Important:** `<span>` is inline by default and ignores `h-*`/`w-*`. Always add `block` (or use a `<div>`) so the size classes take effect.

The `.icon` class can be targeted in CSS if global icon styling is needed, and `.icon-{name}` allows per-icon overrides.

## Using in Components

```liquid
{%- comment -%} Decorative icon next to text — aria-hidden {%- endcomment -%}
<button type="button" class="flex items-center gap-2">
  {% render 'icon-arrow' %}
  {{ 'actions.continue' | t }}
</button>

{%- comment -%} Icon-only button — parent needs aria-label {%- endcomment -%}
<button
  type="button"
  aria-label="{{ 'accessibility.close' | t }}"
  class="min-h-11 min-w-11 p-2"
>
  {% render 'icon-close' %}
</button>
```

## Weight Variants

The `@phosphor-icons/core` package includes 6 weights: thin, light, regular, bold, fill, duotone. This theme uses **regular** weight exclusively for visual consistency. Don't mix weights.
