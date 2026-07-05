# AGENTS.md

This file gives AI coding agents project-specific guidance for the Dailog backend.

## Project Overview

- Framework: NestJS 11
- Language: TypeScript
- Database stack: TypeORM + PostgreSQL
- API docs: Swagger
- Runtime entry: `src/main.ts`

## Commands

- Install dependencies: `npm install`
- Run development server: `npm run dev` or `npm run start:dev`
- Build: `npm run build`
- Format: `npm run format`
- Lint: `npm run lint`
- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`

Note: `npm run lint` currently runs ESLint with `--fix`, so it may modify existing files.

## Code Style

- Use TypeScript.
- Avoid `any` unless there is a clear reason.
- Use semicolons.
- Use camelCase for variables and functions.
- Use PascalCase for classes.
- Follow the repository's Prettier and ESLint configuration.
- Do not make unrelated formatting or refactoring changes.

## Naming Rules

- File names use kebab-case plus a role suffix.
- Examples:
  - `schedule.controller.ts`
  - `schedule.service.ts`
  - `schedule.module.ts`
  - `schedule.dto.ts`
  - `schedule.entity.ts`
  - `schedule.interface.ts`
- Domain folders use plural kebab-case, such as `schedules`, `diaries`, `categories`.
- DTOs for the same domain should be grouped in one `*.dto.ts` file when practical.

## NestJS Architecture

- Keep domain logic in domain modules.
- Controllers should handle routing and delegate business logic to services.
- Services should own business logic, validation beyond DTO checks, database access, and external API calls.
- Do not access repositories or the database directly from controllers.
- Register controllers and providers in the matching module.
- When another module's service is needed, use `imports` and `exports` explicitly.
- Put only truly shared filters, interceptors, decorators, and helpers under `src/global` or shared/common folders.

## Error And Response Rules

- Global exception handling lives under `src/global/error`.
- Success response wrapping lives under `src/global/common`.
- Controllers should not manually wrap successful responses as `{ resultType: "SUCCESS", ... }`; the response interceptor handles that.
- Throw custom exceptions instead of using local try/catch for ordinary API errors.
- Failure responses should follow:

```json
{
  "resultType": "FAIL",
  "code": 500,
  "errorCode": "INTERNAL_SERVER_ERROR",
  "reason": "서버 내부 오류가 발생했습니다",
  "data": null
}
```

- Do not expose secrets, credentials, or internal stack traces in API responses.

## Git And PR Conventions

- Main development branch: `develop`
- Feature branches: `feat/#<issue-number>`
- Bugfix branches: `fix/#<issue-number>`
- Commit message format: `<Type>: <description>`
- Common types: `Feat`, `Fix`, `Chore`, `Docs`, `Refactor`
- Keep commits scoped to one meaningful change.
- PRs should target `develop` unless explicitly instructed otherwise.

## Safety Notes

- Do not revert user changes unless explicitly asked.
- Read existing files before editing.
- Prefer the existing project patterns over introducing new abstractions.
- Keep changes focused on the user request.
