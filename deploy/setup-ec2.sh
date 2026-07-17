#!/usr/bin/env bash
# EC2(Ubuntu) 최초 1회 세팅용. SSH 접속 권한 받으면 이 스크립트부터 실행.
# 이후 배포는 cd.yml이 자동으로 처리하므로 이 스크립트를 다시 돌릴 필요는 없음.
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/dailog}"
REPO_URL="${REPO_URL:-git@github.com:TEAM-DAILOG/BE.git}"

sudo apt-get update
sudo apt-get install -y nginx postgresql-client awscli

# Node.js 24 (CI와 동일 버전)
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo npm install -g pm2

# HTTPS용 certbot
sudo apt-get install -y certbot python3-certbot-nginx

# nginx 사이트 설정
if [ ! -d "$APP_DIR" ]; then
  git clone "$REPO_URL" "$APP_DIR"
fi
sudo cp "$APP_DIR/deploy/nginx/dailog.conf" /etc/nginx/sites-available/dailog.conf
sudo ln -sf /etc/nginx/sites-available/dailog.conf /etc/nginx/sites-enabled/dailog.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# pm2를 시스템 재부팅 후에도 자동 실행
pm2 startup systemd -u "$(whoami)" --hp "$HOME" | tail -n 1 | sudo bash

echo "완료. 다음 단계:"
echo "1. $APP_DIR/.env 작성 (또는 cd.yml의 PROD_ENV_FILE_BASE64로 배포 시 자동 생성)"
echo "2. cd $APP_DIR && npm ci && npm run build && npm run migration:run"
echo "3. pm2 start ecosystem.config.js && pm2 save"
echo "4. 도메인 연결 확인되면: sudo certbot --nginx -d dailog.kro.kr"
