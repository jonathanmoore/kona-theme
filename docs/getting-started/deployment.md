---
title: Deployment
---

# Deployment

Build production assets, deploy to Shopify, or package the theme for distribution.

## Build

```bash
pnpm build
```

This runs `vite build`, which compiles JS islands into optimized bundles, processes Tailwind CSS into a single stylesheet, and outputs everything to `theme/assets/` with flat filenames (`theme.js`, `theme.css` — no content hashes). Shopify's CDN handles cache busting via its own URL versioning.

The build uses `emptyOutDir: false` because `theme/assets/` contains other Shopify assets (images, fonts) that must persist.

## Deploy to Shopify

```bash
pnpm deploy
```

Runs `pnpm build` then `shopify theme push --path theme`. The CLI prompts you to select a target theme unless you specify one with `--theme`.

### Automated deployment via CI

The recommended path is the GitHub Actions deploy workflow. When you push to `main`, `deploy.yml` automatically:

1. Builds the theme
2. Pulls merchant customizations from the published theme (preserving theme editor changes)
3. Pushes `theme/` contents to the `live/<store>` branch as a squashed commit

### Connect the live branch to Shopify

1. Install the [Shopify GitHub app](https://github.com/apps/shopify-online-store) on your account
2. In Shopify admin, go to **Online Store > Themes > Add theme > Connect from GitHub**
3. Select your repo and the `live/<store>` branch
4. Publish when ready

The sync is bidirectional: commits to `live/` update the theme, and merchant edits commit back to the branch. The deploy workflow accounts for this by pulling customizations before pushing.

Run the deploy workflow at least once to create the `live/` branch before connecting it in Shopify.

## Package

```bash
pnpm package
```

Builds the theme, creates a `.zip` via `shopify theme package`, and moves it to `dist/`. The archive can be uploaded to a store, submitted to the Theme Store, or shared with clients.

## Next steps

- [CI/CD Overview](/ci-cd/) — All five GitHub Actions workflows
- [Architecture](/architecture/) — How the build pipeline and islands system work
- [PR Previews](/ci-cd/pr-previews) — Automatic preview themes for pull requests
