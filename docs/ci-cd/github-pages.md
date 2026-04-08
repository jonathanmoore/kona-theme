# GitHub Pages

The Kona Theme documentation site is built with [VitePress](https://vitepress.dev) and deployed to GitHub Pages via a dedicated `docs.yml` workflow.

## How the docs deploy

A GitHub Actions workflow builds the VitePress site and publishes it to GitHub Pages whenever documentation changes are pushed to `main`.

### Trigger

The workflow runs on pushes to `main` when files under `docs/` change:

```yaml
name: Docs
on:
  push:
    branches:
      - main
    paths:
      - 'docs/**'
```

The `paths` filter ensures the workflow only runs when documentation files are modified -- code-only commits skip it entirely.

### Build and deploy steps

The workflow:

1. Checks out the repository
2. Installs pnpm and Node with caching
3. Installs dependencies (`pnpm install`)
4. Builds the VitePress site (`pnpm docs:build`)
5. Uploads the built output as a GitHub Pages artifact
6. Deploys to GitHub Pages

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v5
        with:
          node-version: 22.x
          cache: pnpm
      - run: pnpm install
      - run: pnpm docs:build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

The build produces static HTML in `docs/.vitepress/dist`, which is uploaded as an artifact and then deployed by the `actions/deploy-pages` action.

### GitHub Pages configuration

For the workflow to deploy, GitHub Pages must be configured to use GitHub Actions as the source:

1. Go to **Settings > Pages** in the repository
2. Under **Build and deployment > Source**, select **GitHub Actions**

The VitePress config sets `base: '/kona-theme/'` to match the repository name, since GitHub Pages serves project sites at `https://<user>.github.io/<repo>/`.

## Testing locally

Three npm scripts are available for working with the docs site locally:

### Development server

```bash
pnpm docs:dev
```

Starts a VitePress dev server with hot module replacement. Changes to markdown files are reflected instantly in the browser. The default URL is `http://localhost:5173`.

### Production build

```bash
pnpm docs:build
```

Generates static HTML output in `docs/.vitepress/dist`. This is the same command the CI workflow runs. Use it to verify the build succeeds before pushing.

### Preview the build

```bash
pnpm docs:preview
```

Serves the production build locally so you can verify the output looks correct. This is useful for catching issues that only appear in the built site (e.g., broken links, missing assets, base path problems).

## Updating documentation

The workflow is fully automated. To update the docs:

1. Edit markdown files under `docs/`
2. Commit and push to `main` (or merge a PR)
3. The `docs.yml` workflow triggers automatically
4. The site is live within a few minutes at the GitHub Pages URL

::: tip
If you add new pages, remember to update the sidebar configuration in `docs/.vitepress/config.js`. The sidebar is manually maintained -- VitePress does not auto-discover pages.
:::

## Site structure

The VitePress configuration in `docs/.vitepress/config.js` defines the navigation, sidebar, and site metadata. Key settings:

| Setting | Value | Purpose |
|---------|-------|---------|
| `base` | `'/kona-theme/'` | URL base path for GitHub Pages project site |
| `lastUpdated` | `true` | Shows last git commit date on each page |
| `outline.level` | `[2, 3]` | Table of contents includes `h2` and `h3` headings |
| `search.provider` | `'local'` | Built-in full-text search, no external service needed |

The sidebar groups pages into sections (Getting Started, Architecture, CSS, JavaScript, Shopify, Internationalization, CI/CD, Standards, Demo) with manually ordered links.
