set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/dailog}"
DB_NAME="${DB_NAME:-dailog}"
DB_USERNAME="${DB_USERNAME:-dailog}"
DB_PASSWORD="${DB_PASSWORD:?DB_PASSWORD 환경변수를 지정해주세요 (운영 DB 계정 비밀번호)}"

sudo apt-get update
sudo apt-get install -y nginx postgresql awscli rsync

# 운영 DB는 이 EC2에 직접 설치 (DB_HOST=localhost) — 기본 설정상 외부 접속 불가, 보안그룹에도 5432 안 열어둠
sudo systemctl enable --now postgresql
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USERNAME}'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE ROLE ${DB_USERNAME} WITH LOGIN PASSWORD '${DB_PASSWORD}';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USERNAME};"

# Node.js 24 (CI와 동일 버전)
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo npm install -g pm2

# HTTPS용 certbot
sudo apt-get install -y certbot python3-certbot-nginx

# CD(rsync)가 파일을 넣을 디렉토리 미리 준비
mkdir -p "$APP_DIR"

# nginx 사이트 설정 — 아직 코드가 안 왔으면(첫 배포 전) 건너뛰고 안내만 출력
if [ -f "$APP_DIR/deploy/nginx/dailog.conf" ]; then
  sudo cp "$APP_DIR/deploy/nginx/dailog.conf" /etc/nginx/sites-available/dailog.conf
  sudo ln -sf /etc/nginx/sites-available/dailog.conf /etc/nginx/sites-enabled/dailog.conf
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t
  sudo systemctl reload nginx
  NGINX_DONE=1
else
  NGINX_DONE=0
fi

# pm2를 시스템 재부팅 후에도 자동 실행
pm2 startup systemd -u "$(whoami)" --hp "$HOME" | tail -n 1 | sudo bash

echo "완료. 다음 단계:"
if [ "$NGINX_DONE" -eq 1 ]; then
  echo "1. nginx 사이트 설정 완료됨. 도메인 연결 확인되면: sudo certbot --nginx -d dailog.kro.kr"
else
  echo "1. 아직 코드가 없어서 nginx 설정은 건너뜀 — main에 push해서 CD(cd.yml)가 첫 배포를 마친 뒤 이 스크립트를 한 번 더 실행하면 nginx까지 마무리됨"
fi
echo "2. GitHub Secrets에 EC2_HOST/EC2_USER/EC2_SSH_KEY/PROD_ENV_FILE 등록 후 main에 push하면 CD가 자동으로 첫 배포를 진행함"
