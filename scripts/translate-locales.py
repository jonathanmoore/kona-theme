#!/usr/bin/env python3
"""
Translate Shopify theme locale files using the Claude API.

Compact numbered-list format is ~10x more token-efficient than full JSON.
Incremental mode tracks content hashes to skip unchanged keys.

Usage:
  python3 scripts/translate-locales.py full              # all languages, all keys
  python3 scripts/translate-locales.py sync              # only changed/new keys
  python3 scripts/translate-locales.py fr                # single language (full)
  python3 scripts/translate-locales.py fr de ja          # specific languages (full)

Environment:
  ANTHROPIC_API_KEY    Required. https://console.anthropic.com/settings/keys
  TRANSLATE_MODEL      Optional. Default: claude-sonnet-4-5-20250929
  TRANSLATE_WORKERS    Optional. Default: 3 (concurrent API calls)
"""

import hashlib
import json
import os
import sys
import re
import time
import concurrent.futures
import anthropic

# ── Config ──────────────────────────────────────────────────────────

LOCALES_DIR = "locales"
EN_STOREFRONT = os.path.join(LOCALES_DIR, "en.default.json")
EN_SCHEMA = os.path.join(LOCALES_DIR, "en.default.schema.json")
CACHE_FILE = os.path.join(LOCALES_DIR, ".translation-cache.json")
MODEL = os.environ.get("TRANSLATE_MODEL", "claude-haiku-4-5-20251001")
MAX_WORKERS = int(os.environ.get("TRANSLATE_WORKERS", "5"))
MAX_RETRIES = 3

ALL_LANGS = [
    "bg", "cs", "da", "de", "el", "es", "fi", "fr", "hr", "hu",
    "id", "it", "ja", "ko", "lt", "nb", "nl", "pl", "pt-BR", "pt-PT",
    "ro", "ru", "sk", "sl", "sv", "th", "tr", "vi", "zh-CN", "zh-TW",
]

LANG_CONFIG = {
    "cs": {"name": "Czech", "formal": "formal (vy)", "plural": ["one", "few", "many", "other"], "cart": "Košík", "checkout": "Přejít k pokladně"},
    "da": {"name": "Danish", "formal": "informal (du)", "plural": ["one", "other"], "cart": "Kurv", "checkout": "Gå til kassen"},
    "de": {"name": "German", "formal": "formal (Sie)", "plural": ["one", "other"], "cart": "Warenkorb", "checkout": "Zur Kasse"},
    "es": {"name": "Spanish", "formal": "formal (usted), Latin American", "plural": ["one", "many", "other"], "cart": "Carrito", "checkout": "Finalizar compra"},
    "fi": {"name": "Finnish", "formal": "informal (sinä)", "plural": ["one", "other"], "cart": "Ostoskori", "checkout": "Siirry kassalle"},
    "fr": {"name": "French", "formal": "formal (vous)", "plural": ["one", "other"], "cart": "Panier", "checkout": "Passer la commande"},
    "it": {"name": "Italian", "formal": "formal (Lei)", "plural": ["one", "other"], "cart": "Carrello", "checkout": "Procedi al checkout"},
    "ja": {"name": "Japanese", "formal": "polite (です/ます)", "plural": ["other"], "cart": "カート", "checkout": "ご購入手続きへ"},
    "ko": {"name": "Korean", "formal": "polite/formal", "plural": ["other"], "cart": "장바구니", "checkout": "결제하기"},
    "nb": {"name": "Norwegian Bokmål", "formal": "informal (du)", "plural": ["one", "other"], "cart": "Handlekurv", "checkout": "Gå til kassen"},
    "nl": {"name": "Dutch", "formal": "formal (u)", "plural": ["one", "other"], "cart": "Winkelwagen", "checkout": "Afrekenen"},
    "pl": {"name": "Polish", "formal": "formal", "plural": ["one", "few", "many", "other"], "cart": "Koszyk", "checkout": "Przejdź do kasy"},
    "pt-BR": {"name": "Brazilian Portuguese", "formal": "semi-formal (você)", "plural": ["one", "other"], "cart": "Carrinho", "checkout": "Finalizar compra"},
    "pt-PT": {"name": "European Portuguese", "formal": "formal", "plural": ["one", "other"], "cart": "Carrinho", "checkout": "Finalizar compra"},
    "sv": {"name": "Swedish", "formal": "informal (du)", "plural": ["one", "other"], "cart": "Varukorg", "checkout": "Gå till kassan"},
    "th": {"name": "Thai", "formal": "polite", "plural": ["other"], "cart": "ตะกร้าสินค้า", "checkout": "ชำระเงิน"},
    "tr": {"name": "Turkish", "formal": "formal (siz)", "plural": ["one", "other"], "cart": "Sepet", "checkout": "Ödemeye geç"},
    "zh-CN": {"name": "Simplified Chinese", "formal": "neutral formal", "plural": ["other"], "cart": "购物车", "checkout": "结账"},
    "zh-TW": {"name": "Traditional Chinese", "formal": "neutral formal", "plural": ["other"], "cart": "購物車", "checkout": "結帳"},
    "bg": {"name": "Bulgarian", "formal": "formal (Вие)", "plural": ["one", "other"], "cart": "Количка", "checkout": "Плащане"},
    "el": {"name": "Greek", "formal": "formal (εσείς)", "plural": ["one", "other"], "cart": "Καλάθι", "checkout": "Ολοκλήρωση παραγγελίας"},
    "hr": {"name": "Croatian", "formal": "formal (Vi)", "plural": ["one", "few", "other"], "cart": "Košarica", "checkout": "Plaćanje"},
    "hu": {"name": "Hungarian", "formal": "formal (Ön)", "plural": ["one", "other"], "cart": "Kosár", "checkout": "Pénztár"},
    "id": {"name": "Indonesian", "formal": "formal (Anda)", "plural": ["other"], "cart": "Keranjang", "checkout": "Checkout"},
    "lt": {"name": "Lithuanian", "formal": "formal (Jūs)", "plural": ["one", "few", "many", "other"], "cart": "Krepšelis", "checkout": "Atsiskaityti"},
    "ro": {"name": "Romanian", "formal": "formal (dumneavoastră)", "plural": ["one", "few", "other"], "cart": "Coș de cumpărături", "checkout": "Finalizare comandă"},
    "ru": {"name": "Russian", "formal": "formal (Вы)", "plural": ["one", "few", "many", "other"], "cart": "Корзина", "checkout": "Оформить заказ"},
    "sk": {"name": "Slovak", "formal": "formal (vy)", "plural": ["one", "few", "many", "other"], "cart": "Košík", "checkout": "Prejsť k pokladni"},
    "sl": {"name": "Slovenian", "formal": "formal (vi)", "plural": ["one", "two", "few", "other"], "cart": "Košarica", "checkout": "Na blagajno"},
    "vi": {"name": "Vietnamese", "formal": "formal", "plural": ["other"], "cart": "Giỏ hàng", "checkout": "Thanh toán"},
}

