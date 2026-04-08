# Kona Theme

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/jonathanmoore/kona-theme/blob/main/LICENSE.md)

A Vite-powered Shopify OS 2.0 theme with an Astro-inspired islands architecture. Zero runtime JS dependencies — all interactivity is vanilla Web Components.

**[View Documentation](https://jonathanmoore.github.io/kona-theme/)**

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

Full documentation is available at **[jonathanmoore.github.io/kona-theme](https://jonathanmoore.github.io/kona-theme/)** covering:

- [Getting Started](https://jonathanmoore.github.io/kona-theme/getting-started/) — Installation, development, deployment
- [Architecture](https://jonathanmoore.github.io/kona-theme/architecture/) — Islands, hydration, build pipeline, project layout
- [CSS](https://jonathanmoore.github.io/kona-theme/css/) — Design tokens, Shopify integration
- [JavaScript](https://jonathanmoore.github.io/kona-theme/javascript/) — Creating islands, events, lifecycle, utilities
- [Shopify](https://jonathanmoore.github.io/kona-theme/shopify/) — Sections, blocks, Liquid patterns, templates, icons
- [Internationalization](https://jonathanmoore.github.io/kona-theme/i18n/) — Translation pipeline
- [CI/CD](https://jonathanmoore.github.io/kona-theme/ci-cd/) — Workflows, PR previews, GitHub Pages
- [Standards](https://jonathanmoore.github.io/kona-theme/standards/) — JavaScript, CSS, accessibility, compliance audit

## Author

[Jonathan Moore](https://jonathanmoore.com) · [@moore](https://x.com/moore)

## Thanks

Kona builds on the work of several excellent projects:

- [hydrogen-theme](https://github.com/montalvomiguelo/hydrogen-theme)
- [vite-plugin-shopify](https://github.com/barrel/shopify-vite)
- [hydrogen](https://github.com/Shopify/hydrogen)
- [dawn](https://github.com/Shopify/dawn)
- [astro](https://github.com/withastro/astro)
