import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

// 일기 목록 조회
export function FindAllDiarySwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '일기 목록 조회',
    }),
    ApiResponse({
      status: 200,
      description: '일기 목록 조회 성공',
    }),
    ApiResponse({
      status: 401,
      description: '사용자 인증 실패',
    }),
    ApiResponse({
      status: 500,
      description: '서버 내부 오류',
    }),
  );
}

// 일기 상세 조회
export function FindDiarySwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '일기 상세 조회',
    }),
    ApiParam({
      name: 'diaryId',
      type: Number,
      description: '일기 ID',
    }),
    ApiResponse({
      status: 200,
      description: '일기 상세 조회 성공',
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

// 일기 작성
export function CreateDiarySwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '일기 작성',
    }),
    ApiBody({
      schema: {
        type: 'object',

        required: ['title', 'content'],

        properties: {
          title: {
            type: 'string',
            example: '오늘 하루',
          },
          content: {
            type: 'string',
            example: '오늘 친구와 산책했다.',
          },
          questionId: {
            type: 'number',
            nullable: true,
            example: 1,
          },
          images: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: [
              'https://s3.amazonaws.com/image1.jpg',
              'https://s3.amazonaws.com/image2.jpg',
            ],
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: '일기 작성 성공',
    }),
    ApiResponse({
      status: 400,
      description: '잘못된 요청',
    }),
    ApiResponse({
      status: 500,
      description: '서버 내부 오류',
    }),
  );
}

// 일기 수정
export function UpdateDiarySwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '일기 수정',
    }),
    ApiParam({
      name: 'diaryId',
      type: Number,
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            example: '수정된 제목',
          },
          content: {
            type: 'string',
            example: '수정된 내용',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: '일기 수정 성공',
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

// 일기 삭제
export function DeleteDiarySwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '일기 삭제',
    }),
    ApiParam({
      name: 'diaryId',
      type: Number,
    }),
    ApiResponse({
      status: 200,
      description: '일기 삭제 성공',
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
