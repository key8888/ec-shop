# 実行可能な実装計画書：星野のペット用品 ECサイト

> **対象読者:** 本計画書は、後続のプログラマー（AI）が唯一の参照情報として、ステップ1から順に実装を進められるように設計されている。
> **前提状態:** `docs/external_planning_doc.md` と `docs/internal_design_document_hoshino_pet_ec.md` が存在するのみ。ソースコードは一切存在しない。
> **補足テーブル:** 内部設計書に明記されていないが本計画で使用するテーブル（`categories`, `order_items`, `tryon_images`, `patches_config`）については各ステップで定義しない。

---

## フェーズ1: 環境構築

---

### ステップ1: バックエンドプロジェクトスキャフォールディング

- **目的:** FastAPIバックエンドのディレクトリ構造を作成し、依存関係を定義する。`uvicorn`でサーバーが起動できる状態にする。

- **実装内容:**
  1. `backend/pyproject.toml` を作成する。プロジェクト名は `hoshino-pet-ec-backend`、Python 3.13 を指定する。
  2. 以下の依存関係を全て `pyproject.toml` の `[project.dependencies]` に記述する:
     - `fastapi>=0.115.0`
     - `uvicorn[standard]>=0.34.0`
     - `sqlalchemy[asyncio]>=2.0.36`
     - `asyncpg>=0.30.0`
     - `alembic>=1.14.0`
     - `pydantic>=2.10.0`
     - `pydantic-settings>=2.6.0`
     - `python-jose[cryptography]>=3.3.0`
     - `passlib[bcrypt]>=1.7.4`
     - `bcrypt>=4.2.0`
     - `python-multipart>=0.0.18`
     - `httpx>=0.28.0`
     - `pytest>=8.0.0`
     - `pytest-asyncio>=0.24.0`
     - `httpx>=0.28.0`（テスト用）
  3. `[project.optional-dependencies]` に `dev = ["pytest", "pytest-asyncio", "httpx"]` を追加する。
  4. `backend/app/__init__.py` を空ファイルとして作成する。
  5. `backend/app/main.py` を作成し、FastAPI アプリケーションインスタンスと、`/" で `{"status": "ok"}` を返す最低限のヘルスチェックエンドポイントを実装する。
  6. 以下の空ディレクトリを作成する（各ディレクトリに `__init__.py` を配置する）:
     - `backend/app/api/`
     - `backend/app/models/`
     - `backend/app/services/`
     - `backend/app/repositories/`
     - `backend/app/schemas/`
     - `backend/app/middleware/`
     - `backend/app/utils/`
     - `backend/migrations/`
     - `backend/tests/`
  7. `backend/.env.example` を作成し、以下のプレースホルダーを記述する:
     ```
     DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/hoshino_pet_ec
     SECRET_KEY=change-me-to-a-random-secret-key
     KOMOJU_PUBLIC_KEY=pk_test_dummy_123456789
     KOMOJU_SECRET_KEY=sk_test_dummy_987654321
     AI_API_KEY=dummy_api_key_for_mock
     ```
  8. `python -m venv .venv` で仮想環境を作成し、`pip install -e ".[dev]"` で依存関係をインストールする。

- **注意点:**
  - `pyproject.toml` には `[build-system]` セクション（`setuptools` または `hatchling`）を必ず含める。
  - `.venv/` は `.gitignore` に既に含まれているので問題ない。
  - FastAPI の `lifespan` パラメータはまだ実装しない（後のステップで追加）。

- **完了条件（テスト）:**
  ```bash
  cd backend && pip install -e ".[dev]" && uvicorn app.main:app --port 8000 &
  curl http://localhost:8000/
  # → {"status": "ok"} が返ることを確認
  kill %1
  ```

---

### ステップ2: フロントエンドプロジェクト作成

- **目的:** Next.js フロントエンドのプロジェクトを初期化し、開発サーバーが起動できる状態にする。

- **実装内容:**
  1. `frontend/` ディレクトリで `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` を実行する。ただし `tailwind` フラグは使わず（Vanilla CSS の方針）、代わりに `--no-tailwind` で作成する。プロンプトには全てデフォルト回答する。
  2. または手動で `frontend/package.json` を作成し、以下を依存関係に含める:
     - `next@15`（latest stable）
     - `react@19`
     - `react-dom@19`
     - `typescript`
     - `@types/react`
     - `@types/node`
     - `eslint`
     - `eslint-config-next`
  3. `npm install` を実行する。
  4. 内部設計書に従い、以下のディレクトリを作成する:
     - `frontend/components/`
     - `frontend/features/`
     - `frontend/styles/`
     - `frontend/lib/`
     - `frontend/public/`
  5. `frontend/styles/globals.css` を作成し、白・ゴールド・ネイビーのベースカラー変数を定義する:
     - `--color-white: #ffffff`
     - `--color-gold: #c9a84c`
     - `--color-navy: #1a2a3a`
     - `--color-light-gray: #f5f5f5`
     - `--color-text: #333333`
  6. `frontend/app/layout.tsx` を編集し、`globals.css` をインポートし、`<html>` と `<body>` の基本的なレイアウト（子要素の `{children}` レンダリングのみ）を実装する。
  7. `frontend/app/page.tsx` を編集し、トップページに「星野のペット用品」と表示する最低限のコンテンツを実装する。
  8. `frontend/tsconfig.json` に `"@/*": ["./src/*"]` のパスエイリアスが設定されていることを確認する。設定されていない場合は追加する。

- **注意点:**
  - `create-next-app` を使う場合、`--src-dir` は使わない（内部設計書のディレクトリ構成が `app/` を直下に置く前提のため）。実際には `frontend/app/` が直下にある構成をとる。
  - ESLint の設定はデフォルトのままとする。
  - Tailwind CSS は使用しない。Vanilla CSS で統一する。

- **完了条件（テスト）:**
  ```bash
  cd frontend && npm install && npm run dev &
  curl http://localhost:3000/
  # → HTML が返り、"星野のペット用品" の文字列が含まれていることを確認
  kill %1
  ```

---

### ステップ3: Docker Compose による開発環境構築

- **目的:** PostgreSQL コンテナと管理ツール（pgAdmin もしくは Adminer）を Docker Compose で起動できるようにする。

- **実装内容:**
  1. プロジェクトルートに `docker-compose.yml` を作成する。
  2. 以下のサービスを定義する:
     - **`db` サービス:**
       - イメージ: `postgres:16-alpine`
       - 環境変数: `POSTGRES_USER=user`, `POSTGRES_PASSWORD=password`, `POSTGRES_DB=hoshino_pet_ec`
       - ポート: `5432:5432`
       - ボリューム: `pgdata:/var/lib/postgresql/data`
       - healthcheck を設定する（`pg_isready -U user -d hoshino_pet_ec`）
     - **`adminer` サービス:**
       - イメージ: `adminer:latest`
       - ポート: `8080:8080`
       - `db` サービスに依存（`depends_on`）
  3. ボリューム `pgdata` をトップレベルで定義する。
  4. プロジェクトルートに `.env` ファイルを作成し、`.env.example` からコピーした値を設定する（DB 接続文字列は `postgresql+asyncpg://user:password@localhost:5432/hoshino_pet_ec` に変更）。
  5. `.env` は既に `.gitignore` に含まれていることを確認する。
  6. `docker compose up -d` で起動し、`docker compose ps` で両コンテナが `healthy` / `running` であることを確認する。

- **注意点:**
  - `POSTGRES_USER`, `POSTGRES_PASSWORD` は開発用の固定値で構わない。本番では変更すること。
  - アプリケーションコードからは localhost:5432 でアクセスする想定。
  - `.env` ファイルは `.gitignore` 対象だが、開発環境用にルートに配置する。

- **完了条件（テスト）:**
  ```bash
  docker compose up -d
  docker compose ps
  # → db が healthy、adminer が running の状態を確認
  psql -h localhost -U user -d hoshino_pet_ec -c "SELECT 1"
  # → 1 が返ることを確認（パスワード入力が必要なら PGPASSWORD=password を指定）
  ```

---

## フェーズ2: データベース定義

---

### ステップ4: SQLAlchemy モデル定義

- **目的:** 全てのデータベーステーブルに対応する SQLAlchemy モデルを定義する。

