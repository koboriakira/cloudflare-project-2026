#!/bin/bash
set -euo pipefail

TEMPLATE_NAME="cloudflare-project-2026"

if [ $# -lt 1 ]; then
  echo "Usage: bash install.sh <new-project-name>" >&2
  exit 1
fi

NEW_NAME="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Renaming template '${TEMPLATE_NAME}' -> '${NEW_NAME}'..."

TARGET_FILES=$(grep -rl "$TEMPLATE_NAME" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=.wrangler \
  --exclude-dir=dist \
  --exclude-dir=test-results \
  --exclude=install.sh)

while IFS= read -r file; do
  [ -z "$file" ] && continue
  sed -i.bak "s/${TEMPLATE_NAME}/${NEW_NAME}/g" "$file"
  rm -f "${file}.bak"
  echo "  updated: $file"
done <<< "$TARGET_FILES"

echo ""
echo "wrangler.toml の database_id / bucket_name は自動置換されていません。要設定です:"
echo "  - database_id (production / staging)"
echo "  - .github/workflows/deploy.yml の CLOUDFLARE_API_TOKEN シークレット"

echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "Done. '${NEW_NAME}' への置換が完了しました。"
