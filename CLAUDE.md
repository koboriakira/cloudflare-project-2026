# cloudflare-project-2026 — Claude Code 向け開発規約

## プロジェクト概要

Cloudflare Workers 上で動くアプリケーションのテンプレート。構成要素:

- **Hono** — ルーティング・ミドルウェア
- **D1** — リレーショナルデータストア（SQLite 互換）
- **R2** — オブジェクトストレージ
- **Workers AI** — 推論エンドポイント
- **Sentry (`@sentry/cloudflare`)** — エラートラッキング
- 静的アセット（`public/`）を同一 Worker から配信

これらはすべてオプションとして組み込まれており、実プロジェクトの要件に応じて不要なものを削除する前提で設計されている（後述「オプション機能の削除ガイド」参照）。

## 必須開発コマンド

```bash
npm run dev          # ローカル開発サーバー起動（wrangler dev）
npm run test          # テスト実行（vitest）
npm run test:watch    # テストのウォッチ実行
npm run test:e2e      # E2E テスト実行（playwright）
npm run typecheck     # tsc --noEmit
npm run lint          # biome check
npm run lint:fix       # biome check --write
npm run reset-db       # ローカル D1 のマイグレーションを再適用
```

コードを変更したら、コミット前に最低限 `typecheck` と `lint` を通すこと。振る舞いに関わる変更は `test` も実行する。

## テスト戦略（トロフィー型）

このプロジェクトはテストトロフィー（Testing Trophy）の配分に従う。ピラミッド型（ユニット多数・E2E少数）ではなく、**統合テストを厚く**する。

| 層 | 比重 | 対象 |
|---|---|---|
| ユニットテスト | 少 | 複雑な純粋ロジック（料金計算、バリデーション、パーサー等）のみ |
| 統合テスト | 多 | ルートハンドラ + D1/R2/AI バインディングを通した振る舞い。主軸 |
| E2E テスト | 中（主要パスのみ） | ユーザーが実際に踏む導線（サインアップ→主要操作→結果確認 等） |

理由: Worker のバグの大半はハンドラ・ミドルウェア・バインディングの結合部で起きる。個々の関数を分離してモックしたユニットテストはその結合部の不整合を検出できない。E2E は実行コストが高いため主要パスに絞る。

新しいエンドポイントを追加したら、対応する統合テストを先に書く（TDD）。複雑なロジックを関数として切り出した場合のみ、その関数のユニットテストを追加する。

## 正本の対応表

各関心事には唯一の正本（canonical source）と、それを機械的に検証する verifier がある。矛盾が起きたら正本を信じる。

| 関心事 | 正本 | 検証者 |
|--------|------|--------|
| インフラ構成 | `wrangler.toml` | Cloudflare ランタイム |
| データスキーマ | `migrations/*.sql` | D1 エンジン |
| API 契約 | `openapi.yaml` | 型生成 + CI |
| 画面構造 | `dspec/*.dspec` | dspec パーサー |
| ドメインモデル | `src/types/*.ts` | TypeScript コンパイラ |
| 振る舞い不変条件 | `.claude/rules/*.md` | `judges/*.sh` |
| 設計意図 | `DESIGN.md` | 人間（レビュー） |

## 新機能追加時のチェックリスト

1. **`DESIGN.md` に設計判断を記録する** — なぜその設計にしたか、代替案は何だったか
2. **該当する正本を更新する** — `migrations/`（スキーマ変更）、`openapi.yaml`（API変更）、`src/types/*.ts`（ドメインモデル変更）等。正本を更新せずに実装だけ進めない
3. **テストを書く** — トロフィー型の配分に従う（上記参照）
4. **judges が通ることを確認する** — `.claude/rules/*.md` に対応する `judges/*.sh` を実行し、違反がないことを確認する

正本を更新せずにコードだけ変更すると、正本と実装が乖離し、次にその正本を読んだ人（人間もエージェントも）が誤った前提で作業することになる。これが本プロジェクトで最も避けたい失敗モード。

## オプション機能の削除ガイド

テンプレートには R2 / Workers AI / Sentry / フロントエンドがデフォルトで含まれる。使わないものは早期に削除する（残したまま放置すると、未使用のバインディングやコードが正本と実装の乖離を生む）。

### R2 を外す

- `wrangler.toml` の `[[r2_buckets]]` を削除
- `src/types/env.ts` から `R2Bucket` の宣言を削除
- R2 を参照しているハンドラ・テストがあれば削除または置き換え

### Workers AI を外す

- `wrangler.toml` の `[ai]` を削除
- `src/types/env.ts` から `Ai` の宣言を削除

### Sentry を外す

- `package.json` から `@sentry/cloudflare` を削除
- `src/middleware/error-handler.ts` を削除
- `src/index.ts` から Sentry のラップ処理を削除
- `wrangler.toml` の `SENTRY_DSN` 変数を削除

### フロントエンドを外す

- `public/` ディレクトリを削除
- `wrangler.toml` の `[assets]` を削除

いずれの削除も、削除後に `npm run typecheck` と `npm run test` を実行し、参照切れがないことを確認する。

## Worktree 運用

複数の機能を並行開発する場合は `git worktree` でディレクトリを分離する。同一リポジトリを複数セッションで同時に触ると、未コミット変更の混線や `git add -A` による意図しないファイル混入が起きやすい。

```bash
git worktree add ../cloudflare-project-2026-feature-x feature/x
```

worktree ごとに `npm install` を実行してから作業を始める（`node_modules` は worktree 間で共有されない）。作業が終わったら `git worktree remove` で片付ける。

## コーディング規約

- **TypeScript strict モード** — `tsconfig.json` で `strict: true` を設定済み。`any` を安易に使わない
- **Biome** — lint・フォーマットは Biome に統一する（ESLint/Prettier は使わない）。`npm run lint:fix` で自動修正
- **型はドメインモデルの正本 (`src/types/*.ts`) に集約する** — ハンドラごとに型を再定義しない
- コメントは WHY のみ。WHAT はコードと命名で表現する
