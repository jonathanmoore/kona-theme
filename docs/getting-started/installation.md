---
title: Installation
---

# Installation

Set up your local environment, get a Shopify theme token, and configure CI/CD secrets.

## 1. Clone and install

```bash
git clone https://github.com/jonathanmoore/kona-theme.git
cd kona-theme
corepack enable
pnpm install
```

Corepack ships with Node.js 20+ and pins the exact pnpm version from `package.json`.

## 2. Project structure

```
kona-theme/
  theme/              # Shopify theme source (Liquid, sections, blocks, snippets)
  theme/frontend/     # Frontend source (JS islands, CSS, entrypoints)
  scripts/            # Build and utility scripts
  docs/               # This documentation site
  vite.config.js      # Vite configuration (themeRoot: './theme')
```

## 3. Create a `.env` file

```bash [.env]
SHOPIFY_CLI_THEME_TOKEN=shptka_your_token_here
STORE=my-store.myshopify.com
```

::: warning
The `.env` file contains secrets and is gitignored. Never commit it.
:::

### Get a theme access token

The `SHOPIFY_CLI_THEME_TOKEN` authenticates Shopify CLI without interactive login. It comes from the **Theme Access** app (`write_themes` scope only).

1. In the Shopify admin, go to **Apps** and install [Theme Access](https://apps.shopify.com/theme-access)
2. Open the app and click **Create theme password**
3. Enter a name and email, then click **Create password**
4. Copy the token (`shptka_...`) from the one-time link and add it to `.env`

### Find your store domain

Your `STORE` value is the `*.myshopify.com` domain. Find it under **Settings > Domains** in the Shopify admin, or from the admin URL (`admin.shopify.com/store/my-store` → `my-store.myshopify.com`).

## 4. Set up GitHub secrets for CI/CD

Lint and i18n check workflows work without configuration. Deploy and PR preview workflows need these:

**Required:**

| Type | Name | Value |
|---|---|---|
| Secret | `SHOPIFY_CLI_THEME_TOKEN` | The `shptka_...` token from Theme Access |
| Variable | `STORE` | Your `*.myshopify.com` domain |
| Variable | `LIVE_THEME_ID` | Numeric ID of the published theme |

**Optional:**

| Type | Name | Value |
|---|---|---|
| Secret | `ANTHROPIC_API_KEY` | Claude API key for automated translation sync |

Add them via the GitHub CLI:

```bash
gh secret set SHOPIFY_CLI_THEME_TOKEN --body "shptka_your_token_here"
gh variable set STORE --body "my-store.myshopify.com"
gh variable set LIVE_THEME_ID --body "123456789"
```

Or add them in the GitHub web UI under **Settings > Secrets and variables > Actions**.

### Find the live theme ID

The deploy workflow pulls merchant customizations from the published theme before deploying, so theme editor changes are preserved. Find the numeric ID with:

```bash
shopify theme list --store my-store.myshopify.com
```

Look for the theme marked `[live]` in the output.

## 5. Verify

```bash
pnpm dev -- --store my-store.myshopify.com
```

You should see output from both `shopify theme dev` and `vite` running concurrently. Open the Shopify CLI URL to view the theme.

## Next steps

- [Development](./development) — The dual-server dev workflow
- [Deployment](./deployment) — Building and deploying to production
- [CI/CD Overview](/ci-cd/) — All five GitHub Actions workflows
