# Kona Theme System

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/jonathanmoore/kona-theme/blob/main/LICENSE.md)

A Vite-powered Shopify theme with islands hydration. Zero runtime JS dependencies — all interactivity is vanilla Web Components.

**[View Documentation](https://kona-theme.jonathanmoore.com/)** · **[Demo Store](https://kona-theme.myshopify.com/)**

## Quick Start

```bash
git clone https://github.com/jonathanmoore/kona-theme.git
cd kona-theme
pnpm install
pnpm dev -- --store your-store.myshopify.com
```

This starts two servers concurrently: Shopify CLI proxies your store and Vite serves JS/CSS with HMR at `localhost:5173`. Open the URL printed by Shopify CLI to see the theme.

### Requirements

- **Node.js 20+**
- **pnpm 10+** — activate with `corepack enable`
- **Shopify CLI** — `npm install -g @shopify/cli`
- A [Shopify Partner account](https://partners.shopify.com) with a development store

## How It Works

Kona has three layers: Liquid renders the page, Vite builds the assets, and islands hydrate the interactive parts.

**Liquid** renders every page to complete HTML on Shopify's servers. Pages are fast and functional with JS disabled.

**Vite** compiles frontend source (`theme/frontend/`) into production assets (`theme/assets/`). Five plugins handle Shopify integration, import maps, asset cleanup, and Tailwind CSS v4.

**Islands** are Web Components that hydrate on the client. The revive runtime scans the DOM for custom elements, matches them to island files, and loads them based on hydration directives:

```liquid
<header-drawer client:media="(max-width: 1023px)">
  <details>
    <!-- Full HTML markup, functional without JS -->
  </details>
</header-drawer>
```

Three directives control when each island loads:

| Directive | Loads when |
|-----------|-----------|
| `client:idle` | Main thread is free (`requestIdleCallback`) |
| `client:visible` | Element enters viewport (`IntersectionObserver`) |
| `client:media="(query)"` | Media query matches |

## Project Layout

```
kona-theme/
├── theme/                     Shopify theme (deployed to store)
│   ├── assets/                Built output + static assets
│   ├── blocks/                Theme blocks
│   ├── config/                Settings schema + data
│   ├── layout/                theme.liquid (main layout)
│   ├── locales/               60 locale files (30 languages x 2 types)
│   ├── sections/              Section files
│   ├── snippets/              Reusable partials + icons
│   ├── templates/             JSON templates
│   └── frontend/              Source code (NOT deployed)
│       ├── entrypoints/       theme.js + theme.css (Vite entry points)
│       ├── islands/           Web Components (one per file)
│       ├── lib/               Shared utilities (a11y, events, debounce)
│       └── styles/            CSS layers (theme tokens, base, components, utilities)
├── scripts/                   Build and utility scripts
├── docs/                      VitePress documentation site
└── vite.config.js             Vite configuration
```

The `theme/frontend/` directory is where you write code. Vite compiles it into `theme/assets/`. Everything else in `theme/` is standard Shopify theme structure.

## Key Features

### Tailwind CSS v4

Design tokens are defined in `theme/frontend/styles/theme.css` using Tailwind's `@theme` directive. CSS custom properties set in Liquid (from Shopify theme settings) feed into the `@theme` block, bridging the theme editor with Tailwind utilities. No `tailwind.config.js` — configuration lives in CSS.

### 30-Language i18n

An automated translation pipeline translates English locale files into 30 languages using the Claude API. Content hashing ensures only changed strings are re-translated.

```bash
python3 scripts/translate-locales.py sync    # Translate changed strings
python3 scripts/translate-locales.py check   # Verify translations are current
```

### CI/CD Workflows

Five GitHub Actions workflows handle linting (ESLint + Theme Check), deployment to a `live/` branch connected to Shopify, PR preview themes, translation checks, and documentation publishing.

### Claude Code Skills

Five built-in skills for [Claude Code](https://claude.ai/code) provide Liquid reference, WCAG 2.2 accessibility patterns, Kona coding standards, an interactive component creator, and translation management. See the [skills documentation](https://kona-theme.jonathanmoore.com/claude-code/).

## Commands

```bash
pnpm dev -- --store <name>     # Shopify + Vite dev servers
pnpm run build                 # Build frontend assets
pnpm run deploy                # Build + push theme to Shopify
pnpm run lint                  # ESLint
pnpm run format                # Prettier (Liquid + JS + CSS)
pnpm docs:dev                  # Run docs site locally
```

## Documentation

Full documentation at **[kona-theme.jonathanmoore.com](https://kona-theme.jonathanmoore.com/)** covers architecture, assets (CSS/JS), internationalization, CI/CD, and Claude Code skills.

## Author

[Jonathan Moore](https://jonathanmoore.com) · [@moore](https://x.com/moore)

## Thanks

Kona builds on the work of several excellent projects:

- [hydrogen-theme](https://github.com/montalvomiguelo/hydrogen-theme)
- [vite-plugin-shopify](https://github.com/barrel/shopify-vite)
- [hydrogen](https://github.com/Shopify/hydrogen)
- [dawn](https://github.com/Shopify/dawn)
- [astro](https://github.com/withastro/astro)
