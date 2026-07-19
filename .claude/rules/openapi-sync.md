# openapi.yaml 生成物の鮮度

## 守るべき不変条件

`openapi.yaml`（生成物）について、以下が常に真であること。

1. **openapi.yaml は `src/routes/*.ts` の Zod スキーマから生成される** — 直接編集しない
2. **`npm run generate:openapi` で再生成した結果と、コミット済みの openapi.yaml に差分がない** — 差分がある場合、ルート変更後に再生成を忘れている
3. **openapi.yaml はリポジトリにコミットする** — 外部ツール連携・ドキュメント参照のため

## なぜこのルールが必要か

- code-first 戦略では Zod スキーマが正本であり openapi.yaml は派生物
- 派生物をコミットする理由は、CI/CD パイプラインやドキュメントツールが参照するため
- 「生成し忘れ」を検出しないと、古い openapi.yaml が配布され続ける

## 違反時の対応

`judges/openapi-sync.sh` で検出。`npm run generate:openapi` を実行してコミットすれば解消。
