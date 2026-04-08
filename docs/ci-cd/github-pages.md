# GitHub Pages

The documentation site is built with [VitePress](https://vitepress.dev) and deployed to GitHub Pages whenever docs change on `main`.

## How it works

The `docs.yml` workflow triggers on pushes to `main` that modify files under `docs/`:

```yaml
on:
  push:
    branches: [main]
    paths: ['docs/**']
```

It installs dependencies, runs `pnpm docs:build`, uploads the output as a GitHub Pages artifact, and deploys it.

### GitHub Pages configuration

For the workflow to deploy, configure GitHub Pages to use GitHub Actions as the source:

1. Go to **Settings > Pages** in the repository
2. Under **Build and deployment > Source**, select **GitHub Actions**

The VitePress config sets `base: '/kona-theme/'` to match the repo name for the GitHub Pages project site URL.

## Test locally

```bash
pnpm docs:dev       # Dev server with HMR (localhost:5173)
pnpm docs:build     # Production build (docs/.vitepress/dist)
pnpm docs:preview   # Serve the production build locally
```

## Update the docs

1. Edit markdown files under `docs/`
2. Push to `main` (or merge a PR)
3. The workflow triggers automatically — site is live in a few minutes

::: tip
When adding new pages, update the sidebar in `docs/.vitepress/config.js`. VitePress doesn't auto-discover pages.
:::

## Site configuration

Key settings in `docs/.vitepress/config.js`:

| Setting | Value | Purpose |
|---------|-------|---------|
| `base` | `'/kona-theme/'` | URL base for GitHub Pages |
| `lastUpdated` | `true` | Shows last git commit date per page |
| `outline.level` | `[2, 3]` | TOC includes h2 and h3 |
| `search.provider` | `'local'` | Built-in full-text search |

## Next steps

- [Workflows](./workflows) — All CI/CD workflows
- [CI/CD Overview](./) — Pipeline summary
