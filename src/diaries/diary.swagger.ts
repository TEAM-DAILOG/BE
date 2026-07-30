import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

// 일기 목록 조회
export function FindAllDiarySwagger() {
  return applyDecorators(
    ApiOperation({ summary: '일기 목록 조회' }),
    ApiResponse({
      status: 200,
      description: '일기 목록 조회 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '일기 목록 조회 성공',
          data: [
            {
              diaryId: 2,
              userId: 1,
              date: '2026-07-28',
              diaryType: 'QUESTION',
              diaryTitle: '오늘 하루',
              content: '오늘 친구와 산책했다.',
              aiSummary: null,
              images: ['https://example.com/image1.jpg'],
            },
            {
              diaryId: 1,
              userId: 1,
              date: '2026-07-27',
              diaryType: 'FREE',
              diaryTitle: '자유일기',
              content: '오늘은 혼자 책을 읽었다.',
              aiSummary: '책 읽는 여유로운 하루',
              images: [],
            },
          ],
        },
      },
    }),
    ApiResponse({ status: 401, description: '사용자 인증 실패' }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

// 일기 상세 조회
export function FindDiarySwagger() {
  return applyDecorators(
    ApiOperation({ summary: '일기 상세 조회' }),
    ApiParam({ name: 'diaryId', type: Number, description: '일기 ID' }),
    ApiResponse({
      status: 200,
      description: '일기 상세 조회 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '일기 상세 조회 성공',
          data: {
            diaryId: 27,
            userId: 1,
            date: '2026-07-28',
            diaryType: 'QUESTION',
            diaryTitle: '오늘 하루',
            content: '오늘 친구와 산책했다.',
            aiSummary: null,
            questionContent:
              '오늘 당신의 마음을 가장 잘 대변해주는 날씨나 풍경은 어떤 모습인가요?',
            images: ['https://example.com/image1.jpg'],
          },
        },
      },
    }),
    ApiResponse({ status: 401, description: '사용자 인증 실패' }),
    ApiResponse({ status: 404, description: '존재하지 않는 일기' }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

// 일기 작성
export function CreateDiarySwagger() {
  return applyDecorators(
    ApiOperation({ summary: '일기 작성' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['title', 'content', 'date'],
        properties: {
          title: { type: 'string', example: '오늘 하루' },
          content: { type: 'string', example: '오늘 친구와 산책했다.' },
          questionId: { type: 'number', nullable: true, example: 1 },
          date: {
            type: 'string',
            format: 'date-time',
            example: '2026-07-28T00:30:00+09:00',
          },
          images: {
            type: 'array',
            items: { type: 'string', format: 'binary' },
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: '일기 작성 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '일기 작성 성공',
          data: {
            diaryId: 29,
            userId: 1,
            date: '2026-07-28',
            diaryType: 'QUESTION',
            diaryTitle: '오늘 하루',
            content: '오늘 친구와 산책했다.',
            aiSummary: null,
          },
        },
      },
    }),
    ApiResponse({ status: 400, description: '잘못된 요청' }),
    ApiResponse({ status: 401, description: '사용자 인증 실패' }),
    ApiResponse({ status: 404, description: '존재하지 않는 질문' }),
    ApiResponse({ status: 409, description: '오늘 이미 일기를 작성한 경우' }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

// 일기 수정
export function UpdateDiarySwagger() {
  return applyDecorators(
    ApiOperation({ summary: '일기 수정' }),
    ApiParam({ name: 'diaryId', type: Number }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string', example: '수정된 제목' },
          content: { type: 'string', example: '수정된 내용' },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: '일기 수정 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '일기 수정 성공',
          data: {
            diaryId: 5,
            userId: 1,
            diaryType: 'QUESTION',
            diaryTitle: '수정된 제목',
            content: '수정된 내용',
            aiSummary: null,
            date: '2026-07-28',
          },
        },
      },
    }),
    ApiResponse({ status: 401, description: '사용자 인증 실패' }),
    ApiResponse({ status: 404, description: '존재하지 않는 일기' }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

// 일기 삭제
export function DeleteDiarySwagger() {
  return applyDecorators(
    ApiOperation({ summary: '일기 삭제' }),
    ApiParam({ name: 'diaryId', type: Number }),
    ApiResponse({
      status: 200,
      description: '일기 삭제 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '일기 삭제 성공',
          data: null,
        },
      },
    }),
    ApiResponse({ status: 401, description: '사용자 인증 실패' }),
    ApiResponse({ status: 404, description: '존재하지 않는 일기' }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}
