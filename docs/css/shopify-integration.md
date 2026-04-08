# Shopify Integration

The CSS system bridges Shopify's theme editor with Tailwind's utility classes through a three-tier cascade of CSS custom properties. This lets merchants change colors, fonts, and spacing in the Shopify admin while Tailwind utilities automatically pick up the new values -- with no rebuild required.

## Three-Tier Cascade

```
 Tier 1: Build-Time            Tier 2: Responsive            Tier 3: Runtime (Shopify)
 ────────────────────          ──────────────────            ────────────────────────
 @theme {                      :root {                       :root {
   --font-body:                  --font-size-display: 3rem;    --font-body-family: "Poppins", sans-serif;
     var(--font-body-family);    @media (min-width: 48em) {    --font-heading-family: "Playfair", serif;
   --text-display:                 --font-size-display:        --color-primary: 20 20 20;
     var(--font-size-display);       3.75rem;                  --color-contrast: 250 250 249;
 }                               }                           }
                                }
 theme/frontend/styles/         theme/frontend/styles/        theme/layout/theme.liquid
 theme.css                      base.css                      (inline <style>)
```

Values flow right-to-left at resolution time. When the browser evaluates `--font-body: var(--font-body-family)` from the `@theme` block, it resolves `--font-body-family` from whatever `:root` has set -- which is the Shopify-injected value from Tier 3.

### Tier 1: Build-Time Tokens

The `@theme` block in `theme.css` declares tokens that Tailwind uses to generate utility classes. Most tokens reference CSS custom properties rather than hardcoded values:

```css [theme/frontend/styles/theme.css]
@theme {
  --font-body: var(--font-body-family);
  --font-heading: var(--font-heading-family);
  --text-display: var(--font-size-display);
  --color-primary: rgb(20 20 20);      /* fallback default */
  --color-contrast: rgb(250 250 249);  /* fallback default */
}
```

The hardcoded color values (`rgb(20 20 20)`) serve as fallbacks. In production, Shopify's runtime variables override them.

### Tier 2: Responsive Variables

The `base.css` file sets CSS custom properties on `:root` that change at breakpoints:

```css [theme/frontend/styles/base.css]
:root {
  --font-size-display: 3rem;
  --height-nav: 3rem;

  @media (min-width: 32em) {
    --height-nav: 4rem;
  }
  @media (min-width: 48em) {
    --height-nav: 6rem;
    --font-size-display: 3.75rem;
  }
}
```

These variables are consumed by `@theme` tokens. For example, `--text-display: var(--font-size-display)` resolves to `3rem` on mobile and `3.75rem` on desktop. Because the connection is through `var()`, the responsive behavior works without Tailwind needing to know about the breakpoints.

### Tier 3: Runtime Shopify Settings

In `theme/layout/theme.liquid`, Shopify theme settings are output as CSS custom properties inside a `{% style %}` block:

```liquid [theme/layout/theme.liquid]
{% style %}
  {{ settings.type_body_font | font_face: font_display: 'swap' }}
  {{ settings.type_header_font | font_face: font_display: 'swap' }}

  :root {
    --font-body-family: {{ settings.type_body_font.family }}, {{ settings.type_body_font.fallback_families }};
    --font-body-weight: {{ settings.type_body_font.weight }};
    --font-body-weight-bold: {{ settings.type_body_font.weight | plus: 300 | at_most: 1000 }};

    --font-heading-family: {{ settings.type_header_font.family }}, {{ settings.type_header_font.fallback_families }};
    --font-heading-weight: {{ settings.type_header_font.weight }};

    --color-primary: {{ settings.colors_primary }};
    --color-contrast: {{ settings.colors_contrast }};
    --color-accent: {{ settings.colors_accent }};
  }
{% endstyle %}
```

The `{% style %}` tag ensures Shopify processes these as critical CSS. The `font_face` filter generates `@font-face` declarations with `font-display: swap` for the merchant-selected fonts.

## Example Flow: Merchant Changes a Font

Here is the complete path from a theme editor change to rendered output:

1. **Merchant action**: In the Shopify theme editor, the merchant selects "Playfair Display" as the heading font.

2. **Shopify outputs the variable** in `theme.liquid`:
   ```css
   :root {
     --font-heading-family: "Playfair Display", serif;
   }
   ```

3. **The `@theme` token resolves it**:
   ```css
   @theme {
     --font-heading: var(--font-heading-family);
     /* resolves to: --font-heading: "Playfair Display", serif */
   }
   ```

4. **Tailwind utilities use the new value**. Anywhere `font-heading` appears in markup:
   ```html
   <h1 class="font-heading text-display">Featured Collection</h1>
   ```
   The computed `font-family` is now `"Playfair Display", serif`.

No rebuild is needed. The CSS custom property chain resolves at render time in the browser.

## Example Flow: Merchant Changes a Color

1. **Merchant action**: Sets the primary color to a dark navy in the theme editor.

2. **Shopify outputs**:
   ```css
   :root {
     --color-primary: 15 23 42;
   }
   ```

3. **Tailwind utilities resolve the value**. Classes like `text-primary`, `bg-primary`, `border-primary/10` all pick up the new color:
   ```html
   <body class="text-primary/90 bg-contrast">
   ```
   The text color becomes `rgb(15 23 42 / 0.9)`.

## Why This Architecture Works

**No rebuild on settings change.** Because `@theme` tokens use `var()` references rather than static values, the Tailwind utility classes are generated once at build time but resolve to whatever the CSS custom properties hold at render time.

**Fallback defaults are safe.** The hardcoded values in the `@theme` block (like `rgb(20 20 20)` for `--color-primary`) act as defaults for development and edge cases where Shopify settings haven't loaded. In production, the `:root` values from `theme.liquid` always take precedence due to CSS specificity (both target `:root`, but the Shopify `<style>` block appears later in the document).

**Responsive and runtime layers are independent.** Font sizes scale with viewport via Tier 2 media queries. Colors and font families come from the merchant via Tier 3. Neither layer needs to know about the other -- the `@theme` block composes them.

**Theme editor preview is instant.** When a merchant adjusts settings in the Shopify theme editor, the preview iframe re-renders the Liquid with new values. The CSS custom properties update, and all Tailwind utilities reflect the change immediately.

## Further Reading

- [CSS Overview](./index) -- Entrypoint structure, layer system, and Tailwind plugins.
- [Design Tokens](./design-tokens) -- Complete reference for all `@theme` tokens and the four CSS files.
