# Translation Pipeline

The translation engine is a single Python script (`scripts/translate-locales.py`) that calls the Claude API to produce locale files for 30 languages. It uses a compact wire format and content hashing to minimize API costs, and supports four distinct operating modes.

## Modes

### Full Mode -- Generate All Translations

Translates every key in every target language from scratch. Creates the content hash cache for future incremental runs.

```bash
# All 30 languages (60 files)
python3 scripts/translate-locales.py full

# Specific languages only
python3 scripts/translate-locales.py full fr de ja
```

Use this for initial setup or when you want to regenerate everything.

### Sync Mode -- Incremental Updates

Compares current English values against the content hash cache. Only sends changed or new keys to the API. Removes deleted keys from all locale files. Typically saves **80--90% of API costs** compared to `full`.

```bash
# All languages
python3 scripts/translate-locales.py sync

# Specific languages
python3 scripts/translate-locales.py sync fr de
```

If a locale file is missing (e.g., accidentally deleted), sync regenerates it entirely even if the English source has not changed. If no cache file exists, sync falls back to translating everything (equivalent to `full`).

### Single Language Mode

Passing language codes directly uses sync mode -- unchanged keys are skipped and missing files are regenerated.

```bash
# One language
python3 scripts/translate-locales.py fr

# Multiple specific languages
python3 scripts/translate-locales.py pt-BR zh-CN

# Force a full regeneration
python3 scripts/translate-locales.py full fr
```

### Check Mode -- Verify Without API Calls

Reports translation issues without calling the API or writing any files. **No API key is required.**

```bash
# All 30 languages
python3 scripts/translate-locales.py check

# Specific languages
python3 scripts/translate-locales.py check fr de ja
```

Reports three categories of issues:

- **Missing** -- Keys present in English but absent from a locale file.
- **Obsolete** -- Keys in a locale file that no longer exist in English.
- **Stale** -- English value changed since the last sync (detected via the content hash cache).

Exits with code 0 if all translations are current, code 1 if any issues are found.

## Numbered-List Format

Instead of sending full JSON to the API and parsing JSON back, the script flattens the nested locale JSON into a numbered list. This eliminates all structural tokens (braces, colons, key names) that the model would otherwise need to reproduce verbatim.

**Input sent to the API:**

```
0|Enter store using password:
1|Enter using password
2|Password
3|Your password
4|Wrong password!
```

**Response received from the API:**

```
0|Entrer dans la boutique avec le mot de passe :
1|Entrer avec le mot de passe
2|Mot de passe
3|Votre mot de passe
4|Mot de passe incorrect !
```

The script maps each numbered line back to its original key path and reconstructs the nested JSON. This format reduces token usage by roughly **10x** compared to sending and receiving full JSON objects.

## Content Hashing

Each English value is hashed with SHA-256, truncated to 12 hex characters. These hashes are stored in `theme/locales/.translation-cache.json`, keyed by `storefront:{lang}` and `schema:{lang}`.

On a `sync` run, the script compares current English value hashes against the cached hashes. Only values whose hashes differ are sent for translation. This means editing one English string results in 30 API calls (one per language), each containing just that single string rather than 170+ strings.

The cache file is committed to git so that CI can run `check` mode without any prior state. It is excluded from Shopify theme uploads via `.shopifyignore`.

## Plural Form Handling

English uses two plural forms (`one` and `other`). Many languages require more. The script detects plural keys and instructs the API to return the target language's CLDR-specified plural categories.

For example, Polish requires four forms:

```json
{
  "cart_count": {
    "one": "{{ count }} przedmiot",
    "few": "{{ count }} przedmioty",
    "many": "{{ count }} przedmiotow",
    "other": "{{ count }} przedmiotow"
  }
}
```

Each language's required plural categories are defined in the `LANG_CONFIG` dictionary within the script. Languages like Japanese, Korean, Thai, and Chinese use only `other` (no grammatical number), while Slovenian requires four forms (`one`, `two`, `few`, `other`).

