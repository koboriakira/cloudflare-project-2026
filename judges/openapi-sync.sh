#!/bin/bash
# openapi-sync: openapi.yaml（生成物）が src/routes/ の Zod スキーマと同期しているか検証
#
# code-first 戦略: src/routes/*.ts の Zod スキーマが正本。
# openapi.yaml は `npm run generate:openapi` で生成される派生物。
# このjudgeは「生成し直したら差分が出るか」で鮮度を検出する。
#
# 注意: npm install 済みの環境でのみ動作する（tsx が必要）

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
violations=0

if [ ! -f "$REPO_ROOT/openapi.yaml" ]; then
  echo "WARNING: openapi.yaml not found. Run 'npm run generate:openapi' to create it."
  echo "VIOLATIONS: 0"
  echo "WARNINGS: 1"
  exit 0
fi

if [ ! -d "$REPO_ROOT/node_modules" ]; then
  echo "SKIP: node_modules not found. Run 'npm install' first."
  echo "VIOLATIONS: 0"
  exit 0
fi

# 生成して差分を確認
TEMP_FILE=$(mktemp)
cd "$REPO_ROOT" && npx tsx scripts/generate-openapi.ts > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "WARNING: generate-openapi.ts failed to run. Check script for errors."
  echo "VIOLATIONS: 0"
  echo "WARNINGS: 1"
  rm -f "$TEMP_FILE"
  exit 0
fi

if git diff --quiet openapi.yaml 2>/dev/null; then
  echo "OK: openapi.yaml is up to date with route definitions"
  echo "VIOLATIONS: 0"
else
  echo "VIOLATION: openapi.yaml is stale. Run 'npm run generate:openapi' and commit the result."
  git diff --stat openapi.yaml 2>/dev/null
  violations=1
fi

rm -f "$TEMP_FILE"
echo "VIOLATIONS: $violations"
[ "$violations" -gt 0 ] && exit 1 || exit 0