- **実装内容:**
  1. `backend/app/models/__init__.py` を作成し、全モデルをインポートして `Base.metadata` に反映させる。
  2. `backend/app/config.py` を作成する:
     - `pydantic-settings` の `BaseSettings` を継承した `Settings` クラスを定義する。
     - フィールド: `DATABASE_URL`, `SECRET_KEY`, `KOMOJU_PUBLIC_KEY`, `KOMOJU_SECRET_KEY`, `AI_API_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES=30`（デフォルト値）
     - `model_config = SettingsConfigDict(env_file=".env")` を設定する。
     - モジュールレベルで `settings = Settings()` をインスタンス化する。
  3. `backend/app/models/base.py` を作成する:
     - `from sqlalchemy.orm import DeclarativeBase` で `Base` クラスを定義する。
     - `Base` に共通の `id`（UUID, primary_key, default=`uuid.uuid4`）と `created_at`, `updated_at`（server_default / onupdate）を含めるための Mixin クラス `TimestampMixin` を定義する。
  4. `backend/app/models/user.py` を作成する:
     - テーブル名: `users`
     - カラム: `id`（UUID, PK）, `email`（varchar(255), unique, nullable=False）, `password_hash`（Text, nullable=False）, `name`（varchar(100), nullable=False）, `role`（varchar(20), default=`"customer"`）, `created_at`（DateTime, server_default=func.now()）, `updated_at`（DateTime, onupdate=func.now()）
     - `orders` への one-to-many リレーションシップを定義する。
     - `pets` への one-to-many リレーションシップを定義する。
  5. `backend/app/models/pet.py` を作成する:
     - テーブル名: `pets`
     - カラム: `id`（UUID, PK）, `user_id`（UUID, FK->users.id, NOT NULL）, `name`（varchar(100)）, `species`（varchar(50)）, `gender`（varchar(20)）, `weight`（Numeric(5,2)）, `body_length`（Numeric(5,2)）, `front_image_url`（Text）, `side_image_url`（Text）, `angle45_image_url`（Text）
     - `user` への many-to-one リレーションシップを定義する。
  6. `backend/app/models/category.py` を作成する（内部設計書にテーブル定義はないが、`products.category_id` から参照されるため必要）:
     - テーブル名: `categories`
     - カラム: `id`（UUID, PK）, `name`（varchar(100), unique）, `description`（Text, nullable）, `created_at`（DateTime）
  7. `backend/app/models/product.py` を作成する:
     - テーブル名: `products`
     - カラム: `id`（UUID, PK）, `name`（varchar(255)）, `description`（Text）, `price`（Integer）, `stock`（Integer, default=0）, `category_id`（UUID, FK->categories.id, nullable）, `thumbnail_url`（Text）, `created_at`（DateTime）
     - `category` への many-to-one リレーションシップを定義する。
  8. `backend/app/models/order.py` を作成する:
     - テーブル名: `orders`
     - カラム: `id`（UUID, PK）, `user_id`（UUID, FK->users.id）, `status`（varchar(50), default=`"pending"`）, `total_price`（Integer）, `payment_status`（varchar(50), default=`"unpaid"`）, `komoju_session_id`（varchar(255), nullable）, `patches_config`（JSON, nullable）… 注文全体としてのワッペンカスタムデータ（参考設計書記載のJSON形式）, `created_at`（DateTime）
     - テーブル名: `order_items`
     - カラム: `id`（UUID, PK）, `order_id`（UUID, FK->orders.id）, `product_id`（UUID, FK->products.id）, `quantity`（Integer, default=1）, `unit_price`（Integer）, `patches_config`（JSON, nullable）… 商品単位のワッペンカスタムデータ
     - `order` への many-to-one, `product` への many-to-one リレーションシップを定義する。
  9. `backend/app/models/tryon.py` を作成する:
     - テーブル名: `tryon_images`
     - カラム: `id`（UUID, PK）, `user_id`（UUID, FK->users.id）, `pet_id`（UUID, FK->pets.id, nullable）, `product_id`（UUID, FK->products.id）, `image_url`（Text）, `angle`（varchar(20), default=`"angle45"`）, `created_at`（DateTime）
     - `user`, `pet`, `product` へのリレーションシップを定義する。

- **注意点:**
  - `TimestampMixin` により全てのモデルに `id`, `created_at`, `updated_at` を付与する。
  - 全てのモデルで `__tablename__` を明示的に指定する。
  - `relationship` の `back_populates` を双方向に設定する。
  - 外部キー制約には `ondelete="CASCADE"` を適切に設定する（例: `order_items.order_id → orders.id` は CASCADE, `tryon_images.user_id → users.id` は CASCADE）。

- **完了条件（テスト）:**
  ```bash
  cd backend && python -c "
  from app.models import Base
  from app.config import settings
  print('Models loaded successfully')
  print('Tables:', list(Base.metadata.tables.keys()))
  "
  # → 全てのテーブル名が出力されること（users, pets, categories, products, orders, order_items, tryon_images）
  ```

---

### ステップ5: Alembic マイグレーション生成と適用

- **目的:** Alembic を初期化し、ステップ4で定義したモデルから初期マイグレーションを自動生成し、PostgreSQL にテーブルを作成する。

- **実装内容:**
  1. `backend/alembic.ini` を作成する（`alembic init alembic` 相当の内容を手動または CLI で生成する）。
  2. `backend/migrations/env.py` を編集する:
     - `from app.models import Base` と `from app.config import settings` をインポートする。
     - `target_metadata = Base.metadata` を設定する。
     - `sqlalchemy.url` を `settings.DATABASE_URL` から動的に取得するように変更する（同期ドライバ `psycopg2` がなくてもエラーにならないように注意。実際の migration ラン時は `asyncpg` ではなく同期ドライバが必要なため。.env の `DATABASE_URL` を参照して同期用に変換するロジックを入れるか、`alembic.ini` に直接同期用URLを指定する）。
  3. 同期ドライバ `psycopg2-binary` を `pyproject.toml` の依存関係に追加する（alembic は同期ドライバで動作するため）。
  4. `alembic stamp head` 相当は不要。代わりに `alembic revision --autogenerate -m "initial"` でマイグレーションファイルを生成する。
  5. 生成されたマイグレーションスクリプトを確認し、全てのテーブルが正しく定義されていることを目視確認する。
  6. `alembic upgrade head` を実行してマイグレーションを適用する。
  7. `docker compose exec db psql -U user -d hoshino_pet_ec -c '\dt'` でテーブル一覧を確認する。

- **注意点:**
  - **重要:** Alembic は同期ドライバを必要とする。`.env` の `DATABASE_URL` は非同期用 (`postgresql+asyncpg://...`) だが、alembic 実行時は同期用 (`postgresql://...`) に変換する必要がある。`migrations/env.py` 内で文字列置換して同期URLを生成するロジックを実装する。
  - または、`alembic.ini` に直接同期用の接続文字列をハードコード（開発環境のみ）してもよいが、環境差異を避けるために env.py 内で変換する方式を推奨する。
  - 初回マイグレーション後にモデルを変更した場合も同様の手順で `revision --autogenerate` → `upgrade head` を行う。

- **完了条件（テスト）:**
  ```bash
  cd backend && alembic upgrade head
  docker compose exec db psql -U user -d hoshino_pet_ec -c '\dt'
  # → users, pets, categories, products, orders, order_items, tryon_images の 7 テーブルが存在することを確認
  ```

---

### ステップ6: Pydantic スキーマ定義

- **目的:** 全 API エンドポイントで使用するリクエスト/レスポンス用の Pydantic スキーマを定義する。

- **実装内容:**
  1. `backend/app/schemas/__init__.py` を作成し、全スキーマをエクスポートする。
  2. `backend/app/schemas/auth.py`:
     - `RegisterRequest`: `email`（EmailStr）, `password`（str, min_length=8）, `name`（str）
     - `LoginRequest`: `email`（EmailStr）, `password`（str）
     - `TokenResponse`: `access_token`（str）, `token_type`（str = "bearer"）
     - `UserResponse`: `id`（UUID）, `email`（str）, `name`（str）, `role`（str）, `created_at`（datetime）
  3. `backend/app/schemas/product.py`:
     - `ProductCreate`: `name`, `description`, `price`（int > 0）, `stock`（int >= 0）, `category_id`（UUID, optional）, `thumbnail_url`（optional）
     - `ProductUpdate`: 全フィールド Optional
     - `ProductResponse`: 全カラム + `id`, `created_at`
     - `ProductListResponse`: `items`（list[ProductResponse]）, `total`（int）, `page`（int）, `per_page`（int）
  4. `backend/app/schemas/category.py`:
     - `CategoryCreate`: `name`, `description`（optional）
     - `CategoryResponse`: `id`, `name`, `description`
  5. `backend/app/schemas/order.py`:
     - `OrderItemInput`: `product_id`（UUID）, `quantity`（int >= 1）, `patches_config`（Optional[dict]）
     - `OrderCreate`: `items`（list[OrderItemInput]）
     - `OrderResponse`: 全注文カラム + `items`（list[OrderItemResponse]）
     - `OrderItemResponse`: `product_id`, `product_name`, `quantity`, `unit_price`, `patches_config`
     - `OrderHistoryResponse`: `items`（list[OrderResponse]）, `total`, `page`, `per_page`
     - `PaymentSessionResponse`: `payment_url`（str）
  6. `backend/app/schemas/pet.py`:
     - `PetCreate`: `name`, `species`, `gender`, `weight`（Optional[float]）, `body_length`（Optional[float]）
     - `PetResponse`: 全カラム
     - `PetImageUploadResponse`: `image_url`（str）
  7. `backend/app/schemas/tryon.py`:
     - `TryOnRequest`: `pet_id`（UUID）, `product_id`（UUID）, `angle`（Optional[str] = "angle45"）
     - `TryOnResponse`: `id`（UUID）, `image_url`（str）, `angle`, `created_at`
     - `TryOnHistoryResponse`: `items`（list[TryOnResponse]）
  8. 必要に応じて `backend/app/schemas/common.py`:
     - `PaginationParams`: `page`（int = 1, ge=1）, `per_page`（int = 20, ge=1, le=100）

