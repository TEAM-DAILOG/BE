import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

// 오늘의 질문 조회
export function FindTodayQuestionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '오늘의 질문 조회',
    }),
    ApiResponse({
      status: 200,
      description: '오늘의 질문 조회 성공',
    }),
    ApiResponse({
      status: 500,
      description: '서버 내부 오류',
    }),
  );
}

// 오늘의 질문 재생성 (테스트용)
export function RegenerateTodayQuestionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '오늘의 질문 재생성 (테스트용)',
    }),
    ApiResponse({
      status: 200,
      description: '오늘의 질문 재생성 성공',
    }),
    ApiResponse({
      status: 500,
      description: '서버 내부 오류',
    }),
  );
}
