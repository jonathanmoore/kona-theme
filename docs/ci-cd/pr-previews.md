# PR Previews

Every PR targeting `main` gets its own unpublished preview theme. `pr-preview.yml` creates/updates it, `pr-preview-cleanup.yml` deletes it when the PR closes.

## Lifecycle

```
PR opened/updated → build → find or create preview theme → push → comment on PR
PR closed         → find theme by PR number → delete
```

## Theme naming

Preview themes are named `PR #<number> - <branch-name>`. The workflow searches by `PR #<number> ` (with trailing space), so renaming the branch mid-PR doesn't create a duplicate.

## Build and push

Same build as production deploy (checkout, install, build, remove `.vite`). Then:

```bash
# Search for existing theme
EXISTING=$(shopify theme list --json \
  | jq -r --arg pr "PR #${PR_NUMBER} " \
    '.[] | select(.name | startswith($pr)) | .id' \
  | head -1)

if [ -n "$EXISTING" ]; then
  shopify theme push --theme "$EXISTING" --path theme
else
  shopify theme push --unpublished --theme "$THEME_NAME" --path theme
fi
```

- `--unpublished` creates a new theme without affecting the published one
- Subsequent pushes update the existing preview in place

## PR comment

After deploying, the workflow posts a comment with two links:

| Link | URL pattern |
|------|-------------|
| **Preview** | `https://<store>/?preview_theme_id=<theme_id>` |
| **Editor** | `https://admin.shopify.com/store/<handle>/themes/<theme_id>/editor` |

An HTML marker (`<!-- shopify-preview-comment -->`) identifies the comment. Subsequent pushes update the same comment instead of creating duplicates. Uses `actions/github-script@v7`.

## Concurrency

```yaml
concurrency:
  group: pr-preview-${{ github.event.pull_request.number }}
  cancel-in-progress: true
```

Push A triggers a run, push B cancels it. Different PRs run independently.

## Cleanup

When a PR closes, `pr-preview-cleanup.yml` searches for the theme and deletes it with `--force`. No checkout or build — just Node (for Shopify CLI) and store credentials. If the theme was already deleted manually, it skips silently.

## Permissions

```yaml
permissions:
  contents: read
  pull-requests: write
```

Both workflows need `SHOPIFY_CLI_THEME_TOKEN` and `STORE`.

## Limitations

- Preview themes are only accessible via `?preview_theme_id=` or the theme editor — not visible to customers
- Each counts toward the store's theme limit (typically 20 for non-Plus stores)
- Previews don't pull merchant customizations — they reflect the PR branch code, not the live theme's settings

## Next steps

- [Workflows](./workflows) — All five workflows in detail
- [Deployment](/getting-started/deployment) — Production deploy process
