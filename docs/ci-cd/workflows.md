# Workflows

All five GitHub Actions workflows, with setup instructions and gotchas.

## CI (`ci.yml`)

Runs on every push to `main` and every PR. Two parallel jobs:

**Lint** — `pnpm install` then `pnpm lint` (ESLint).

**Theme Check** — Builds first (so compiled assets and auto-generated snippets exist), then runs `shopify/theme-check-action@v2` against `theme/` to catch Liquid errors, missing translations, and deprecated APIs.

## Deploy (`deploy.yml`)

Runs on push to `main` and manual dispatch (`workflow_dispatch`).

### Steps

1. Checkout, install pnpm/Node/dependencies, install Shopify CLI globally
2. `pnpm run build`
3. Remove `theme/assets/.vite` (build artifact not needed in the theme)
4. Pull customizations from the published theme (push events only):

```yaml
shopify theme pull
  --theme ${{ vars.LIVE_THEME_ID }}
  --store ${{ vars.STORE }}
  --path theme
  --only templates/*.json
  --only sections/*.json
  --only config/settings_data.json
```

5. Push `theme/` to the `live/<store>` branch as a single squashed commit via `JamesIves/github-pages-deploy-action@v4`

### Connect the live branch to Shopify

After the deploy runs at least once (creating the `live/` branch):

1. Install the [Shopify GitHub app](https://github.com/apps/shopify-online-store)
2. In Shopify admin: **Online Store > Themes > Add theme > Connect from GitHub**
3. Select your repo and the `live/<store>` branch
4. Publish the connected theme

The sync is bidirectional: deploys update the theme, merchant edits commit back to the branch. The deploy workflow preserves merchant changes by pulling customizations before pushing.

### Manual dispatch

Trigger without a commit via **Actions > Deploy > Run workflow** or:

```bash
gh workflow run deploy.yml
```

Manual dispatches skip "Pull customizations" — the branch is overwritten with the current build.

## PR Preview (`pr-preview.yml`)

Runs when a PR is opened, updated, or reopened. See [PR Previews](./pr-previews) for the full lifecycle.

1. Same build as deploy
2. Search for theme named `PR #<number> ...` — update it or create a new unpublished one
3. Post/update a PR comment with preview and editor links

Concurrent runs for the same PR cancel the previous one:

```yaml
concurrency:
  group: pr-preview-${{ github.event.pull_request.number }}
  cancel-in-progress: true
```

## Translation Check (`i18n-check.yml`)

Runs on every PR. No API key, no build, no Node — just Python:

```yaml
steps:
  - uses: actions/checkout@v5
  - run: python3 scripts/translate-locales.py check
```

Reports missing, obsolete, and stale translations. When it fails, run sync locally:

```bash
set -a && source .env && set +a && python3 scripts/translate-locales.py sync
```

## PR Preview Cleanup (`pr-preview-cleanup.yml`)

Runs when a PR is closed. Searches for a theme named `PR #<number> ...` and deletes it. No checkout or build needed.

## Setup

CI and translation check work with no configuration. Deploy and preview need three things:

### 1. Create a Shopify theme access token

Install the [Theme Access](https://apps.shopify.com/theme-access) app in Shopify admin. Create a password — the recipient gets a one-time link (expires after 7 days or one view).

### 2. Find the live theme ID

```bash
shopify theme list --store my-store.myshopify.com
```

Find the one marked `[live]`.

### 3. Add secrets and variables to GitHub

```bash
gh secret set SHOPIFY_CLI_THEME_TOKEN --body "shptka_your_token_here"
gh variable set STORE --body "my-store.myshopify.com"
gh variable set LIVE_THEME_ID --body "123456789"
```

Or via the GitHub web UI: **Settings > Secrets and variables > Actions**.

**Optional** — for auto-translation in CI:

```bash
gh secret set ANTHROPIC_API_KEY --body "sk-ant-api03-your-key-here"
```

## Gotchas

**Theme Access tokens are view-once.** If lost, delete and recreate in the Theme Access app.

**The `live/` branch has commits from Shopify.** Merchant editor changes commit to the branch. These are overwritten on deploy (`single-commit: true`), but merchant changes survive because the workflow pulls them first.

**The branch must exist before connecting.** Run the deploy workflow at least once.

**50 MB branch limit.** Shopify can't connect branches over 50 MB.

**No merge conflict resolution.** If deploy and a Shopify editor commit race, deploy wins. Merchant changes are safe as long as "Pull customizations" ran before push.

## Next steps

- [PR Previews](./pr-previews) — Deep dive into preview theme lifecycle
- [GitHub Pages](./github-pages) — Docs site deployment
- [Installation](/getting-started/installation) — Setting up secrets
