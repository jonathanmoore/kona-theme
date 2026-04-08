# Kona Theme

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/jonathanmoore/kona-theme/blob/main/LICENSE.md)

A Vite-powered Shopify OS 2.0 theme with an Astro-inspired islands architecture. Zero runtime JS dependencies — all interactivity is vanilla Web Components.

## 🔨 Requirements

- [Node.js (latest LTS version)](https://nodejs.org/en/)
- [pnpm](https://pnpm.io/)
- [Shopify CLI](https://shopify.dev/themes/tools/cli)

## 🚀 Project Structure

This theme leverages the [default Shopify theme folder structure](https://shopify.dev/themes/tools/github#repository-structure) and introduces the following directories, some of which have special behaviors.

```bash
└── kona-theme
    └── frontend
        ├── entrypoints
        ├── islands
        ├── lib
        └── styles
```

| Subdirectory  | Description                           |
| :------------ | :------------------------------------ |
| `entrypoints` | The entry points for your theme       |
| `islands`     | The interactive islands in your theme |
| `lib`         | Theme specific libraries              |
| `styles`      | The styles of your theme              |

## 🧞 Commands

| Command                             | Action                                                                  |
| :---------------------------------- | :---------------------------------------------------------------------- |
| `pnpm install`                      | Installs dependencies                                                   |
| `pnpm dev -- --store johns-apparel` | Launch the Shopify and Vite servers in parallel                         |
| `pnpm run deploy`                   | Bundle your theme's assets and upload your local theme files to Shopify |

## 🏝️ Hydration Directives

The following hydration strategies are available (borrowed from [Astro](https://docs.astro.build/en/concepts/islands/)).

| Directive        | Description                                                                                                                                       |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| `client:idle`    | Hydrate the component as soon as the main thread is [free](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)           |
| `client:visible` | Hydrates the component as soon as the element [enters the viewport](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)   |
| `client:media`   | Hydrates the component as soon as the browser [matches the given media query](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) |

Usage:

```html
<my-component client:visible>This is an island.</my-component>
```

## 🙇‍♂️ Thanks

Kona builds on the work of several excellent projects:

- [hydrogen-theme](https://github.com/montalvomiguelo/hydrogen-theme)
- [vite-plugin-shopify](https://github.com/barrel/shopify-vite)
- [hydrogen](https://github.com/Shopify/hydrogen)
- [dawn](https://github.com/Shopify/dawn)
- [astro](https://github.com/withastro/astro)
