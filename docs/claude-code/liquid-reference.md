---
title: Liquid Reference
---

# Liquid Reference

The `/shopify-liquid` skill gives Claude deep knowledge of Shopify's Liquid templating language — syntax, filters, tags, objects, schema settings, LiquidDoc, and translation conventions.

## Invoke

```
/shopify-liquid
```

The skill also activates implicitly when you ask Claude to write or edit `.liquid` files, work with schema JSON, or look up Liquid APIs.

## What it knows

The skill loads a comprehensive reference covering:

- **Liquid syntax** — delimiters, operators, whitespace trimming, variables, critical gotchas (no parentheses, no ternary, 50-iteration loop limit)
- **152 filters** — array, string, math, money, color, media, URL, HTML, localization
- **30 tags** — theme, control flow, iteration, variable, HTML, documentation
- **Global and page-specific objects** — `cart`, `product`, `collection`, `customer`, and all template-scoped objects
- **33 schema setting types** — decision table for choosing the right type, `visible_if` patterns, block entry types
- **LiquidDoc (`{% doc %}`)** — param types, optional vs required, `@example` blocks
- **Translation conventions** — `t` filter usage, variable interpolation, locale file structure, key naming
- **JSON template editing** — `jq`-based patterns for safe template and config modifications

## Example prompts

- "Create a section schema with an image picker, color setting, and range slider"
- "What filters can I chain to format a product price with currency?"
- "Write a LiquidDoc header for a snippet that accepts a product and a boolean"
- "How do I use `visible_if` to conditionally show a setting?"
- "Convert these hardcoded strings to use translation keys"

## Composes with

| Skill | Why |
|-------|-----|
| [`/shopify-liquid-a11y`](./accessibility) | Add WCAG 2.2 patterns to Liquid components |
| [`/shopify-liquid-kona-standards`](./coding-standards) | Follow Kona's CSS/JS/HTML conventions |
| [`/shopify-liquid-kona-new`](./component-creator) | Create new sections/blocks/snippets with correct schema |
| [`/shopify-liquid-translator`](./translator) | Generate translations for locale keys |

## Tier

**Universal** — works with any Shopify theme, not tied to Kona-specific paths or conventions.
