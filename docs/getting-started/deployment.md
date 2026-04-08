---
title: Deployment
---

# Deployment

Kona provides three commands for producing and shipping production builds: `build` for compiling assets, `deploy` for pushing to Shopify, and `package` for creating a distributable archive.

## Building

```bash
pnpm build
```

This runs `vite build`, which:

1. Compiles JavaScript entry points and islands into optimized bundles
2. Processes Tailwind CSS v4 into a single stylesheet
3. Outputs all assets to `theme/assets/` with flat filenames (`[name].js`, `[name].[ext]` -- no content hashes)
4. Generates a Vite manifest that `vite-plugin-shopify` uses to update `vite-tag.liquid` with production CDN URLs
5. Regenerates `theme/snippets/vite-tag.liquid` and `theme/snippets/importmap.liquid` for production mode

The build uses `emptyOutDir: false` because `theme/assets/` contains other Shopify assets (images, fonts, static files) that must not be deleted.

::: tip
The build output is not minified by default (`minify: false` in `vite.config.js`). Shopify's CDN applies its own compression, so skipping minification keeps the source readable for debugging while the CDN handles optimization.
:::

## Deploying to Shopify

```bash
pnpm deploy
```

This runs `pnpm build` followed by `shopify theme push --path theme`, which uploads the entire `theme/` directory to your store. The CLI will prompt you to select which theme to push to unless you specify one with `--theme`.

### Automated deployment via CI

The recommended deployment path is through the GitHub Actions workflow. When you push to `main`, the deploy workflow (`deploy.yml`) runs automatically:

1. Installs dependencies and builds the theme
2. Removes the `.vite` manifest directory (build artifact not needed in the theme)
3. Pulls merchant customizations (`templates/*.json`, `sections/*.json`, `config/settings_data.json`) from the published theme so editor changes are preserved
4. Pushes the contents of `theme/` to the `live/<store>` branch as a single squashed commit

### Connecting the live branch to Shopify

The `live/<store>` branch (e.g., `live/my-store.myshopify.com`) contains built theme files at the repository root, which is what Shopify's GitHub integration expects. To connect it:

1. Install the [Shopify Online Store GitHub app](https://github.com/apps/shopify-online-store) on your GitHub account or organization
2. In the Shopify admin, go to **Online Store > Themes**
3. Click **Add theme** and select **Connect from GitHub**
4. Select your repository and choose the `live/<store>` branch
5. Publish the connected theme when ready

Once connected, the sync is bidirectional: commits to the `live/` branch update the theme, and merchant edits in the theme editor commit back to the branch. The deploy workflow accounts for this by pulling customizations before pushing.

::: warning
The deploy workflow must run at least once to create the `live/` branch before you can connect it in the Shopify admin.
:::

For full details on the CI/CD pipeline, including PR preview themes and manual dispatch, see the [CI/CD documentation](/ci-cd/).

## Packaging

```bash
pnpm package
```

This runs the build, then uses `shopify theme package --path theme` to create a `.zip` archive, and moves it to the `dist/` directory. The resulting file is a standard Shopify theme package that can be:

- Uploaded to a store via the Shopify admin (**Online Store > Themes > Add theme > Upload zip file**)
- Submitted to the Shopify Theme Store
- Distributed to clients or other developers

## Production considerations

**No runtime dependencies** -- All npm packages are devDependencies. The built theme ships zero third-party JavaScript to the browser. Every interactive component is a vanilla Web Component.

**Asset filenames** -- Build output uses flat filenames without content hashes (`theme.js`, `theme.css`). This is intentional: Shopify's CDN handles cache busting via its own URL versioning, and flat names keep the asset directory readable.

**Theme Check** -- The CI pipeline runs [Shopify Theme Check](https://shopify.dev/docs/themes/tools/theme-check) on every push and PR to catch Liquid errors, deprecated APIs, and missing translations before they reach production.

**PR previews** -- Every pull request gets an unpublished preview theme pushed to the store, with a link posted as a PR comment. Preview themes are automatically cleaned up when the PR is closed. See [CI/CD documentation](/ci-cd/) for details.

## What's next

- [CI/CD Overview](/ci-cd/) -- All five GitHub Actions workflows explained
- [Architecture Overview](/architecture/) -- How the build pipeline and islands system work together
- [Installation](./installation) -- Setting up GitHub secrets for automated deployment