- **注意点:**
  - 全てのレスポンススキーマは `model_config = {"from_attributes": True}` を設定し、ORM モードを有効にする。
  - `email` フィールドには `pydantic` の `EmailStr` を使用するため、`pydantic[email]` または `email-validator` のインストールが必要。`pyproject.toml` に `email-validator>=2.0.0` を追加する。
  - バリデーションロジック（例: 価格が正であること）はスキーマの `field_validator` で記述する。

- **完了条件（テスト）:**
  ```bash
  cd backend && python -c "
  from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
  from app.schemas.product import ProductCreate, ProductResponse
  from app.schemas.order import OrderCreate, OrderResponse
  from app.schemas.pet import PetCreate
  from app.schemas.tryon import TryOnRequest, TryOnResponse
  print('All schemas imported successfully')
  "
  # → エラーなくインポートできることを確認
  ```

---

## フェーズ3: コアロジック

---

### ステップ7: データベース接続と設定管理

- **目的:** FastAPI アプリケーションが PostgreSQL に接続し、リクエストごとにセッションを取得できる非同期データベース接続基盤を構築する。

- **実装内容:**
  1. `backend/app/database.py` を作成する:
     - SQLAlchemy の `create_async_engine` でエンジンを作成する（`settings.DATABASE_URL` を使用）。
     - `async_sessionmaker` で `AsyncSession` のファクトリ `AsyncSessionLocal` を作成する。
     - `async def get_db()` の非同期ジェネレータ関数を定義する:
       - `async with AsyncSessionLocal() as session:` でセッションを取得し、`yield session` する。
       - FastAPI の `Depends` で使用することを意図する。
     - エンジン作成時の設定: `echo=False`（本番）、`pool_size=10`, `max_overflow=20`
  2. `backend/app/main.py` を編集する:
     - `from app.database import get_db` をインポートする（まだ使用しなくてもよい）。
     - `lifespan` コンテキストマネージャを実装する（現時点では何もしない `yield` のみでも可。ただし後の `startup` / `shutdown` イベント追加に備えて引数で受け取れるようにしておく）。
     - ヘルスチェックエンドポイントの動作はそのまま維持する。
  3. 動作確認用に `backend/tests/conftest.py` を作成する（後で使用するための準備）:
     - `pytest_asyncio` の設定
     - `async def override_get_db()` でテスト用の `AsyncSession` を差し替えられるようにする。

- **注意点:**
  - `create_async_engine` を使用するため、`DATABASE_URL` は `postgresql+asyncpg://` スキームである必要がある。
  - `get_db` ジェネレータは `@asynccontextmanager` ではなく `async_generator` として定義する（FastAPI の `Depends` で正しく動作させるため）。

- **完了条件（テスト）:**
  ```bash
  cd backend && python -c "
  import asyncio
  from app.database import AsyncSessionLocal
  from sqlalchemy import text
  
  async def test():
      async with AsyncSessionLocal() as session:
          result = await session.execute(text('SELECT 1'))
          print('Connection OK:', result.scalar())
  
  asyncio.run(test())
  "
  # → "Connection OK: 1" と表示されること
  ```

---

### ステップ8: リポジトリ層の実装

- **目的:** データアクセスを抽象化するリポジトリパターンを実装する。全エンティティの CRUD 操作をリポジトリ経由で行えるようにする。

- **実装内容:**
  1. `backend/app/repositories/__init__.py` を作成する。
  2. `backend/app/repositories/base.py` を作成する:
     - ジェネリクスを使った `BaseRepository[ModelT]` クラスを定義する。
     - コンストラクタ `__init__(self, session: AsyncSession)` でセッションを受け取る。
     - 共通メソッド:
       - `async def get(self, id: UUID) -> ModelT | None`
       - `async def list(self, skip: int = 0, limit: int = 20) -> list[ModelT]`
       - `async def add(self, instance: ModelT) -> ModelT`
       - `async def update(self, instance: ModelT) -> ModelT`
       - `async def delete(self, instance: ModelT) -> None`
     - `add` と `update` の内部で `session.commit()` は呼ばず、呼び出し側の責務とする（Unit of Work パターンに準拠）。
  3. `backend/app/repositories/user_repository.py`:
     - `UserRepository(BaseRepository[User])` を定義する。
     - `async def get_by_email(self, email: str) -> User | None`
  4. `backend/app/repositories/product_repository.py`:
     - `ProductRepository(BaseRepository[Product])` を定義する。
     - `async def list_by_category(self, category_id: UUID) -> list[Product]`
     - `async def search(self, keyword: str) -> list[Product]`（`ilike` を使用）
  5. `backend/app/repositories/order_repository.py`:
     - `OrderRepository(BaseRepository[Order])` を定義する。
     - `async def get_by_user(self, user_id: UUID) -> list[Order]`
  6. `backend/app/repositories/pet_repository.py`:
     - `PetRepository(BaseRepository[Pet])` を定義する。
     - `async def get_by_user(self, user_id: UUID) -> list[Pet]`

- **注意点:**
  - 各リポジトリは `BaseRepository` を継承し、エンティティ固有のクエリメソッドのみを追加する。
  - トランザクション管理はサービス層の責務とする。リポジトリ内で `commit` や `rollback` は行わない。
  - `ModelT` の型変数には `from typing import TypeVar` を使用する。境界値は `TypeVar("ModelT", bound=Base)`。

- **完了条件（テスト）:**
  ```bash
  cd backend && python -c "
  from app.repositories.base import BaseRepository
  from app.repositories.user_repository import UserRepository
  from app.repositories.product_repository import ProductRepository
  from app.repositories.order_repository import OrderRepository
  from app.repositories.pet_repository import PetRepository
  print('All repositories imported successfully')
  "
  # → エラーなくインポートできることを確認
  ```

---

### ステップ9: 認証サービスの実装

- **目的:** JWT トークン発行/検証、パスワードハッシュ化、ユーザー登録・ログインのビジネスロジックを実装する。

- **実装内容:**
  1. `backend/app/utils/__init__.py` を作成する。
  2. `backend/app/utils/security.py` を作成する:
     - `hash_password(password: str) -> str`: `passlib.context.CryptContext(schemes=["bcrypt"])` を使用。
     - `verify_password(plain: str, hashed: str) -> bool`
     - `create_access_token(data: dict, expires_delta: timedelta | None = None) -> str`: `jose.jwt.encode` を使用。ペイロードに `sub`（ユーザーID文字列）, `exp`（有効期限）, `iat`（発行時刻）を含める。秘密鍵は `settings.SECRET_KEY`、アルゴリズムは `HS256`。
     - `decode_access_token(token: str) -> dict | None`: デコードしてペイロードを返す。期限切れや不正なトークンの場合は `None` を返す（例外は握りつぶす）。
  3. `backend/app/services/__init__.py` を作成する。
  4. `backend/app/services/auth_service.py` を作成する:
     - `AuthService` クラスを定義する（コンストラクタで `UserRepository` と `AsyncSession` を受け取る）。
     - `async def register(self, req: RegisterRequest) -> UserResponse`:
       1. メールアドレスの重複チェック（存在すれば `HTTPException(409)`）
       2. パスワードをハッシュ化
       3. ユーザーを作成して `session.add()` + `session.commit()`
       4. `UserResponse` を返す
     - `async def login(self, req: LoginRequest) -> TokenResponse`:
       1. メールアドレスでユーザーを検索（なければ `HTTPException(401)`）
       2. パスワード検証（失敗なら `HTTPException(401)`）
       3. JWT アクセストークンを生成
       4. `TokenResponse` を返す
     - `async def get_current_user(self, token: str) -> User`:
       1. `decode_access_token` で検証
       2. ユーザーID からユーザーを取得（存在しなければ `HTTPException(401)`）
     - `async def reset_password(self, email: str, new_password: str) -> None`:
       1. ユーザー検索
       2. パスワードハッシュ化して更新
       3. `session.commit()`

- **注意点:**
  - パスワードリセットは簡易実装とし、メール送信は行わず直接新しいパスワードを受け付ける（MVP フェーズのため）。後でトークンベースのリセットフローに置き換える想定。
  - `HTTPException` は `fastapi` からインポートする。

- **完了条件（テスト）:**
  ```bash
  cd backend && python -c "
  from app.utils.security import hash_password, verify_password, create_access_token, decode_access_token
  
  # パスワードハッシュ検証
  hashed = hash_password('testpass123')
  assert verify_password('testpass123', hashed), 'Password verification failed'
  assert not verify_password('wrongpass', hashed), 'Wrong password should not verify'
  
  # JWT トークン検証
  token = create_access_token({'sub': 'test-user-id'})
  payload = decode_access_token(token)
  assert payload['sub'] == 'test-user-id', 'Token decode failed'
  
  print('Security utilities verified successfully')
  "
  # → "Security utilities verified successfully" と表示されること
  ```

---

### ステップ10: 商品・カテゴリサービスの実装

- **目的:** 商品とカテゴリの CRUD ビジネスロジックを実装する。

