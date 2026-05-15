# 星野のペット用品 ECサイト メンテナンスマニュアル

## 1. システム構成の概要

- アーキテクチャ: Caddy → Next.js / FastAPI → PostgreSQL
- 使用ポート: 3000 (Frontend), 8000 (Backend), 5432 (PostgreSQL), 8080 (Adminer)

```
[インターネット]
    │
    ▼
[Caddy (Reverse Proxy)]
    │
    ├──► /api/* ──► FastAPI (localhost:8000)
    │
    └──► /* ──────► Next.js (localhost:3000)
                        │
                        ▼
              [PostgreSQL (localhost:5432)]
```

## 2. 本番環境のセットアップ（Ubuntu VPS）

### VPS 初期設定

```bash
# システム更新
sudo apt update && sudo apt upgrade -y

# 必要なパッケージをインストール
sudo apt install -y curl git build-essential

# Node.js 22+ のインストール（NodeSource 使用）
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Docker と Docker Compose のインストール
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable docker --now
sudo usermod -aG docker $USER

# Caddy のインストール
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

### アプリケーションのデプロイ

```bash
# リポジトリをクローン
git clone <repository-url> /opt/ec-shop
cd /opt/ec-shop

# Docker Compose で PostgreSQL を起動
docker compose up -d

# バックエンドのセットアップ
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
# .env ファイルを本番用に編集（SECRET_KEY 等を変更）
alembic upgrade head

# フロントエンドのセットアップ
cd ../frontend
npm install
echo 'NEXT_PUBLIC_API_URL=https://your-domain.com/api' > .env.local
npm run build
```

## 3. systemd サービス設定

### バックエンドサービス (`/etc/systemd/system/hoshino-backend.service`)

```ini
[Unit]
Description=Hoshino Pet EC Backend
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/ec-shop/backend
Environment="PATH=/opt/ec-shop/backend/venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/opt/ec-shop/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### フロントエンドサービス (`/etc/systemd/system/hoshino-frontend.service`)

