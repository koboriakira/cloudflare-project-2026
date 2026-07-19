# cloudflare-project-2026

## Overview / 概要

A starter template for Cloudflare Workers projects. Combines [Hono](https://hono.dev/) with [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi) for type-safe routing, D1 for relational storage, R2 for object storage, and Workers AI for inference — all deployable as a single Worker.

The template follows a **code-first API strategy**: Zod schemas in route definitions are the canonical source of API contracts. `openapi.yaml` is a generated artifact, not a hand-written spec.

## Setup / セットアップ

```bash
./install.sh        # Rename project + npm install
npm run dev         # Start local dev server
```

For secrets (API keys, tokens):

```bash
wrangler secret put SENTRY_DSN
wrangler secret put <SECRET_NAME> --env staging
```

## Development / 開発

```bash
npm run dev              # Local dev server (wrangler dev)
npm run test             # Integration tests (vitest + pool-workers)
npm run typecheck        # tsc --noEmit
npm run lint             # biome check
npm run generate:openapi # Regenerate openapi.yaml from Zod schemas
npm run judges           # Run all invariant checks
npm run reset-db         # Re-apply local D1 migrations
```

## Deploy / デプロイ

```bash
wrangler d1 migrations apply DB --env staging   # Apply migrations
wrangler deploy --env staging                    # Deploy to staging

wrangler d1 migrations apply DB                  # Apply migrations (prod)
wrangler deploy                                  # Deploy to production
```

CI runs typecheck, lint, tests, and judges on every push. Deployment is manual.

## Canonical sources / 正本

正本の対応表（唯一の正本）は [`CLAUDE.md`](./CLAUDE.md) を参照。

Core principle: **正本の形式度が検証の自動化範囲を決める。**

## Removing optional features / オプション機能の削除

See [`CLAUDE.md`](./CLAUDE.md) for the full deletion guide. In brief:

- **R2**: delete `[[r2_buckets]]` from `wrangler.toml`, remove `R2Bucket` from `src/types/env.ts`
- **Workers AI**: delete `[ai]` from `wrangler.toml`, remove `Ai` from `src/types/env.ts`
- **Sentry**: remove `@sentry/cloudflare`, unwrap the Sentry layer in `src/index.ts`
- **Frontend**: delete `public/`, remove `[assets]` from `wrangler.toml`