- **実装内容:**
  1. `backend/app/services/product_service.py` を作成する:
     - `ProductService` クラス（コンストラクタで `ProductRepository`, `AsyncSession` を受け取る）
     - `async def create(self, data: ProductCreate) -> ProductResponse`:
       1. `Product` モデルインスタンスを作成
       2. `repo.add(product)`
       3. `session.commit()`
       4. `ProductResponse` を返す
     - `async def get(self, product_id: UUID) -> ProductResponse`:
       - 存在しない場合は `HTTPException(404)`
     - `async def list(self, page: int, per_page: int, category_id: UUID | None = None, keyword: str | None = None) -> ProductListResponse`:
       - ページネーション付きで商品一覧を返す
       - カテゴリフィルタ・キーワード検索に対応
     - `async def update(self, product_id: UUID, data: ProductUpdate) -> ProductResponse`
     - `async def delete(self, product_id: UUID) -> None`（存在しない場合は 404）
  2. `backend/app/services/category_service.py` を作成する:
     - `CategoryService` クラス
     - `async def create`, `async def list`, `async def delete` を実装する（上記と同様のパターン）。

- **注意点:**
  - 商品削除は論理削除ではなく物理削除とする（内部設計書に論理削除の指定があるが、MVP では物理削除でよい。後で `is_active` カラムを追加する場合に備えてもよい）。
  - 在庫管理: `create` 時や `update` 時に在庫がマイナスにならないバリデーションを入れる。

- **完了条件（テスト）:**
  ```bash
  cd backend && python -c "
  from app.services.product_service import ProductService
  from app.services.category_service import CategoryService
  print('Product and Category services imported successfully')
  "
  ```

---

### ステップ11: 注文・決済サービスの実装

- **目的:** 注文作成、KOMOJU 決済連携（モック）、Webhook 処理のビジネスロジックを実装する。

- **実装内容:**
  1. `backend/app/services/order_service.py` を作成する:
     - `OrderService` クラス（コンストラクタで `OrderRepository`, `ProductRepository`, `AsyncSession` を受け取る）
     - `async def create_order(self, user_id: UUID, data: OrderCreate) -> OrderResponse`:
       1. 各 `OrderItemInput` について商品の存在確認と在庫チェック
       2. 在庫を減少させる
       3. `Order` + `OrderItem` を作成し、合計金額を計算
       4. `session.add_all()` + `session.commit()`
       5. `OrderResponse` を返す
     - `async def get_order(self, order_id: UUID, user_id: UUID) -> OrderResponse`:
       - 他人の注文は参照不可（`user_id` が一致しなければ 403）
     - `async def get_order_history(self, user_id: UUID, page: int, per_page: int) -> OrderHistoryResponse`
     - `async def create_payment_session(self, order_id: UUID) -> PaymentSessionResponse`:
       1. 注文の存在確認・ステータス検証
       2. KOMOJU API を呼び出して支払いセッションを作成する（モック実装）
       3. 生成された `payment_url` を返す
     - `async def handle_webhook(self, payload: dict) -> None`:
       1. 署名検証（モックではスキップ可能）
       2. `komoju_session_id` で注文を特定
       3. `payment_status` と `status` を更新
  2. `backend/app/services/payment_service.py` を作成する:
     - `PaymentService` クラス
     - `async def create_session(self, order: Order, amount: int) -> dict`:
       - モック実装: `settings.KOMOJU_SECRET_KEY` を使用して `httpx` で `https://api.komoju.com/v1/sessions` に POST する。ただし実際の API には接続できないため、`httpx` の呼び出し部分は `try-except` でラップし、失敗時は以下のモックレスポンスを返す:
         ```python
         return {
             "id": f"sandbox_session_{order.id}",
             "payment_url": f"https://sandbox.komoju.com/sessions/sandbox_session_{order.id}",
             "status": "pending"
         }
         ```
       - 本番環境では実際の API を呼び出すようコメントで記述する。
     - `async def verify_webhook_signature(self, payload: bytes, signature: str) -> bool`:
       - モック: 常に `True` を返す。

- **注意点:**
  - 在庫処理と注文作成は同一トランザクション内で行う。途中でエラーが発生した場合は `session.rollback()` して在庫を元に戻す。
  - KOMOJU のモック実装はダミーキーを使用する。実際の API キーは `.env` から取得する。
  - Webhook の重複防止: `handle_webhook` 内で `payment_status` が既に `paid` の場合は早期リターンする。

- **完了条件（テスト）:**
  ```bash
  cd backend && python -c "
  from app.services.order_service import OrderService
  from app.services.payment_service import PaymentService
  print('Order and Payment services imported successfully')
  "
  ```

---

### ステップ12: ペット・AI試着サービスの実装

- **目的:** ペット情報管理と AI 試着画像生成（モック）のビジネスロジックを実装する。

- **実装内容:**
  1. `backend/app/services/pet_service.py` を作成する:
     - `PetService` クラス（`PetRepository`, `AsyncSession` を受け取る）
     - `async def create_pet(self, user_id: UUID, data: PetCreate) -> PetResponse`
     - `async def get_pets(self, user_id: UUID) -> list[PetResponse]`
     - `async def update_pet(self, pet_id: UUID, user_id: UUID, data: PetCreate) -> PetResponse`
     - `async def delete_pet(self, pet_id: UUID, user_id: UUID) -> None`
     - `async def upload_pet_image(self, pet_id: UUID, user_id: UUID, angle: str, image: UploadFile) -> PetImageUploadResponse`:
       1. バリデーション: ファイルサイズ 10MB 以下、許可拡張子（png/jpg/jpeg/webp/heic）
       2. 画像をローカルストレージ（`backend/uploads/pets/`）またはモック URL として保存
       3. 対応する `pet.{angle}_image_url` を更新
       4. `session.commit()`
  2. `backend/app/services/tryon_service.py` を作成する:
     - `TryOnService` クラス（`AsyncSession` を受け取る）
     - `async def generate(self, user_id: UUID, request: TryOnRequest) -> TryOnResponse`:
       1. ペット・商品の存在確認
       2. 最大生成枚数（4枚）チェック: ユーザーの既存生成数をカウント
       3. 外部 AI API を呼び出す… モック実装: 固定のダミー画像 URL（`https://via.placeholder.com/512?text=TryOn+{angle}`）を返す
       4. `TryonImage` レコードを作成して保存
       5. `session.commit()`
       6. `TryOnResponse` を返す
     - `async def generate_additional(self, user_id: UUID, pet_id: UUID, product_id: UUID, angles: list[str]) -> list[TryOnResponse]`:
       - 複数角度（正面、横）を一括生成。既存枚数 + 要求枚数が 4 を超えないことをチェック。
     - `async def get_history(self, user_id: UUID) -> list[TryOnResponse]`
  3. `backend/app/utils/file_upload.py` を作成する:
     - `validate_image(file: UploadFile) -> bool`: サイズ・拡張子チェック
     - `save_image(file: UploadFile, subdir: str) -> str`: ファイルを保存し、保存パスを返す。MVP ではローカル保存（`backend/uploads/`）とし、後で S3 等に変更可能なように `image_url` は相対パスで保存する。

- **注意点:**
  - AI 画像生成 API のモックは `settings.AI_API_KEY` を参照するが、実際の HTTP リクエストは行わない。代わりに疑似 URL を生成する。
  - アップロードディレクトリ `backend/uploads/pets/` と `backend/uploads/tryon/` はコード実行時に自動生成する（`os.makedirs(exist_ok=True)`）。
  - ファイル名は UUID ベースで一意にする（`uuid.uuid4().hex + ext`）。

- **完了条件（テスト）:**
  ```bash
  cd backend && python -c "
  from app.services.pet_service import PetService
  from app.services.tryon_service import TryOnService
  from app.utils.file_upload import validate_image, save_image
  print('Pet, TryOn services and file utils imported successfully')
  "
  ```

---

### ステップ13: ミドルウェア実装

- **目的:** JWT 認証依存性、CORS、リクエストロギング、レート制限の各ミドルウェアを実装する。

- **実装内容:**
  1. `backend/app/middleware/__init__.py` を作成する。
  2. `backend/app/middleware/auth.py`:
     - `async def get_current_user(request: Request) -> User`:
       - FastAPI の `Depends` として使用する。
       - `request.cookies` から `access_token` を取得する。
       - なければ `Authorization: Bearer <token>` ヘッダーから取得する（フォールバック）。
       - `AuthService.get_current_user` を呼び出す。
     - `async def require_admin(current_user: User = Depends(get_current_user)) -> User`:
       - `current_user.role` が `admin` または `staff` でなければ `HTTPException(403)`
  3. `backend/app/middleware/logging.py`:
     - FastAPI の `Middleware` クラスまたは `@app.middleware("http")` として実装する。
     - リクエストの `method`, `path`, `status_code`, `processing_time` をログ出力する。
     - Python 標準の `logging` モジュールを使用する（構造化ログではなくプレインテキストでよい）。
  4. `backend/app/main.py` を編集し、以下を追加する:
     - `from fastapi.middleware.cors import CORSMiddleware` をインポートし、`app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])` を設定する。
     - ロギングミドルウェアを `app.middleware("http")` で登録する。
     - 各ルーターを `app.include_router` で登録する準備をする（実際のルーターは後のステップで実装）。
  5. `backend/app/middleware/rate_limit.py`:
     - 簡易的なインメモリレート制限を実装する（`dict` で IP アドレスごとのリクエスト回数を管理）。
     - 注意: 分散環境では使えない。本番では Redis 等を使用する想定であることをコメントに記述する。
     - デフォルト制限: 1分間に60リクエスト。

