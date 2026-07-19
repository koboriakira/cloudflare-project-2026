#!/bin/bash
set -euo pipefail

TEMPLATE_NAME="cloudflare-project-2026"

if [ $# -lt 1 ]; then
  echo "Usage: ./install.sh <new-project-name>" >&2
  echo "  Project name must be lowercase alphanumeric with hyphens only (Workers naming constraint)" >&2
  exit 1
fi

NEW_NAME="$1"

# Workers の name 制約: 小文字英数字とハイフンのみ
if ! [[ "$NEW_NAME" =~ ^[a-z][a-z0-9-]*[a-z0-9]$ ]]; then
  echo "Error: Project name must match /^[a-z][a-z0-9-]*[a-z0-9]$/" >&2
  echo "  Examples: my-api, cool-project-2026" >&2
  echo "  Invalid: My-App, my_app, -dash-start, end-dash-" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 2回目実行の検出
if ! grep -q "$TEMPLATE_NAME" package.json 2>/dev/null; then
  echo "Error: Template name '${TEMPLATE_NAME}' not found in package.json." >&2
  echo "  install.sh is meant to run once on a fresh clone." >&2
  exit 1
fi

echo "Renaming template '${TEMPLATE_NAME}' -> '${NEW_NAME}'..."

TARGET_FILES=$(grep -rl "$TEMPLATE_NAME" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=.wrangler \
  --exclude-dir=dist \
  --exclude-dir=test-results \
  --include='*.ts' --include='*.json' --include='*.toml' --include='*.yml' --include='*.yaml' --include='*.md' --include='*.sh' || true)

while IFS= read -r file; do
  [ -z "$file" ] && continue
  # sed の区切り文字に | を使い、入力値の / や & による破壊を防ぐ
  sed -i.bak "s|${TEMPLATE_NAME}|${NEW_NAME}|g" "$file"
  rm -f "${file}.bak"
  echo "  updated: $file"
done <<< "$TARGET_FILES"

echo ""
echo "wrangler.toml の以下は手動設定が必要です:"
echo "  - database_id (production / staging)"
echo "  - .github/workflows/deploy.yml の CLOUDFLARE_API_TOKEN シークレット"

echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "Done. '${NEW_NAME}' への置換が完了しました。"
