# Translation Pipeline

The translation engine is `scripts/translate-locales.py` — a single Python script that calls the Claude API to produce locale files for 30 languages. Content hashing ensures only changed strings are re-translated.

## Modes

### `full` — Generate all translations

Translates every key from scratch. Creates the content hash cache for future incremental runs.

```bash
python3 scripts/translate-locales.py full          # All 30 languages
python3 scripts/translate-locales.py full fr de ja  # Specific languages
```

### `sync` — Incremental updates

Compares current English values against the hash cache. Only sends changed or new keys to the API. Removes deleted keys. Typically saves **80–90% of API costs** vs. `full`.

```bash
python3 scripts/translate-locales.py sync
python3 scripts/translate-locales.py sync fr de
```

If a locale file is missing, sync regenerates it entirely. If no cache exists, sync falls back to full.

### Language codes — Single language sync

```bash
python3 scripts/translate-locales.py fr              # Sync one language
python3 scripts/translate-locales.py pt-BR zh-CN     # Sync specific languages
python3 scripts/translate-locales.py full fr          # Force full regen
```

### `check` — Verify without API calls

Reports missing, obsolete, and stale translations. **No API key needed.** Exits 0 if current, 1 if issues found.

```bash
python3 scripts/translate-locales.py check
python3 scripts/translate-locales.py check fr de ja
```

## Numbered-list wire format

Instead of sending JSON to the API, the script flattens locale keys into a numbered list — roughly **10x more token-efficient**:

**Sent:**
```
0|Enter store using password:
1|Enter using password
2|Password
```

**Received:**
```
0|Entrer dans la boutique avec le mot de passe :
1|Entrer avec le mot de passe
2|Mot de passe
```

The script maps numbered lines back to key paths and reconstructs nested JSON.

## Content hashing

Each English value is SHA-256 hashed (truncated to 12 hex chars). Hashes are stored in `theme/locales/.translation-cache.json`.

On `sync`, the script compares current hashes against cached ones. Editing one English string triggers 30 small API calls (one per language, one string each) rather than retranslating everything.

The cache is committed to git so CI can run `check` without prior state. It's excluded from Shopify uploads via `.shopifyignore`.

## Plural handling

The script detects plural keys and generates the target language's CLDR-specified categories. Polish, for example, needs four forms:

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

Wire format for plurals:

```
5|PLURAL(one,few,many,other)|{"one":"{{ count }} item","other":"{{ count }} items"}
```

Response:

```
5|one=1 {{ count }} przedmiot
5|few={{ count }} przedmioty
5|many={{ count }} przedmiotow
5|other={{ count }} przedmiotow
```

Each language's categories are defined in `LANG_CONFIG` within the script.

## Concurrency and retries

Up to **5 concurrent API calls** via `ThreadPoolExecutor` (configurable with `TRANSLATE_WORKERS`). Rate limit errors retry with exponential backoff: 2s, 4s, 8s, up to 3 attempts.

## Translation quality

The prompt includes per-language context:

- **Formality** — French uses `vous`, German uses `Sie`, Danish uses `du`, Japanese uses `desu/masu`
- **E-commerce terms** — Pre-specified translations for "Cart" and "Checkout"
- **Preservation** — <code v-pre>{{ variable }}</code> placeholders, HTML tags, brand names, and URLs are never translated
- **Register** — Storefront strings described as "customer-facing," schema strings as "merchant-facing in Shopify admin"

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | required | Claude API key |
| `TRANSLATE_MODEL` | `claude-haiku-4-5-20251001` | Model for translations |
| `TRANSLATE_WORKERS` | `5` | Max concurrent API calls |

```bash
set -a && source .env && set +a
python3 scripts/translate-locales.py sync
```

## GitHub Actions

`i18n-check.yml` runs `check` on every PR targeting `main`. No API key or setup needed — it reads the cache already in the repo.

```yaml
jobs:
  i18n:
    name: Check Translations
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: python3 scripts/translate-locales.py check
```

## File reference

| File | Purpose |
|------|---------|
| `scripts/translate-locales.py` | Translation engine |
| `theme/locales/en.default.json` | English storefront strings (source of truth) |
| `theme/locales/en.default.schema.json` | English schema strings (source of truth) |
| `theme/locales/.translation-cache.json` | Content hash cache (committed to git) |
| `.github/workflows/i18n-check.yml` | PR translation check |

## Next steps

- [Adding Translations](./adding-translations) — Step-by-step guide for new strings
- [i18n Overview](./) — Quick start and language list