- **注意点:**
  - `get_current_user` は全ての認証が必要なエンドポイントで `Depends(get_current_user)` として使用する。認証が不要なエンドポイント（ログイン、登録、商品一覧など）では使用しない。
  - CORS の `allow_origins` は開発環境用に `http://localhost:3000` を許可する。本番では実際のドメインに変更する。
  - レート制限はメモリリークを防ぐため、定期的に古いエントリをクリーンアップする仕組みを入れる。

- **完了条件（テスト）:**
  ```bash
  cd backend && python -c "
  from app.middleware.auth import get_current_user, require_admin
  from app.middleware.logging import setup_logging
  from app.middleware.rate_limit import RateLimiter
  print('All middleware imported successfully')
  "
  ```

---

## フェーズ4: API/インターフェース

---

### ステップ14: 認証APIエンドポイント

- **目的:** ユーザー登録、ログイン、ログアウト、パスワードリセットの REST API エンドポイントを実装する。

- **実装内容:**
  1. `backend/app/api/__init__.py` を作成する。
  2. `backend/app/api/router.py` を作成し、全ルーターを集約する:
     - `api_router = APIRouter(prefix="/api")`
     - 各サブルーターを `api_router.include_router(auth_router, prefix="/auth")` のように追加する。
     - `app.include_router(api_router)` を `main.py` で呼び出す。
  3. `backend/app/api/auth.py` を作成する:
     - `router = APIRouter(tags=["auth"])`
     - `POST /api/auth/register`:
       - `Request: RegisterRequest`, `Response: UserResponse`
       - `AuthService.register()` を呼び出す。
       - ステータスコード: 201
     - `POST /api/auth/login`:
       - `Request: LoginRequest`, `Response: TokenResponse`
       - ログイン成功時に `Set-Cookie: access_token=<token>; HttpOnly; Secure; Path=/; Max-Age=1800` をレスポンスヘッダーに設定する（開発環境では `Secure` を付けない）。
       - `AuthService.login()` を呼び出す。
     - `POST /api/auth/logout`:
       - `Set-Cookie: access_token=; HttpOnly; Path=/; Max-Age=0` でクッキーを削除する。
       - 認証必須（`Depends(get_current_user)`）
     - `POST /api/auth/reset-password`:
       - `Request Body: {"email": str, "new_password": str}`
       - `AuthService.reset_password()` を呼び出す。
  4. `backend/app/main.py` を編集し、`app.include_router(api_router)` を追加する。

- **注意点:**
  - `Set-Cookie` は FastAPI の `Response` オブジェクトに直接設定する。または `response.set_cookie()` を使用する。
  - パスワードリセットは簡易実装。認証なしでパスワードを変更できる状態だが、MVP では許容する（外部計画書に「パスワードリセット」の記載はあるが具体的な方式の指定はない）。

- **完了条件（テスト）:**
  ```bash
  cd backend && uvicorn app.main:app --port 8000 &
  # ユーザー登録
  curl -s -X POST http://localhost:8000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123","name":"テスト太郎"}'
  # → 201 と UserResponse が返る
  # ログイン
  curl -s -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123"}'
  # → 200 と TokenResponse + Set-Cookie が返る
  kill %1
  ```

---

### ステップ15: 商品APIエンドポイント

- **目的:** 商品の CRUD とカテゴリ管理の REST API エンドポイントを実装する。

- **実装内容:**
  1. `backend/app/api/products.py` を作成する:
     - `router = APIRouter(prefix="/products", tags=["products"])`
     - `GET /api/products`:
       - クエリパラメータ: `page`（int, default=1）, `per_page`（int, default=20）, `category_id`（UUID, optional）, `keyword`（str, optional）
       - 認証不要
       - `ProductService.list()` を呼び出す。
     - `GET /api/products/{id}`:
       - 認証不要
       - `ProductService.get()` を呼び出す。
     - `POST /api/products`:
       - 認証必須 + 管理者権限（`Depends(require_admin)`）
       - `Request: ProductCreate`, `Response: ProductResponse (201)`
       - `ProductService.create()` を呼び出す。
     - `PUT /api/products/{id}`:
       - 認証必須 + 管理者権限
       - `Request: ProductUpdate`, `Response: ProductResponse`
     - `DELETE /api/products/{id}`:
       - 認証必須 + 管理者権限
       - `Response: 204 No Content`
  2. `backend/app/api/categories.py` を作成する:
     - `router = APIRouter(prefix="/categories", tags=["categories"])`
     - `GET /api/categories`: 認証不要
     - `POST /api/categories`: 管理者のみ
     - `DELETE /api/categories/{id}`: 管理者のみ
  3. `backend/app/api/router.py` に `products` ルーターと `categories` ルーターを追加する。

- **注意点:**
  - `GET /api/products` は認証不要。一般公開。
  - 管理者権限チェックは `require_admin` 依存性を使用する。
  - カテゴリ削除時、紐づく商品がある場合はエラーを返す（`HTTPException(409, "category has products")`）。

- **完了条件（テスト）:**
  ```bash
  cd backend && uvicorn app.main:app --port 8000 &
  # 商品一覧（空）
  curl -s http://localhost:8000/api/products
  # → {"items":[], "total":0, "page":1, "per_page":20}
  kill %1
  ```

---

### ステップ16: 注文APIエンドポイント

- **目的:** 注文作成、注文詳細取得、注文履歴、決済セッション生成の REST API エンドポイントを実装する。

- **実装内容:**
  1. `backend/app/api/orders.py` を作成する:
     - `router = APIRouter(prefix="/orders", tags=["orders"])`
     - 全エンドポイント認証必須（全エンドポイントに `Depends(get_current_user)` を付ける）
     - `POST /api/orders`:
       - `Request: OrderCreate`, `Response: OrderResponse (201)`
       - `current_user.id` を `user_id` として使用する。
     - `GET /api/orders/{id}`:
       - `Response: OrderResponse`
       - 自分の注文のみ取得可能（`current_user` でフィルタ）
     - `GET /api/orders/history`:
       - クエリパラメータ: `page`, `per_page`
       - `Response: OrderHistoryResponse`
     - `POST /api/orders/{id}/payment`:
       - `Response: PaymentSessionResponse`
       - `OrderService.create_payment_session()` を呼び出す。
  2. `backend/app/api/webhooks.py` を作成する:
     - `router = APIRouter(prefix="/webhooks", tags=["webhooks"])`
     - `POST /api/webhooks/komoju`:
       - 認証不要（KOMOJU からのコールバックのため）
       - `Request Body: dict`（生の JSON）
       - `OrderService.handle_webhook()` を呼び出す。
       - `Response: 200 {"status": "ok"}`
  3. `backend/app/api/router.py` に `orders` ルーターと `webhooks` ルーターを追加する。

- **注意点:**
  - Webhook エンドポイントは認証不要だが、IP 制限などの追加セキュリティを将来実装できるようコメントを残す。
  - 注文作成時の在庫減少はトランザクション内で行われ、エラー時はロールバックされる。
  - `GET /api/orders/{id}` は `current_user` が管理者の場合は全ユーザーの注文を参照可能にする。

- **完了条件（テスト）:**
  ```bash
  cd backend && uvicorn app.main:app --port 8000 &
  # 認証なしで注文作成しようとすると 401
  curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8000/api/orders
  # → 401
  kill %1
  ```

---

### ステップ17: ペット・AI試着APIエンドポイント

- **目的:** ペット情報管理、画像アップロード、AI試着生成・履歴の REST API エンドポイントを実装する。

- **実装内容:**
  1. `backend/app/api/pets.py` を作成する:
     - `router = APIRouter(prefix="/pets", tags=["pets"])`
     - 全エンドポイント認証必須
     - `GET /api/pets`: 自分のペット一覧
     - `POST /api/pets`: `PetCreate` → `PetResponse (201)`
     - `PUT /api/pets/{id}`: `PetCreate` → `PetResponse`
     - `DELETE /api/pets/{id}`: `204 No Content`
     - `POST /api/pets/{id}/images`: `UploadFile`（フィールド名 `image`）+ `angle`（フォームデータ）→ `PetImageUploadResponse`
       - サポートする角度: `front`, `side`, `angle45`
  2. `backend/app/api/tryon.py` を作成する:
     - `router = APIRouter(prefix="/tryon", tags=["tryon"])`
     - 全エンドポイント認証必須
     - `POST /api/tryon/generate`:
       - `Request: TryOnRequest`, `Response: TryOnResponse (201)`
       - `TryOnService.generate()` を呼び出す。
     - `POST /api/tryon/generate-additional`:
       - `Request Body: {"pet_id": UUID, "product_id": UUID, "angles": list[str]}`
       - `TryOnService.generate_additional()` を呼び出す。
     - `GET /api/tryon/history`:
       - `Response: TryOnHistoryResponse`
  3. `backend/app/api/router.py` に `pets` ルーターと `tryon` ルーターを追加する。

- **注意点:**
  - 画像アップロードは `UploadFile` を使用する。`File` は `fastapi` からインポートする。
  - 画像バリデーション（サイズ・拡張子）は `file_upload.py` の `validate_image` を使用する。
  - AI 生成はモック実装であることを Swagger の説明文に記載する。

