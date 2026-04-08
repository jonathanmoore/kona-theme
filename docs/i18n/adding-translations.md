# Adding Translations

A step-by-step guide for adding new translatable strings to Kona Theme, using translation references in Liquid and schema, auditing for hardcoded text, and fixing corrupted locale files.

## Adding a New Storefront String

Storefront strings are customer-facing text -- button labels, error messages, headings, and any text visitors see on the store.

### 1. Add the key to the English source file

Edit `theme/locales/en.default.json` and add your key in the appropriate section:

```json
{
  "products": {
    "product": {
      "quantity_label": "Quantity",
      "your_new_key": "Your new English string"
    }
  }
}
```

Follow the existing nesting structure. Keys use `snake_case`.

### 2. Use the key in your Liquid template

Reference the key using the `| t` filter. The key path uses dot notation matching the JSON nesting:

```liquid
<label>{{ 'products.product.your_new_key' | t }}</label>
```

For strings containing HTML, use the `_html` suffix convention:

```liquid
{{ 'general.password_page.admin_link_html' | t }}
```

For strings with variables, pass them as filter parameters:

```liquid
{{ 'general.pagination.page' | t: number: current_page }}
```

This renders the English source <code v-pre>"Page {{ number }}"</code> with the variable substituted.

### 3. Run sync to translate across all languages

```bash
set -a && source .env && set +a
python3 scripts/translate-locales.py sync
```

The sync command detects the new key (its hash is absent from the cache) and translates it across all 30 languages. Existing translations for unchanged keys are preserved.

### 4. Verify the result

```bash
python3 scripts/translate-locales.py check
```

This confirms all locale files contain the new key and no translations are stale.

## Adding a New Schema String

Schema strings are merchant-facing text visible in the Shopify theme editor -- section names, setting labels, dropdown options, and help text.

### 1. Add the key to the English schema file

Edit `theme/locales/en.default.schema.json`:

```json
{
  "sections": {
    "featured_collection": {
      "settings": {
        "show_vendor": {
          "label": "Show product vendor"
        }
      }
    }
  }
}
```

### 2. Reference the key in your schema block

Inside a `{% schema %}` block, use the `t:` prefix followed by the dot-notation key path:

```json
{
  "type": "checkbox",
  "id": "show_vendor",
  "label": "t:sections.featured_collection.settings.show_vendor.label",
  "default": false
}
```

The `t:` prefix works for `name`, `label`, `info`, and option `label` fields within schema JSON.

### 3. Run sync and verify

```bash
set -a && source .env && set +a
python3 scripts/translate-locales.py sync
python3 scripts/translate-locales.py check
```

## Translation Key Naming Conventions

Keys follow a consistent hierarchy:

### Storefront keys (`en.default.json`)

```
{category}.{subcategory}.{key_name}
```

| Top-level category | Examples |
|---|---|
| `general` | `general.search.submit`, `general.pagination.next` |
| `accessibility` | `accessibility.close`, `accessibility.skip_to_text` |
| `products` | `products.product.add_to_cart`, `products.product.price` |
| `sections` | `sections.header.cart_count` |
| `newsletter` | `newsletter.label`, `newsletter.success` |
| `templates` | `templates.cart.title` |

### Schema keys (`en.default.schema.json`)

```
sections.{section_name}.{context}.{key_name}
```

Where `{context}` is one of:

- `name` -- The section's display name
- `settings.{setting_id}.label` -- A setting's label
- `settings.{setting_id}.info` -- A setting's help text
- `settings.{setting_id}.options.{value}` -- A select option label
- `presets.name` -- The section preset's display name
- `presets.blocks.{block_type}.{field}` -- Default text for block presets

### Naming rules

- Use `snake_case` for all key segments.
- Suffix keys containing HTML with `_html` (e.g., `admin_link_html`).
- Use `_label` for form labels, `_placeholder` for placeholder text, `_error` for validation messages.
- Keep keys descriptive but concise: `add_to_cart` not `button_text_for_adding_item_to_cart`.

## Using Translations in Liquid

### Basic string

```liquid
<h2>{{ 'templates.cart.title' | t }}</h2>
```

### String with variables

Define placeholders in the English source with double braces:

```json
{
  "general": {
    "search": {
      "no_results_html": "Your search for \"{{ terms }}\" did not return results."
    }
  }
}
```

Pass the variable when rendering:

```liquid
{{ 'general.search.no_results_html' | t: terms: search.terms }}
```

### Plural strings

Shopify handles pluralization automatically. Define plural forms in the English source:

```json
{
  "sections": {
    "header": {
      "cart_count": {
        "one": "{{ count }} item",
        "other": "{{ count }} items"
      }
    }
  }
}
```

Shopify selects the correct form based on the `count` variable:

```liquid
{{ 'sections.header.cart_count' | t: count: cart.item_count }}
```

The translation pipeline automatically generates the correct plural forms for each target language per its CLDR rules. See [Translation Pipeline](./translation-pipeline#plural-form-handling) for details on how plural categories vary by language.

## Auditing for Hardcoded Text

If you have Liquid templates with English text that is not wrapped in translation filters, the audit mode will find them.

### Running an audit

Use the `/shopify-liquid-translator` Claude Code skill:

```
/shopify-liquid-translator audit
```

This scans all `.liquid` files and reports hardcoded English strings with their locations. After you confirm the findings, it:

1. Adds the new keys to `en.default.json` or `en.default.schema.json` as appropriate.
2. Replaces hardcoded text in the templates with `| t` filter calls or `t:` prefix references.

### After the audit

Run sync to translate the newly extracted strings:

```bash
set -a && source .env && set +a
python3 scripts/translate-locales.py sync
```

### Skipping files

To exclude a file from the audit, add this comment at the top:

```liquid
{%- comment -%}theme-translator:skip{%- endcomment -%}
```

## Regenerating a Corrupted Locale File

If a locale file has invalid JSON or incorrect translations, delete it and regenerate:

```bash
# Delete the corrupted files
rm theme/locales/fr.json theme/locales/fr.schema.json

# Regenerate (sync detects missing files and translates everything)
set -a && source .env && set +a
python3 scripts/translate-locales.py fr

# Verify
python3 scripts/translate-locales.py check fr
```

To force a complete retranslation even if the files exist:

```bash
set -a && source .env && set +a
python3 scripts/translate-locales.py full fr
```

## CI Validation

Every pull request targeting `main` runs the `i18n-check.yml` workflow, which executes `python3 scripts/translate-locales.py check`. This catches:

- New English strings that have not been translated yet.
- Keys removed from English but still present in locale files.
- English values that changed without a corresponding translation update.

If the check fails, run `sync` locally to update translations before pushing:

```bash
set -a && source .env && set +a
python3 scripts/translate-locales.py sync
```

Then commit the updated locale files and push. For full details on the CI pipeline, see [CI/CD](/ci-cd/).
