# Quality Checklist

Run through this checklist after generating any new component (section, block, or snippet).

---

## Schema Completeness

- [ ] All `"name"`, `"label"`, `"info"`, `"content"`, `"placeholder"` values use `t:` prefix
- [ ] All `"default"` values on text-type settings use `t:` prefix (text, textarea, richtext, inline_richtext, html, liquid, url)
- [ ] All `"default"` values on non-text settings are raw values (no `t:` prefix on select, range, checkbox, color, etc.)
- [ ] Select/radio option labels all use `t:` prefix
- [ ] Preset `"name"` and `"category"` use `t:` prefix
- [ ] Preset block setting values use `t:` prefix for text-type settings
- [ ] Block schema has `"tag": null` (prevent extra wrapper element)
- [ ] Setting `"id"` values are snake_case
- [ ] Range settings have `min`, `max`, `default`, `step` (all required)

## Markup Quality

- [ ] Tailwind utility classes used directly in markup (no custom CSS unless shared)
- [ ] Responsive padding follows theme pattern: `px-6 md:px-8 lg:px-12`
- [ ] Dynamic values use CSS variables: `style="--gap: {{ value }}px"` + `gap-(--gap)`
- [ ] Enumerated values use data attributes: `data-size="{{ value }}"` + `data-[size=lg]:class`
- [ ] Images use `image_url` + `image_tag` with `loading`, `width`, `height`, `sizes`, `widths`
- [ ] First-section images use `loading: 'eager'` + `fetchpriority: 'high'`
- [ ] Below-fold images use `loading: 'lazy'`
- [ ] Aspect ratio containers prevent layout shift
- [ ] Placeholder SVG fallback for empty image states
- [ ] No hardcoded pixel values in classes (use design tokens or CSS variables)

## Accessibility

- [ ] Semantic HTML elements used (`<article>`, `<nav>`, `<section>`, `<details>`, `<dialog>`)
- [ ] Heading levels configurable via select setting (h1/h2/h3/div) — no hardcoded levels
- [ ] Focus indicators: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`
- [ ] Touch targets minimum 44px: `min-h-11 min-w-11`
- [ ] Motion respect: `motion-reduce:transition-none` on all transitions
- [ ] Color not sole indicator — paired with text, icons, or patterns
- [ ] Images have `alt` text (via `image.alt | escape` or manual)
- [ ] Icon buttons have `aria-label="{{ 'key' | t }}"`
- [ ] Interactive elements are keyboard accessible
- [ ] Dialog/drawer: `role="dialog" aria-modal="true"` + focus trap + Escape to close
- [ ] Forms: visible `<label>` with `for`/`id`, `aria-required`, `aria-invalid`, `aria-describedby`
- [ ] Live regions for dynamic content: `aria-live="polite" aria-atomic="true"`

## Translations

- [ ] Schema keys added to `theme/locales/en.default.schema.json`
- [ ] Template strings added to `theme/locales/en.default.json`
- [ ] Key paths follow convention: `sections.{name}.`, `blocks.{name}.`
- [ ] Keys use snake_case
- [ ] Values use sentence case (capitalize first word only)
- [ ] No hardcoded English strings in template markup
- [ ] No hardcoded English strings in schema JSON
- [ ] `| t` filter used for all template strings
- [ ] `t:` prefix used for all schema strings
- [ ] Variable interpolation correct: `{{ 'key' | t: var: value }}`

## LiquidDoc

- [ ] ALL snippets have `{%- doc -%}` tag
- [ ] ALL blocks have `{%- doc -%}` or `{% doc %}` tag
- [ ] Each `@param` has `{type}`, name, and description
- [ ] Optional params use bracket notation: `@param {type} [name]`
- [ ] Param types are correct: `string`, `number`, `boolean`, `image`, `object`, `array`

## Icons

- [ ] Check existing `theme/snippets/icon-*.liquid` before creating a new icon
- [ ] Source SVG from `@phosphor-icons/core` regular weight only — no mixed weights
- [ ] Icon snippet has `{% doc %}` tag describing the icon
- [ ] SVG has `viewBox="0 0 256 256"` and `fill="currentColor"`
- [ ] Decorative icons: `aria-hidden="true" focusable="false" role="presentation"`
- [ ] Meaningful icons (icon-only buttons): no `aria-hidden`, parent has `aria-label`
- [ ] SVG has `class="icon icon-{name}"`
- [ ] Icon sized via Tailwind on parent element, not on SVG directly

## Companion Files

- [ ] If block delegates to snippet: snippet exists with matching params
- [ ] If interactive: island file exists at `theme/frontend/islands/{name}.js`
- [ ] Island follows Web Component pattern: `class extends HTMLElement` + `customElements.define`
- [ ] Island has `disconnectedCallback()` for cleanup
- [ ] Island uses `async`/`await` (not `.then()` chains)
- [ ] Island uses `@/` import alias (not relative paths)
- [ ] Island uses `AbortController` for fetch calls
- [ ] Hydration directive matches use case: `client:visible`, `client:idle`, or `client:media="(query)"`

## Block-Specific

- [ ] Outer element includes `{{ block.shopify_attributes }}`
- [ ] Uses `data-slot` attribute for parent CSS styling hooks
- [ ] `wrapper_class` param accepted and applied if block is reused in different contexts

## Section-Specific

- [ ] Section wrapper has `id="SectionName-{{ section.id }}"`
- [ ] Uses `{%- content_for 'blocks' -%}` or `{%- content_for 'block', type: ..., id: ... -%}`
- [ ] Presets define sensible default block configuration
- [ ] `"blocks": [{ "type": "@theme" }, { "type": "@app" }]` for flexible block acceptance
- [ ] `"tag": "section"` set if you want Shopify to wrap in `<section>` element
