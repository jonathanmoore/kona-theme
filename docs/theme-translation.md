# Theme Translation

An automated translation pipeline that maintains 30 language locale files for the theme. A Python script calls the Claude API using a compact numbered-list format (~10x more token-efficient than sending full JSON), and content hashing ensures unchanged keys are never re-translated.

## Why

Shopify themes need locale files for every supported language — two files per language (storefront strings and editor labels), each mirroring the English source structure key-for-key. Maintaining these by hand is impractical: the theme has ~170 storefront keys and ~150 schema keys. Adding a single new English string means updating up to 60 files.

The translation script automates this entirely. A `sync` run after editing English strings translates only the changed keys across all 30 languages, typically completing in under a minute. A `full` run generates everything from scratch. Both modes validate output as valid JSON and cache content hashes for future incremental runs.

## File Overview

| File | Purpose |
|------|---------|
| `scripts/translate-locales.py` | Translation engine — calls Claude API, manages caching, writes locale files |
| `.claude/skills/theme-translator/SKILL.md` | Claude Code skill definition — invoked via `/theme-translator` |
| `.claude/skills/theme-translator/references/language-config.md` | Per-language metadata (formality, terminology, quirks) |
| `locales/en.default.json` | English storefront strings (customer-facing) |
| `locales/en.default.schema.json` | English editor strings (merchant-facing in Shopify admin) |
| `locales/.translation-cache.json` | Content hash cache (auto-generated, committed to git, excluded from Shopify via `.shopifyignore`) |
| `.env` | API key storage (gitignored) |
| `.env.example` | Template showing required environment variables |

## Locale File Structure

Shopify themes use two types of locale files:

**Storefront files** (`{lang}.json`) contain strings customers see — button labels, error messages, page titles, cart text. These are referenced in Liquid templates with the `| t` filter:

```liquid
<button>{{ 'products.product.add_to_cart' | t }}</button>
```

**Schema files** (`{lang}.schema.json`) contain strings merchants see in the Shopify theme editor — section names, setting labels, help text, dropdown options. These are referenced in `{% schema %}` blocks with the `t:` prefix:

```json
{
  "label": "t:sections.header.settings.enable_sticky_header.label"
}
```

The English source files (`en.default.json` and `en.default.schema.json`) are the authoritative sources. Every other locale file mirrors their key structure exactly.

## Target Languages (30)

Both `.json` (storefront) and `.schema.json` (editor) files are generated for every language — 60 locale files total:

bg, cs, da, de, el, es, fi, fr, hr, hu, id, it, ja, ko, lt, nb, nl, pl, pt-BR, pt-PT, ro, ru, sk, sl, sv, th, tr, vi, zh-CN, zh-TW

## Setup

### 1. Install the Python dependency

```bash
pip install anthropic
```

### 2. Set up the API key

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

### 3. Verify it works

```bash
set -a && source .env && set +a && python3 scripts/translate-locales.py fr
```

This generates `locales/fr.json` and `locales/fr.schema.json`. Both files should be valid JSON with all keys translated to French.

## Usage

### Full mode — Generate all translations from scratch

```bash
# All 30 languages (60 files)
set -a && source .env && set +a && python3 scripts/translate-locales.py full

# Specific languages only
set -a && source .env && set +a && python3 scripts/translate-locales.py full fr de ja
```

Translates every key in every target language. Creates the content hash cache for future `sync` runs. Use this for initial setup or when you want to regenerate everything.

### Sync mode — Update only changed keys

```bash
# All languages
set -a && source .env && set +a && python3 scripts/translate-locales.py sync

# Specific languages
set -a && source .env && set +a && python3 scripts/translate-locales.py sync fr de
```

Compares current English values against the content hash cache. Only sends changed/new keys to the API. Removes deleted keys from all locale files. Typically saves 80-90% of API costs compared to `full`.

If a locale file is missing (e.g., deleted), sync regenerates it entirely even if the English source hasn't changed.

If no cache file exists, falls back to translating everything (equivalent to `full`).

### Single language — Generate or update one language

```bash
# Uses sync mode — skips unchanged keys, regenerates missing files
set -a && source .env && set +a && python3 scripts/translate-locales.py fr
set -a && source .env && set +a && python3 scripts/translate-locales.py pt-BR zh-CN

# Force a full regeneration with explicit full mode
set -a && source .env && set +a && python3 scripts/translate-locales.py full fr
```

### Check mode — Verify translations are current (no API key needed)

```bash
# All 30 languages
python3 scripts/translate-locales.py check

# Specific languages
python3 scripts/translate-locales.py check fr de ja
```

Reports three types of issues without calling the API or writing any files:

- **Missing** — Keys present in English but absent from a locale file
- **Obsolete** — Keys in a locale file that no longer exist in English
- **Stale** — English value changed since the last `sync` (detected via the content hash cache)

Exits 0 if all translations are current, 1 if any issues are found. Used by the `i18n-check.yml` CI workflow to gate PRs — see [ci-cd.md](ci-cd.md).

### Via Claude Code skill

```
/theme-translator full       # all languages
/theme-translator sync       # incremental
/theme-translator check      # verify translations are current
/theme-translator fr         # single language
/theme-translator audit      # find hardcoded strings (see Audit section)
```

## How the Script Works

### Compact numbered-list format

Instead of sending full JSON to the LLM and parsing full JSON back, the script flattens the locale JSON into a numbered list:

```
0|Enter store using password:
1|Enter using password
2|Password
3|Your password
4|Wrong password!
```

The API response mirrors this format:

```
0|Entrer dans la boutique avec le mot de passe :
1|Entrer avec le mot de passe
2|Mot de passe
3|Votre mot de passe
4|Mot de passe incorrect !
```

