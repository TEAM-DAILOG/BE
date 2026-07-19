import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

// 일기 목록 조회
export function FindAllDiarySwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '일기 목록 조회',
    }),
    ApiResponse({
      status: 200,
      description: '일기 목록 조회 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '일기 목록 조회 성공',
          data: [
            {
              createdAt: '2026-07-19T17:53:56.937Z',
              updatedAt: '2026-07-19T17:53:56.937Z',
              deletedAt: null,
              diaryId: 27,
              userId: 1,
              diaryType: 'QUESTION',
              diaryTitle: '오늘 하루',
              content: '오늘 친구와 산책했다.',
              aiSummary: null,
           },
        ],
    },
  },
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
      schema: {
       example: {
  resultType: 'SUCCESS',
  message: '일기 상세 조회 성공',
  data: {
    diaryId: 27,
    userId: 1,
    diaryType: 'QUESTION',
    diaryTitle: '오늘 하루',
    content: '오늘 친구와 산책했다.',
    aiSummary: null,
    createdAt: '2026-07-19T17:53:56.937Z',
    updatedAt: '2026-07-19T17:53:56.937Z',
    questionContent: '오늘 당신의 마음을 가장 잘 대변해주는 날씨나 풍경은 어떤 모습인가요?',
    images: [],
  },
},
  },
}),

   ApiResponse({
      status: 401,
      description: '사용자 인증 실패',
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


    ApiConsumes('multipart/form-data'),

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
              format: 'binary',
            },
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
    createdAt: '2026-07-19T17:58:11.931Z',
    updatedAt: '2026-07-19T17:58:11.931Z',
    deletedAt: null,
    diaryId: 29,
    userId: 1,
    diaryType: 'QUESTION',
    diaryTitle: '오늘 하루',
    content: '오늘 친구와 산책했다.',
    aiSummary: null,
  },
},
  },
}),
    ApiResponse({
      status: 400,
      description: '잘못된 요청',
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
  schema: {
    example: {
      resultType: 'SUCCESS',
      message: '일기 수정 성공',
      data: {
        createdAt: '2026-07-18T15:45:02.114Z',
        updatedAt: '2026-07-19T18:10:47.031Z',
        deletedAt: null,
        diaryId: 5,
        userId: 1,
        diaryType: 'QUESTION',
        diaryTitle: '수정된 제목',
        content: '수정된 내용',
        aiSummary: null,
      },
    },
  },
}),

       ApiResponse({
      status: 401,
      description: '사용자 인증 실패',
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
  schema: {
    example: {
      resultType: 'SUCCESS',
      message: '일기 삭제 성공',
      data: {
        generatedMaps: [],
        raw: [],
        affected: 1,
      },
    },
  },
}),

       ApiResponse({
      status: 401,
      description: '사용자 인증 실패',
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
