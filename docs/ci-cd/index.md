# CI/CD Overview

Five GitHub Actions workflows handle linting, deployment, PR previews, translation checks, and docs publishing.

## Why CI/CD for this theme

Theme source lives in `theme/` — a subdirectory, not the repo root. Shopify's GitHub integration requires files at root, so the CI pipeline builds the theme and pushes `theme/` contents to a `live/` branch where files sit at root. That branch is connected to the store via Shopify's GitHub integration for two-way sync.

## Workflows

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| CI | `ci.yml` | Push to `main`, PRs | Lint (ESLint) + Theme Check |
| Deploy | `deploy.yml` | Push to `main`, manual | Build, pull customizations, deploy to `live/` branch |
| PR Preview | `pr-preview.yml` | PR opened/updated | Push preview theme, comment on PR |
| PR Cleanup | `pr-preview-cleanup.yml` | PR closed | Delete preview theme |
| Translation Check | `i18n-check.yml` | PRs | Verify locale translations are current |

## Prerequisites

CI and translation check work with no configuration. Deploy and preview need:

**Secrets:**

| Name | Value |
|------|-------|
| `SHOPIFY_CLI_THEME_TOKEN` | Theme Access token (`shptka_...`) |
| `ANTHROPIC_API_KEY` (optional) | Claude API key for auto-translation |

**Variables:**

| Name | Value |
|------|-------|
| `STORE` | `*.myshopify.com` domain |
| `LIVE_THEME_ID` | Numeric ID of published theme |

See [Installation](/getting-started/installation#_4-set-up-github-secrets-for-ci-cd) for setup instructions.

## Next steps

- [Workflows](./workflows) — All five workflows in detail, setup, and gotchas
- [PR Previews](./pr-previews) — Preview theme lifecycle: creation, updates, cleanup
- [GitHub Pages](./github-pages) — Docs site deployment
- [Translation Pipeline](/i18n/translation-pipeline) — The system validated by `i18n-check.yml`
