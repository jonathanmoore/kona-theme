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

## Default workflow

1. **Edit English** — Add or change strings in `en.default.json` or `en.default.schema.json`
2. **Sync** — Run `/shopify-liquid-translator sync` to translate only the changed keys
3. **Review** — Spot-check a few languages to verify context and tone
4. **Check** — Run `python3 scripts/translate-locales.py check` to confirm all locales are current (no API key needed)

## What the skill handles for you

- Picks the right execution mode (`full`, `sync`, single language) based on your prompt
- Generates the `translate-locales.py` script if it doesn't exist
- Uses content hashing so unchanged keys are never re-translated
- Formats output in a compact numbered-list wire format (~10x more token-efficient than raw JSON)
- Handles pluralization rules per language

## Source of truth

| File | Location |
|------|----------|
| Storefront strings | `theme/locales/en.default.json` |
| Schema strings | `theme/locales/en.default.schema.json` |
| Translated locales | `theme/locales/{lang}.json` and `{lang}.schema.json` |
| Translation script | `scripts/translate-locales.py` |

## What it knows

The skill loads the full translation pipeline:

- **30 target languages** — bg, cs, da, de, el, es, fi, fr, hr, hu, id, it, ja, ko, lt, nb, nl, pl, pt-BR, pt-PT, ro, ru, sk, sl, sv, th, tr, vi, zh-CN, zh-TW
- **Execution modes** — `full` (from scratch), `sync` (incremental via content hashing), `audit` (find hardcoded strings), single language
- **Prerequisites** — Python 3 with `anthropic` package, `ANTHROPIC_API_KEY` environment variable

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

## Next steps

- [Internationalization](../i18n/) — Full i18n docs: locale file types, supported languages, translation pipeline
- [Adding Translations](../i18n/adding-translations) — Step-by-step guide for adding new strings
- [`/shopify-liquid-kona-new`](./component-creator) — Create a component, then translate its keys
