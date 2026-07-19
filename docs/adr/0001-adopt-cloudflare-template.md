# ADR-0001: cloudflare-project-2026 テンプレートの採用

## Status
Superseded by ADR-0002

## Date
2026-07-19

## Context
新規 Cloudflare Workers プロジェクトを立ち上げるたびに、ルーティング（Hono）、データスキーマ（D1）、オブジェクトストレージ（R2）、推論エンドポイント（Workers AI）、エラートラッキング（Sentry）、静的アセット配信の初期構成をゼロから組み立てるのはコストが高く、プロジェクト間で構成が揺れる原因になっていた。

## Decision
`cloudflare-project-2026` テンプレートを採用する。このテンプレートは Hono + D1 + R2 + Workers AI + Sentry + 静的アセット配信を初期構成として含み、正本（canonical source）の対応表と `.claude/rules/` + `judges/*.sh` による機械検証を最初から備える。

## Consequences
- 初期構成に Hono + D1 + R2 + Workers AI が含まれる。プロジェクトがこれらの機能をすべて必要としない場合、`CLAUDE.md` の「オプション機能の削除ガイド」に従って不要な機能を削除する
- 正本の対応表（`wrangler.toml` / `migrations/*.sql` / `openapi.yaml` / `dspec/*.dspec` / `src/types/*.ts` / `.claude/rules/*.md` / `DESIGN.md`）に従うことがプロジェクトの規約になる。新しい関心事が生じた場合は対応表自体を更新する
- テンプレート由来の判断（Hono・D1 の採用理由等）は `DESIGN.md` にサンプルとして残し、実プロジェクト固有の判断で上書きしていく
