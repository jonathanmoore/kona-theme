# Kona Theme

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/jonathanmoore/kona-theme/blob/main/LICENSE.md)

A Vite-powered Shopify theme with islands hydration. Zero runtime JS dependencies — all interactivity is vanilla Web Components.

**[View Documentation](https://kona-theme.jonathanmoore.com/)**

## Quick Start

```bash
pnpm install
pnpm dev -- --store your-store-name
```

## Key Features

- **Islands Architecture** — Liquid renders server-side, Web Components hydrate client-side with `client:idle`, `client:visible`, and `client:media` directives
- **Vite Build Pipeline** — HMR in development, optimized production builds with five custom plugins
- **Tailwind CSS v4** — Utility-first styling with `@theme` design tokens bridged to Shopify's theme editor
- **30-Language i18n** — Automated translation pipeline with content hashing for incremental updates
- **CI/CD Workflows** — GitHub Actions for linting, theme checks, PR previews, and deployment
- **Claude Code Skills** — Five built-in skills for Liquid reference, accessibility, standards, component creation, and translations

## Documentation

Full documentation is available at **[kona-theme.jonathanmoore.com](https://kona-theme.jonathanmoore.com/)** covering:

- [Getting Started](https://kona-theme.jonathanmoore.com/getting-started/) — Installation, development, deployment
- [Architecture](https://kona-theme.jonathanmoore.com/architecture/) — Islands, hydration, build pipeline, project layout
- [Assets](https://kona-theme.jonathanmoore.com/assets/) — CSS, creating islands, events, lifecycle, utilities
- [Claude Code Skills](https://kona-theme.jonathanmoore.com/claude-code/) — Liquid reference, accessibility, standards, component creation, translations
- [Internationalization](https://kona-theme.jonathanmoore.com/i18n/) — Translation pipeline
- [CI/CD](https://kona-theme.jonathanmoore.com/ci-cd/) — Workflows, PR previews

## Author

[Jonathan Moore](https://jonathanmoore.com) · [@moore](https://x.com/moore)

## Thanks

Kona builds on the work of several excellent projects:

- [hydrogen-theme](https://github.com/montalvomiguelo/hydrogen-theme)
- [vite-plugin-shopify](https://github.com/barrel/shopify-vite)
- [hydrogen](https://github.com/Shopify/hydrogen)
- [dawn](https://github.com/Shopify/dawn)
- [astro](https://github.com/withastro/astro)
