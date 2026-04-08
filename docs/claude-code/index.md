---
title: Claude Code Skills
---

# Claude Code Skills

Five skills in `.claude/skills/` give Claude deep context about Liquid, accessibility, coding standards, and Kona's architecture. Invoke them with slash commands in any Claude Code session running inside the project.

## Quick reference

| Skill | Command | What it does |
|-------|---------|-------------|
| [Liquid Reference](./liquid-reference) | `/shopify-liquid` | Syntax, 152 filters, 30 tags, objects, 33 schema setting types, LiquidDoc, translations |
| [Accessibility](./accessibility) | `/shopify-liquid-a11y` | WCAG 2.2 patterns for e-commerce components |
| [Coding Standards](./coding-standards) | `/shopify-liquid-kona-standards` | Tailwind v4, island JS, CSS layers, design tokens |
| [Component Creator](./component-creator) | `/shopify-liquid-kona-new` | Guided workflow for new sections, blocks, and snippets |
| [Translator](./translator) | `/shopify-liquid-translator` | Translate locale files into 30 languages |

## Skill tiers

| Tier | Skills | Scope |
|------|--------|-------|
| **Universal** | `/shopify-liquid`, `/shopify-liquid-a11y`, `/shopify-liquid-translator` | Works with any Shopify theme |
| **Project** | `/shopify-liquid-kona-standards`, `/shopify-liquid-kona-new` | Kona-specific paths and conventions |

Universal skills have no Kona-specific paths. Project skills reference Kona's directory structure, Tailwind setup, and island architecture.

## How to use

### Slash commands

Type the slash command at the Claude Code prompt:

```
> /shopify-liquid-kona-new section newsletter-signup
```

### Implicit activation

Skills also activate automatically based on context. Ask Claude to write Liquid, fix accessibility issues, or manage translations — the relevant skill loads without an explicit command.

### Chaining skills

Skills compose together. For example, creating a new section might use:

1. `/shopify-liquid-kona-new` — scaffold the component
2. `/shopify-liquid` — reference for schema settings and filters
3. `/shopify-liquid-a11y` — accessible markup patterns
4. `/shopify-liquid-translator` — generate translations for new keys

### Skill files

Each skill directory contains:

- `skill.json` — metadata (name, description)
- `SKILL.md` — the full prompt content Claude receives

## Next steps

- [Liquid Reference](./liquid-reference) — The foundation skill for all Liquid work
- [Architecture Overview](/architecture/) — How islands, Vite, and Shopify fit together
- [Adding Translations](/i18n/adding-translations) — Step-by-step translation workflow
