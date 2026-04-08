# Workflows

All five GitHub Actions workflows that power the Kona Theme CI/CD pipeline, with detailed explanations, setup instructions, and gotchas.

## CI (`ci.yml`)

Runs on every push to `main` and every PR targeting `main`. Two independent jobs run in parallel:

**Lint** -- Installs dependencies, runs `pnpm lint` (ESLint):

```yaml
lint:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v5
    - uses: pnpm/action-setup@v4
    - uses: actions/setup-node@v5
      with:
        node-version: 22.x
        cache: pnpm
    - run: pnpm install
    - run: pnpm lint
```

**Theme Check** -- Builds the theme first (so compiled JS/CSS and auto-generated snippets are present), then runs Shopify's `theme-check-action` against `theme/` to catch Liquid errors, missing translations, and deprecated APIs:

```yaml
theme-check:
  name: Theme Check
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v5
    - uses: pnpm/action-setup@v4
    - uses: actions/setup-node@v5
      with:
        node-version: 22.x
        cache: pnpm
    - run: pnpm install
    - run: pnpm run build
    - uses: shopify/theme-check-action@v2
      with:
        token: ${{ github.token }}
        path: theme/
```

The build step is required because Theme Check validates the full theme directory including built assets. Without it, auto-generated files like `vite-tag.liquid` and compiled entry points would be missing.

::: info Lighthouse CI
The workflow also contains a commented-out Lighthouse CI job (`shopify/lighthouse-ci-action@v1`). This can be enabled once the required secrets (`SHOP_ACCESS_TOKEN`, `SHOP_STORE`, `SHOP_PASSWORD`, `LHCI_GITHUB_APP_TOKEN`) are configured.
:::

## Deploy (`deploy.yml`)

Runs when commits land on `main` (after merge) and on manual dispatch via `workflow_dispatch`.

### Steps

1. **Checkout, install pnpm/Node/dependencies, install Shopify CLI globally**
2. **`pnpm run build`** -- Vite compiles JS/CSS into `theme/assets/`
3. **Remove `theme/assets/.vite`** -- The manifest directory is a Vite build artifact not needed in the deployed theme
4. **Pull customizations from the published theme** (push events only) -- `shopify theme pull` fetches merchant-edited JSON files so they are included in the deploy:

```yaml
- name: Pull customizations
  if: github.event_name == 'push'
  env:
    SHOPIFY_CLI_THEME_TOKEN: ${{ secrets.SHOPIFY_CLI_THEME_TOKEN }}
  run: >
    shopify theme pull
    --theme ${{ vars.LIVE_THEME_ID }}
    --store ${{ vars.STORE }}
    --path theme
    --only templates/*.json
    --only sections/*.json
    --only config/settings_data.json
```

5. **Extract the commit subject** for the deploy commit message
6. **Push `theme/` to the `live/<store>` branch** using `JamesIves/github-pages-deploy-action` -- this replaces the entire branch content with a single squashed commit:

```yaml
- name: Deploy to live branch
  uses: JamesIves/github-pages-deploy-action@v4
  with:
    folder: theme
    branch: live/${{ vars.STORE }}
    clean: true
    commit-message: ${{ steps.commit-msg.outputs.subject || 'Manual deploy' }}
    single-commit: true
```

### Connecting the live branch to Shopify

After the deploy workflow runs for the first time, it creates a `live/<store>` branch (e.g., `live/my-store.myshopify.com`) containing the built theme files at root. Connect this branch to the store's published theme so Shopify keeps it in sync.

