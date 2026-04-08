# Internationalization

Kona Theme ships with automated translations for **30 languages**, maintained by a Python script that calls the Claude API. The system produces **60 locale files** -- two per language -- and uses content hashing so that only changed strings are ever re-translated.

## Two Types of Locale Files

Shopify themes require two kinds of translations for each language:

| Type | Filename pattern | Audience | Referenced via |
|------|-----------------|----------|----------------|
| **Storefront** | `{lang}.json` | Customers browsing the store | <code v-pre>{{ 'key.path' \| t }}</code> in Liquid |
| **Schema** | `{lang}.schema.json` | Merchants editing the theme in Shopify admin | `"t:key.path"` in schema JSON |

The English source files (`en.default.json` and `en.default.schema.json`) in `theme/locales/` are the single source of truth. Every other locale file mirrors their key structure exactly.

## Supported Languages

Both storefront and schema files are generated for all 30 target languages:

| | | | | | |
|---|---|---|---|---|---|
| bg (Bulgarian) | cs (Czech) | da (Danish) | de (German) | el (Greek) | es (Spanish) |
| fi (Finnish) | fr (French) | hr (Croatian) | hu (Hungarian) | id (Indonesian) | it (Italian) |
| ja (Japanese) | ko (Korean) | lt (Lithuanian) | nb (Norwegian) | nl (Dutch) | pl (Polish) |
| pt-BR (Brazilian Portuguese) | pt-PT (European Portuguese) | ro (Romanian) | ru (Russian) | sk (Slovak) | sl (Slovenian) |
| sv (Swedish) | th (Thai) | tr (Turkish) | vi (Vietnamese) | zh-CN (Simplified Chinese) | zh-TW (Traditional Chinese) |

## How It Works

The translation pipeline centers on `scripts/translate-locales.py`, which:

1. **Flattens** the English JSON into a compact numbered-list format (`0|string`) that is roughly 10x more token-efficient than sending full JSON to the API.
2. **Hashes** each English value with SHA-256 and stores the hashes in `theme/locales/.translation-cache.json`.
3. **Diffs** current values against the cache to determine which keys have changed since the last run.
4. **Translates** only the changed keys by sending them to the Claude API, running up to 5 concurrent requests with exponential backoff retry.
5. **Merges** new translations into existing locale files and writes validated JSON.

This means editing a single English string triggers 30 small API calls (one per language, one string each) rather than retranslating everything.

## Quick Start

```bash
# Translate everything from scratch (first-time setup)
python3 scripts/translate-locales.py full

# Update only changed strings (daily workflow)
python3 scripts/translate-locales.py sync

# Verify translations are current (no API key needed)
python3 scripts/translate-locales.py check
```

The `check` mode runs in CI on every pull request via the `i18n-check.yml` workflow. See [CI/CD](/ci-cd/) for details on the PR check.

## Further Reading

- [Translation Pipeline](./translation-pipeline) -- Architecture of the translation script, the numbered-list format, content hashing, plural handling, concurrency, and GitHub Actions integration.
- [Adding Translations](./adding-translations) -- Step-by-step guide for adding new strings, using translation filters in Liquid and schema, auditing for hardcoded text, and regenerating corrupted files.