- **完了条件（テスト）:**
  ```bash
  cd backend && uvicorn app.main:app --port 8000 &
  # Swagger UI が開けることを確認
  curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs
  # → 200
  kill %1
  ```

---

### ステップ18: 管理APIエンドポイント

- **目的:** 管理画面向けのダッシュボード、顧客管理、注文管理、アクセス解析のエンドポイントを実装する。

- **実装内容:**
  1. `backend/app/api/admin.py` を作成する:
     - `router = APIRouter(prefix="/admin", tags=["admin"])`
     - 全エンドポイントに `Depends(require_admin)` を付ける。
     - `GET /api/admin/dashboard`:
       - ダッシュボードデータ（総売上、注文件数、登録ユーザー数、在庫切れ商品数）を集計して返す。
       - `Response: {"total_revenue": int, "total_orders": int, "total_users": int, "out_of_stock": int}`
     - `GET /api/admin/orders`:
       - 全ユーザーの注文一覧（ページネーション付き、ステータスフィルタ可能）
       - クエリパラメータ: `page`, `per_page`, `status`（optional）
     - `PUT /api/admin/orders/{id}/status`:
       - `Request Body: {"status": str}`（例: "shipped", "delivered"）
       - 注文ステータスを更新する。
     - `GET /api/admin/customers`:
       - 顧客一覧（ページネーション付き）
       - クエリパラメータ: `page`, `per_page`
     - `GET /api/admin/customers/{id}`:
       - 顧客詳細（注文履歴含む）
     - `GET /api/admin/analytics`:
       - アクセス解析データ（モック: 固定値を返す）
       - `Response: {"daily_visitors": [...], "conversion_rate": float, ...}`
  2. `backend/app/services/admin_service.py` を作成する:
     - `AdminService` クラス（`AsyncSession` を受け取る）
     - `async def get_dashboard_data() -> dict`: 集計クエリを実行
     - `async def get_customers(page, per_page) -> dict`
     - `async def get_customer_detail(customer_id) -> dict`
  3. `backend/app/api/router.py` に `admin` ルーターを追加する。

- **注意点:**
  - アクセス解析は MVP ではモック固定値を返す。実際のトラッキング実装はフェーズ4（growth）に委ねる。
  - 管理者権限は `role` が `admin` または `staff` のユーザーに付与する。
  - 最初の管理者ユーザーはデータベースに直接 INSERT するか、`/api/auth/register` 後に手動で role を更新する必要がある。この手順は README などに記載する想定だが、当面は `register` 時の role デフォルトが `customer` なので、SQL で直接更新する運用でよい。

- **完了条件（テスト）:**
  ```bash
  cd backend && uvicorn app.main:app --port 8000 &
  # 管理者権限なしでアクセスすると 403
  curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/admin/dashboard
  # → 401（認証なし）または 403（認証あり・権限なし）
  kill %1
  ```

---

### ステップ19: フロントエンドレイアウト・APIクライアント

- **目的:** フロントエンドの共通レイアウト（ヘッダー、フッター）と、バックエンド API を呼び出すための API クライアントモジュールを実装する。

- **実装内容:**
  1. `frontend/styles/globals.css` を充実させる:
     - 基本リセット（`* { box-sizing: border-box; margin: 0; padding: 0; }`）
     - フォントファミリー: `"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", sans-serif`
     - カラー変数（白・ゴールド・ネイビー）
     - `body` に背景色 `var(--color-light-gray)`、文字色 `var(--color-text)`
  2. `frontend/components/Header.tsx` を作成する:
     - ナビゲーション: ロゴ、商品検索、カートアイコン、ログイン/マイページリンク
     - レスポンシブデザイン（モバイルではハンバーガーメニュー）
     - 認証状態に応じて表示を切り替える（ログイン時: マイページ、ログアウト時: ログインボタン）
  3. `frontend/components/Footer.tsx` を作成する:
     - 簡易フッター（会社名、コピーライト）
  4. `frontend/lib/api.ts` を作成する:
     - `BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"`
     - 汎用 `fetch` ラッパー関数:
       - `async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T>`
       - `GET`, `POST`, `PUT`, `DELETE` のヘルパー関数
       - 自動的に `credentials: "include"` を設定し、HttpOnly Cookie を送信する。
       - エラーハンドリング: レスポンスが `ok` でない場合はエラーレスポンスボディをパースして `ApiError` としてスローする。
     - 型定義:
       - `interface ApiError { detail: string }`
  5. `frontend/lib/auth.ts` を作成する:
     - `async function login(email: string, password: string): Promise<void>`
     - `async function register(name: string, email: string, password: string): Promise<void>`
     - `async function logout(): Promise<void>`
     - `async function getCurrentUser(): Promise<UserResponse | null>`
     - 認証状態管理は `AuthContext`（または `zustand`）を使わず、シンプルに `getCurrentUser` を各ページで呼び出す方式をとる。必要に応じて後でリファクタリングする。
  6. `frontend/app/layout.tsx` を編集し、`Header` と `Footer` を全てのページに適用する。

- **注意点:**
  - `NEXT_PUBLIC_API_URL` は Next.js の環境変数として `.env.local` に設定する。
  - API クライアントは `fetch` のラッパーとし、余計なライブラリは追加しない。
  - Cookie ベースの認証のため、`credentials: "include"` が必須。

- **完了条件（テスト）:**
  ```bash
  cd frontend && npm run dev &
  curl -s http://localhost:3000/ | grep -c "星野のペット用品"
  # → 1 以上（文字列が含まれていること）
  kill %1
  ```

---

### ステップ20: 認証画面実装

- **目的:** ログインページ、登録ページ、パスワードリセットページを実装する。

- **実装内容:**
  1. `frontend/app/login/page.tsx`:
     - メールアドレスとパスワードの入力フォーム
     - ログインボタン押下で `lib/auth.ts` の `login()` を呼び出す
     - 成功時はトップページまたは元のページにリダイレクト
     - エラー時はエラーメッセージを表示
     - デザイン: 白背景、中央配置、ゴールドのアクセントボーダー
  2. `frontend/app/register/page.tsx`:
     - 名前、メールアドレス、パスワード（+ 確認用）の入力フォーム
     - 登録ボタン押下で `register()` を呼び出す
     - 成功時はログインページに遷移
  3. `frontend/app/reset-password/page.tsx`:
     - メールアドレスと新しいパスワードの入力フォーム
     - `POST /api/auth/reset-password` を呼び出す
  4. `frontend/features/auth/AuthContext.tsx`（または簡易的な auth hook）:
     - `useAuth()` カスタムフック: `user`, `loading`, `login`, `logout`, `register` を提供する
     - 内部的に `getCurrentUser()` を呼び出して認証状態を管理する
     - `AuthProvider` コンポーネントを作成し、`layout.tsx` でラップする
  5. `frontend/styles/globals.css` にフォーム関連のスタイルを追加する:
     - `.form-container`, `.form-input`, `.form-button`, `.error-message` クラス

- **注意点:**
  - パスワード確認用フィールドはフロントエンドのみでバリデーション（一致チェック）。
  - 環境変数 `NEXT_PUBLIC_API_URL` が設定されていない場合はデフォルト値を使用する。
  - `AuthProvider` はクライアントコンポーネントとする (`"use client"`)。

- **完了条件（テスト）:**
  ```bash
  cd frontend && npm run dev &
  curl -s http://localhost:3000/login | grep -c "ログイン"
  # → 1 以上（ログインページが表示される）
  curl -s http://localhost:3000/register | grep -c "登録"
  # → 1 以上（登録ページが表示される）
  kill %1
  ```

---

### ステップ21: 商品一覧・詳細画面実装

- **目的:** 商品一覧ページと商品詳細ページを実装する。

- **実装内容:**
  1. `frontend/app/products/page.tsx`:
     - クエリパラメータから `page`, `category_id`, `keyword` を取得する。
     - `GET /api/products` を呼び出して商品一覧を取得する。
     - 商品カードグリッド表示（`ProductCard` コンポーネント使用）
     - カテゴリフィルタサイドバー（または上部ドロップダウン）
     - キーワード検索バー
     - ページネーション
     - ローディング状態はスケルトンスクリーン（`skeleton-loader` CSS クラス）
  2. `frontend/components/ProductCard.tsx`:
     - props: `product: ProductResponse`
     - サムネイル画像、商品名、価格、カテゴリ名を表示
     - クリックで `/products/{id}` に遷移
  3. `frontend/app/products/[id]/page.tsx`:
     - `GET /api/products/{id}` で商品詳細を取得
     - 商品画像（メイン）、商品名、説明、価格、在庫状況を表示
     - 「カートに入れる」ボタン（数量セレクター付き）
     - AI試着プレビューセクション（後で実装、現時点ではプレースホルダー）
     - ワッペンカスタマイズセクション（後で実装、現時点ではプレースホルダー）
  4. `frontend/styles/globals.css` に商品関連のスタイルを追加する:
     - `.product-grid`, `.product-card`, `.product-detail`, `.skeleton-loader`
  5. `frontend/app/page.tsx`（トップページ）を編集する:
     - 特集商品セクション（`GET /api/products?per_page=8` を呼び出して表示）

- **注意点:**
  - 商品画像が存在しない場合はプレースホルダー画像を表示する。
  - 在庫切れの商品は `disabled` 表示 + 「在庫切れ」ラベル。
  - スケルトンスクリーンは CSS アニメーション（`@keyframes shimmer`）で実装する。