# Keys that have plural sub-objects in English
PLURAL_KEYS = {"sections.header.cart_count"}


# ── JSON flattening ─────────────────────────────────────────────────

def flatten(obj, prefix=""):
    """Extract leaf key paths and values from nested dict, preserving order."""
    items = []
    for k, v in obj.items():
        path = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            if path in PLURAL_KEYS:
                items.append((path, f"PLURAL:{json.dumps(v)}"))
            else:
                items.extend(flatten(v, path))
        else:
            items.append((path, v))
    return items


def unflatten(items):
    """Reconstruct nested dict from (key_path, value) pairs."""
    result = {}
    for path, value in items:
        keys = path.split(".")
        d = result
        for k in keys[:-1]:
            if k not in d:
                d[k] = {}
            d = d[k]
        d[keys[-1]] = value
    return result


# ── Content hashing ─────────────────────────────────────────────────

def hash_value(value):
    """Short hash of a value for change detection."""
    if isinstance(value, dict):
        raw = json.dumps(value, sort_keys=True)
    else:
        raw = str(value)
    return hashlib.sha256(raw.encode()).hexdigest()[:12]


def load_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE) as f:
            return json.load(f)
    return {}


def save_cache(cache):
    with open(CACHE_FILE, "w") as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)
        f.write("\n")


def diff_entries(entries, cache_key, cache):
    """Compare entries against cache. Returns (changed, deleted)."""
    cached = cache.get(cache_key, {})
    current_paths = set()
    changed = []

    for path, value in entries:
        current_paths.add(path)
        h = hash_value(value)
        if cached.get(path) != h:
            changed.append((path, value))

    deleted = [p for p in cached if p not in current_paths]
    return changed, deleted


def update_cache_entries(entries, cache_key, cache):
    """Update cache with current entry hashes."""
    cache[cache_key] = {path: hash_value(value) for path, value in entries}


# ── Translation ─────────────────────────────────────────────────────

