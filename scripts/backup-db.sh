#!/usr/bin/env bash
# 운영 DB 덤프 후 S3 업로드. 배포(cd.yml)에서 migration:run 직전에 호출.
# 필요한 환경변수: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, S3_BUCKET_NAME
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/tmp/dailog_backup_${TIMESTAMP}.sql"

export PGPASSWORD="${DB_PASSWORD}"
pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USERNAME}" -d "${DB_NAME}" -F c -f "${BACKUP_FILE}"

# aws CLI는 표준 변수명(AWS_ACCESS_KEY_ID)을 쓰는데, 앱 코드는 AWS_ACCESS_KEY를 쓰므로 여기서만 매핑
export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY}"
aws s3 cp "${BACKUP_FILE}" "s3://${S3_BUCKET_NAME}/db-backups/$(basename "${BACKUP_FILE}")"

rm -f "${BACKUP_FILE}"
