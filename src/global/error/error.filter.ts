// 모든 에러를 최종적으로 처리하는 곳
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { CustomException } from './custom.exception';

interface ErrorResponse {
  resultType: 'FAIL';
  code: number;
  errorCode: string;
  reason: string;
  data: unknown;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  //에러 종류 판별 후 각 핸들러로 위임
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();

    const errorResponse = this.resolveException(exception, request);

    response.status(errorResponse.code).json(errorResponse);
  }

  private resolveException(
    exception: unknown,
    request: Request
  ): ErrorResponse {
    if (exception instanceof CustomException){
      return this.handleCustomException(exception, request);
    }

    if (exception instanceof HttpException){
      return this.handleHttpException(exception, request);
    }

    return this.handleUnknownException(exception, request);
  }

  // 커스텀 에러 처리
  private handleCustomException(
    exception: CustomException,
    request: Request,
  ): ErrorResponse{
    this.logger.warn(`[${exception.errorCode}] ${exception.reason} - ${request.method} ${request.url}`,);
    return {
      resultType: 'FAIL',
      code: exception.statusCode,
      errorCode: exception.errorCode,
      reason: exception.reason,
      data: exception.data,
    };
  }

  // 기본 에러 처리(HTTP 상태 코드)
  private handleHttpException(
    exception: HttpException,
    request: Request,
  ): ErrorResponse{
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const reason = this.extractReason(exceptionResponse, exception.message);
    this.logger.warn( `[HTTP_EXCEPTION] ${reason} - ${request.method} ${request.url}`,);

    return {
      resultType: 'FAIL',
      code: status,
      errorCode: HttpStatus[status] ?? 'HTTP_ERROR',
      reason,
      data: null,
    };
  }

  // 서버 내부 오류 처리 (500 에러)
  private handleUnknownException(
    exception: unknown,
    request: Request,
  ): ErrorResponse{
    this.logger.error(
      `[UNHANDLED] ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    return{
      resultType: 'FAIL',
      code: 500,
      errorCode: 'INTERNAL_SERVER_ERROR',
      reason: '서버 내부에 오류가 발생했습니다.',
      data: null,
    };
  }

  // DTO 유효성 검사 에러 처리
  private extractReason(
    exceptionResponse: string | object,
    fallback: string,
  ): string {
    if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
      const message = (exceptionResponse as any).message;
      return Array.isArray(message) ? message.join(', ') : message;
    }
    return fallback;
  };
}