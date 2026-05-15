# 星野のペット用品 ECサイト 起動マニュアル

## 1. 前提条件

- 必要なソフトウェア: Docker, Docker Compose, Miniconda (Python 3.13), Node.js 22+, npm
- PostgreSQL のローカルインストールは不要（Docker Compose で提供）

## 2. リポジトリのクローン

```bash
git clone <repository-url>
cd ec-shop
```

## 3. Docker Compose で PostgreSQL を起動

```bash
docker compose up -d
docker compose ps
```

`docker compose ps` で `db` と `adminer` の両方が `Up` (healthy) 状態であることを確認する。

## 4. バックエンドのセットアップ

```bash
conda create -n hoshino-pet-ec python=3.13 -y
conda activate hoshino-pet-ec
cd backend
pip install -e ".[dev]"
cp .env.example .env
# .env の内容はデフォルトのままで動作する（開発用）
alembic upgrade head
# 最初の管理者ユーザーを作成（パスワードは hash_password('admin123') で生成）
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000/docs で Swagger UI
```

`POSTGRES_USER=user`, `POSTGRES_PASSWORD=password`, `POSTGRES_DB=hoshino_pet_ec` がデフォルト値。

## 5. フロントエンドのセットアップ

```bash
cd frontend
npm install
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000/api' > .env.local
npm run dev
# → http://localhost:3000
```

## 6. 動作確認

- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:8000/docs
- 管理画面: http://localhost:3000/admin
- DB管理: http://localhost:8080 (Adminer)

Adminer ログイン情報:
- システム: PostgreSQL
- サーバ: db
- ユーザ名: user
- パスワード: password
- データベース: hoshino_pet_ec

## 7. よくある問題と対処法

### `docker compose up -d` でポート 5432 が既に使用されている場合

```bash
# 既存の PostgreSQL プロセスを確認
sudo lsof -i :5432
# または
sudo ss -tlnp | grep 5432

# 既存サービスを停止するか、docker-compose.yml のポートを変更する
```

### `alembic upgrade head` が失敗する場合

```bash
# Docker Compose の PostgreSQL が起動しているか確認
docker compose ps

# 接続確認
docker compose exec db pg_isready -U user -d hoshino_pet_ec

# DB が起動するまで待ってから再実行（healthcheck 完了待ち）
sleep 5 && alembic upgrade head
```

### conda 環境が認識されない場合

```bash
# conda の初期化
conda init bash
# シェルを再起動するか、以下を実行
source ~/.bashrc

# または直接 activate スクリプトを使用
source $(conda info --base)/etc/profile.d/conda.sh
conda activate hoshino-pet-ec
```

## 8. テスト実行

```bash
# バックエンド
cd backend && python -m pytest tests/ -v

# フロントエンド
cd frontend && npm test
```