def build_prompt(lang_code, entries, file_type):
    """Build compact prompt with numbered entries."""
    cfg = LANG_CONFIG[lang_code]
    plural_forms = cfg["plural"]

    lines = []
    for i, (path, value) in enumerate(entries):
        if isinstance(value, str) and value.startswith("PLURAL:"):
            lines.append(f"{i}|PLURAL({','.join(plural_forms)})|{value[7:]}")
        else:
            lines.append(f"{i}|{value}")

    entry_block = "\n".join(lines)
    file_desc = (
        "storefront (customer-facing)"
        if file_type == "storefront"
        else "theme editor (merchant-facing in Shopify admin)"
    )

    return f"""Translate these {file_desc} strings to {cfg['name']}.

RULES:
- Formality: {cfg['formal']}
- Cart = "{cfg['cart']}", Checkout = "{cfg['checkout']}"
- Keep {{{{ variable }}}} placeholders exactly as-is
- Keep HTML tags, URLs, CSS classes unchanged — translate text only
- Never translate: brand names (Shopify, PayPal, Apple Pay), social media names, SKU
- Use natural e-commerce language for {cfg['name']}
- For PLURAL entries: output each form on its own sub-line as form=translated text
- Use escaped quotes \\" for quotes inside strings, never typographic quotes

OUTPUT FORMAT: Return ONLY numbered lines matching the input. For regular entries:
0|translated text
For PLURAL entries:
5|one=1 {{{{ count }}}} item-translation
5|other={{{{ count }}}} items-translation
(use the plural forms specified in parentheses)

Do NOT add any commentary, markdown, or extra text. Just the numbered translations.

INPUT:
{entry_block}"""


def parse_response(response_text, entries, plural_forms):
    """Parse numbered response back into (path, value) pairs."""
    translated = {}
    for line in response_text.strip().split("\n"):
        line = line.strip()
        if not line or line.startswith("#") or line.startswith("```"):
            continue
        match = re.match(r"^(\d+)\|(.+)$", line)
        if not match:
            continue
        idx = int(match.group(1))
        value = match.group(2)
        if idx >= len(entries):
            continue

        path = entries[idx][0]
        orig = entries[idx][1]

        if isinstance(orig, str) and orig.startswith("PLURAL:"):
            form_match = re.match(r"^(\w+)=(.+)$", value)
            if form_match:
                form = form_match.group(1)
                text = form_match.group(2)
                if path not in translated:
                    translated[path] = {}
                translated[path][form] = text
        else:
            translated[path] = value

    result = []
    for i, (path, orig) in enumerate(entries):
        if path in translated:
            result.append((path, translated[path]))
        else:
            if isinstance(orig, str) and orig.startswith("PLURAL:"):
                result.append((path, json.loads(orig[7:])))
            else:
                result.append((path, orig))
    return result


def call_api(client, entries, lang_code, file_type):
    """Call Claude API with retries. Returns list of (path, value) pairs."""
    cfg = LANG_CONFIG[lang_code]
    prompt = build_prompt(lang_code, entries, file_type)

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.messages.create(
                model=MODEL,
                max_tokens=8000,
                messages=[{"role": "user", "content": prompt}],
            )
            return parse_response(response.content[0].text, entries, cfg["plural"])
        except anthropic.RateLimitError:
            if attempt < MAX_RETRIES:
                wait = 2 ** attempt
                print(f"    Rate limited, retrying in {wait}s...")
                time.sleep(wait)
            else:
                raise


def write_locale(data, path):
    """Write JSON locale file and validate it."""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    # Validate
    with open(path) as f:
        json.load(f)


# ── File-level operations ──────────────────────────────────────────

def translate_full(client, lang_code, all_entries, file_type, output_path):
    """Translate all entries from scratch."""
    translated = call_api(client, all_entries, lang_code, file_type)
    write_locale(unflatten(translated), output_path)
    return len(translated)


def translate_sync(client, lang_code, all_entries, changed_entries, deleted_keys, file_type, output_path):
    """Translate only changed entries, merge into existing file."""
    # Load existing translations as a lookup dict
    existing = {}
    if os.path.exists(output_path):
        with open(output_path) as f:
            existing = dict(flatten(json.load(f)))

    # Translate changed entries
    new_translations = {}
    if changed_entries:
        translated = call_api(client, changed_entries, lang_code, file_type)
        new_translations = dict(translated)

    # Build final entries in English key order
    final = []
    for path, en_value in all_entries:
        if path in new_translations:
            # Newly translated
            final.append((path, new_translations[path]))
        elif path in existing and path not in deleted_keys:
            # Keep existing translation
            final.append((path, existing[path]))
        else:
            # Missing — use English as fallback (shouldn't normally happen)
            final.append((path, en_value))

    write_locale(unflatten(final), output_path)
    return len(changed_entries)


# ── Task builders ──────────────────────────────────────────────────

