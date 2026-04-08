---
title: Translator
---

# Translator

The `/shopify-liquid-translator` skill manages translations for Shopify theme locale files. It translates `en.default.json` and `en.default.schema.json` into 30 languages using a Python script that calls the Claude API.

## Invoke

```
/shopify-liquid-translator full     # All 30 languages from scratch
/shopify-liquid-translator sync     # Incremental update after English changes
/shopify-liquid-translator audit    # Find hardcoded strings in templates
/shopify-liquid-translator fr       # Single language (any of the 30 codes)
```

## What it knows

The skill loads the full translation pipeline:

- **Source files** — `theme/locales/en.default.json` (storefront strings) and `en.default.schema.json` (editor strings)
- **30 target languages** — bg, cs, da, de, el, es, fi, fr, hr, hu, id, it, ja, ko, lt, nb, nl, pl, pt-BR, pt-PT, ro, ru, sk, sl, sv, th, tr, vi, zh-CN, zh-TW
- **Execution modes** — `full` (from scratch), `sync` (incremental via content hashing), `audit` (find hardcoded strings), single language
- **Prerequisites** — Python 3 with `anthropic` package, `ANTHROPIC_API_KEY` environment variable
- **Token efficiency** — uses a compact numbered-list format that's ~10x more efficient than having an LLM write full JSON
- **Incremental tracking** — content hashes ensure unchanged keys are never re-translated

### Audit mode

The `audit` mode scans `.liquid` files for hardcoded English strings that should use translation keys. It finds text in HTML elements and attributes that isn't wrapped in <code v-pre>{{ ... | t }}</code>.

## Example prompts

- "Translate the theme into all 30 languages"
- "I updated the English strings — sync the translations"
- "Audit the templates for hardcoded strings"
- "Generate just the French translations"
- "Add Japanese translations for the new section I created"

## Composes with

| Skill | Why |
|-------|-----|
| [`/shopify-liquid`](./liquid-reference) | Translation key conventions, `t` filter syntax, locale file structure |
| [`/shopify-liquid-kona-new`](./component-creator) | New components generate translation keys that this skill translates |

## Tier

**Universal** — the translation script and patterns work with any Shopify theme that uses standard locale files.
