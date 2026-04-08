---
name: theme-translator
description: "Generate and maintain Shopify theme locale translations. Translates en.default.json and en.default.schema.json into 30 languages. Use when adding new languages, syncing translations after English changes, auditing for hardcoded strings, or generating a single language. Invoke with: /theme-translator [full|sync|audit|lang-code]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Theme Translator

Translates this theme's English locale files into 30 target languages. Uses a Python script (`scripts/translate-locales.py`) that calls the Claude API directly with a compact numbered-list format — ~10x more token-efficient than having an LLM write full JSON.

Incremental mode tracks content hashes so unchanged keys are never re-translated.

## Source Files

- `locales/en.default.json` — Storefront-facing strings (customer sees these)
- `locales/en.default.schema.json` — Theme editor strings (merchant sees these in Shopify admin)

## Target Languages (30)

Both `.json` and `.schema.json` are generated for every language:

bg, cs, da, de, el, es, fi, fr, hr, hu, id, it, ja, ko, lt, nb, nl, pl, pt-BR, pt-PT, ro, ru, sk, sl, sv, th, tr, vi, zh-CN, zh-TW

## Prerequisites

The script requires:
- Python 3 with the `anthropic` package (`pip install anthropic`)
- `ANTHROPIC_API_KEY` environment variable

If the key isn't set, tell the user:
```
cp .env.example .env   # add your key
source .env             # load it
```

Every Bash call that runs the script must load `.env` with auto-export since shell state doesn't persist between calls:
```bash
set -a && source .env && set +a && python3 scripts/translate-locales.py ...
```

## Execution Modes

### `full` — Generate all locale files from scratch

1. **Pre-flight:** Suggest running `audit` first if it hasn't been run recently
2. Run the script:
   ```bash
   set -a && source .env && set +a && python3 scripts/translate-locales.py full
   ```
   Or for specific languages:
   ```bash
   set -a && source .env && set +a && python3 scripts/translate-locales.py full fr de ja
   ```
3. The script handles concurrency (3 workers), retries, and validation
4. After completion, a cache file (`locales/.translation-cache.json`) is saved for future `sync` runs

### `sync` — Update existing translations after English changes

Only translates new/changed keys. Uses content hashes stored in `locales/.translation-cache.json` to detect what changed. Typically saves 80-90% of API costs compared to `full`.

```bash
set -a && source .env && set +a && python3 scripts/translate-locales.py sync
```

Or for specific languages:
```bash
set -a && source .env && set +a && python3 scripts/translate-locales.py sync fr de
```

If no cache file exists, falls back to translating everything (equivalent to `full`).

### `audit` — Find and extract hardcoded strings

Pre-flight step. Scans all `.liquid` files for hardcoded English strings that should be in locale files, extracts them, and replaces them with translation references. Covers both template content and schema JSON.

**Before running audit**, load the `/shopify-liquid-themes` skill for reference on correct `| t` filter and `t:` schema prefix patterns.

#### Skipping files

Files can opt out of template markup scanning by including this Liquid comment anywhere in the file:

```liquid
{%- comment -%}theme-translator:skip{%- endcomment -%}
```

This skips **template markup** scanning only. Schema JSON inside a skipped file is still audited — schema translations affect the theme editor, which is always relevant.

Use this for developer-only demo sections, documentation pages, or any file where hardcoded English is intentional and not customer-facing.

#### What to scan

**1. Template markup — hardcoded text in HTML**

Scan all `.liquid` files in `sections/`, `blocks/`, `snippets/`, and `layout/` for English text outside of Liquid tags. **Skip** any file containing the `theme-translator:skip` comment. Look for:

- Text content between HTML tags: `<h2>Welcome</h2>` → should be `<h2>{{ 'sections.hero.heading' | t }}</h2>`
- Text in attributes that users see: `aria-label="Close menu"`, `title="Search"`, `placeholder="Enter email"`
- Button/link text: `<button>Add to cart</button>`
- Alt text on images (if hardcoded, not from Liquid objects)

**Ignore** (these are not translatable):
- Text inside `{% comment %}` / `{% endcomment %}` and `{%- comment -%}` blocks
- Text inside `{% doc %}` / `{% enddoc %}` blocks
- Liquid tag contents (`{% if %}`, `{% assign %}`, etc.)
- CSS class names and IDs
- HTML tag names and attribute names
- Text that is already a `| t` filter call
- Text output from Liquid objects (`{{ product.title }}`, `{{ shop.name }}`, etc.)
- Inline `<script>` or `<style>` content
- Icon/SVG markup (path data, viewBox, etc.)

**2. Schema JSON — hardcoded labels in `{% schema %}`**

Scan every `{% schema %}...{% endschema %}` block for string values that should use the `t:` prefix. These fields must be translated:

