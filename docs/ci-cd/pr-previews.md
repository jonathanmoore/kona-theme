# PR Previews

Every pull request targeting `main` gets its own unpublished preview theme on the Shopify store. Two workflows manage the lifecycle: `pr-preview.yml` creates and updates the theme, `pr-preview-cleanup.yml` deletes it when the PR closes.

## How it works

```
PR opened/updated → build theme → find or create preview theme → push to Shopify → comment on PR
PR closed         → find preview theme by PR number → delete from store
```

## Theme naming convention

Preview themes are named using the pattern:

```
PR #<number> - <branch-name>
```

For example, a PR numbered 42 from branch `feature/cart-upsell` creates a theme named `PR #42 - feature/cart-upsell`.

The PR number prefix is the stable identifier. When the workflow searches for an existing preview theme, it matches on `PR #<number> ` (with a trailing space) rather than the full name. This means renaming the branch mid-PR does not create a duplicate theme.

## Build and push cycle

The preview workflow runs the same build steps as the production deploy:

1. Checkout, install pnpm, Node, and dependencies
2. Install Shopify CLI globally
3. `pnpm run build` -- compile JS/CSS into `theme/assets/`
4. Remove `theme/assets/.vite` -- strip the Vite manifest directory

After building, the workflow searches for an existing preview theme and either updates it or creates a new one:

```yaml
- name: Find or create preview theme
  id: theme
  run: |
    THEME_NAME="PR #${PR_NUMBER} - ${BRANCH_NAME}"

    # Search for existing theme by PR number prefix
    EXISTING=$(shopify theme list --json \
      | jq -r --arg pr "PR #${PR_NUMBER} " \
        '.[] | select(.name | startswith($pr)) | .id' \
      | head -1)

    if [ -n "$EXISTING" ]; then
      echo "Found existing theme: $EXISTING"
      shopify theme push --theme "$EXISTING" --path theme
      THEME_ID="$EXISTING"
    else
      echo "Creating new preview theme..."
      shopify theme push --unpublished --theme "$THEME_NAME" --path theme
      THEME_ID=$(shopify theme list --json \
        | jq -r --arg name "$THEME_NAME" \
          '.[] | select(.name == $name) | .id' \
        | head -1)
    fi
    echo "theme_id=$THEME_ID" >> "$GITHUB_OUTPUT"
    echo "theme_name=$THEME_NAME" >> "$GITHUB_OUTPUT"
```

Key details:
- `shopify theme push --unpublished` creates a new theme without affecting the published one
- On subsequent pushes, `shopify theme push --theme "$EXISTING"` updates the existing preview in place
- The theme ID and name are passed to the next step via `$GITHUB_OUTPUT`

## PR comment with preview links

After deploying, the workflow posts a comment on the PR with two links:

| Link | URL pattern |
|------|-------------|
| **Preview** | `https://<store>/?preview_theme_id=<theme_id>` |
| **Editor** | `https://admin.shopify.com/store/<store_handle>/themes/<theme_id>/editor` |

The preview link appends `?preview_theme_id=` to the storefront URL, which tells Shopify to render the unpublished theme instead of the published one. The editor link opens the theme in the Shopify admin's visual editor.

### Updating existing comments

The workflow uses an HTML marker to avoid creating duplicate comments on subsequent pushes:

```javascript
const marker = '<!-- shopify-preview-comment -->';
```

On each run, it:

1. Lists all comments on the PR
2. Searches for one containing the marker string
3. If found, updates that comment with the new theme ID and links
4. If not found, creates a new comment

This keeps the PR thread clean -- a single comment is updated in place rather than posting a new one for every push:

```javascript
const existing = comments.find(c => c.body.includes(marker));

if (existing) {
  await github.rest.issues.updateComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    comment_id: existing.id,
    body,
  });
} else {
  await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
    body,
  });
}
```

The workflow uses `actions/github-script@v7` to run this logic directly in the workflow YAML, avoiding the need for a separate script file.

## Concurrency handling

Multiple pushes to the same PR branch can trigger overlapping workflow runs. The workflow uses GitHub Actions concurrency groups to cancel previous runs:

```yaml
concurrency:
  group: pr-preview-${{ github.event.pull_request.number }}
  cancel-in-progress: true
```

The concurrency group is keyed by PR number, so:
- Push A triggers a run, push B triggers another -- run A is cancelled
- Different PRs run independently (each has its own group)
- Only the most recent push deploys to the preview theme

## Cleanup on PR close

When a PR is closed (merged or discarded), `pr-preview-cleanup.yml` fires:

```yaml
on:
  pull_request:
    branches:
      - main
    types: [closed]
```

The cleanup workflow:

1. Installs Node and Shopify CLI (no checkout or build needed)
2. Searches for a theme whose name starts with `PR #<number> `
3. Deletes it with `shopify theme delete --theme "$EXISTING" --force`
4. If no matching theme is found (e.g., already deleted manually), logs a message and exits cleanly

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

::: tip
The cleanup workflow does not check out the repo or build the theme. It only needs Node (to run the Shopify CLI) and the store credentials.
:::

## Required permissions

The preview workflow requires two GitHub token permissions:

```yaml
permissions:
  contents: read        # Checkout the repo
  pull-requests: write  # Post and update comments
```

Both workflows require the `SHOPIFY_CLI_THEME_TOKEN` secret and `STORE` variable. The cleanup workflow sets `SHOPIFY_FLAG_STORE` as an environment variable so the Shopify CLI picks it up automatically without the `--store` flag.

## Limitations

- Preview themes are unpublished and only accessible via the `?preview_theme_id=` URL parameter or the theme editor. They are not visible to customers.
- Each preview theme counts toward the store's theme limit (typically 20 themes for non-Plus stores). Clean up regularly or rely on the automatic cleanup.
- The preview does not pull merchant customizations like the deploy workflow does. Templates and sections reflect the code in the PR branch, not the live theme's customizations.
