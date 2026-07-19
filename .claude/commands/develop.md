# develop — 機能開発フロー

新しいエンドポイント・機能を TDD で実装するときに使う。

## 手順

1. 要件を確認し、対象のルート（`src/routes/`）・サービス（`src/services/`）・型（`src/types/`）を特定する
2. `src/__tests__/` に失敗するテストを先に書く（vitest）
3. `npm test` で失敗を確認する
4. 実装を書き、`npm test` が通るまで修正する
5. `npm run typecheck` で型エラーがないことを確認する
6. `npm run lint` でスタイル違反がないことを確認する
7. 振る舞いに関わる変更なら `e2e/` に Playwright テストを追加し、`npm run test:e2e` で確認する
8. すべて通ったらコミットする

## 注意

- D1 を使うロジックはユニットテストではモックする（`src/__tests__/user-service.test.ts` を参照）
- バインディング（`DB` / `BUCKET` / `AI` / `SENTRY_DSN`）を新規追加した場合、`wrangler.toml` の production と `env.staging` の両方に定義し、`src/types/env.ts` の `Bindings` 型も更新する
