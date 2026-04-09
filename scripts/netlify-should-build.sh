#!/bin/bash
# Netlify build ignore script for docs site
# Exit 0 = build, Exit 1 = skip build

set -e

echo "Checking if docs build is needed..."

# For deploy previews (PRs), check if docs/ changed compared to base branch
if [ "$CONTEXT" = "deploy-preview" ]; then
  # Netlify sets CACHED_COMMIT_REF to the base branch commit
  BASE_COMMIT=${CACHED_COMMIT_REF:-origin/main}

  echo "Comparing HEAD to $BASE_COMMIT"

  # Check if any docs-related files changed
  CHANGED_FILES=$(git diff --name-only $BASE_COMMIT HEAD || echo "")

  echo "Changed files:"
  echo "$CHANGED_FILES"

  # Check if any changes affect docs
  if echo "$CHANGED_FILES" | grep -qE '^(docs/|package\.json|pnpm-lock\.yaml|netlify\.toml)'; then
    echo "✅ Docs-related changes detected - proceeding with build"
    exit 0
  else
    echo "⏭️  No docs changes - skipping build"
    exit 1
  fi
fi

# For production/branch deploys, always build
echo "✅ Production/branch deploy - proceeding with build"
exit 0