- **完了条件（テスト）:**
  ```bash
  cd frontend && npm run dev &
  curl -s http://localhost:3000/products | grep -c "product"
  # → ページがレンダリングされること
  kill %1
  ```

---

### ステップ22: カート・決済画面実装

- **目的:** ショッピングカート機能と決済画面への誘導を実装する。

- **実装内容:**
  1. **カート状態管理**:
     - カートの状態は `localStorage` に保持する（簡易実装。ログイン後はサーバーサイドカートに移行することも検討するが、MVP では localStorage ベースでよい）。
     - `frontend/features/cart/CartContext.tsx`:
       - `CartProvider`, `useCart()` フック
       - 状態: `items: Array<{product_id, product, quantity, patches_config?}>`
       - 操作: `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `getTotal`
  2. `frontend/app/cart/page.tsx`:
     - カート内の商品一覧（`CartItem` コンポーネント使用）
     - 数量変更、削除ボタン
     - 合計金額表示
     - 「レジに進む」ボタン（`/checkout` へ遷移）
     - カートが空の場合は「カートは空です」と表示
  3. `frontend/components/CartItem.tsx`:
     - 商品サムネイル、名前、単価、数量セレクター、小計、削除ボタン
  4. `frontend/app/checkout/page.tsx`:
     - 注文内容の確認表示
     - `POST /api/orders` を呼び出して注文を作成する（認証必須、未認証の場合はログインページにリダイレクト）
     - 注文成功後、`POST /api/orders/{id}/payment` で決済URLを取得
     - KOMOJU の決済ページへリダイレクトする（モックの場合はダミーURL）
     - 支払い完了後の戻り先ページ（`/orders/{id}/complete`）を表示
  5. カートアイコンのバッジ表示を `Header.tsx` に追加する（カート内の商品点数）。

- **注意点:**
  - `localStorage` ベースのカートはブラウザ間で同期されない。フェーズ2以降でサーバーサイドカートに移行予定。
  - 在庫チェックは注文作成時（バックエンド）で行う。フロントエンドでの在庫超過販売は防げないが、バックエンドで防ぐ。
  - 決済画面は KOMOJU にリダイレクトするため、フロントエンドにはダミーのリダイレクト先URLを表示するだけでよい。

- **完了条件（テスト）:**
  ```bash
  cd frontend && npm run dev &
  curl -s http://localhost:3000/cart | grep -c "カート"
  kill %1
  ```

---

### ステップ23: マイページ・ペット管理画面実装

- **目的:** ユーザーが自身の注文履歴とペット情報を確認・管理できるマイページを実装する。

- **実装内容:**
  1. `frontend/app/mypage/page.tsx`:
     - 認証必須（未認証ならログインページにリダイレクト）
     - ユーザー情報表示（名前、メールアドレス）
     - 注文履歴へのリンク、ペット管理へのリンク
  2. `frontend/app/mypage/orders/page.tsx`:
     - `GET /api/orders/history` で注文履歴を取得
     - 注文日、ステータス、合計金額、明細（商品名、数量）の一覧表示
     - 各注文をクリックで `/mypage/orders/{id}` に遷移
  3. `frontend/app/mypage/orders/[id]/page.tsx`:
     - `GET /api/orders/{id}` で注文詳細を取得
     - 配送状況、支払い状況、注文商品一覧（ワッペンカスタム情報があれば表示）
  4. `frontend/app/mypage/pets/page.tsx`:
     - ペット一覧（`GET /api/pets`）
     - ペット登録フォーム（名前、種類、性別、体重、体長）
     - 画像アップロード機能（正面、斜め45度、横）
     - ペット編集・削除機能
  5. `frontend/components/PetImageUploader.tsx`:
     - 3つのスロット（正面、斜め45度、横）の画像アップロードUI
     - プレビュー表示
     - アップロード中はプログレスバーを表示

- **注意点:**
  - 全てのマイページ配下のページは `"use client"` とし、認証状態を確認する処理を含める。
  - ペット画像アップロードは `multipart/form-data` でバックエンドに送信する。

- **完了条件（テスト）:**
  ```bash
  cd frontend && npm run dev &
  curl -s http://localhost:3000/mypage | grep -c "マイページ"
  kill %1
  ```

---

### ステップ24: AI試着UI・ワッペンカスタマイズUI実装

- **目的:** 商品詳細ページで AI 試着プレビューとワッペンカスタマイズを操作できる UI を実装する。

- **実装内容:**
  1. **AI試着UI** (`frontend/components/TryOnPreview.tsx`):
     - 商品詳細ページ内でペット選択ドロップダウン（`GET /api/pets` から取得）
     - 「試着を生成」ボタン
     - 生成中はスケルトンスクリーン + ローディングアニメーション
     - 生成結果の画像表示（デフォルトは斜め45度）
     - 「他の角度も生成」ボタン（正面、横の追加生成、合計4枚まで）
     - 生成履歴表示
  2. **ワッペンカスタマイズUI** (`frontend/components/PatchCanvas.tsx`):
     - HTML5 Canvas 要素を使用する。
     - 商品画像を Canvas に描画する。
     - ワッペン一覧（商品に紐づくワッペンアセット）を表示する。
     - ワッペンをドラッグ＆ドロップで Canvas 上に配置する。
     - タッチイベント対応（`touchstart`, `touchmove`, `touchend`）。
     - 配置したワッペンの位置調整（ドラッグで移動）。
     - 削除ボタン（各ワッペンをタップ/クリックで削除）。
     - 現在の配置を JSON 形式（`{"patches": [{"patch_id": "uuid", "x": 120, "y": 240, "scale": 1.2}]}`）で保持する。
  3. `frontend/app/products/[id]/page.tsx` を編集する:
     - `TryOnPreview` と `PatchCanvas` を商品詳細ページに統合する。
     - タブまたはセクションで「試着を見る」と「ワッペンをカスタマイズ」を切り替えられるようにする。
  4. **ワッペンデータの注文連携**:
     - カートに追加する際、`PatchCanvas` から JSON データを取得し、`addItem` の `patches_config` として保持する。
     - チェックアウト時に `OrderCreate.items[].patches_config` として送信する。

- **注意点:**
  - Canvas の解像度は商品画像に合わせて動的に変更する。
  - ワッペンはモックデータとして固定のパス画像（`/patches/sample.png`）を使用する。管理者が後でアップロードできるようにする。
  - AI 試着ボタンは連打防止のため、生成中は `disabled` 状態にする。
  - モバイル対応: Canvas 領域は画面幅に応じてリサイズする。

- **完了条件（テスト）:**
  ```bash
  cd frontend && npm run dev &
  curl -s http://localhost:3000/products/dummy-id | grep -c "試着"
  # → 試着UIがページ内に含まれていること
  kill %1
  ```

---

### ステップ25: 管理画面実装

- **目的:** 管理者向けダッシュボード、商品管理、注文管理、顧客管理画面を実装する。

- **実装内容:**
  1. `frontend/app/admin/page.tsx`（ダッシュボード）:
     - 管理者権限チェック（`/api/auth/me` の `role` が `admin` または `staff` でなければリダイレクト）
     - `GET /api/admin/dashboard` のデータを表示
     - カード形式で KPI（売上、注文件数、ユーザー数、在庫切れ）を表示
  2. `frontend/app/admin/layout.tsx`:
     - 管理画面共通レイアウト（サイドバーナビゲーション: ダッシュボード、商品管理、注文管理、顧客管理）
  3. `frontend/app/admin/products/page.tsx`:
     - 商品一覧（テーブル形式）
     - 新規商品登録ボタン
     - 編集・削除ボタン
  4. `frontend/app/admin/products/new/page.tsx`:
     - 商品登録フォーム（名前、説明、価格、在庫、カテゴリ、サムネイル画像アップロード）
  5. `frontend/app/admin/products/[id]/edit/page.tsx`:
     - 商品編集フォーム（`new` と同様のフォーム、初期値に既存データをセット）
  6. `frontend/app/admin/orders/page.tsx`:
     - 全注文一覧（テーブル形式、ステータスフィルタ可能）
     - ステータス更新ドロップダウン（未発送→発送済み など）
  7. `frontend/app/admin/customers/page.tsx`:
     - 顧客一覧（テーブル形式）
     - 顧客詳細リンク

- **注意点:**
  - 管理画面は `role` チェックを各ページの先頭で行い、権限がない場合はトップページにリダイレクトする。
  - `staff` 権限のユーザーは商品管理・注文管理のみアクセス可能（ダッシュボード・顧客管理は `admin` のみ）。
  - 全ての管理画面は `"use client"` とする。

- **完了条件（テスト）:**
  ```bash
  cd frontend && npm run dev &
  curl -s http://localhost:3000/admin | grep -c "ダッシュボード"
  kill %1
  ```

---

## フェーズ5: テスト

---

### ステップ26: バックエンド単体テスト実装

- **目的:** pytest を使用してバックエンドの各レイヤー（モデル、リポジトリ、サービス、ユーティリティ）の単体テストを実装する。

- **実装内容:**
  1. `backend/tests/conftest.py` を作成する（まだの場合は拡充）:
     - テスト用の非同期エンジンとセッションのフィクスチャ
     - テスト用の設定（テストDBは使用せず、原則モックまたは SQLite in-memory を使用する。ただし SQLite は非同期モードで制約があるため、`sqlite+aiosqlite` を `pyproject.toml` の dev 依存に追加するオプションもある。あるいはリポジトリ/サービステストではモックを使用する戦略をとる。）
     - **推奨戦略:** ユニットテストでは SQLAlchemy や DB に依存しないよう、リポジトリとサービスをモックする。DB が必要なテストのみ `create_async_engine("sqlite+aiosqlite", echo=True)` でインメモリDBを使用する。
     - `pytest.fixture` の `event_loop` を設定する（`pytest_asyncio` 使用時）。
  2. `backend/tests/test_utils_security.py`:
     - `hash_password` / `verify_password` のテスト
     - `create_access_token` / `decode_access_token` のテスト
     - 期限切れトークンのテスト
  3. `backend/tests/test_services_auth.py`:
     - `AuthService.register` のテスト（正常系、重複メール）
     - `AuthService.login` のテスト（正常系、パスワード誤り）
     - モックの `UserRepository` を使用する。
  4. `backend/tests/test_services_product.py`:
     - `ProductService.create`, `get`, `list`, `update`, `delete` のテスト
  5. `backend/tests/test_services_order.py`:
     - `OrderService.create_order` のテスト（正常系、在庫不足）
     - `OrderService.get_order` のテスト（権限チェック）
  6. `backend/tests/test_services_tryon.py`:
     - `TryOnService.generate` のテスト（枚数制限）
     - モックの画像生成を使用
  7. `backend/tests/test_api_auth.py`（結合テスト用の準備）:
     - `TestClient` を使用した API 結合テスト
     - `POST /api/auth/register` のテスト
     - `POST /api/auth/login` のテスト
     - 認証状態での保護されたエンドポイントへのアクセステスト

- **注意点:**
  - `httpx.AsyncClient` を使用して FastAPI のテストを行う場合、`app.dependency_overrides` を使用して認証依存性をモックする。
  - テストデータの作成にはファクトリ関数を `conftest.py` に定義する。
  - テストは `cd backend && python -m pytest tests/ -v` で実行する。
  - `pytest-asyncio` の `@pytest.mark.asyncio` を各非同期テストに付与する。

- **完了条件（テスト）:**
  ```bash
  cd backend && python -m pytest tests/ -v --cov=app --cov-report=term-missing
  # → 最低でもカバレッジ 70% 以上、全テストが PASS すること
  ```

---

### ステップ27: バックエンド結合テスト実装

- **目的:** 複数のサービスや実際の API エンドポイントを通した結合テストを実装する。

- **実装内容:**
  1. `backend/tests/conftest.py` を拡充する:
     - `test_engine`, `test_session` フィクスチャ（`sqlite+aiosqlite` インメモリを使用。またはテスト用 PostgreSQL コンテナを使用する）
     - `override_get_db` 依存性オーバーライド
     - `client` フィクスチャ（`httpx.AsyncClient` with `app`）
     - `test_user`, `test_admin` フィクスチャ（事前作成ユーザー）
     - `auth_headers` フィクスチャ（ログイン後の認証ヘッダー）
  2. `backend/tests/test_api_products.py`:
     - `GET /api/products`（空一覧、商品作成後の一覧）
     - `GET /api/products/{id}`（存在する、存在しない）
     - `POST /api/products`（管理者のみ作成可能）
     - `PUT /api/products/{id}`（管理者のみ更新可能）
     - `DELETE /api/products/{id}`（管理者のみ削除可能）
  3. `backend/tests/test_api_orders.py`:
     - 注文作成フロー（商品を先に作成 → 注文 → 確認）
     - 未認証ユーザーのアクセス拒否
     - 在庫不足時のエラー
  4. `backend/tests/test_api_tryon.py`:
     - `POST /api/tryon/generate`（正常系）
     - 生成枚数制限のテスト
     - `GET /api/tryon/history` のテスト
  5. `backend/tests/test_api_admin.py`:
     - 管理者ダッシュボードアクセステスト
     - 顧客一覧アクセステスト
     - 注文ステータス更新テスト

- **注意点:**
  - 結合テストでは実際の DB（インメモリ SQLite）を使用する。テスト実行前にテーブルを作成する（`Base.metadata.create_all`）。
  - 各テストケース実行後にトランザクションをロールバックするか、テーブルをクリアする。
  - 外部 API（KOMOJU、AI生成）はモックする（`httpx` の `Transport` を差し替えるか、`unittest.mock.patch` を使用する）。

- **完了条件（テスト）:**
  ```bash
  cd backend && python -m pytest tests/ -v --cov=app --cov-report=term-missing
  # → 全テストが PASS し、カバレッジ 80% 以上であること
  ```

---

### ステップ28: フロントエンドテスト実装

- **目的:** フロントエンドの主要コンポーネントのユニットテストと、API クライアントのテストを実装する。

- **実装内容:**
  1. `frontend/jest.config.ts`（または `vitest.config.ts`）を作成する:
     - Next.js プロジェクトは `create-next-app` で作成されている場合、デフォルトでテストランナーは含まれない。`vitest` + `@testing-library/react` をインストールして設定する。
     - `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
     - `package.json` に `"test": "vitest run"` を追加する。
     - `vitest.config.ts` で `environment: "jsdom"` を設定する。
  2. `frontend/components/__tests__/Header.test.tsx`:
     - ヘッダーが正しくレンダリングされること
     - ロゴやナビゲーションリンクが表示されること
  3. `frontend/components/__tests__/ProductCard.test.tsx`:
     - 商品カードが正しく表示されること（タイトル、価格）
     - クリックで詳細ページに遷移すること
  4. `frontend/lib/__tests__/api.test.ts`:
     - `apiClient` が正しいリクエストを送信すること（`fetch` をモックして検証）
     - エラーレスポンス時に `ApiError` をスローすること
  5. `frontend/features/cart/__tests__/CartContext.test.tsx`:
     - カートに商品を追加できること
     - 数量を変更できること
     - 商品を削除できること
     - 合計金額が正しく計算されること
  6. `frontend/app/__tests__/login.test.tsx`:
     - ログインフォームがレンダリングされること
     - フォーム送信で `login` 関数が呼ばれること（モック）

