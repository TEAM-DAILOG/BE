import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

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
      description: '오늘의 질문을 재생성합니다. 만들어진 질문을 덮어쓰기합니다',
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

// AI 답변 생성
export function CreateAnswerSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'AI 답변 생성',
      description:
        '일기 내용을 바탕으로 AI 답변을 생성합니다. 테스트 단계라 이미 답변이 있어도 매번 새로 덮어씁니다.',
    }),
    ApiParam({
      name: 'diaryId',
      type: Number,
      description: '일기 ID',
    }),
    ApiResponse({
      status: 201,
      description: 'AI 답변 생성 성공',
    }),
    ApiResponse({
      status: 404,
      description: '존재하지 않는 일기',
    }),
    ApiResponse({
      status: 500,
      description: '서버 내부 오류',
    }),
  );
}

// AI 답변 확인
export function FindAnswerSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'AI 답변 확인',
    }),
    ApiParam({
      name: 'diaryId',
      type: Number,
      description: '일기 ID',
    }),
    ApiResponse({
      status: 200,
      description: 'AI 답변 조회 성공',
    }),
    ApiResponse({
      status: 404,
      description: '존재하지 않는 일기이거나 아직 생성된 답변이 없음',
    }),
    ApiResponse({
      status: 500,
      description: '서버 내부 오류',
    }),
  );
}

// 질문-일기 연결 (테스트용)
export function LinkDiaryQuestionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '질문-일기 연결 (테스트용)',
      description:
        'questionId와 diaryId로 질문-일기 매핑을 생성/갱신합니다. diary.service.ts에서 정식 연동되기 전까지 쓰는 임시 테스트용 엔드포인트입니다.',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['questionId', 'diaryId'],
        properties: {
          questionId: { type: 'number', example: 1 },
          diaryId: { type: 'number', example: 1 },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: '질문-일기 연결 성공',
    }),
    ApiResponse({
      status: 404,
      description: '존재하지 않는 질문 또는 일기',
    }),
    ApiResponse({
      status: 500,
      description: '서버 내부 오류',
    }),
  );
}

// 일기-질문 매핑 조회
export function FindDiaryQuestionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '일기-질문 매핑 조회',
      description:
        '일기와 질문을 연결하는 매핑 테이블(DiaryQuestion) row를 조회합니다. 이 매핑은 일기 작성 과정에서 자동으로 생성될 예정이며, 이 API는 그 결과를 확인하는 용도입니다.',
    }),
    ApiParam({
      name: 'diaryId',
      type: Number,
      description: '일기 ID',
    }),
    ApiResponse({
      status: 200,
      description: '일기-질문 매핑 조회 성공',
    }),
    ApiResponse({
      status: 404,
      description: '존재하지 않는 일기이거나 매핑된 질문이 없음',
    }),
    ApiResponse({
      status: 500,
      description: '서버 내부 오류',
    }),
  );
}
