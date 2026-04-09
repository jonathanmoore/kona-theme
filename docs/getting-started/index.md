---
title: Introduction
---

# Introduction

Get your dev environment running and start building with islands, [Vite](https://vitejs.dev/), and [Tailwind](https://tailwindcss.com/). Kona is a Shopify theme where Liquid renders HTML server-side and interactive components hydrate client-side as vanilla Web Components — no framework runtime ships to the browser.

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

## Acknowledgments

Kona builds on the shoulders of excellent open-source work:

- **[hydrogen-theme](https://github.com/montalvomiguelo/hydrogen-theme)** by Miguel Montalvo — A port of Hydrogen's default template to Shopify OS 2.0. Kona's design language and Liquid architecture draw heavily from this project. Thank you, Miguel.
- **[vite-plugin-shopify](https://github.com/barrel/shopify-vite)** by Barrel — Core Vite/Shopify integration that generates `vite-tag.liquid` and wires up entry points, HMR, and CDN asset URLs.
- **[vite-plugin-shopify-theme-islands](https://github.com/Rees1993/vite-plugin-shopify-theme-islands)** by Alex Rees — The island hydration runtime and `client:*` directive system that powers Kona's partial hydration architecture.
- **[vite-plugin-shopify-import-maps](https://github.com/slavamak/vite-plugin-shopify-import-maps)** by slavamak — ES module import map generation for bare module imports in islands.
- **[@driver-digital/vite-plugin-shopify-clean](https://www.npmjs.com/package/@driver-digital/vite-plugin-shopify-clean)** by Driver Digital — Stale build artifact cleanup for the `theme/assets/` directory.
- **[Tailwind CSS](https://tailwindcss.com/)** and **[@tailwindcss/vite](https://github.com/tailwindlabs/tailwindcss)** by Tailwind Labs — CSS-first utility framework powering the entire design system.
- **[Vite](https://vitejs.dev/)** — The build tool that makes all of this fast.
