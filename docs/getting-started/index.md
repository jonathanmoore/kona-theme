---
title: Introduction
---

# Introduction

Get your dev environment running and start building with islands, Vite, and Tailwind. Kona is a Shopify theme where Liquid renders HTML server-side and interactive components hydrate client-side as vanilla Web Components — no framework runtime ships to the browser.

## Requirements

- **Node.js 20+**
- **pnpm 10+** — activate with `corepack enable`
- **Shopify CLI** — `npm install -g @shopify/cli`
- A [Shopify Partner account](https://partners.shopify.com) with a development store

## Quick start

```bash
git clone https://github.com/jonathanmoore/kona-theme.git
cd kona-theme
pnpm install
pnpm dev -- --store my-store.myshopify.com
```

This starts two servers concurrently: Shopify CLI (proxies your store) and Vite (serves JS/CSS with HMR at `localhost:5173`). Open the URL printed by Shopify CLI to see the theme.

## Demo store

See Kona running live at [kona-theme.myshopify.com](https://kona-theme.myshopify.com/).

## Next steps

- [Installation](./installation) — Environment setup, tokens, and CI/CD secrets
- [Development](./development) — The dual-server dev workflow
- [Deployment](./deployment) — Build, deploy, and package the theme
- [Architecture](/architecture/) — How islands, Vite, and Shopify fit together
