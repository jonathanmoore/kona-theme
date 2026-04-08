# CI/CD

Five GitHub Actions workflows that lint, build, deploy to production, create PR preview themes, check translations, and clean up after merge.

## Why

The theme source lives in `theme/` — a subdirectory, not the repo root. Shopify's native GitHub integration requires theme files at root, so it cannot connect directly to `main`. Instead, a CI pipeline builds the theme and pushes the `theme/` contents to a dedicated `live/` branch where files sit at root. That branch is then connected to the store's published theme via Shopify's GitHub integration, giving you two-way sync: code pushes update the theme, and merchant edits in the theme editor commit back to the branch.

PR previews use a different mechanism — `shopify theme push` via the CLI — to create unpublished preview themes directly, without branch sync.

## Workflows

| File | Trigger | What it does |
|------|---------|--------------|
| `ci.yml` | Push to `main`, PRs to `main` | Lint (ESLint) + Theme Check (Shopify linter) |
| `deploy.yml` | Push to `main`, manual dispatch | Build, pull merchant customizations, deploy to `live/` branch |
| `pr-preview.yml` | PR opened/updated to `main` | Build, push to unpublished preview theme, comment on PR |
| `i18n-check.yml` | PRs to `main` | Verify all locale translations are current |
| `pr-preview-cleanup.yml` | PR closed | Delete the preview theme from the store |

## Setup

Three pieces of configuration must be added to the GitHub repository before the deploy and preview workflows run. The translation check workflow (`i18n-check.yml`) works with no configuration — it only reads files already in the repo.

### 1. Create a Shopify theme access token

The workflows authenticate to Shopify using a token from the **Theme Access** app. This grants `write_themes` scope only — no access to orders, customers, or other store data.

