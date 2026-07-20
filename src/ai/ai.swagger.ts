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
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '오늘의 질문 조회 성공',
          data: {
            questionId: 1,
            content: '오늘 가장 기억에 남는 순간은 무엇인가요?',
            targetDate: '2026-07-19',
          },
        },
      },
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
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '오늘의 질문 재생성 성공',
          data: {
            questionId: 1,
            content: '오늘 나를 웃게 만든 일이 있었나요?',
            targetDate: '2026-07-19',
          },
        },
      },
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
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: 'AI 답변 생성 성공',
          data: {
            answerId: 1,
            diaryId: 5,
            answer:
              '오늘 하루도 고생 많으셨어요. 맛있는 저녁까지 챙기셨다니 다행이에요.',
            createdAt: '2026-07-19T09:00:00.000Z',
          },
        },
      },
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
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: 'AI 답변 확인 성공',
          data: {
            answerId: 1,
            answer:
              '오늘 하루도 고생 많으셨어요. 맛있는 저녁까지 챙기셨다니 다행이에요.',
          },
        },
      },
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
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '질문-일기 연결 성공',
          data: null,
        },
      },
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
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '일기-질문 매핑 조회 성공',
          data: {
            diaryQuestionId: 1,
            questionId: 1,
            questionContent: '오늘 가장 기억에 남는 순간은 무엇인가요?',
            diaryId: 5,
            isWritten: true,
          },
        },
      },
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

// AI 일정 추천 최초 생성 (한 번에 3개)
export function CreateRecommendationsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'AI 일정 추천 최초 생성',
      description:
        '오늘 첫 호출 시 로그인한 유저의 오늘 일기 내용을 바탕으로 서로 겹치지 않는 일정을 한 번에 3개(일기 내용이 부족해 3개를 못 채우면 나온 만큼만) 추천합니다. 유저의 기존 카테고리와 유사한 게 있으면 연결하고, 없으면 새 카테고리를 생성해 연결합니다. 오늘 이미 추천이 하나라도 생성돼 있으면 errorCode `ALREADY_INITIALIZED`와 함께 409를 반환하니, 그 이후에는 추가 생성 API(`POST /ai/schedules/add`)를 사용하세요.',
    }),
    ApiResponse({
      status: 201,
      description: 'AI 일정 추천 최초 생성 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: 'AI 일정 추천 생성 성공',
          data: {
            recommendedScheduleCount: 3,
            recommendedSchedules: [
              {
                recommendId: 1,
                categoryId: 3,
                categoryTitle: '운동',
                categoryColor: 'BLUE',
                scheduleTitle: '저녁 러닝 30분',
                isAdded: false,
              },
              {
                recommendId: 2,
                categoryId: 4,
                categoryTitle: '공부',
                categoryColor: 'GREEN',
                scheduleTitle: 'TypeScript 강의 1시간',
                isAdded: false,
              },
              {
                recommendId: 3,
                categoryId: 5,
                categoryTitle: '독서',
                categoryColor: 'BLUE',
                scheduleTitle: '소설책 30페이지 읽기',
                isAdded: false,
              },
            ],
          },
        },
      },
    }),
    ApiResponse({
      status: 409,
      description:
        '오늘 작성된 일기가 없음(CONFLICT) 또는 오늘의 추천이 이미 생성됨(ALREADY_INITIALIZED)',
      schema: {
        example: {
          resultType: 'FAIL',
          code: 409,
          errorCode: 'ALREADY_INITIALIZED',
          reason: '오늘의 추천 일정이 이미 생성되었습니다.',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: '서버 내부 오류',
    }),
  );
}

// AI 일정 추천 추가 생성 (1개)
export function AddRecommendationSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'AI 일정 추천 추가 생성',
      description:
        '오늘 이미 생성된 추천 목록과 겹치지 않는 일정을 하나 더 추천합니다(호출당 정확히 1개). 최초 생성 여부와 무관하게 호출할 수 있습니다. 유저의 기존 카테고리와 유사한 게 있으면 연결하고, 없으면 새 카테고리를 생성해 연결합니다. 더 이상 추천할 게 없으면 errorCode `NO_MORE_RECOMMENDATIONS`와 함께 409를 반환합니다.',
    }),
    ApiResponse({
      status: 201,
      description: 'AI 일정 추천 추가 생성 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: 'AI 일정 추천 추가 생성 성공',
          data: {
            recommendId: 4,
            categoryId: 3,
            categoryTitle: '운동',
            scheduleTitle: '아침 스트레칭 10분',
          },
        },
      },
    }),
    ApiResponse({
      status: 409,
      description:
        '오늘 작성된 일기가 없음(CONFLICT) 또는 더 이상 추천할 일정이 없음(NO_MORE_RECOMMENDATIONS)',
      schema: {
        example: {
          resultType: 'FAIL',
          code: 409,
          errorCode: 'NO_MORE_RECOMMENDATIONS',
          reason: '더 이상 추천할 수 있는 일정이 없습니다.',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: '서버 내부 오류',
    }),
  );
}

// AI 일정 추천 조회
export function FindRecommendationsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'AI 일정 추천 조회',
      description:
        '로그인한 유저의 오늘 일기에 대한 추천 일정 목록을 조회합니다.',
    }),
    ApiResponse({
      status: 200,
      description: 'AI 일정 추천 조회 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: 'AI 일정 추천 조회 성공',
          data: {
            recommendedScheduleCount: 2,
            recommendedSchedules: [
              {
                recommendId: 1,
                categoryId: 3,
                categoryTitle: '운동',
                categoryColor: 'BLUE',
                scheduleTitle: '저녁 러닝 30분',
                isAdded: false,
              },
              {
                recommendId: 2,
                categoryId: 4,
                categoryTitle: '공부',
                categoryColor: 'GREEN',
                scheduleTitle: 'TypeScript 강의 1시간',
                isAdded: true,
              },
            ],
          },
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: '오늘 작성된 일기가 없음',
    }),
    ApiResponse({
      status: 500,
      description: '서버 내부 오류',
    }),
  );
}