The script parses these numbered lines back into nested JSON. This format eliminates all the structural tokens (braces, colons, key names) that the LLM would otherwise need to reproduce verbatim, reducing token usage by roughly 10x.

### Content hashing

Each English value is hashed with SHA-256 (truncated to 12 hex characters). These hashes are stored in `locales/.translation-cache.json` keyed by `storefront:{lang}` and `schema:{lang}`.

On a `sync` run, the script compares current English value hashes against the cache. Only values whose hashes have changed are sent for translation. This means editing one English string results in 30 API calls (one per language) each containing just that one string — not 170+ strings.

### Plural forms

English uses `one`/`other` for plurals. The script detects plural keys (like `cart_count`) and instructs the API to return the target language's CLDR plural forms. For example, Polish requires four forms:

```json
"cart_count": {
  "one": "{{ count }} przedmiot",
  "few": "{{ count }} przedmioty",
  "many": "{{ count }} przedmiotów",
  "other": "{{ count }} przedmiotów"
}
```

Each language's required plural categories are defined in the `LANG_CONFIG` dict in the script.

### Concurrency and retries

The script runs up to 5 concurrent API calls (configurable via `TRANSLATE_WORKERS`). Rate limit errors are retried with exponential backoff (2s, 4s, 8s) up to 3 times.

### Translation quality

The prompt includes per-language context:
- **Formality level** — French uses `vous`, German uses `Sie`, Danish uses `du`
- **E-commerce terminology** — pre-specified translations for "Cart" and "Checkout" ensure consistency
- **Preservation rules** — `{{ variable }}` placeholders, HTML tags, brand names, and URLs are never translated

## Audit Mode

The audit mode scans `.liquid` files for hardcoded English strings and extracts them into locale files. This is a Claude Code operation (not the Python script) — it reads files, identifies untranslated text, and makes the replacements.

### What it finds

**In template markup:**
```liquid
<!-- Before -->
<button>Add to cart</button>

<!-- After -->
<button>{{ 'products.product.add_to_cart' | t }}</button>
```

**In schema JSON:**
```json
// Before
{ "name": "Image banner" }

// After
{ "name": "t:sections.image_banner.name" }
```

### What it ignores

- Text inside `{% comment %}` blocks
- Liquid object output (`{{ product.title }}`)
- CSS classes, HTML attributes, SVG paths
- Text already using `| t` filter or `t:` prefix
- Files with `{%- comment -%}theme-translator:skip{%- endcomment -%}`

### Workflow

1. Run `/theme-translator audit`
2. Claude Code scans all `.liquid` files and presents a table of findings
3. After you confirm, it adds keys to the English locale files and replaces hardcoded text
4. Run `/theme-translator sync` to translate the new keys across all languages

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `ANTHROPIC_API_KEY` | (required) | Claude API key |
| `TRANSLATE_MODEL` | `claude-haiku-4-5-20251001` | Model to use for translations |
| `TRANSLATE_WORKERS` | `5` | Maximum concurrent API calls |

## GitHub Actions

### PR check (no API key needed)

The repo includes `.github/workflows/i18n-check.yml`, which runs `check` mode on every PR. It verifies that all locale files are complete and current by comparing against the English sources and the content hash cache. If any translations are missing, obsolete, or stale, the check fails and prints what needs attention. See [ci-cd.md](ci-cd.md) for setup.

### Auto-sync on push (optional)

To automatically translate changed strings when English locale files are updated on `main`, add your `ANTHROPIC_API_KEY` as a repository secret (see [ci-cd.md](ci-cd.md) step 4), then create a workflow:

```yaml
# .github/workflows/translate.yml
name: Translate locales
on:
  push:
    paths: ['locales/en.default*.json']
    branches: [main]

jobs:
  translate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install anthropic
      - run: python3 scripts/translate-locales.py sync
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      - uses: peter-evans/create-pull-request@v6
        with:
          title: 'Update locale translations'
          commit-message: 'chore: sync locale translations'
          branch: chore/update-translations
```

This triggers whenever `locales/en.default.json` or `locales/en.default.schema.json` changes on `main`. The `sync` mode ensures only changed keys are translated, keeping API costs minimal. The result is opened as a PR for review before merging.

## Validation

After translation, verify all output files:

```bash
# Check every locale file parses as valid JSON
for f in locales/*.json; do
  [[ "$f" == *"en.default"* || "$f" == *".translation-cache"* ]] && continue
  python3 -m json.tool "$f" > /dev/null 2>&1 && echo "OK: $f" || echo "INVALID: $f"
done
```

The script automatically validates each file it writes by re-parsing it immediately after writing. If a file is invalid JSON, the write fails and the error is reported.

## Typical Workflows

### Adding a new English string

1. Add the key to `locales/en.default.json` (or `en.default.schema.json`)
2. Run `set -a && source .env && set +a && python3 scripts/translate-locales.py sync`
3. The new key is translated across all 30 languages

### Adding a new section with hardcoded text

1. Build the section with hardcoded English strings for speed
2. Run `/theme-translator audit` to extract strings into locale files
3. Run `/theme-translator sync` to translate the new keys

### First-time setup for a new theme

1. Run `/theme-translator audit` to find and extract all hardcoded strings
2. Run `/theme-translator full` to generate all 60 locale files
3. Commit everything
4. Set up the GitHub Actions workflow for ongoing maintenance

### Regenerating a single language

If a locale file gets corrupted or you want a fresh translation:

```bash
rm locales/fr.json locales/fr.schema.json
set -a && source .env && set +a && python3 scripts/translate-locales.py fr
```