1. In the Shopify admin, go to **Apps** and install the [Theme Access](https://apps.shopify.com/theme-access) app
2. Open the app and click **Create theme password**
3. Enter a name and email (e.g., "GitHub Actions", your email)
4. Click **Create password** — the recipient gets a one-time link to view the token
5. Copy the token (format: `shptka_...`) — the link expires after 7 days or one view

### 2. Find the live theme ID

The deploy workflow pulls merchant customizations (template/section/config JSON) from the published theme before deploying, so edits made in the theme editor are preserved.

Via Shopify CLI:

```bash
shopify theme list --store my-store.myshopify.com
```

The output shows each theme's numeric ID. Find the one marked `[live]`.

Via the Shopify admin: go to **Online Store > Themes**, click the `...` menu on the published theme, and look at the URL — the theme ID is the number in the path.

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

### 4. (Optional) Add an Anthropic API key for CI auto-translation

The translation check workflow only detects out-of-date translations — it does not fix them. If you want a CI workflow that automatically runs `sync` to translate changed strings (see `docs/theme-translation.md` for the existing example workflow), you need an `ANTHROPIC_API_KEY` secret.

1. Get an API key from [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Add it as a repository secret:

**Via the GitHub web UI:** Go to **Settings > Secrets and variables > Actions > New repository secret**, name it `ANTHROPIC_API_KEY`.

**Via the GitHub CLI:**

```bash
gh secret set ANTHROPIC_API_KEY --body "sk-ant-api03-your-key-here"
```

## Connecting the Live Branch to Shopify

After the deploy workflow runs for the first time, it creates a `live/<store>` branch (e.g., `live/my-store.myshopify.com`) containing the built theme files at root. Connect this branch to the store's published theme so Shopify keeps it in sync.

### Prerequisites

- The deploy workflow must have run at least once (the branch must exist)
- The [Shopify Online Store GitHub app](https://github.com/apps/shopify-online-store) must be installed on your GitHub account or organization
- You need write access to the repository

### Steps

1. In the Shopify admin, go to **Online Store > Themes**
2. In the theme library, click **Add theme**
3. Select **Connect from GitHub**
4. If prompted, log in to GitHub and authorize the Shopify Online Store app — choose which repositories to grant access to
5. Select your **GitHub account or organization**
6. Select the **repository**
7. In the **Branch** dropdown, search for and select `live/my-store.myshopify.com` (the branch name contains a `/`, which is supported)
8. The theme appears in your library, connected to the branch

To make this the published theme, click **Publish** on the newly connected theme card.

### What the sync does

Once connected, the sync is bidirectional and always-on:

- **GitHub to Shopify** — Every commit pushed to the `live/` branch (by the deploy workflow) automatically updates the theme in the Shopify admin.
- **Shopify to GitHub** — Every change made via the Shopify theme editor or admin code editor is automatically committed back to the `live/` branch.

The deploy workflow accounts for this by pulling customizations (`templates/*.json`, `sections/*.json`, `config/settings_data.json`) from the live theme before pushing to the branch. This preserves any changes merchants made in the editor since the last deploy.

### Manual dispatch

If you need to deploy without pushing a commit (e.g., after updating the `LIVE_THEME_ID` variable), trigger the deploy workflow manually:

**Via the GitHub web UI:** Go to **Actions > Deploy > Run workflow**.

**Via the GitHub CLI:**

```bash
gh workflow run deploy.yml
```

Manual dispatches skip the "Pull customizations" step, since there is no new commit to merge with merchant changes. The branch is overwritten with the current build of `main`.

## How Each Workflow Works

### CI (`ci.yml`)

Runs on every push to `main` and every PR targeting `main`. Two independent jobs:

- **lint** — Installs dependencies, runs `pnpm lint` (ESLint)
- **theme-check** — Builds the theme first (so built JS/CSS and auto-generated snippets are present), then runs Shopify's `theme-check-action` against `theme/` to catch Liquid errors, missing translations, and deprecated APIs

### Deploy (`deploy.yml`)

Runs when commits land on `main` (after merge) and on manual dispatch.

1. Checkout, install pnpm/Node/dependencies, install Shopify CLI globally
2. `pnpm run build` — Vite compiles JS/CSS into `theme/assets/`
3. Remove `theme/assets/.vite` — the manifest directory is a build artifact not needed in the theme
4. Pull customizations from the published theme (push events only) — `shopify theme pull` fetches merchant-edited JSON files so they are included in the deploy
5. Extract the commit subject for the deploy commit message
6. Push the `theme/` directory to the `live/<store>` branch using `JamesIves/github-pages-deploy-action` — this replaces the entire branch content with a single squashed commit

### PR Preview (`pr-preview.yml`)

Runs when a PR is opened, updated, or reopened against `main`. Concurrent runs for the same PR cancel the previous one.

1. Full build (same as deploy)
2. Search existing store themes for one named `PR #<number> ...` — if found, push to it; if not, create a new unpublished theme
3. Post a comment on the PR with links to the store preview and theme editor — uses an HTML marker (`<!-- shopify-preview-comment -->`) to update the same comment on subsequent pushes

### Translation Check (`i18n-check.yml`)

Runs on every PR targeting `main`. No API key, no build, no Node — just Python (pre-installed on Ubuntu runners).

Runs `python3 scripts/translate-locales.py check`, which:

1. Compares every locale file against the English source to find missing or obsolete keys
2. Compares English value hashes against the translation cache (`.translation-cache.json`) to find stale translations where the English text changed but the locale was not re-synced
3. Exits 0 if everything is current, exits 1 with a summary of issues if not

When the check fails, the fix is to run the translation sync locally:

```bash
set -a && source .env && set +a && python3 scripts/translate-locales.py sync
```

Or via the Claude Code skill: `/theme-translator sync`

See [theme-translation.md](theme-translation.md) for full details on the translation system.

### PR Preview Cleanup (`pr-preview-cleanup.yml`)

Runs when a PR targeting `main` is closed (merged or discarded). No checkout or build needed.

1. Install Node and Shopify CLI
2. Search for a theme named `PR #<number> ...` and delete it with `--force`
3. If no matching theme exists (e.g., already deleted manually), skip silently

## Gotchas

**Theme Access tokens are view-once.** The link emailed after creating a token expires after 7 days or one view. If lost, delete the password in the Theme Access app and create a new one.

**The `live/` branch will have commits from Shopify.** When merchants edit in the theme editor, Shopify commits to the branch. These are overwritten on the next deploy (`single-commit: true` replaces the branch). Merchant changes survive because the deploy workflow pulls them first.

**Disconnecting a theme from GitHub is irreversible for that theme instance.** If you disconnect the `live/` branch from a theme and reconnect, Shopify creates a new theme — it does not reattach to the old one. Avoid disconnecting unless you intend to start fresh.

**The branch must exist before connecting.** The Shopify admin shows a dropdown of existing branches. Run the deploy workflow at least once before attempting to connect.

**50 MB branch limit.** Shopify cannot connect branches exceeding 50 MB. Built theme assets should be well under this.

**No merge conflict resolution.** If the deploy workflow and a Shopify editor commit race, the deploy wins — `single-commit: true` replaces the branch entirely. Merchant changes are safe as long as the "Pull customizations" step ran before the push.