**Prerequisites:**
- The deploy workflow must have run at least once (the branch must exist)
- The [Shopify Online Store GitHub app](https://github.com/apps/shopify-online-store) must be installed on your GitHub account or organization
- You need write access to the repository

**Steps:**

1. In the Shopify admin, go to **Online Store > Themes**
2. In the theme library, click **Add theme**
3. Select **Connect from GitHub**
4. If prompted, log in to GitHub and authorize the Shopify Online Store app -- choose which repositories to grant access to
5. Select your **GitHub account or organization**
6. Select the **repository**
7. In the **Branch** dropdown, search for and select `live/my-store.myshopify.com` (the branch name contains a `/`, which is supported)
8. The theme appears in your library, connected to the branch

To make this the published theme, click **Publish** on the newly connected theme card.

### What the sync does

Once connected, the sync is bidirectional and always-on:

- **GitHub to Shopify** -- Every commit pushed to the `live/` branch (by the deploy workflow) automatically updates the theme in the Shopify admin.
- **Shopify to GitHub** -- Every change made via the Shopify theme editor or admin code editor is automatically committed back to the `live/` branch.

The deploy workflow accounts for this by pulling customizations (`templates/*.json`, `sections/*.json`, `config/settings_data.json`) from the live theme before pushing to the branch. This preserves any changes merchants made in the editor since the last deploy.

### Manual dispatch

If you need to deploy without pushing a commit (e.g., after updating the `LIVE_THEME_ID` variable), trigger the deploy workflow manually:

**Via the GitHub web UI:** Go to **Actions > Deploy > Run workflow**.

**Via the GitHub CLI:**

```bash
gh workflow run deploy.yml
```

Manual dispatches skip the "Pull customizations" step, since there is no new commit to merge with merchant changes. The branch is overwritten with the current build of `main`.

## PR Preview (`pr-preview.yml`)

Runs when a PR is opened, updated, or reopened against `main`. See [PR Previews](./pr-previews) for a deep dive into the preview theme lifecycle.

Concurrent runs for the same PR cancel the previous one:

```yaml
concurrency:
  group: pr-preview-${{ github.event.pull_request.number }}
  cancel-in-progress: true
```

### Steps

1. Full build (same as deploy: checkout, install, build, remove `.vite`)
2. Search existing store themes for one named `PR #<number> ...` -- if found, push to it; if not, create a new unpublished theme
3. Post a comment on the PR with links to the store preview and theme editor -- uses an HTML marker (`<!-- shopify-preview-comment -->`) to update the same comment on subsequent pushes

## Translation Check (`i18n-check.yml`)

Runs on every PR targeting `main`. No API key, no build, no Node -- just Python (pre-installed on Ubuntu runners):

```yaml
name: Translation Check
on:
  pull_request:
    branches:
      - main

jobs:
  i18n:
    name: Check Translations
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - name: Check translations
        run: python3 scripts/translate-locales.py check
```

The `check` command:

1. Compares every locale file against the English source to find missing or obsolete keys
2. Compares English value hashes against the translation cache (`.translation-cache.json`) to find stale translations where the English text changed but the locale was not re-synced
3. Exits 0 if everything is current, exits 1 with a summary of issues

When the check fails, the fix is to run the translation sync locally:

```bash
set -a && source .env && set +a && python3 scripts/translate-locales.py sync
```

See the [Translation Pipeline](/i18n/translation-pipeline) docs for full details on how the translation system works.

## PR Preview Cleanup (`pr-preview-cleanup.yml`)

Runs when a PR targeting `main` is closed (merged or discarded). No checkout or build needed:

1. Install Node and Shopify CLI
2. Search for a theme named `PR #<number> ...` and delete it with `--force`
3. If no matching theme exists (e.g., already deleted manually), skip silently

```yaml
- name: Delete preview theme
  run: |
    EXISTING=$(shopify theme list --json \
      | jq -r --arg pr "PR #${PR_NUMBER} " \
        '.[] | select(.name | startswith($pr)) | .id' \
      | head -1)

    if [ -n "$EXISTING" ]; then
      echo "Deleting theme $EXISTING..."
      shopify theme delete --theme "$EXISTING" --force
    else
      echo "No preview theme found for PR #${PR_NUMBER}, skipping."
    fi
```

## Setup

Three pieces of configuration must be added to the GitHub repository before the deploy and preview workflows run. The CI workflow (`ci.yml`) and translation check (`i18n-check.yml`) work with no configuration.

### 1. Create a Shopify theme access token

The workflows authenticate to Shopify using a token from the **Theme Access** app. This grants `write_themes` scope only -- no access to orders, customers, or other store data.

1. In the Shopify admin, go to **Apps** and install the [Theme Access](https://apps.shopify.com/theme-access) app
2. Open the app and click **Create theme password**
3. Enter a name and email (e.g., "GitHub Actions", your email)
4. Click **Create password** -- the recipient gets a one-time link to view the token
5. Copy the token (format: `shptka_...`) -- the link expires after 7 days or one view

### 2. Find the live theme ID

The deploy workflow pulls merchant customizations (template/section/config JSON) from the published theme before deploying, so edits made in the theme editor are preserved.

Via Shopify CLI:

```bash
shopify theme list --store my-store.myshopify.com
```

The output shows each theme's numeric ID. Find the one marked `[live]`.

Via the Shopify admin: go to **Online Store > Themes**, click the `...` menu on the published theme, and look at the URL -- the theme ID is the number in the path.

### 3. Add secrets and variables to GitHub

**Via the GitHub web UI:**

1. Go to **Settings > Secrets and variables > Actions**
2. Under **Secrets**, click **New repository secret**:
   - Name: `SHOPIFY_CLI_THEME_TOKEN`, Value: the `shptka_...` token from step 1
3. Switch to the **Variables** tab and click **New repository variable** twice:
   - Name: `STORE`, Value: your myshopify.com domain (e.g., `my-store.myshopify.com`)
   - Name: `LIVE_THEME_ID`, Value: the numeric theme ID from step 2

**Via the GitHub CLI:**

```bash
# Secret (encrypted, not visible after creation)
gh secret set SHOPIFY_CLI_THEME_TOKEN --body "shptka_your_token_here"

# Variables (plaintext, visible in the UI)
gh variable set STORE --body "my-store.myshopify.com"
gh variable set LIVE_THEME_ID --body "123456789"
```

### 4. (Optional) Add an Anthropic API key for auto-translation

The translation check workflow only detects out-of-date translations -- it does not fix them. If you want a CI workflow that automatically runs `sync` to translate changed strings, you need an `ANTHROPIC_API_KEY` secret.

1. Get an API key from [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Add it as a repository secret:

**Via the GitHub web UI:** Go to **Settings > Secrets and variables > Actions > New repository secret**, name it `ANTHROPIC_API_KEY`.

**Via the GitHub CLI:**

```bash
gh secret set ANTHROPIC_API_KEY --body "sk-ant-api03-your-key-here"
```

## Gotchas

**Theme Access tokens are view-once.** The link emailed after creating a token expires after 7 days or one view. If lost, delete the password in the Theme Access app and create a new one.

**The `live/` branch will have commits from Shopify.** When merchants edit in the theme editor, Shopify commits to the branch. These are overwritten on the next deploy (`single-commit: true` replaces the branch). Merchant changes survive because the deploy workflow pulls them first.

**Disconnecting a theme from GitHub is irreversible for that theme instance.** If you disconnect the `live/` branch from a theme and reconnect, Shopify creates a new theme -- it does not reattach to the old one. Avoid disconnecting unless you intend to start fresh.

**The branch must exist before connecting.** The Shopify admin shows a dropdown of existing branches. Run the deploy workflow at least once before attempting to connect.

**50 MB branch limit.** Shopify cannot connect branches exceeding 50 MB. Built theme assets should be well under this.

**No merge conflict resolution.** If the deploy workflow and a Shopify editor commit race, the deploy wins -- `single-commit: true` replaces the branch entirely. Merchant changes are safe as long as the "Pull customizations" step ran before the push.