```ini
[Unit]
Description=Hoshino Pet EC Frontend
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/ec-shop/frontend
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/node /opt/ec-shop/frontend/node_modules/.bin/next start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### サービスの有効化

```bash
sudo systemctl daemon-reload
sudo systemctl enable hoshino-backend hoshino-frontend --now
sudo systemctl status hoshino-backend hoshino-frontend
```

## 4. Caddy リバースプロキシ設定

### Caddyfile (`/etc/caddy/Caddyfile`)

```caddyfile
your-domain.com {
    reverse_proxy /api/* localhost:8000
    reverse_proxy /* localhost:3000

    encode gzip zstd

    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy strict-origin-when-cross-origin
    }
}
```

### Caddy の再起動

```bash
sudo systemctl reload caddy
```

## 5. データベースバックアップ

### バックアップスクリプト (`/opt/scripts/backup-db.sh`)

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/hoshino_pet_ec_$TIMESTAMP.sql.gz"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

docker compose -f /opt/ec-shop/docker-compose.yml exec -T db \
    pg_dump -U user hoshino_pet_ec | gzip > "$BACKUP_FILE"

# 古いバックアップを削除
find "$BACKUP_DIR" -name "hoshino_pet_ec_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_FILE"
```

### バックアップの復元

```bash
gunzip -c /opt/backups/hoshino_pet_ec_YYYYMMDD_HHMMSS.sql.gz | \
    docker compose -f /opt/ec-shop/docker-compose.yml exec -T db \
    psql -U user -d hoshino_pet_ec
```

### cron 設定

```bash
# crontab -e で以下を追加（毎日午前3時にバックアップ）
0 3 * * * /bin/bash /opt/scripts/backup-db.sh >> /var/log/hoshino-backup.log 2>&1

# cron が動作しているか確認
systemctl status cron
```

## 6. ログの確認方法

```bash
# バックエンドのログ
sudo journalctl -u hoshino-backend -f

# フロントエンドのログ
sudo journalctl -u hoshino-frontend -f

# 両方を同時に確認
sudo journalctl -u hoshino-backend -u hoshino-frontend -f

# 過去1時間のログ
sudo journalctl -u hoshino-backend --since "1 hour ago"

# Caddy のアクセスログ
sudo journalctl -u caddy -f

# Docker (PostgreSQL) のログ
docker compose -f /opt/ec-shop/docker-compose.yml logs -f db
```

## 7. デプロイ手順（アップデート手順）

```bash
# 1. 最新コードを取得
cd /opt/ec-shop
git pull origin main

# 2. バックエンドの更新
cd backend
source venv/bin/activate
pip install -e ".[dev]"
alembic upgrade head
sudo systemctl restart hoshino-backend

# 3. フロントエンドの更新
cd ../frontend
npm install
npm run build
sudo systemctl restart hoshino-frontend

# 4. 動作確認
sudo systemctl status hoshino-backend hoshino-frontend
curl -s http://localhost:8000/ | head -n 1
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

### ローリングアップデート（ダウンタイム最小化）

```bash
# フロントエンドをビルドしてからバックエンドを更新
cd /opt/ec-shop/frontend && npm run build
cd /opt/ec-shop/backend && source venv/bin/activate && pip install -e ".[dev]" && alembic upgrade head
# 両方を一気に再起動（ダウンタイム数秒）
sudo systemctl restart hoshino-backend hoshino-frontend
```

## 8. トラブルシューティング

### DB 接続エラー

```bash
# PostgreSQL が起動しているか確認
docker compose -f /opt/ec-shop/docker-compose.yml ps
# 停止している場合は再起動
docker compose -f /opt/ec-shop/docker-compose.yml up -d

# ポートが利用可能か確認
sudo ss -tlnp | grep 5432

# ディスク容量確認
df -h
```

### バックエンド起動エラー

```bash
# 詳細なエラーログを確認
sudo journalctl -u hoshino-backend -n 50 --no-pager

# 手動で起動テスト
cd /opt/ec-shop/backend
source venv/bin/activate
python -c "from app.main import app; print('Import OK')"

# .env ファイルが存在するか確認
ls -la /opt/ec-shop/backend/.env
```

### フロントエンド起動エラー

```bash
# ビルドログを確認
cd /opt/ec-shop/frontend && npm run build

# .env.local の内容を確認
cat /opt/ec-shop/frontend/.env.local

# Next.js の本番起動テスト
NODE_ENV=production node node_modules/.bin/next start -p 3000
```

### ディスク容量不足

```bash
# 使用状況確認
df -h

# Docker の未使用イメージ・ボリュームを削除
docker system prune -a

# 大きなファイルを検索
sudo find /opt -type f -size +100M -exec ls -lh {} \;
```

### メモリ不足

```bash
# メモリ使用状況
free -h

# プロセスごとのメモリ使用量
ps aux --sort=-%mem | head -20

# スワップ領域の確認
sudo swapon --show

# 必要に応じてスワップを追加
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 9. セキュリティチェックリスト

- [ ] `.env` の `SECRET_KEY` を本番用のランダムな文字列に変更
- [ ] `.env` の `KOMOJU_PUBLIC_KEY` と `KOMOJU_SECRET_KEY` を本番用キーに変更
- [ ] `.env` の `AI_API_KEY` を実際の API キーに変更（不要なら削除）
- [ ] PostgreSQL のパスワードを強力なものに変更（`docker-compose.yml` の `POSTGRES_PASSWORD`）
- [ ] Caddy で HTTPS (Let's Encrypt) が有効になっているか確認
- [ ] ファイアウォール (ufw) が適切に設定されているか確認
- [ ] `sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw enable`
- [ ] 不要なポート (5432, 8000, 3000, 8080) が外部に公開されていないか確認
- [ ] SSH のポート番号をデフォルトから変更しているか確認
- [ ] 定期的なセキュリティアップデートが設定されているか確認 (`sudo apt update && sudo apt upgrade`)
- [ ] バックアップが正常に動作しているか確認
- [ ] `.env` と `.env.local` のパーミッションが適切か確認 (`chmod 600`)
- [ ] CORS の設定が本番ドメインに制限されているか確認 (`backend/app/main.py` の `allow_origins`)

## 10. 監視項目一覧

```bash
# CPU 使用率
top -bn1 | head -5
# または
mpstat 1 5

# メモリ使用量
free -h

# ディスク使用量
df -h /

# バックエンドの応答時間
curl -o /dev/null -s -w 'HTTP %{http_code}\nTime: %{time_total}s\n' http://localhost:8000/

# API のヘルスチェック
curl -s http://localhost:8000/docs

# フロントエンドの応答確認
curl -o /dev/null -s -w '%{http_code}' http://localhost:3000

# DB 接続状態
docker compose -f /opt/ec-shop/docker-compose.yml exec db pg_isready -U user -d hoshino_pet_ec

# サービス稼働状態
sudo systemctl is-active hoshino-backend hoshino-frontend caddy
sudo systemctl is-active docker

# アクティブなコネクション数
ss -s
```

### 推奨監視ツール

- `htop` : リアルタイムプロセス監視 (`sudo apt install htop`)
- `nmon` : 総合システムモニタ (`sudo apt install nmon`)
- `goaccess` : Web アクセスログ解析 (`sudo apt install goaccess`)
- `netdata` : リアルタイムダッシュボード監視（オプション）
