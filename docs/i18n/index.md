# Internationalization

Add a string to the English source file, run `sync`, and it's translated into 30 languages automatically. The pipeline uses content hashing so only changed strings are re-translated.

## Quick start

```bash
# Translate everything from scratch (first-time setup)
python3 scripts/translate-locales.py full

# Update only changed strings (daily workflow)
python3 scripts/translate-locales.py sync

# Verify translations are current (no API key needed)
python3 scripts/translate-locales.py check
```

## Two locale file types

| Type | Pattern | Audience | Referenced via |
|------|---------|----------|----------------|
| **Storefront** | `{lang}.json` | Customers | <code v-pre>{{ 'key.path' \| t }}</code> in Liquid |
| **Schema** | `{lang}.schema.json` | Merchants in theme editor | `"t:key.path"` in schema JSON |

English source files (`en.default.json` and `en.default.schema.json`) are the single source of truth. Every other locale mirrors their key structure.

## Supported languages (30)

| | | | | | |
|---|---|---|---|---|---|
| bg | cs | da | de | el | es |
| fi | fr | hr | hu | id | it |
| ja | ko | lt | nb | nl | pl |
| pt-BR | pt-PT | ro | ru | sk | sl |
| sv | th | tr | vi | zh-CN | zh-TW |

## Next steps

- [Adding Translations](./adding-translations) — How to add new strings step by step
- [Translation Pipeline](./translation-pipeline) — How the script works: hashing, wire format, plurals, concurrency
- [`/shopify-liquid-translator` skill](../claude-code/translator) — Let Claude drive the translation workflow for you