- **注意点:**
  - テストファイルはテスト対象のコンポーネントと同じディレクトリに `__tests__` フォルダを作成して配置する。
  - `@testing-library/react` の `render` と `screen` を使用する。
  - 非同期処理を含むコンポーネントは `waitFor` などで適切に待機する。
  - CI でも実行できるよう、ブラウザに依存しないテストとする。

- **完了条件（テスト）:**
  ```bash
  cd frontend && npm test
  # → 全テストが PASS すること
  ```

---

## 補足情報

### 依存関係グラフ（ステップ間の前提条件）

```
Step 1 (Backend scaffolding)
  ├──→ Step 3 (Docker Compose) … DB が必要なステップ（4〜）の前提
  ├──→ Step 4 (SQLAlchemy models) … Step 1 完了が前提
  │     └──→ Step 5 (Alembic migrations) … Step 3, 4 完了が前提
  │           └──→ Step 6 (Pydantic schemas) … Step 4 の知識が必要（独立しても可）
  │
  ├──→ Step 7 (DB connection) … Step 3, 4 完了が前提
  │     └──→ Step 8 (Repositories) … Step 7 完了が前提
  │           └──→ Step 9〜12 (Services) … Step 8 完了が前提
  │                 └──→ Step 13 (Middleware) … 並行して実装可能
  │                       └──→ Step 14〜18 (API endpoints) … Step 9〜13 完了が前提
  │                             └──→ Step 26〜27 (Backend tests)
  │
  └──→ Step 2 (Frontend scaffolding)
        └──→ Step 19 (Frontend layout & API client)
              └──→ Step 20〜25 (Frontend pages)
                    └──→ Step 28 (Frontend tests)
```

### 各ステップの想定作業時間

| ステップ | 想定時間 | 備考 |
|---------|---------|------|
| 1-3 | 30分 | 環境構築は依存関係のインストールが中心 |
| 4-6 | 45分 | モデル定義とマイグレーション |
| 7-8 | 30分 | DB接続とリポジトリ基底 |
| 9-12 | 1時間 | サービス層（各30分程度） |
| 13 | 20分 | ミドルウェア |
| 14-18 | 1.5時間 | APIエンドポイント（各15-20分） |
| 19 | 30分 | フロントエンド基盤 |
| 20-25 | 2.5時間 | フロントエンド画面（各25分程度） |
| 26-27 | 1時間 | バックエンドテスト |
| 28 | 30分 | フロントエンドテスト |
| **合計** | **約8時間** | |

### 環境変数一覧（.env）

```
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/hoshino_pet_ec
SECRET_KEY=dev-secret-key-change-in-production
KOMOJU_PUBLIC_KEY=pk_test_dummy_123456789
KOMOJU_SECRET_KEY=sk_test_dummy_987654321
AI_API_KEY=dummy_api_key_for_mock
ACCESS_TOKEN_EXPIRE_MINUTES=30
NEXT_PUBLIC_API_URL=http://localhost:8000/api  # frontend/.env.local
```
