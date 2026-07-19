# ADR-0002: code-first API 戦略への移行

## Status
Accepted

## Date
2026-07-19

## Context
ADR-0001 で採用したテンプレートは design-first（openapi.yaml を人間が書き、実装がそれに従う）を前提としていた。しかし敵対的検証により、openapi.yaml と実装の乖離が出荷時点で存在しており、検証者（judges/openapi-sync.sh）がパス数比較のみで形状一致を検証できないことが判明した。

個人プロジェクトのテンプレートとして、マルチチーム協業の「先に契約を合意する」フローは不要。中核テーゼ「正本の形式度が検証の自動化範囲を決める」に最も忠実な設計を選ぶ。

## Decision
- @hono/zod-openapi を導入し、ルート定義に Zod スキーマを埋め込む（code-first）
- `src/routes/*.ts` の Zod スキーマが API 契約の正本になる
- openapi.yaml はコードから生成する派生物に降格する。直接編集しない
- dspec を正本テーブルから削除する（実体が存在せず、このテンプレートは API-first）
- テスト戦略を @cloudflare/vitest-pool-workers による統合テスト主軸に移行する

## Consequences
- API 契約と実装の乖離が TypeScript の型システムにより構造的に不可能になる
- openapi.yaml を先に書いて合意するワークフローは使えない
- @hono/zod-openapi + zod への依存が追加される
- 正本テーブルが CLAUDE.md に一元化され、README / DESIGN.md は参照リンクのみになる
