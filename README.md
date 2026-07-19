# cloudflare-project-2026

## Overview / 概要

A starter template for Cloudflare Workers projects, combining [Hono](https://hono.dev/) for routing, D1 for relational storage, R2 for object storage, and Workers AI for inference — all deployable as a single Worker with static assets served from `public/`. The template is designed to be cloned, trimmed down to the features an actual project needs, and extended from a single well-defined source of truth per concern (see "Canonical sources" below).

## Setup / セットアップ

```bash
bin/install.sh
```

`install.sh` installs npm dependencies, verifies the `wrangler` CLI is authenticated (`wrangler whoami`), and creates local D1/R2 bindings for development if they don't already exist.

Secrets (API keys, tokens) are never committed to `wrangler.toml`. Set them with:

```bash
wrangler secret put SENTRY_DSN
wrangler secret put <SECRET_NAME> --env staging
```

Non-secret configuration (bucket names, feature flags) lives in `wrangler.toml` under `[vars]`.

## Development / 開発

```bash
npm run dev          # start the local dev server (wrangler dev)
npm run test         # run the integration/unit test suite (vitest)
npm run test:e2e     # run end-to-end tests (playwright)
npm run typecheck    # tsc --noEmit
npm run lint         # biome check
npm run reset-db     # drop and re-apply local D1 migrations
```

## Deploy / デプロイ

```bash
wrangler deploy --env staging     # staging
wrangler deploy                   # production
```

CI runs typecheck, lint, and tests on every push; deployment to staging happens automatically on merge to `main`, production deploys are manual (see `.github/workflows/`).

## Canonical sources / 正本の階層

Every cross-cutting concern in this project has exactly one canonical source — the file that is authoritative when something disagrees with it — and one verifier that mechanically checks the rest of the codebase against it.

| 関心事 (Concern) | 正本 (Canonical source) | 検証者 (Verifier) |
|---|---|---|
| インフラ構成 (Infrastructure) | `wrangler.toml` | Cloudflare ランタイム (Cloudflare runtime) |
| データスキーマ (Data schema) | `migrations/*.sql` | D1 エンジン (D1 engine) |
| API 契約 (API contract) | `openapi.yaml` | 型生成 + CI (type generation + CI) |
| 画面構造 (Screen structure) | `dspec/*.dspec` | dspec パーサー (dspec parser) |
| ドメインモデル (Domain model) | `src/types/*.ts` | TypeScript コンパイラ (TypeScript compiler) |
| 振る舞い不変条件 (Behavioral invariants) | `.claude/rules/*.md` | `judges/*.sh` |
| 設計意図 (Design intent) | `DESIGN.md` | 人間 (human review) |

When you need to know "what's true," go to the canonical source, not to whichever file you happened to open first. When you change a canonical source, run its verifier before committing.

## Removing optional features / オプション機能の削除ガイド

This template ships with R2, Workers AI, Sentry, and a static frontend enabled by default. Remove what you don't need:

- **R2**: delete `[[r2_buckets]]` from `wrangler.toml`, remove `R2Bucket` from `src/types/env.ts`.
- **Workers AI**: delete `[ai]` from `wrangler.toml`, remove `Ai` from `src/types/env.ts`.
- **Sentry**: remove `@sentry/cloudflare` from `package.json`, delete `src/middleware/error-handler.ts`, remove the Sentry wrapper from `src/index.ts`.
- **Frontend**: delete `public/`, remove `[assets]` from `wrangler.toml`.

See `CLAUDE.md` for the full checklist and rationale behind each step.
