# Adding Translations

Add new translatable strings, use them in Liquid, and keep translations in sync.

## Add a storefront string

Storefront strings are customer-facing: button labels, error messages, headings.

### 1. Add the key to English

Edit `theme/locales/en.default.json`:

```json
{
  "products": {
    "product": {
      "your_new_key": "Your new English string"
    }
  }
}
```

### 2. Use it in Liquid

```liquid
<label>{{ 'products.product.your_new_key' | t }}</label>
```

With variables:

```liquid
{{ 'general.pagination.page' | t: number: current_page }}
```

With HTML (use `_html` suffix):

```liquid
{{ 'general.password_page.admin_link_html' | t }}
```

### 3. Translate

```bash
set -a && source .env && set +a
python3 scripts/translate-locales.py sync
```

### 4. Verify

```bash
python3 scripts/translate-locales.py check
```

## Add a schema string

Schema strings are merchant-facing: section names, setting labels, help text.

### 1. Add the key to English

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

### 2. Reference in your schema

```json
{
  "type": "checkbox",
  "id": "show_vendor",
  "label": "t:sections.featured_collection.settings.show_vendor.label",
  "default": false
}
```

### 3. Translate and verify

```bash
set -a && source .env && set +a
python3 scripts/translate-locales.py sync
python3 scripts/translate-locales.py check
```

## Plural strings

Define plural forms in English:

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

Shopify selects the correct form based on `count`:

```liquid
{{ 'sections.header.cart_count' | t: count: cart.item_count }}
```

The translation pipeline generates the correct CLDR plural categories for each language (e.g., Polish gets `one`, `few`, `many`, `other`).

## Key naming conventions

### Storefront (`en.default.json`)

```
{category}.{subcategory}.{key_name}
```

| Category | Examples |
|---|---|
| `general` | `general.search.submit`, `general.pagination.next` |
| `accessibility` | `accessibility.close`, `accessibility.skip_to_text` |
| `products` | `products.product.add_to_cart` |
| `sections` | `sections.header.cart_count` |
| `templates` | `templates.cart.title` |

### Schema (`en.default.schema.json`)

```
sections.{section_name}.settings.{setting_id}.label
sections.{section_name}.presets.name
blocks.{block_name}.settings.{setting_id}.label
```

### Rules

- `snake_case` for all key segments
- Suffix HTML keys with `_html`
- Use `_label` for form labels, `_placeholder` for placeholders, `_error` for validation
- Keep keys concise: `add_to_cart` not `button_text_for_adding_item_to_cart`

## Audit for hardcoded text

Use the `/shopify-liquid-translator` skill to find English text not wrapped in translation filters:

```
/shopify-liquid-translator audit
```

It scans `.liquid` files, reports hardcoded strings, and can extract them into locale files. Run `sync` afterward to translate the new keys.

## Regenerate a corrupted file

```bash
rm theme/locales/fr.json theme/locales/fr.schema.json
set -a && source .env && set +a
python3 scripts/translate-locales.py fr
python3 scripts/translate-locales.py check fr
```

Force a complete retranslation:

```bash
python3 scripts/translate-locales.py full fr
```

## CI validation

Every PR runs `python3 scripts/translate-locales.py check` via `i18n-check.yml`. If it fails, run `sync` locally, commit the updated locale files, and push.

## Next steps

- [Translation Pipeline](./translation-pipeline) — How the script works under the hood
- [i18n Overview](./) — Quick start and language list
