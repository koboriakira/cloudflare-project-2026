# cloudflare-project-2026 — Claude Code 向け開発規約

## プロジェクト概要

Cloudflare Workers 上で動くアプリケーションのテンプレート。構成要素:

- **Hono + @hono/zod-openapi** — 型安全なルーティング。Zod スキーマで API 契約を定義
- **D1** — リレーショナルデータストア（SQLite 互換）
- **R2** — オブジェクトストレージ
- **Workers AI** — 推論エンドポイント
- **Sentry (`@sentry/cloudflare`)** — エラートラッキング
- 静的アセット（`public/`）を同一 Worker から配信

これらはすべてオプションとして組み込まれており、不要なものを削除する前提で設計されている（後述「オプション機能の削除ガイド」参照）。

## 必須開発コマンド

```bash
npm run dev          # ローカル開発サーバー起動（wrangler dev）
npm run test         # 統合テスト実行（vitest + pool-workers）
npm run test:watch   # テストのウォッチ実行
npm run test:e2e     # E2E テスト実行（playwright、staging 手動）
npm run typecheck    # tsc --noEmit
npm run lint         # biome check
npm run lint:fix     # biome check --write
npm run reset-db     # ローカル D1 のマイグレーションを再適用
npm run generate:openapi  # Zod スキーマから openapi.yaml を再生成
npm run judges       # 全 judge を実行
```

コードを変更したら、コミット前に `typecheck`、`lint`、`test` を通すこと。

## 中核テーゼ

> 正本の形式度が検証の自動化範囲を決める。

検証できないものを「検証している」と書かない。検証が弱いなら弱いと書く。

## 正本の対応表（このテーブルが唯一の正本）

README / DESIGN.md はこのテーブルへの参照リンクのみ。テーブルを複製しない。

| 関心事 | 正本 | 検証者 | 検証されること | 検証されないこと |
|--------|------|--------|---------------|----------------|
| インフラ構成 | `wrangler.toml` | Cloudflare runtime | バインディング名・型の存在 | wrangler.toml と env.ts の一致 |
| データスキーマ | `migrations/*.sql` | D1 engine + `judges/migration-integrity.sh` | SQL構文・連番整合・既存ファイル不変 | migrations と types の型一致 |
| API 契約 | `src/routes/*.ts` (Zod スキーマ) | TypeScript compiler + Hono 型システム | リクエスト/レスポンス形状の型一致 | API の意味的正しさ |
| API ドキュメント | `openapi.yaml`（生成物。正本ではない） | `judges/openapi-sync.sh` | 生成物が最新か | — |
| ドメインモデル | `src/types/*.ts` | TypeScript compiler | 型使用の内部整合 | 型と DB スキーマの意味的対応 |
| コード構造規約 | `.claude/rules/*.md` | `judges/*.sh` (CI で実行) | 各ルールの不変条件 | ルールの網羅性 |
| 設計意図 | `DESIGN.md` | 人間レビュー | なし | — |

### 正本を持たない関心事（明示的な例外）

- **静的アセット (`public/`)** — ファイル自体が成果物。形式化された仕様は不要

### 縫い目（正本間の整合 — 現時点で未検証）

- `wrangler.toml` ⇔ `src/types/env.ts`（バインディング名の一致）
- `migrations/*.sql` ⇔ `src/types/*.ts`（カラム名と型の対応）

将来的に型生成ツール（sql-to-ts 等）で埋める余地を残す。

## code-first API 戦略

@hono/zod-openapi により、ルート定義に Zod スキーマを埋め込む。

```
src/routes/*.ts (Zod スキーマ + ハンドラ = 正本)
  ↓ npm run generate:openapi
openapi.yaml (生成物。ドキュメント・外部ツール連携用)
```

- openapi.yaml を直接編集しない。変更は常に src/routes/ のスキーマ側から行う
- `judges/openapi-sync.sh` が生成物の鮮度を検出する

## テスト戦略（トロフィー型）

**統合テストを主軸とする。** @cloudflare/vitest-pool-workers により、Miniflare 上で実際のバインディング（D1, R2）を使ってテストする。

| 層 | 比重 | CI | 対象 |
|---|---|---|---|
| 統合テスト | 多 | ✓ | ルートハンドラ + バインディング。`SELF.fetch()` でリクエストを送る |
| ユニットテスト | 少 | ✓ | 複雑な純粋ロジック（計算、バリデーション等）のみ |
| E2E テスト | 少 | — | staging デプロイ後に手動で実行 |

新しいエンドポイントを追加したら、対応する統合テストを先に書く（TDD）。

## judges の実行

| タイミング | 方法 |
|-----------|------|
| CI（push/PR） | `npm run judges` |
| エージェントフロー | `.claude/commands/develop.md` に従う |
| 手動 | `bash judges/<name>.sh` |

## 新機能追加時のチェックリスト

1. **Zod スキーマでルートを定義する** — `src/routes/` にスキーマ付きルートを追加。これが API 契約の正本になる
2. **統合テストを書く** — SELF.fetch() で実際のリクエストを送り、レスポンスを検証
3. **マイグレーションを追加する**（スキーマ変更時）— `migrations/` に新しい連番ファイル
4. **openapi.yaml を再生成する** — `npm run generate:openapi` してコミット
5. **judges が通ることを確認する** — `npm run judges`

## Secrets 管理

- `wrangler.toml [vars]` = 非機密の設定値のみ。空文字プレースホルダー禁止
- 機密値 → `wrangler secret put <名前>`
- `src/types/env.ts` では secret も non-secret も `Bindings` 型に含める（ランタイムでは区別がない）

## オプション機能の削除ガイド

### R2 を外す

- `wrangler.toml` の `[[r2_buckets]]` を削除
- `src/types/env.ts` から `R2Bucket` の宣言を削除
- R2 を参照しているハンドラ・テストがあれば削除

### Workers AI を外す

- `wrangler.toml` の `[ai]` を削除
- `src/types/env.ts` から `Ai` の宣言を削除

### Sentry を外す

- `package.json` から `@sentry/cloudflare` を削除
- `src/index.ts` の Sentry ラップを外し、`src/app.ts` の `app` を直接 export default にする
- `src/middleware/error-handler.ts` から Sentry 呼び出しを削除
- `src/types/env.ts` から `SENTRY_DSN` を削除

### フロントエンドを外す

- `public/` ディレクトリを削除
- `wrangler.toml` の `[assets]` を削除

いずれの削除も、削除後に `npm run typecheck` と `npm run test` を通すこと。

## Worktree 運用

複数の機能を並行開発する場合は `git worktree` でディレクトリを分離する。

```bash
git worktree add ../cloudflare-project-2026-feature-x feature/x
```

## コーディング規約

- **TypeScript strict モード** — `any` を安易に使わない
- **Biome** — lint・フォーマットは Biome に統一。設定は `biome.json`
- **型はドメインモデルの正本 (`src/types/*.ts`) に集約する** — ハンドラごとに型を再定義しない
- **API の型は Zod スキーマが正本** — `src/schemas/` に定義し、ルートから参照する
- コメントは WHY のみ