def build_tasks(langs, mode, cache):
    """Build list of translation tasks: (lang, source_entries, file_type, output_path, changed, deleted)."""
    # Load English sources
    with open(EN_STOREFRONT) as f:
        storefront_entries = flatten(json.load(f))
    with open(EN_SCHEMA) as f:
        schema_entries = flatten(json.load(f))

    tasks = []
    for lang in langs:
        # Storefront
        sf_path = os.path.join(LOCALES_DIR, f"{lang}.json")
        sf_cache_key = f"storefront:{lang}"
        if mode == "sync":
            if not os.path.exists(sf_path):
                # File missing — translate everything
                tasks.append((lang, storefront_entries, "storefront", sf_path, storefront_entries, [], sf_cache_key))
            else:
                changed, deleted = diff_entries(storefront_entries, sf_cache_key, cache)
                if changed or deleted:
                    tasks.append((lang, storefront_entries, "storefront", sf_path, changed, deleted, sf_cache_key))
        else:
            tasks.append((lang, storefront_entries, "storefront", sf_path, storefront_entries, [], sf_cache_key))

        # Schema
        sc_path = os.path.join(LOCALES_DIR, f"{lang}.schema.json")
        sc_cache_key = f"schema:{lang}"
        if mode == "sync":
            if not os.path.exists(sc_path):
                tasks.append((lang, schema_entries, "schema", sc_path, schema_entries, [], sc_cache_key))
            else:
                changed, deleted = diff_entries(schema_entries, sc_cache_key, cache)
                if changed or deleted:
                    tasks.append((lang, schema_entries, "schema", sc_path, changed, deleted, sc_cache_key))
        else:
            tasks.append((lang, schema_entries, "schema", sc_path, schema_entries, [], sc_cache_key))

    return tasks, storefront_entries, schema_entries


def process_task(client, task, mode):
    """Process a single translation task. Returns (output_path, keys_translated) or raises."""
    lang, all_entries, file_type, output_path, changed, deleted, cache_key = task

    if mode == "sync":
        n = translate_sync(client, lang, all_entries, changed, deleted, file_type, output_path)
    else:
        n = translate_full(client, lang, all_entries, file_type, output_path)

    return output_path, n


# ── Main ───────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]

    if not args or args[0] == "full":
        mode = "full"
        langs = args[1:] if len(args) > 1 else ALL_LANGS
    elif args[0] == "sync":
        mode = "sync"
        langs = args[1:] if len(args) > 1 else ALL_LANGS
    else:
        # Treat all args as language codes → sync mode (respects cache)
        mode = "sync"
        langs = args

    # Validate languages
    valid = set(ALL_LANGS)
    for lang in langs:
        if lang not in valid:
            print(f"Unknown language: {lang}")
            print(f"Valid: {', '.join(ALL_LANGS)}")
            sys.exit(1)

    # Check API key
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ANTHROPIC_API_KEY not set.")
        print("Copy .env.example to .env, add your key, then: source .env")
        sys.exit(1)

    client = anthropic.Anthropic()
    cache = load_cache()

    tasks, storefront_entries, schema_entries = build_tasks(langs, mode, cache)

    if not tasks:
        if mode == "sync":
            print("No changes detected — all translations are up to date.")
        else:
            print("No files to translate.")
        return

    total = len(tasks)
    action = "Syncing" if mode == "sync" else "Translating"
    print(f"{action} {total} file(s) using {MODEL}...")

    completed = 0
    errors = []
    keys_translated = 0

    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {}
        for task in tasks:
            future = executor.submit(process_task, client, task, mode)
            futures[future] = task

        for future in concurrent.futures.as_completed(futures):
            task = futures[future]
            lang, _, file_type, output_path, changed, _, cache_key = task
            try:
                path, n = future.result()
                completed += 1
                keys_translated += n

                # Update cache for this file
                all_entries = task[1]
                update_cache_entries(all_entries, cache_key, cache)

                label = f"{n} keys" if mode == "sync" else "all keys"
                print(f"  [{completed}/{total}] {path} ({label})")
            except Exception as e:
                errors.append((output_path, str(e)))
                print(f"  ERROR: {output_path} — {e}")

    # Save updated cache
    # Also cache the source entries for languages we didn't process (in full mode)
    if mode == "full":
        for lang in langs:
            sf_key = f"storefront:{lang}"
            if sf_key not in cache:
                update_cache_entries(storefront_entries, sf_key, cache)
            sc_key = f"schema:{lang}"
            if sc_key not in cache:
                update_cache_entries(schema_entries, sc_key, cache)

    save_cache(cache)

    # Summary
    print(f"\nDone: {completed}/{total} files, {keys_translated} keys translated")
    if mode == "sync" and completed == 0:
        print("(No files needed updating)")
    if errors:
        print(f"\nErrors ({len(errors)}):")
        for path, err in errors:
            print(f"  {path}: {err}")
        sys.exit(1)


if __name__ == "__main__":
    main()