The wire format for plurals uses a special notation:

```
5|PLURAL(one,few,many,other)|{"one":"{{ count }} item","other":"{{ count }} items"}
```

The API responds with one sub-line per form:

```
5|one=1 {{ count }} przedmiot
5|few={{ count }} przedmioty
5|many={{ count }} przedmiotow
5|other={{ count }} przedmiotow
```

## Concurrency and Retries

The script runs up to **5 concurrent API calls** using Python's `concurrent.futures.ThreadPoolExecutor`. The concurrency level is configurable via the `TRANSLATE_WORKERS` environment variable.

Rate limit errors from the API are retried with **exponential backoff**: 2 seconds, 4 seconds, 8 seconds, up to 3 attempts. Other errors are reported immediately and the script continues processing remaining tasks.

## Translation Quality

The prompt sent to the API includes per-language context:

- **Formality level** -- French uses `vous` (formal), German uses `Sie` (formal), Danish uses `du` (informal), Japanese uses polite `desu/masu` form.
- **E-commerce terminology** -- Pre-specified translations for "Cart" and "Checkout" ensure consistency across all strings in a language.
- **Preservation rules** -- <code v-pre>{{ variable }}</code> placeholders, HTML tags, brand names (Shopify, PayPal, Apple Pay), and URLs are never translated.
- **File type context** -- Storefront strings are described as "customer-facing" and schema strings as "merchant-facing in Shopify admin" so the model uses appropriate register and terminology.

## Audit Mode

Audit mode is a Claude Code operation (not part of the Python script) that scans `.liquid` files for hardcoded English strings and extracts them into the English locale files.

**What it finds:**

```liquid
<!-- Before -->
<button>Add to cart</button>

<!-- After -->
<button>{{ 'products.product.add_to_cart' | t }}</button>
```

```json
// Schema: before
{ "name": "Image banner" }

// Schema: after
{ "name": "t:sections.image_banner.name" }
```

**What it ignores:** text inside `{% comment %}` blocks, Liquid object output (<code v-pre>{{ product.title }}</code>), CSS classes, HTML attributes, SVG paths, and text already using the `| t` filter or `t:` prefix.

Invoke it with the `/shopify-liquid-translator` skill:

```
/shopify-liquid-translator audit
```

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `ANTHROPIC_API_KEY` | (required) | Claude API key for translation calls |
| `TRANSLATE_MODEL` | `claude-haiku-4-5-20251001` | Model used for translations |
| `TRANSLATE_WORKERS` | `5` | Maximum concurrent API calls |

Set these in a `.env` file (gitignored) and source it before running:

```bash
set -a && source .env && set +a
python3 scripts/translate-locales.py sync
```

## GitHub Actions Integration

The repository includes a CI workflow at `.github/workflows/i18n-check.yml` that runs `check` mode on every pull request targeting `main`:

```yaml
name: Translation Check
on:
  pull_request:
    branches:
      - main

jobs:
  i18n:
    name: Check Translations
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - name: Check translations
        run: python3 scripts/translate-locales.py check
```

This workflow requires **no API key** and **no setup** -- it reads the English source files, the locale files, and the content hash cache already in the repository. If any translations are missing, obsolete, or stale, the check fails and prints what needs attention.

For full CI/CD documentation including the deploy, preview, and lint workflows, see [CI/CD](/ci-cd/).

## File Reference

| File | Purpose |
|------|---------|
| `scripts/translate-locales.py` | Translation engine |
| `theme/locales/en.default.json` | English storefront strings (source of truth) |
| `theme/locales/en.default.schema.json` | English schema strings (source of truth) |
| `theme/locales/.translation-cache.json` | SHA-256 content hash cache (auto-generated, committed to git) |
| `.github/workflows/i18n-check.yml` | PR translation check workflow |
| `.env` | API key storage (gitignored) |
| `.env.example` | Template showing required environment variables |
