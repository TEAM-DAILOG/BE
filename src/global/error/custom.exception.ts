import { HttpException } from "@nestjs/common";

//기본 커스텀 에러
export class CustomException extends HttpException{
  constructor(
    public readonly statusCode: number,
    public readonly errorCode: string,
    public readonly reason: string,
    public readonly data: unknown = null,
  ){
    super({ statusCode, errorCode, reason, data }, statusCode);
  }
}

// BAD_REQUEST
export class BadRequestException extends CustomException{
  constructor(
    reason = '잘못된 요청입니다.',
    errorCode = 'BAD_REQUEST',
    data = null,
  ){
    super(400, errorCode, reason, data);
  }
}

// UNAUTHORIZED
export class UnauthorizedException extends CustomException{
  constructor(
    reason = '인증에 실패했습니다.',
    errorCode = 'UNAUTHORIZED',
    data = null,
  ){
    super(401, errorCode, reason, data);
  }
}

// FORBIDDEN
export class ForbiddenException extends CustomException{
  constructor(
    reason = '접근 권한이 없습니다.',
    errorCode = 'FORBIDDEN',
    data = null,
  ){
    super(403, errorCode, reason, data);
  }
}

//NOT_FOUND
export class NotFoundException extends CustomException {
  constructor(
    reason = '리소스를 찾을 수 없습니다',
    errorCode = 'NOT_FOUND',
    data = null,
  ) {
    super(404, errorCode, reason, data);
  }
}

// INTERNAL_SERVER_ERROR
export class InternalServerException extends CustomException {
  constructor(
    reason = '서버 내부 오류가 발생했습니다',
    errorCode = 'INTERNAL_SERVER_ERROR',
    data = null,
  ) {
    super(500, errorCode, reason, data);
  }
}