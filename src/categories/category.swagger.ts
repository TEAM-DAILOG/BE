import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

// 카테고리 조회
export function FindAllCategorySwagger() {
  return applyDecorators(
    ApiOperation({ summary: '카테고리 목록 조회' }),
    ApiResponse({
      status: 200,
      description: '카테고리 조회 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '카테고리 조회 성공',
          data: [
            {
              categoryId: 1,
              categoryName: '운동',
              categoryColor: 'BLUE',
              categoryOrder: 1,
            },
            {
              categoryId: 2,
              categoryName: '공부',
              categoryColor: 'GREEN',
              categoryOrder: 2,
            },
          ],
        },
      },
    }),
    ApiResponse({ status: 401, description: '사용자 인증 실패' }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

// 카테고리 생성
export function CreateCategorySwagger() {
  return applyDecorators(
    ApiOperation({ summary: '카테고리 생성' }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['categoryName', 'categoryColor'],
        properties: {
          categoryName: {
            type: 'string',
            description: '카테고리 이름',
            example: '운동',
          },
          categoryColor: {
            type: 'string',
            description: '카테고리 색상',
            enum: ['BLUE', 'BROWN', 'GREEN', 'PURPLE', 'PINK'],
            example: 'BLUE',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: '카테고리 생성 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '카테고리 생성 성공',
          data: {
            categoryId: 1,
            categoryName: '운동',
            categoryColor: 'BLUE',
            categoryOrder: 1,
          },
        },
      },
    }),
    ApiResponse({ status: 400, description: '잘못된 요청' }),
    ApiResponse({ status: 401, description: '사용자 인증 실패' }),
    ApiResponse({
      status: 409,
      description: '카테고리는 최대 5개까지 생성할 수 있습니다.',
    }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

// 카테고리 수정
export function UpdateCategorySwagger() {
  return applyDecorators(
    ApiOperation({ summary: '카테고리 수정' }),
    ApiParam({
      name: 'categoryId',
      type: Number,
      description: '카테고리 ID',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          categoryName: {
            type: 'string',
            description: '카테고리 이름',
            example: '헬스',
          },
          categoryColor: {
            type: 'string',
            description: '카테고리 색상',
            enum: ['BLUE', 'BROWN', 'GREEN', 'PURPLE', 'PINK'],
            example: 'GREEN',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: '카테고리 수정 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '카테고리 수정 성공',
          data: {
            categoryId: 1,
            categoryName: '헬스',
            categoryColor: 'GREEN',
            categoryOrder: 1,
          },
        },
      },
    }),
    ApiResponse({ status: 400, description: '잘못된 요청' }),
    ApiResponse({ status: 401, description: '사용자 인증 실패' }),
    ApiResponse({
      status: 404,
      description: '존재하지 않는 카테고리입니다.',
    }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

// 카테고리 삭제
export function DeleteCategorySwagger() {
  return applyDecorators(
    ApiOperation({ summary: '카테고리 삭제' }),
    ApiParam({
      name: 'categoryId',
      type: Number,
      description: '카테고리 ID',
    }),
    ApiResponse({
      status: 200,
      description: '카테고리 삭제 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '카테고리 삭제 성공',
          data: null,
        },
      },
    }),
    ApiResponse({ status: 401, description: '사용자 인증 실패' }),
    ApiResponse({
      status: 404,
      description: '존재하지 않는 카테고리입니다.',
    }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

// 카테고리 순서 변경
export function ReorderCategorySwagger() {
  return applyDecorators(
    ApiOperation({ summary: '카테고리 순서 변경' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          categories: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                categoryId: {
                  type: 'number',
                  example: 1,
                },
                categoryOrder: {
                  type: 'number',
                  example: 2,
                },
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: '카테고리 순서 변경 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '카테고리 순서 변경 성공',
          data: null,
        },
      },
    }),
    ApiResponse({ status: 400, description: '잘못된 요청' }),
    ApiResponse({ status: 401, description: '사용자 인증 실패' }),
    ApiResponse({
      status: 404,
      description: '존재하지 않는 카테고리입니다.',
    }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}
