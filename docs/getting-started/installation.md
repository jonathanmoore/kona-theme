---
title: Installation
---

# Installation

## Clone and install

```bash
git clone https://github.com/jonathanmoore/kona-theme.git
cd kona-theme
```

Enable pnpm via Corepack (ships with Node.js 20+), then install dependencies:

```bash
corepack enable
pnpm install
```

::: info
The project pins `pnpm@10.33.0` via the `packageManager` field in `package.json`. Corepack will download this exact version automatically.
:::

## Project structure

After installation, the key directories are:

```
kona-theme/
  theme/              # Shopify theme source (Liquid, sections, blocks, snippets)
  theme/frontend/     # Frontend source (JS islands, CSS, entrypoints)
  scripts/            # Build and utility scripts
  docs/               # Documentation (this site)
  vite.config.js      # Vite configuration
  package.json        # Scripts and dependencies
```

Theme source files live in `theme/` to separate them from build tooling. Vite is configured with `themeRoot: './theme'` so it knows where to find and output theme assets.

## Environment setup

Create a `.env` file in the project root for local development convenience and CI/CD scripts:

```bash [.env]
SHOPIFY_CLI_THEME_TOKEN=shptka_your_token_here
STORE=my-store.myshopify.com
```

::: warning
The `.env` file contains secrets. It is gitignored and should never be committed.
:::

### Getting a theme access token

The `SHOPIFY_CLI_THEME_TOKEN` authenticates the Shopify CLI without interactive login. It comes from the **Theme Access** app, which grants `write_themes` scope only -- no access to orders, customers, or other store data.

1. In the Shopify admin, go to **Apps** and install the [Theme Access](https://apps.shopify.com/theme-access) app
2. Open the app and click **Create theme password**
3. Enter a name and email (e.g., "Local Dev", your email)
4. Click **Create password** -- the recipient gets a one-time link to view the token
5. Copy the token (format: `shptka_...`) and add it to your `.env` file

::: warning
The token link expires after 7 days or one view. If lost, delete the password in the Theme Access app and create a new one.
:::

### Finding your store domain

The `STORE` value is your myshopify.com domain. You can find it in the Shopify admin under **Settings > Domains**, or in the URL bar when logged into the admin (e.g., `admin.shopify.com/store/my-store` means the domain is `my-store.myshopify.com`).

## GitHub secrets for CI/CD

The CI/CD pipeline requires credentials stored as GitHub repository secrets and variables. The translation check workflow (`i18n-check.yml`) and lint workflow (`ci.yml`) work without any configuration -- only the deploy and PR preview workflows need secrets.

### Required

| Type | Name | Value |
|---|---|---|
| Secret | `SHOPIFY_CLI_THEME_TOKEN` | The `shptka_...` token from Theme Access |
| Variable | `STORE` | Your myshopify.com domain (e.g., `my-store.myshopify.com`) |
| Variable | `LIVE_THEME_ID` | Numeric ID of the published theme |

### Optional

| Type | Name | Value |
|---|---|---|
| Secret | `ANTHROPIC_API_KEY` | Claude API key for automated translation sync in CI |

### Adding via GitHub CLI

```bash
# Secret (encrypted, not visible after creation)
gh secret set SHOPIFY_CLI_THEME_TOKEN --body "shptka_your_token_here"

# Variables (plaintext, visible in the Settings UI)
gh variable set STORE --body "my-store.myshopify.com"
gh variable set LIVE_THEME_ID --body "123456789"

# Optional: for automated translations
gh secret set ANTHROPIC_API_KEY --body "sk-ant-api03-your-key-here"
```

### Adding via GitHub web UI

1. Go to **Settings > Secrets and variables > Actions**
2. Under **Secrets**, click **New repository secret** to add `SHOPIFY_CLI_THEME_TOKEN`
3. Switch to the **Variables** tab and add `STORE` and `LIVE_THEME_ID`

### Finding the live theme ID

The deploy workflow pulls merchant customizations from the published theme before deploying, so edits made in the Shopify theme editor are preserved. You need the numeric theme ID.

Via the Shopify CLI:

```bash
shopify theme list --store my-store.myshopify.com
```

The output shows each theme's numeric ID. Find the one marked `[live]`.

Via the Shopify admin: go to **Online Store > Themes**, click the `...` menu on the published theme, and look at the URL -- the theme ID is the number in the path.

## Verify the setup

Run the dev servers to confirm everything works:

```bash
pnpm dev -- --store my-store.myshopify.com
```

You should see output from both `shopify theme dev` and `vite` running concurrently. Open the URL printed by the Shopify CLI to view the theme.

## What's next

- [Development](./development) -- How the dual-server workflow operates
- [Deployment](./deployment) -- Building and deploying to production
- [CI/CD Overview](/ci-cd/) -- Full details on all five GitHub Actions workflows
