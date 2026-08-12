# :tanabata_tree:DAILOG Backend:tanabata_tree:

<div align="center">

<img src="https://github.com/user-attachments/assets/93ac78ed-12cf-4a79-9298-88d997737b4e" />

일정과 일기를 함께 기록하는 모바일 앱서비스,

DAILOG의 백엔드 레포지토리입니다.

</div>

---


## Team

|<img width="150" height="150" alt="image" src="https://github.com/user-attachments/assets/4424180b-f020-4673-9b1d-d65f4f8e07f0" />| <img width="135" height="135" alt="image" src="https://github.com/user-attachments/assets/243661be-0fed-4e8e-95a0-98f423ac503e" />|<img width="150" height="150" alt="image" src="https://github.com/user-attachments/assets/5bba97dc-2693-4c43-8b5a-60326478c719" />| <img width="150" height="150" alt="image" src="https://github.com/user-attachments/assets/1feaf120-24b0-4601-afca-23ba0524e027" />|<img width="150" height="150" alt="image" src="https://github.com/user-attachments/assets/6ebe1ccb-cc6a-49c5-8bc9-9678b9214eaa" />|<img width="150" height="150" alt="image" src="https://github.com/user-attachments/assets/2e4fae85-91dc-4a69-871f-293bec89e40f" />|
|:-:|:-:|:-:|:-:|:-:|:-:|
| [우변/양우영](https://github.com/yangwooyoung123) | [신/성태경](https://github.com/sungtaegyeong) | [볼리/김건우](https://github.com/kimkimgungunwoo) | [셔니/박시현](https://github.com/hyuneey2) | [망곰/최승연](https://github.com/seungyeon-choi04) | [린/소예린](https://github.com/soyerin0407) |
| **Back-End (팀장)** | **Back-End** | **Back-End** | **Back-End** | **Back-End** | **Back-End** |
| 백엔드 총괄<br/>사용자 정보 조회 구현<br/>푸시 알람 구현 | 자체 회원가입 및 로그인 구현 | AI 기능 구현<br/>배포 및 운영 | 일정 관련 기능 구현 | 카테고리 관련 기능 구현 | 일기 관련 기능 구현 |

## ⚙️ 시스템 구성도
### 🔧 기술 스택
| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | ![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) | REST API 서버 구축 및 비즈니스 로직 처리 (TypeORM, JWT 인증, Swagger 문서화) |
| **App Server** | ![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white) | EC2 리버스 프록시 설정 및 요청 크기 제한 관리 |
| **Database** | ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) | TypeORM 기반 데이터 관리 및 마이그레이션 |
| **Compute** | ![AWS](https://img.shields.io/badge/AWS-%23232F3E.svg?style=for-the-badge&logo=amazon-aws&logoColor=white) | EC2 인스턴스 기반 애플리케이션 호스팅 및 PM2 프로세스 관리 |
| **Storage** | ![AWS S3](https://img.shields.io/badge/AWS_S3-569A31?style=flat-square&logo=amazons3&logoColor=white) | 일기·프로필 이미지 업로드 및 객체 URL 관리 |
| **CI/CD** | ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white) | main 브랜치 Push 시 자동 빌드·검증 및 EC2 자동 배포 |

### 🏗 Service Architecture Flow
<div align="center">
<img width="1639" height="621" alt="Group 20" src="https://github.com/user-attachments/assets/cb65a5d3-c56b-40d2-96be-d6889232aaaa" />
</div>


## 📁 시스템 디렉토리 구조
> NestJS는 기능(도메인) 단위로 모듈을 나눠서 관리합니다. `controllers/`, `services/`, `dtos/` 처럼 역할별로 폴더를 나누는 계층형 구조 대신, 도메인 하나에 필요한 `controller`, `service`, `dto`, `entity`를 같은 폴더 안에 모아두는 도메인 단위 구조를 사용합니다.
```bash
BE
├── .github/                    # GitHub Actions (CI/CD), 이슈/PR 템플릿
│   ├── ISSUE_TEMPLATE/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── cd.yml
│   └── PULL_REQUEST_TEMPLATE.md
│
├── scripts/                    # 운영 스크립트 (DB 백업 등)
│   └── backup-db.sh
│
├── src/
│   ├── ai/                     # AI 질문/답변/추천 기능
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── services/
│   │   ├── ai.controller.ts
│   │   ├── ai.module.ts
│   │   └── ai.swagger.ts
│   ├── alarms/                 # 푸시 알림, 리마인더 기능
│   │   ├── entities/
│   │   ├── services/
│   │   ├── alarms.controller.ts
│   │   ├── alarms.dto.ts
│   │   ├── alarms.module.ts
│   │   ├── alarms.swagger.ts
│   │   └── firebase-admin.provider.ts
│   ├── auth/                   # 회원가입/로그인, JWT 인증
│   │   ├── entities/
│   │   ├── auth.controller.ts
│   │   ├── auth.decorator.ts
│   │   ├── auth.dto.ts
│   │   ├── auth.interface.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.swagger.ts
│   │   ├── email-verification.service.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── jwt.strategy.ts
│   ├── categories/             # 카테고리 관련 기능
│   │   ├── entities/
│   │   ├── category.controller.ts
│   │   ├── category.dto.ts
│   │   ├── category.module.ts
│   │   ├── category.service.ts
│   │   └── category.swagger.ts
│   ├── diaries/                # 일기 작성/조회 기능
│   │   ├── entities/
│   │   ├── enums/
│   │   ├── diary.controller.ts
│   │   ├── diary.dto.ts
│   │   ├── diary.module.ts
│   │   ├── diary.service.ts
│   │   └── diary.swagger.ts
│   ├── global/                 # 공통 모듈 (인터셉터, 에러 필터, 메일, S3 등)
│   │   ├── common/
│   │   ├── decorators/
│   │   ├── error/
│   │   ├── mail/
│   │   ├── s3/
│   │   ├── utills/
│   │   ├── base-model.ts
│   │   └── date.util.ts
│   ├── migrations/             # TypeORM 마이그레이션 파일
│   ├── schedules/               # 일정 관련 기능
│   │   ├── entities/
│   │   ├── schedule.controller.ts
│   │   ├── schedule.dto.ts
│   │   ├── schedule.module.ts
│   │   └── schedule.service.ts
│   ├── stats/                  # 통계 기능
│   │   ├── stats.controller.ts
│   │   ├── stats.dto.ts
│   │   ├── stats.module.ts
│   │   ├── stats.service.ts
│   │   └── stats.swagger.ts
│   ├── users/                  # 사용자 정보 관리
│   │   ├── entities/
│   │   ├── user.module.ts
│   │   ├── user.service.ts
│   │   ├── users.controller.ts
│   │   ├── users.dto.ts
│   │   └── users.swagger.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── data-source.ts          # TypeORM 데이터소스 설정
│   └── main.ts                 # 서버 실행 진입점
│
├── test/                       # e2e 테스트
│   ├── fcm/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── .coderabbit.yaml             # CodeRabbit 리뷰 설정
├── .env                         # 환경 변수
├── .prettierrc
├── package.json
└── README.md
```
## 📍 Back-End GitHub 협업
 
### ▷ 작업 프로세스 요약
1. **이슈 생성** → GitHub Issue 탭에서 작업할 내용 등록 (이슈명: `[Feat/Fix/Chore/Refactor] 이슈 명`) → Assignees 본인 지정
2. **Branch 생성** → `develop`에서 분기하여 작업 브랜치 생성
3. **작업 및 Push** → 컨벤션에 맞춰 커밋 진행 후 원격 저장소에 push
4. **Pull Request 생성** → 작업 브랜치 → `develop`으로 PR 생성, 템플릿에 맞춰 작성
5. **Review & Merge** → 팀원 리뷰 후 `develop`에 병합
### ▷ Branch 전략
| 브랜치명 | 설명 | 명명 규칙 예시 |
| --- | --- | --- |
| main | 실제 배포되어 운영되는 서버의 코드 | main |
| develop | 다음 배포를 위해 개발된 기능들이 통합되는 브랜치 | develop |
| feature | 단위 기능 개발을 위한 브랜치, develop에서 분기 | feature/이슈-번호 |
 
- 브랜치명 형식: `<타입>/#<이슈번호>`
- 예시: `feat/#12`, `fix/#23`
### ▷ 이슈 유형 & 커밋 컨벤션
| 타입 | 설명 | 커밋 예시 |
| --- | --- | --- |
| **Feat** | 새로운 기능 추가 | `Feat: 카카오 로그인 기능 구현` |
| **Fix** | 오류/버그 수정 | `Fix: 세부과제 상태 변경 시 권한 체크 오류 수정` |
| **Chore** | 빌드 설정, CI/CD, 라이브러리 변경 | `Chore: GitHub Actions CD 배포 설정` |
| **Docs** | 문서 수정 (README, API 명세 등) | `Docs: API 엔드포인트 명세 업데이트` |
| **Refactor** | 기능 변경 없는 코드 구조 개선 | `Refactor: 알림 서비스 로직 개선` |
 
**커밋 메시지 규칙**
- 형식: `<타입>: 제목`
- 세미콜론(;)으로 문장 종료, 문자열은 작은따옴표 사용
- 하나의 작업 단위별로 커밋 (너무 크거나 작은 커밋 지양)
### ▷ 브랜치 생성 및 작업 방법 (Git CLI)
```bash
# 1. develop 브랜치로 이동 및 최신화
git checkout develop
git pull origin develop
 
# 2. 작업 브랜치 생성
git checkout -b <타입>/#이슈번호
 
# 3. 작업 후 커밋
git add .
git commit -m "<타입>: 내용"
 
# 4. 원격 저장소 push
git push origin <타입>/#이슈번호
```
 
- 개인 브랜치 작업 전에는 항상 `develop`을 최신화하여 Conflict를 최소화한다.
- PR을 올린 상태에서 추가 작업이 필요한 경우 커밋 제목 앞에 `[WIP]`를 붙인다. (예: `[WIP]Feat/#12] 카카오 로그인 로직 구현`)
### ▷ Pull Request 작성 방법
1. 작업 브랜치를 push한 후 GitHub에서 `develop`으로 PR 생성
2. **제목 형식**: `[타입/#이슈번호] 작업 내용` (예: `[Feat/#12] 카카오 로그인 기능 구현`)
3. **Assignees**: PR 작성자 본인 지정 / Reviewer는 별도 지정하지 않음
4. **본문 템플릿**
```markdown
### 📌 관련 이슈번호
- Closes #이슈번호
 
### 📌 PR 유형
- [ ] 새 기능 추가
- [ ] 버그 수정
- [ ] 리팩토링
- [ ] 배포/설정 변경
 
### 📌 PR 요약
해당 PR을 간단하게 요약해 주세요
 
### 📌 작업 세부 내용
1.
2.
3.
 
### 📸 스크린샷 (선택)
 
### 🔗 참고 자료
```
 
**주의사항**
- PR은 작고 명확한 단위로 만들어 리뷰 부담을 줄인다.
- 충분한 테스트를 거친 후 PR을 생성한다.
- 리뷰는 CodeRabbit을 통해 1차 검토를 진행하며, 지적된 사항은 확인 후 반영한다.
- `Closes #이슈번호`를 반드시 포함하여 머지 시 이슈가 자동으로 닫히도록 한다.
---
 
## ⚙️ API 설계
 
### ▷ 공통 응답 포맷
```json
// 성공 시
{
  "resultType": "SUCCESS",
  "message": "string",
  "data": {
    ...
  }
}
 
// 실패 시
{
  "resultType": "FAIL",
  "code": 500,
  "errorCode": "INTERNAL_SERVER_ERROR",
  "reason": "서버 내부 오류가 발생했습니다",
  "data": null
}
```
 
### ▷ HTTP 상태 코드
| 코드 | 상태 텍스트 | 의미 |
| :---: | --- | --- |
| 200 | OK | 서버가 요청을 성공적으로 처리 |
| 201 | Created | 요청이 처리되어 새로운 리소스가 생성됨 |
| 400 | Bad Request | 요청의 구문/파라미터가 잘못됨 |
| 401 | Unauthorized | 인증에 실패함 (토큰 없음/만료) |
| 403 | Forbidden | 인증은 되었으나 해당 리소스에 대한 접근 권한 없음 |
| 404 | Not Found | 지정한 리소스를 찾을 수 없음 |
| 409 | Conflict | 요청 처리 중 리소스 상태 충돌 발생 (중복 등) |
| 500 | Internal Server Error | 서버 내부 오류 발생 |
 
### ▷ 커스텀 에러 클래스 구조
`CustomError`를 상속받아 도메인 공통으로 사용하는 에러 클래스를 정의한다. 서비스 레이어에서는 `try/catch` 없이 `throw`만 하고, 공통 Exception Filter/Middleware가 이를 받아 정해진 응답 포맷으로 변환한다.
 
```js
// 기본 커스텀 에러 클래스
class CustomError extends Error {
  constructor(statusCode, errorCode, reason, data = null) {
    super(reason);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.reason = reason;
    this.data = data;
    this.name = this.constructor.name;
  }
}
 
// 400 Bad Request
class BadRequestError extends CustomError {
  constructor(errorCode = 'BAD_REQUEST', reason = '잘못된 요청입니다', data = null) {
    super(400, errorCode, reason, data);
  }
}
 
// 401 Unauthorized
class UnauthorizedError extends CustomError {
  constructor(errorCode = 'UNAUTHORIZED', reason = '인증에 실패했습니다', data = null) {
    super(401, errorCode, reason, data);
  }
}
 
// 403 Forbidden
class ForbiddenError extends CustomError {
  constructor(errorCode = 'FORBIDDEN', reason = '접근 권한이 없습니다', data = null) {
    super(403, errorCode, reason, data);
  }
}
 
// 404 Not Found
class NotFoundError extends CustomError {
  constructor(errorCode = 'NOT_FOUND', reason = '리소스를 찾을 수 없습니다', data = null) {
    super(404, errorCode, reason, data);
  }
}
 
// 409 Conflict
class ConflictError extends CustomError {
  constructor(errorCode = 'CONFLICT', reason = '요청이 리소스 상태와 충돌합니다', data = null) {
    super(409, errorCode, reason, data);
  }
}
 
// 500 Internal Server Error
class InternalServerError extends CustomError {
  constructor(errorCode = 'INTERNAL_SERVER_ERROR', reason = '서버 내부 오류가 발생했습니다', data = null) {
    super(500, errorCode, reason, data);
  }
}
 
module.exports = {
  CustomError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
};
```
 
### ▷ 에러 처리 규칙
| 규칙 | 내용 |
| --- | --- |
| 검증 위치 | 필수값 존재 여부는 컨트롤러(DTO)에서, 비즈니스 규칙 검증(중복, 권한, 상태 불일치 등)은 서비스에서 |
| 에러 발생 방식 | `errors/` 커스텀 에러 클래스를 그대로 `throw`, `try/catch`로 감싸지 않음 |
| 공통 처리 | 공통 에러 핸들링 미들웨어가 statusCode/errorCode/reason을 받아 위 실패 응답 포맷으로 변환 |
| 에러 코드 네이밍 | `<도메인>_<상황>` 형태의 스네이크 케이스 사용 (예: `TASK_NOT_FOUND`, `USER_NICKNAME_DUPLICATED`, `ALARM_NOT_FOUND`) |
| 신규 에러 유형 | 새로운 에러 유형이 생길 때마다 팀 노션/문서에 업데이트 |
## 📝 주요 API 목록

### 🔐 Auth Domain
| 기능명 | Method | Endpoint | 설명 |
| :--- | :---: | :--- | :--- |
| 이메일 중복 확인 | POST | `/auth/signup/email/check` | 회원가입 이메일 중복 체크 |
| 이메일 인증번호 전송 | POST | `/auth/signup/email/verification/send` | 회원가입 이메일 인증번호 전송 |
| 이메일 인증번호 검증 | POST | `/auth/signup/email/verification/verify` | 회원가입 이메일 인증번호 검증 |
| 자체 회원가입 | POST | `/auth/signup` | 자체 회원가입 |
| 자체 로그인 | POST | `/auth/login` | 자체 로그인 |
| Access Token 재발급 | POST | `/auth/token/reissue` | Refresh Token 기반 Access Token 재발급 |
| 로그아웃 | POST | `/auth/logout` | 통합 로그아웃 |
| 회원 탈퇴 | DELETE | `/auth/withdraw` | 회원 탈퇴 |
| 비밀번호 변경 | PATCH | `/auth/password` | 로그인 상태에서 비밀번호 변경 |
| 현재 비밀번호 확인 | POST | `/auth/password/check` | 현재 비밀번호 일치 여부 확인 |
| 비밀번호 찾기 인증번호 전송 | POST | `/auth/password/reset/email/verification/send` | 비밀번호 찾기 인증번호 전송 |
| 비밀번호 찾기 인증번호 검증 | POST | `/auth/password/reset/email/verification/verify` | 비밀번호 찾기 인증번호 검증 |
| 비밀번호 재설정 | PATCH | `/auth/password/reset` | 비밀번호 재설정 |

### 👤 User Domain
| 기능명 | Method | Endpoint | 설명 |
| :--- | :---: | :--- | :--- |
| 사용자 정보 조회 | GET | `/users/me` | 로그인 사용자 정보 조회 |
| 사용자 정보 수정 | PATCH | `/users/me` | 닉네임, 이메일, 프로필 이미지 수정 |
| AI 일기 요약 ON/OFF | PATCH | `/users/ai-summary` | AI 일기 요약 기능 활성화 여부 변경 |

### 🔔 Alarm Domain
| 기능명 | Method | Endpoint | 설명 |
| :--- | :---: | :--- | :--- |
| 알람 설정 조회 | GET | `/alarms` | 로그인 사용자 알림 설정 조회 |
| 알람 설정 수정 | PATCH | `/alarms` | 푸시/일기/답장 알림 ON·OFF 수정 |
| 리마인드 설정 조회 | GET | `/alarms/reminder` | 리마인드 요일·시간 조회 |
| 리마인드 설정 수정 | PATCH | `/alarms/reminder` | 리마인드 요일·시간 수정 |
| FCM 토큰 등록 | POST | `/alarms/push-token` | 앱 로그인·실행 시 FCM 토큰 등록 |
| FCM 토큰 삭제 | DELETE | `/alarms/push-token/:tokenId` | 앱 로그아웃 시 FCM 토큰 삭제 |

### 📅 Schedule Domain
| 기능명 | Method | Endpoint | 설명 |
| :--- | :---: | :--- | :--- |
| 전체 일정 목록 조회 | GET | `/schedules` | 날짜 범위 기반 일정 조회 |
| 가까운 일정 조회 | GET | `/schedules/upcoming` | 내일~7일 후 미완료 일정 조회 |
| 일정 등록 | POST | `/schedules` | 단일·반복 일정 생성 |
| 일정 수정 | PATCH | `/schedules/:scheduleId` | 일정 정보 수정 |
| 일정 완료 상태 변경 | PATCH | `/schedules/:scheduleId/completion` | 일정 완료·미완료 처리 |
| 일정 삭제 | DELETE | `/schedules/:scheduleId` | 일정 삭제 |

### 🗂️ Category Domain
| 기능명 | Method | Endpoint | 설명 |
| :--- | :---: | :--- | :--- |
| 카테고리 목록 조회 | GET | `/categories` | 사용자 카테고리 목록 조회 |
| 카테고리 생성 | POST | `/categories` | 카테고리 생성 |
| 카테고리 수정 | PATCH | `/categories/:categoryId` | 카테고리 이름·색상 수정 |
| 카테고리 삭제 | DELETE | `/categories/:categoryId` | 카테고리 삭제 |
| 카테고리 순서 변경 | PATCH | `/categories/order` | 카테고리 순서 변경 |

### 📔 Diary Domain
| 기능명 | Method | Endpoint | 설명 |
| :--- | :---: | :--- | :--- |
| 일기 목록 조회 | GET | `/diaries` | 사용자 전체 일기 목록 조회 |
| 일기 상세 조회 | GET | `/diaries/:diaryId` | 일기 상세 조회 |
| 일기 작성 | POST | `/diaries` | 일기 작성 (이미지 최대 3장) |
| 일기 수정 | PATCH | `/diaries/:diaryId` | 일기 제목·내용 수정 |
| 일기 삭제 | DELETE | `/diaries/:diaryId` | 일기 삭제 |

### 📊 Stats Domain
| 기능명 | Method | Endpoint | 설명 |
| :--- | :---: | :--- | :--- |
| 통계 메인 조회 | GET | `/stats` | 오늘·이번 주 일정 통계 조회 |
| 일정 통계 상세 조회 | GET | `/stats/detail` | 월별 일정 통계 상세 조회 |
| 미완료 일정 조회 | GET | `/stats/schedules/pending` | 월별 미완료 일정 조회 |
| 완료 일정 조회 | GET | `/stats/schedules/completed` | 월별 완료 일정 조회 |

### 🤖 AI Domain
| 기능명 | Method | Endpoint | 설명 |
| :--- | :---: | :--- | :--- |
| 오늘의 질문 조회 | GET | `/ai/questions/today` | 오늘의 AI 질문 조회 |
| AI 답변 생성 | POST | `/ai/answer/:diaryId` | 일기 기반 AI 답변 생성 |
| AI 답변 조회 | GET | `/ai/answer/:diaryId` | 생성된 AI 답변 조회 |
| AI 일정 추천 최초 생성 | POST | `/ai/schedules` | 오늘 일기 기반 일정 3개 추천 |
| AI 일정 추천 추가 생성 | POST | `/ai/schedules/add` | 추천 일정 1개 추가 생성 |
| AI 일정 추천 재생성 | POST | `/ai/schedules/regenerate` | 통계용 일정 추천 재생성 |
| AI 일정 추천 조회 | GET | `/ai/schedules` | 오늘 AI 일정 추천 조회 |
| 일기별 AI 일정 추천 조회 | GET | `/ai/schedules/:diaryId` | 특정 일기의 AI 추천 조회 |

