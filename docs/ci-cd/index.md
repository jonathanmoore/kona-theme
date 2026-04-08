# CI/CD Overview

Five GitHub Actions workflows lint, build, deploy, create PR preview themes, and validate translations for the Kona Theme.

## Why CI/CD for Shopify themes

The theme source lives in `theme/` -- a subdirectory, not the repo root. Shopify's native GitHub integration requires theme files at root, so it cannot connect directly to `main`. Instead, a CI pipeline builds the theme and pushes the `theme/` contents to a dedicated `live/` branch where files sit at root. That branch is then connected to the store's published theme via Shopify's GitHub integration, giving you two-way sync: code pushes update the theme, and merchant edits in the theme editor commit back to the branch.

PR previews use a different mechanism -- `shopify theme push` via the CLI -- to create unpublished preview themes directly, without branch sync.

## Workflows

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| CI | `ci.yml` | Push to `main`, PRs to `main` | Lint (ESLint) + Theme Check (Shopify linter) |
| Deploy | `deploy.yml` | Push to `main`, manual dispatch | Build, pull merchant customizations, deploy to `live/` branch |
| PR Preview | `pr-preview.yml` | PR opened/updated to `main` | Build, push to unpublished preview theme, comment on PR |
| PR Preview Cleanup | `pr-preview-cleanup.yml` | PR closed | Delete the preview theme from the store |
| Translation Check | `i18n-check.yml` | PRs to `main` | Verify all locale translations are current |

## Prerequisites

Three pieces of configuration must be added to the GitHub repository before the deploy and preview workflows run. The CI and translation check workflows work with no additional configuration.

### Secrets

| Name | Value | Used by |
|------|-------|---------|
| `SHOPIFY_CLI_THEME_TOKEN` | Theme Access token (`shptka_...`) | `deploy.yml`, `pr-preview.yml`, `pr-preview-cleanup.yml` |
| `ANTHROPIC_API_KEY` (optional) | Claude API key for auto-translation | Custom translation workflow |

### Variables

| Name | Value | Used by |
|------|-------|---------|
| `STORE` | myshopify.com domain (e.g., `my-store.myshopify.com`) | `deploy.yml`, `pr-preview.yml`, `pr-preview-cleanup.yml` |
| `LIVE_THEME_ID` | Numeric ID of the published theme | `deploy.yml` |

See the [Workflows](./workflows) page for detailed setup instructions.

## Further reading

- [Workflows](./workflows) -- Detailed explanation of all five workflows, setup instructions, and gotchas
- [PR Previews](./pr-previews) -- Deep dive into the preview theme lifecycle: creation, updates, comments, and cleanup
- [GitHub Pages](./github-pages) -- How the docs site deploys via VitePress and GitHub Pages
- [Translation Pipeline](/i18n/translation-pipeline) -- The translation system validated by `i18n-check.yml`
