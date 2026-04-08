---
title: Claude Code Skills
---

# Claude Code Skills

Kona Theme ships with five [Claude Code](https://claude.ai/code) skills in `.claude/skills/`. These are project-level prompt instructions that give Claude deep context about Shopify Liquid, accessibility patterns, coding standards, and the Kona theme architecture.

Skills are invoked with slash commands in any Claude Code session running inside the project.

## Available Skills

### `/shopify-liquid` — Liquid Reference

The base Shopify Liquid reference. Covers syntax, filters, tags, objects, schema settings, LiquidDoc, and translation conventions. Use when writing or editing `.liquid` files, working with schema JSON, locale keys, or looking up Liquid APIs.

**What it provides:**

- Theme architecture overview (sections, blocks, snippets, layout, templates)
- Liquid syntax reference (delimiters, operators, variables, critical gotchas)
- Filter quick reference — 152 filters across language, HTML/media, and commerce categories
- Tags quick reference — 30 tags across theme, control, iteration, variable, HTML, and documentation categories
- Objects quick reference — global and page-specific objects by template type
- Schema structure for sections and blocks with all 33 setting types
- LiquidDoc `{% doc %}` syntax with `@param` annotations
- Translation patterns and locale file structure
- JSON template editing via `jq`

```
/shopify-liquid
```

---

### `/shopify-liquid-a11y` — Accessibility Patterns

WCAG 2.2 accessibility patterns for Shopify Liquid themes. Covers e-commerce components like product cards, carousels, cart drawers, price display, forms, filters, and modals.

**What it provides:**

- Component decision table — which HTML element and ARIA pattern for each component type
- Page structure — landmarks, skip links, heading hierarchy
- Focus management — `:focus-visible` indicators, focus trapping with `trapFocus`/`removeTrapFocus` from `@/lib/a11y`
- Full accessible code examples for product cards, carousels, modals, cart drawers, forms, filters, price display, accordions, tabs, dropdowns, and tooltips
- Mobile accessibility — 44x44px touch targets, no orientation lock, no hover-only content
- Reduced motion — `motion-reduce:` Tailwind variant and `prefers-reduced-motion` media query
- Color contrast requirements (4.5:1 normal text, 3:1 large text and UI)

```
/shopify-liquid-a11y
```

---

### `/shopify-liquid-kona-standards` — Coding Standards

CSS, JavaScript, and HTML coding standards specific to the Kona theme. Use when writing CSS, JS, or HTML in `.liquid` files or theme frontend source files.

**What it provides:**

- **CSS architecture** — Where CSS lives, Tailwind utility-first approach, when to extract component classes, the three-tier CSS variable cascade
- **Styling from settings** — Data attributes with `data-[val]:` variants, conditional classes, inline `style` CSS variables, decision guide
- **JavaScript rules** — No semicolons, `async`/`await`, `for...of`, `@/` import alias, AbortController lifecycle, `#privateMethod` syntax
- **Island hydration** — Component template with `connectedCallback`/`disconnectedCallback`, hydration directives, component communication via events
- **HTML standards** — Native elements first (`<details>`, `<dialog>`, `popover`), progressive enhancement, image best practices
- **Responsive design** — Tailwind responsive prefixes, container queries, logical properties for RTL
- **Defensive CSS** — `min-w-0`, `max-w-full`, `break-words`, `isolate`, aspect ratios

```
/shopify-liquid-kona-standards
```

---

### `/shopify-liquid-kona-new` — Component Creator

Interactive guided workflow for creating new theme components — sections, blocks, and snippets — with correct schema, translation keys, LiquidDoc, accessibility, and Kona conventions.

**What it provides:**

- Decision guide for section vs. block vs. snippet
- **Section workflow** — Type catalog (hero, featured collection, slideshow, FAQ, tabs, etc.), guided steps, schema generation, responsive padding patterns
- **Block workflow** — Type catalog (leaf, container, group blocks), guided steps, LiquidDoc requirement, translation key patterns
- **Snippet workflow** — Pattern catalog (utility, icon, component snippets), guided steps, Phosphor Icons system, parameter documentation
- **Shared rules** — Naming conventions (kebab-case files, snake_case schema), translation keys for schema and template strings, Tailwind markup, accessibility requirements

```
# Create a new section
/shopify-liquid-kona-new section hero-banner

# Create a new block
/shopify-liquid-kona-new block testimonial

# Create a new snippet
/shopify-liquid-kona-new snippet badge
```

---

### `/shopify-liquid-translator` — Translation Management

Generate and maintain Shopify theme locale translations. Translates `en.default.json` and `en.default.schema.json` into 30 languages using the Claude API. See [Translation Pipeline](/i18n/translation-pipeline) for how the underlying Python script works.

**What it provides:**

- **`full`** — Generate all locale files from scratch
- **`sync`** — Update existing translations after English source changes (uses content hash cache)
- **`audit`** — Scan `.liquid` files for hardcoded English strings and schema JSON for untranslated labels, then extract them into locale files
- **`[lang-code]`** — Translate a single language (e.g., `fr`, `pt-BR`, `zh-CN`)

```
# Full translation of all 30 languages
/shopify-liquid-translator full

# Sync after editing English strings
/shopify-liquid-translator sync

# Audit templates for hardcoded text
/shopify-liquid-translator audit

# Translate a single language
/shopify-liquid-translator fr
```

::: tip
The `audit` mode is particularly useful after adding new sections or blocks. It scans both template markup and schema JSON for any untranslated text and generates the appropriate locale keys.
:::

## Skill Architecture

The five skills are organized into two tiers:

| Tier | Skills | Scope |
|------|--------|-------|
| **Universal** | `/shopify-liquid`, `/shopify-liquid-a11y`, `/shopify-liquid-translator` | Platform-generic — no Kona-specific paths or conventions |
| **Project** | `/shopify-liquid-kona-standards`, `/shopify-liquid-kona-new` | Kona-specific — references project architecture, file paths, and conventions |

Universal skills work with any Shopify theme. Project skills build on the universal ones and are tailored to the Kona theme's islands architecture, Vite build pipeline, and file structure.

Each skill directory contains:

| File | Purpose |
|------|---------|
| `skill.json` | Metadata — name, description, allowed tools, invocation format |
| `skill.md` | Prompt content — the reference material loaded into Claude's context |

## Using Skills

Skills are available automatically in any Claude Code session opened inside the project directory. Type the slash command to invoke a skill:

```
> /shopify-liquid-kona-new section newsletter-signup
```

Claude will follow the skill's instructions to guide you through the workflow, referencing the correct conventions, file paths, and patterns for the Kona theme.

Skills can also be triggered implicitly — when you ask Claude to write a Liquid template, fix an accessibility issue, or add a translation, it will pull from the relevant skill's reference material.

## Related

- [Architecture Overview](/architecture/) — How islands, Vite, and Shopify fit together
- [Coding Standards](/standards/) — JavaScript, CSS, and accessibility standards
- [Adding Translations](/i18n/adding-translations) — Step-by-step translation workflow
