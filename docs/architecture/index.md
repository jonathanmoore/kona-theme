# Architecture Overview

Kona has three layers: Liquid renders the page, Vite builds the assets, and islands hydrate the interactive parts. Everything else is static HTML — no framework owns the page.

## The three layers

**Server rendering (Liquid)** — Shopify renders every page to complete HTML before any JavaScript executes. Pages are fast and functional with JS disabled.

**Build pipeline ([Vite](https://vitejs.dev/))** — Vite compiles frontend source (`theme/frontend/`) into production assets (`theme/assets/`). In development, Vite serves assets with HMR. In production, built files ship from the Shopify CDN. Five plugins coordinate the integration — see [Build Pipeline](./build-pipeline) for credits and details.

**Client hydration (Islands)** — Interactive components are Web Components that hydrate on the client. The revive runtime from [`vite-plugin-shopify-theme-islands`](https://github.com/Rees1993/vite-plugin-shopify-theme-islands) scans the DOM for custom elements, matches them to island files, and loads them based on [hydration directives](./hydration-directives) that control _when_ each component's JavaScript loads.

## How the pieces connect

The layout file `theme/layout/theme.liquid` loads two entry points via auto-generated snippets:

- **`theme.css`** — Tailwind CSS v4 with the full design system
- **`theme.js`** — Imports the revive runtime and accessibility utilities

Sections and snippets render custom elements with hydration directives:

```liquid
<header-drawer client:media="(max-width: 1023px)">
  <details>
    <!-- Full HTML markup, functional without JS -->
  </details>
</header-drawer>
```

The revive runtime sees `<header-drawer>`, finds `theme/frontend/islands/header-drawer.js`, checks the `client:media` directive, and dynamically imports the island when the media query matches.

All npm packages are devDependencies. No third-party JavaScript ships to the browser — every interactive component is a vanilla Web Component using platform APIs.

## Deep dives

| Page | What it covers |
|------|---------------|
| [Islands Architecture](./islands) | Partial hydration, the revive runtime, progressive enhancement, nested islands |
| [Hydration Directives](./hydration-directives) | The 5 directives that control when islands load |
| [Build Pipeline](./build-pipeline) | Vite config, the 5 plugins, dev vs. production modes |
| [Project Layout](./project-layout) | Directory structure and file organization |
