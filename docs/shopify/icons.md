# Icons

Icons in Kona are inline SVG snippets rendered via `{% render 'icon-{name}' %}`. Each icon is a self-contained Liquid file at `theme/snippets/icon-{name}.liquid`.

**Icon source:** [Phosphor Icons](https://phosphoricons.com/) -- regular weight. The package `@phosphor-icons/core` is installed as a devDependency. SVG source files are at `node_modules/@phosphor-icons/core/assets/regular/`.

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

## Snippet Structure

Every icon snippet follows the same structure:

```liquid
{% doc %}
  Renders a right-pointing arrow icon.
{% enddoc %}

<svg
  viewBox="0 0 14 10"
  fill="none"
  aria-hidden="true"
  focusable="false"
  role="presentation"
  class="icon icon-arrow"
  xmlns="http://www.w3.org/2000/svg"
>
  <path fill-rule="evenodd" clip-rule="evenodd" d="..." fill="currentColor">
</svg>
```

Key attributes:

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `aria-hidden="true"` | Always present on decorative icons | Hides from screen readers |
| `focusable="false"` | Always present on decorative icons | Prevents focus in IE/Edge |
| `role="presentation"` | Always present on decorative icons | Reinforces decorative status |
| `class="icon icon-{name}"` | Varies per icon | Global `.icon` hook + per-icon `.icon-{name}` override |
| `fill="currentColor"` | On most icons | Inherits text color from parent element |

## Converting a Phosphor Icon to a Snippet

### Step 1: Find the icon

Browse [phosphoricons.com](https://phosphoricons.com/) or search the package:

```bash
ls node_modules/@phosphor-icons/core/assets/regular/ | grep star
# star-and-crescent.svg  star-four.svg  star-half.svg  star-of-david.svg  star.svg
```

### Step 2: Read the source SVG

```bash
cat node_modules/@phosphor-icons/core/assets/regular/star.svg
```

Output:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
  <path d="M239.18,97.26A16.38,16.38,0,0,..."/>
</svg>
```

### Step 3: Create the snippet file

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

### Step 4: Add accessibility attributes

Add `aria-hidden="true"`, `focusable="false"`, and `role="presentation"` to the `<svg>` element. These are not present in the Phosphor source.

### Step 5: Add the icon classes

Add `class="icon icon-{name}"` where `{name}` matches the snippet filename. The `.icon` class enables global icon styling; `.icon-{name}` enables per-icon overrides.

### Conversion Reference

| Phosphor source | Theme snippet |
|----------------|---------------|
| `viewBox="0 0 256 256"` | Keep as-is (256x256 is the Phosphor standard) |
| `fill="currentColor"` | Keep -- inherits text color from parent |
| No accessibility attrs | Add `aria-hidden="true" focusable="false" role="presentation"` |
| No class | Add `class="icon icon-{name}"` |
| Inline `<svg>` | Wrap in `{% doc %}...{% enddoc %}` with description |

## Sizing

Icons have no intrinsic size -- they fill their parent container. Wrap them in a `<span>` with `block` + Tailwind size classes:

```liquid
{%- comment -%} Icon next to text {%- endcomment -%}
<button class="flex items-center gap-2">
  <span class="block h-5 w-5">{% render 'icon-arrow' %}</span>
  Next
</button>

{%- comment -%} Icon-only button {%- endcomment -%}
<button class="flex items-center justify-center min-h-11 min-w-11 p-2">
  <span class="block h-5 w-5">{% render 'icon-caret-right' %}</span>
</button>
```

**Important:** `<span>` is inline by default and ignores `h-*`/`w-*`. Always add `block` (or use a `<div>`) so the size classes take effect.

Common size combinations used in the theme:

| Size | Classes | Use case |
|------|---------|----------|
| 20px | `h-5 w-5` | Standard inline icons (buttons, links) |
| 24px | `h-6 w-6` | Larger UI icons |
| 16px | `h-4 w-4` | Small indicators |

## Accessibility

Most icons are **decorative** -- they appear next to visible text that already conveys meaning. These use `aria-hidden="true"`:

```liquid
{%- comment -%} Decorative icon next to text -- aria-hidden {%- endcomment -%}
<button type="button" class="flex items-center gap-2">
  {% render 'icon-arrow' %}
  {{ 'actions.continue' | t }}
</button>
```

When an icon is the **only content** (e.g., a close button with no visible text), the parent element must have an accessible label:

```liquid
{%- comment -%} Icon-only button -- parent needs aria-label {%- endcomment -%}
<button
  type="button"
  aria-label="{{ 'accessibility.close' | t }}"
  class="min-h-11 min-w-11 p-2"
>
  {% render 'icon-close' %}
</button>
```

Some icons carry their own `aria-label` instead of `aria-hidden`. The close icon is an example:

```liquid
{% doc %}
  Renders a close (X) icon.
{% enddoc %}

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 20 20"
  aria-label="{{ 'accessibility.close' | t }}"
  fill="currentColor"
  stroke="currentColor"
  class="icon"
>
  <path stroke-width="1.25" d="m4.442 4.308 11.314 11.314M15.558 4.308 4.244 15.622"/>
</svg>
```

When using `aria-label` on the SVG itself, drop `aria-hidden`, `focusable`, and `role="presentation"` -- those attributes would conflict with the accessible label.

## Color Inheritance

All icons use `fill="currentColor"` (or `stroke="currentColor"` for stroke-based icons like `icon-close`). This means the icon color is inherited from the parent element's `color` CSS property.

To change an icon's color, set the text color on its parent:

```liquid
<span class="text-accent block h-5 w-5">{% render 'icon-success' %}</span>
```

## Weight Variants

The `@phosphor-icons/core` package includes 6 weights:

| Weight | Directory | Used in Kona |
|--------|-----------|--------------|
| Thin | `assets/thin/` | No |
| Light | `assets/light/` | No |
| **Regular** | `assets/regular/` | **Yes (exclusively)** |
| Bold | `assets/bold/` | No |
| Fill | `assets/fill/` | Only `icon-star-fill` |
| Duotone | `assets/duotone/` | No |

Kona uses the **regular** weight exclusively for visual consistency. Do not mix weights within the theme.

## How to Add a New Icon

1. **Check existing icons** -- make sure the icon does not already exist (see list above)
2. **Find the Phosphor icon** -- browse [phosphoricons.com](https://phosphoricons.com/) or search `node_modules/@phosphor-icons/core/assets/regular/`
3. **Create the snippet file** at `theme/snippets/icon-{name}.liquid`
4. **Copy the SVG content** from the Phosphor source file
5. **Add the `{% doc %}` tag** with a brief description
6. **Add accessibility attributes:** `aria-hidden="true" focusable="false" role="presentation"`
7. **Add the class:** `class="icon icon-{name}"`
8. **Test the icon** by rendering it in a section or snippet with `{% render 'icon-{name}' %}`

Full example -- adding a `heart` icon:

```bash
# Find the source
cat node_modules/@phosphor-icons/core/assets/regular/heart.svg
```

Create `theme/snippets/icon-heart.liquid`:

```liquid
{% doc %}
  Renders a heart icon.
{% enddoc %}

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 256 256"
  fill="currentColor"
  aria-hidden="true"
  focusable="false"
  role="presentation"
  class="icon icon-heart"
>
  <path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32Z"/>
</svg>
```

Use it in a template:

```liquid
<span class="block h-5 w-5">{% render 'icon-heart' %}</span>
```

## Also See

- [Liquid Patterns](./liquid-patterns) -- `{% doc %}` tags, `{% render %}` usage
- [Sections & Blocks](./sections-blocks) -- how icons are used within section markup
- [Shopify Overview](./) -- the full theme architecture
