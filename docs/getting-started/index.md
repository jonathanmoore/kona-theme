---
title: Introduction
---

# Introduction

Kona is a Vite-powered Shopify OS 2.0 theme built on an Astro-inspired islands architecture. Liquid renders HTML server-side, and interactive components hydrate client-side as vanilla Web Components -- no React, no Vue, no runtime framework dependencies.

The build pipeline uses Vite with five purpose-built plugins to bridge the gap between modern frontend tooling and Shopify's theme platform. You get hot module replacement during development, Tailwind CSS v4 with design tokens driven by Shopify theme settings, and a CI/CD pipeline that handles deployment, PR previews, and 30-language translations.

## Who this is for

- **Theme developers** who want modern tooling (Vite, Tailwind, ESLint, Prettier) without shipping a JavaScript framework to the browser
- **Teams** who need a deployment pipeline with PR preview themes and automated linting
- **Developers** familiar with Shopify themes who want to adopt a component-based architecture with clear separation between server-rendered markup and client-side interactivity

## Requirements

| Dependency | Version | Notes |
|---|---|---|
| Node.js | 20+ | Required for Vite and build tooling |
| pnpm | 10+ | Package manager (`corepack enable` to activate) |
| Shopify CLI | Latest | `npm install -g @shopify/cli` |
| Shopify Partner account | -- | [partners.shopify.com](https://partners.shopify.com) |
| Development store | -- | Create one from the Partner dashboard |

## Quick start

```bash
git clone https://github.com/jonathanmoore/kona-theme.git
cd kona-theme
pnpm install
pnpm dev -- --store my-store.myshopify.com
```

This starts two servers concurrently: the Shopify CLI dev server (which proxies your store) and the Vite dev server (which serves frontend assets with HMR at `localhost:5173`). Open the URL printed by the Shopify CLI to see the theme.

::: tip
The first time you run `shopify theme dev`, the CLI will ask you to authenticate with your Shopify Partner account. Follow the prompts in the terminal.
:::

## Demo store

See Kona running live at [kona-theme.myshopify.com](https://kona-theme.myshopify.com/).

## What's next

- [Installation](./installation) -- Detailed setup including environment variables and CI/CD secrets
- [Development](./development) -- How the dual-server dev workflow works
- [Deployment](./deployment) -- Building, deploying, and packaging the theme
- [Architecture Overview](/architecture/) -- How islands, Vite, and Shopify fit together
- [Claude Code Skills](/claude-code/) -- Five built-in skills for Liquid reference, accessibility, standards, component creation, and translations
