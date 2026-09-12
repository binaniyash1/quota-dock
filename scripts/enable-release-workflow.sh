#!/bin/bash
# Run this ONCE with: bash scripts/enable-release-workflow.sh
# Requires: gh auth login (with workflow scope)
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$REPO_ROOT/.github/workflows"
cp "$REPO_ROOT/release-workflow.yml" "$REPO_ROOT/.github/workflows/release.yml"
# Strip the first 2 comment lines from the template
sed -i '' '1,2d' "$REPO_ROOT/.github/workflows/release.yml" 2>/dev/null || sed -i '1,2d' "$REPO_ROOT/.github/workflows/release.yml"
cd "$REPO_ROOT"
gh workflow list 2>/dev/null || true
git add .github/workflows/release.yml
git commit -m "Add macOS release workflow" || true
git push origin main
echo "Done. Open Actions and run Release workflow."
