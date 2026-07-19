#!/bin/bash
# openapi-sync: openapi.yaml と src/routes/ の軽量整合チェック
# .claude/rules/openapi-sync.md の不変条件を機械検証する
#
# 完全なスキーマ検証（リクエスト/レスポンス形状の一致）は行わない。
# openapi.yaml の paths 数と src/routes/ 配下のファイル数を比較し、
# 大きな乖離（正本の更新漏れ・実装の追い越し）の兆候を検出する軽量チェック。

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OPENAPI_FILE="$REPO_ROOT/openapi.yaml"
ROUTES_DIR="$REPO_ROOT/src/routes"
violations=0
warnings=0

if [ ! -f "$OPENAPI_FILE" ]; then
  echo "MISSING: openapi.yaml not found at $OPENAPI_FILE"
  echo "VIOLATIONS: 1"
  exit 1
fi

# openapi.yaml の paths: 配下のトップレベルパス数をカウント
# (2スペースインデントの "  /xxx:" 行を paths エントリとみなす)
openapi_path_count=$(awk '
  /^paths:/ { in_paths=1; next }
  in_paths && /^[a-zA-Z]/ { in_paths=0 }
  in_paths && /^  \/[^ ]+:/ { count++ }
  END { print count+0 }
' "$OPENAPI_FILE")

if [ ! -d "$ROUTES_DIR" ]; then
  if [ "$openapi_path_count" -gt 0 ]; then
    echo "WARNING: openapi.yaml defines $openapi_path_count path(s) but src/routes/ does not exist"
    warnings=$((warnings + 1))
  fi
  echo "VIOLATIONS: $violations"
  echo "WARNINGS: $warnings"
  [ "$violations" -gt 0 ] && exit 1 || exit 0
fi

route_file_count=$(find "$ROUTES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | wc -l | tr -d ' ')

echo "openapi.yaml paths: $openapi_path_count"
echo "src/routes/ files: $route_file_count"

if [ "$openapi_path_count" -eq 0 ] && [ "$route_file_count" -gt 0 ]; then
  echo "VIOLATION: src/routes/ has $route_file_count file(s) but openapi.yaml defines no paths"
  violations=$((violations + 1))
elif [ "$openapi_path_count" -gt 0 ] && [ "$route_file_count" -eq 0 ]; then
  echo "VIOLATION: openapi.yaml defines $openapi_path_count path(s) but src/routes/ has no handler files"
  violations=$((violations + 1))
elif [ "$openapi_path_count" -ne "$route_file_count" ]; then
  echo "WARNING: path count ($openapi_path_count) and route file count ($route_file_count) differ — verify manually (one file may implement multiple paths, or vice versa)"
  warnings=$((warnings + 1))
fi

echo "VIOLATIONS: $violations"
echo "WARNINGS: $warnings"
if [ "$violations" -eq 0 ] && [ "$warnings" -eq 0 ]; then
  echo "OK: openapi-sync check passed"
fi
[ "$violations" -gt 0 ] && exit 1 || exit 0