| Field | Example hardcoded | Should be |
|-------|------------------|-----------|
| `"name"` | `"name": "Image banner"` | `"name": "t:sections.image_banner.name"` |
| `"label"` | `"label": "Heading"` | `"label": "t:sections.image_banner.settings.heading.label"` |
| `"info"` | `"info": "Header shows..."` | `"info": "t:sections.header.settings.enable_sticky_header.info"` |
| `"content"` | `"content": "Layout"` | `"content": "t:sections.section.settings.header__layout.content"` |
| `"placeholder"` | `"placeholder": "Enter text"` | `"placeholder": "t:sections.hero.settings.heading.placeholder"` |
| preset `"name"` | `"name": "Image banner"` | `"name": "t:sections.image_banner.presets.name"` |
| preset `"category"` | `"category": "Banners"` | `"category": "t:sections.image_banner.presets.category"` |
| option `"label"` | `"label": "Large"` | `"label": "t:sections.section.settings.size.options__lg.label"` |
| `"default"` (text types) | `"default": "Talk about your brand"` | `"default": "t:blocks.heading.settings.heading.default"` |

The `"default"` field supports `t:` only for these setting types: `text`, `textarea`, `richtext`, `inline_richtext`, `html`, `liquid`, `url`, `video`, `video_url`. For all other types (`select`, `range`, `checkbox`, `color`, etc.) the default is a programmatic value and is **not translatable** — skip those.

Preset block setting values (inside `presets[].blocks[].settings` or `presets[].settings`) also support `t:` for the same text-based types listed above.

**Ignore** in schema:
- `"type"` values (these are internal identifiers: `"text"`, `"image_picker"`, etc.)
- `"id"` values
- `"default"` values on non-text setting types (`select`, `range`, `checkbox`, `radio`, `color`, `font_picker`, `text_alignment`, etc.)
- `"tag"` values (`"section"`, `"div"`, etc.)
- `"class"` values
- `"accept"` arrays
- URLs in `"content"` fields (Markdown links like `[Learn more](https://...)` — translate the link text, keep the URL)
- Boolean and numeric values

#### Audit workflow

1. **Scan** — Read all `.liquid` files. For each file, extract:
   - Hardcoded English text in template markup
   - Hardcoded English strings in schema JSON fields
2. **Generate keys** — Create appropriate locale key paths following the naming conventions:
   - Schema keys follow the file's section/block identity: `t:sections.{section_id}.settings.{setting_id}.label`
   - Template keys follow component grouping: `sections.{name}.{context}`, `blocks.{name}.{context}`
   - Use snake_case, max 3 levels deep, sentence case for values
3. **Report** — Present a table of findings before making changes:
   ```
   | File | Location | Hardcoded text | Proposed key | Type |
   |------|----------|---------------|--------------|------|
   | sections/header.liquid | line 12 | "Menu" | sections.header.menu | template |
   | sections/header.liquid | schema.name | "Header" | t:sections.header.name | schema |
   ```
4. **Extract** — After user confirms (or immediately if running as part of `full`):
   - Add new keys + English values to `locales/en.default.json` (template strings)
   - Add new keys + English values to `locales/en.default.schema.json` (schema strings)
   - Replace hardcoded text in `.liquid` files with `{{ 'key' | t }}` (template) or `"t:key"` (schema)
5. **Validate** — Confirm the locale files are still valid JSON after additions

#### Key naming for schema

The key path mirrors the schema structure. For a section file `sections/image-banner.liquid`:

```
sections.image_banner.name                                    → section name
sections.image_banner.settings.{setting_id}.label             → setting label
sections.image_banner.settings.{setting_id}.info              → setting info
sections.image_banner.settings.{setting_id}.default           → setting default (text types only)
sections.image_banner.settings.{setting_id}.options__{value}.label → option label
sections.image_banner.settings.{header_id}.content            → header content
sections.image_banner.presets.name                            → preset name
sections.image_banner.presets.category                        → preset category
```

For a block file `blocks/heading.liquid`:

```
blocks.heading.name                                           → block name
blocks.heading.settings.{setting_id}.label                    → setting label
blocks.heading.presets.name                                   → preset name
```

### `[lang-code]` — Single language (e.g., `fr`, `pt-BR`, `zh-CN`)

```bash
set -a && source .env && set +a && python3 scripts/translate-locales.py fr
```

Multiple languages:
```bash
set -a && source .env && set +a && python3 scripts/translate-locales.py fr de ja
```

### No argument — Default to `full`

If the user runs `/theme-translator` with no argument, treat it as `full`.

## GitHub Actions

The script works directly in CI. Example workflow (`.github/workflows/translate.yml`):

```yaml
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

## Validation

After translation completes, the script validates each output file as valid JSON. For additional checks:

```bash
# Parse check all locale files
for f in locales/*.json; do
  [[ "$f" == *"en.default"* || "$f" == *".translation-cache"* ]] && continue
  python3 -m json.tool "$f" > /dev/null 2>&1 && echo "OK: $f" || echo "INVALID: $f"
done
```

## Configuration

Environment variables:
- `ANTHROPIC_API_KEY` — Required
- `TRANSLATE_MODEL` — Optional, default: `claude-haiku-4-5-20251001`
- `TRANSLATE_WORKERS` — Optional, default: `5` (concurrent API calls)
