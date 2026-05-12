
# 内部設計書_星野のペット用品ECサイト

## 1. システム概要
本システムは、ペット用品販売を目的としたECサイト「星野のペット用品」の内部設計を定義するものである。

本設計書は、フロントエンド、バックエンド、データベース、外部API連携、管理機能、AI画像生成機能の実装仕様を明確化し、プログラマーが統一された仕様に基づいて開発を行うことを目的とする。

システムはNext.jsを用いたSPA構成を採用し、FastAPIによるREST APIを提供する。
データベースにはPostgreSQLを使用し、決済処理にはKOMOJU APIを利用する。

---

## 2. システム構成

### フロントエンド
- Next.js (React)
- Vanilla CSS
- SPA構成
- レスポンシブデザイン
- JWT認証対応

### バックエンド
- FastAPI
- REST API
- OpenAPI(Swagger)
- JWT認証
- AI画像生成ジョブ管理

### データベース
- PostgreSQL
- トランザクション制御
- 論理削除対応

### インフラ
- Ubuntu VPS
- Caddy Reverse Proxy
- Let's Encrypt
- systemdプロセス管理

---

## 3. ディレクトリ構成

```text
frontend/
 ├─ app/
 ├─ components/
 ├─ features/
 ├─ styles/
 ├─ lib/
 └─ public/

backend/
 ├─ app/
 │   ├─ api/
 │   ├─ models/
 │   ├─ services/
 │   ├─ repositories/
 │   ├─ schemas/
 │   ├─ middleware/
 │   └─ utils/
 ├─ migrations/
 └─ tests/
```

---

## 4. 認証設計

認証方式はJWT認証を採用する。

### 認証フロー
1. ユーザーがログインAPIへアクセス
2. FastAPIが認証情報を検証
3. JWTアクセストークン発行
4. HttpOnly Cookieへ保存
5. APIアクセス時にJWT検証

### パスワード管理
- bcryptによるハッシュ化
- 平文保存禁止
- ワンタイムトークン方式採用

---

## 5. データベース設計

### usersテーブル
| カラム名 | 型 |
|---|---|
| id | UUID |
| email | varchar(255) |
| password_hash | text |
| name | varchar(100) |
| created_at | timestamp |
| updated_at | timestamp |

### petsテーブル
| カラム名 | 型 |
|---|---|
| id | UUID |
| user_id | UUID |
| name | varchar(100) |
| species | varchar(50) |
| gender | varchar(20) |
| weight | numeric |
| body_length | numeric |
| front_image_url | text |
| side_image_url | text |
| angle45_image_url | text |

### productsテーブル
| カラム名 | 型 |
|---|---|
| id | UUID |
| name | varchar(255) |
| description | text |
| price | integer |
| stock | integer |
| category_id | UUID |
| thumbnail_url | text |
| created_at | timestamp |

### ordersテーブル
| カラム名 | 型 |
|---|---|
| id | UUID |
| user_id | UUID |
| status | varchar(50) |
| total_price | integer |
| payment_status | varchar(50) |
| created_at | timestamp |

---

## 6. API設計

### 認証API
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/reset-password

### 商品API
- GET /api/products
- GET /api/products/{id}
- POST /api/products
- PUT /api/products/{id}
- DELETE /api/products/{id}

### 注文API
- POST /api/orders
- GET /api/orders/{id}
- GET /api/orders/history

### AI試着API
- POST /api/tryon/generate
- GET /api/tryon/history

---

## 7. AI試着機能設計

### 処理フロー
1. ペット画像アップロード
2. バリデーション
3. ストレージ保存
4. AI生成APIへ送信
5. 結果保存
6. フロントエンド表示

### 制限事項
- 最大生成枚数4枚
- 最大10MB
- PNG/JPEG/webp/heicのみ許可

---

## 8. ワッペンカスタマイズ設計

### 保存形式例

```json
{
  "patches": [
    {
      "patch_id": "uuid",
      "x": 120,
      "y": 240,
      "scale": 1.2
    }
  ]
}
```

### 実装方式
- HTML5 Canvas
- ドラッグ操作
- タッチイベント対応

---

## 9. 決済設計

決済にはKOMOJU APIを利用する。

### 処理フロー
1. 注文作成
2. 決済セッション生成
3. 決済URL返却
4. Webhook受信
5. 注文状態更新

### セキュリティ
- 署名検証
- 重複Webhook対策
- リトライ制御

---

## 10. 管理画面設計

### 管理機能
- 商品管理
- 在庫管理
- 注文管理
- 顧客管理
- 売上分析
- アクセス解析

### 権限
| 権限 | 内容 |
|---|---|
| admin | 全権限 |
| staff | 商品・注文管理 |

---

## 11. ログ・監視設計

### ログ
- APIアクセスログ
- 認証失敗ログ
- 決済ログ
- AI生成エラーログ

### 監視項目
- CPU使用率
- メモリ使用率
- ディスク容量
- APIレスポンス時間

---

## 12. セキュリティ設計

### セキュリティ対策
- CSRF対策
- XSS対策
- SQL Injection対策
- HTTPS強制
- JWT有効期限設定
- レート制限

### 画像保護
- 署名付きURL
- 拡張子検証
- アクセス制御

---

## 13. 非機能設計

### 性能要件
- 商品一覧API : 500ms以内
- モバイル優先設計
- ローディングアニメーション実装

### 可用性
- DBバックアップ
- 自動再起動

### 保守性
- OpenAPI自動生成
- Repositoryパターン採用

---

## 14. テスト設計

### 単体テスト
- API試験
- DB試験
- 認証試験

### 結合テスト
- 決済連携試験
- AI生成試験
- 注文試験

### E2E試験
- 商品購入
- ログイン
- カスタマイズ操作

---

## 15. デプロイ設計

### デプロイ手順
1. Git Pull
2. Frontend Build
3. Backend更新
4. Migration実行
5. systemd再起動

### 起動構成

```text
Caddy
 ├─ Next.js
 └─ FastAPI
```

---

## 16. 今後の拡張予定
- サブスクリプション対応
- SNS共有機能
- AIレコメンド
- 多言語対応
- スマホアプリ化
