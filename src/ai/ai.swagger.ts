import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

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
            targetDate: '2026-07-19T00:00:00Z',
          },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description:
        '서버 내부 오류, 또는 AI가 빈 응답을 반환함(AI_EMPTY_RESPONSE)',
      content: {
        'application/json': {
          examples: {
            internalError: {
              summary: '서버 내부 오류',
              value: {
                resultType: 'FAIL',
                code: 500,
                errorCode: 'INTERNAL_SERVER_ERROR',
                reason: '서버 내부 오류가 발생했습니다',
                data: null,
              },
            },
            aiEmptyResponse: {
              summary: 'AI가 빈 응답을 반환함',
              value: {
                resultType: 'FAIL',
                code: 500,
                errorCode: 'AI_EMPTY_RESPONSE',
                reason: 'AI가 빈 응답을 반환했습니다.',
                data: null,
              },
            },
          },
        },
      },
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
            createdAt: '2026-07-19T09:00:00Z',
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
      description:
        '서버 내부 오류, 또는 AI가 빈 응답을 반환함(AI_EMPTY_RESPONSE)',
      content: {
        'application/json': {
          examples: {
            internalError: {
              summary: '서버 내부 오류',
              value: {
                resultType: 'FAIL',
                code: 500,
                errorCode: 'INTERNAL_SERVER_ERROR',
                reason: '서버 내부 오류가 발생했습니다',
                data: null,
              },
            },
            aiEmptyResponse: {
              summary: 'AI가 빈 응답을 반환함',
              value: {
                resultType: 'FAIL',
                code: 500,
                errorCode: 'AI_EMPTY_RESPONSE',
                reason: 'AI가 빈 응답을 반환했습니다.',
                data: null,
              },
            },
          },
        },
      },
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
        '오늘 첫 호출 시 로그인한 유저의 오늘 일기 내용을 바탕으로 서로 겹치지 않는 일정을 한 번에 3개(일기 내용이 부족해 3개를 못 채우면 나온 만큼만) 추천합니다. 반드시 유저가 이미 만들어둔 카테고리 중에서만 골라 연결하며, 새 카테고리는 생성하지 않습니다. 카테고리가 하나도 없으면 errorCode `NO_CATEGORY`와 함께 409를 반환합니다. 오늘 이미 추천이 하나라도 생성돼 있으면 errorCode `ALREADY_INITIALIZED`와 함께 409를 반환하니, 그 이후에는 추가 생성 API(`POST /ai/schedules/add`)를 사용하세요.',
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
        '오늘 작성된 일기가 없음(CONFLICT), 오늘의 추천이 이미 생성됨(ALREADY_INITIALIZED), 또는 카테고리가 하나도 없음(NO_CATEGORY)',
      content: {
        'application/json': {
          examples: {
            noDiary: {
              summary: '오늘 작성된 일기가 없음',
              value: {
                resultType: 'FAIL',
                code: 409,
                errorCode: 'CONFLICT',
                reason: '오늘 작성된 일기가 없습니다.',
                data: null,
              },
            },
            alreadyInitialized: {
              summary: '오늘의 추천이 이미 생성됨',
              value: {
                resultType: 'FAIL',
                code: 409,
                errorCode: 'ALREADY_INITIALIZED',
                reason: '오늘의 추천 일정이 이미 생성되었습니다.',
                data: null,
              },
            },
            noCategory: {
              summary: '카테고리가 하나도 없음',
              value: {
                resultType: 'FAIL',
                code: 409,
                errorCode: 'NO_CATEGORY',
                reason: '일정 추천을 받으려면 먼저 카테고리를 생성해야 합니다.',
                data: null,
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description:
        '서버 내부 오류, 또는 AI 응답이 비어있거나(AI_EMPTY_RESPONSE) 파싱할 수 없음(AI_RESPONSE_PARSE_ERROR)',
      content: {
        'application/json': {
          examples: {
            internalError: {
              summary: '서버 내부 오류',
              value: {
                resultType: 'FAIL',
                code: 500,
                errorCode: 'INTERNAL_SERVER_ERROR',
                reason: '서버 내부 오류가 발생했습니다',
                data: null,
              },
            },
            aiEmptyResponse: {
              summary: 'AI가 빈 응답을 반환함',
              value: {
                resultType: 'FAIL',
                code: 500,
                errorCode: 'AI_EMPTY_RESPONSE',
                reason: 'AI가 빈 응답을 반환했습니다.',
                data: null,
              },
            },
            aiResponseParseError: {
              summary: 'AI 응답을 파싱할 수 없음',
              value: {
                resultType: 'FAIL',
                code: 500,
                errorCode: 'AI_RESPONSE_PARSE_ERROR',
                reason: 'AI 응답을 파싱할 수 없습니다.',
                data: null,
              },
            },
          },
        },
      },
    }),
  );
}

// AI 일정 추천 추가 생성 (1개)
export function AddRecommendationSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'AI 일정 추천 추가 생성',
      description:
        '오늘 이미 생성된 추천 목록과 겹치지 않는 일정을 하나 더 추천합니다(호출당 정확히 1개). 최초 생성 여부와 무관하게 호출할 수 있습니다. 반드시 유저가 이미 만들어둔 카테고리 중에서만 골라 연결하며, 새 카테고리는 생성하지 않습니다. 카테고리가 하나도 없으면 errorCode `NO_CATEGORY`와 함께 409를 반환합니다. 더 이상 추천할 게 없으면 errorCode `NO_MORE_RECOMMENDATIONS`와 함께 409를 반환합니다.',
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
        '오늘 작성된 일기가 없음(CONFLICT), 더 이상 추천할 일정이 없음(NO_MORE_RECOMMENDATIONS), 또는 카테고리가 하나도 없음(NO_CATEGORY)',
      content: {
        'application/json': {
          examples: {
            noDiary: {
              summary: '오늘 작성된 일기가 없음',
              value: {
                resultType: 'FAIL',
                code: 409,
                errorCode: 'CONFLICT',
                reason: '오늘 작성된 일기가 없습니다.',
                data: null,
              },
            },
            noMoreRecommendations: {
              summary: '더 이상 추천할 일정이 없음',
              value: {
                resultType: 'FAIL',
                code: 409,
                errorCode: 'NO_MORE_RECOMMENDATIONS',
                reason: '더 이상 추천할 수 있는 일정이 없습니다.',
                data: null,
              },
            },
            noCategory: {
              summary: '카테고리가 하나도 없음',
              value: {
                resultType: 'FAIL',
                code: 409,
                errorCode: 'NO_CATEGORY',
                reason: '일정 추천을 받으려면 먼저 카테고리를 생성해야 합니다.',
                data: null,
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description:
        '서버 내부 오류, 또는 AI 응답이 비어있거나(AI_EMPTY_RESPONSE) 파싱할 수 없음(AI_RESPONSE_PARSE_ERROR)',
      content: {
        'application/json': {
          examples: {
            internalError: {
              summary: '서버 내부 오류',
              value: {
                resultType: 'FAIL',
                code: 500,
                errorCode: 'INTERNAL_SERVER_ERROR',
                reason: '서버 내부 오류가 발생했습니다',
                data: null,
              },
            },
            aiEmptyResponse: {
              summary: 'AI가 빈 응답을 반환함',
              value: {
                resultType: 'FAIL',
                code: 500,
                errorCode: 'AI_EMPTY_RESPONSE',
                reason: 'AI가 빈 응답을 반환했습니다.',
                data: null,
              },
            },
            aiResponseParseError: {
              summary: 'AI 응답을 파싱할 수 없음',
              value: {
                resultType: 'FAIL',
                code: 500,
                errorCode: 'AI_RESPONSE_PARSE_ERROR',
                reason: 'AI 응답을 파싱할 수 없습니다.',
                data: null,
              },
            },
          },
        },
      },
    }),
  );
}

// AI 일정 추천 재생성 (통계 전용 "다른 일정 추천받기")
export function RegenerateRecommendationsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'AI 일정 추천 재생성 (통계 전용)',
      description:
        '통계 화면의 "다른 일정 추천받기" 전용 API입니다. 지금까지 나온 모든 추천(일기 목록 포함)과 겹치지 않는 새 일정을 최대 3개까지(부족하면 그보다 적게) 생성합니다. 기존에 재생성으로 만들어둔 배치가 있으면 삭제하지 않고 보관 처리한 뒤 새 배치로 교체하며, 이후 통계에서는 이 새 배치가 우선 노출됩니다. 일기 화면에 보이는 최초 추천 목록에는 영향을 주지 않습니다. 카테고리가 하나도 없으면 errorCode `NO_CATEGORY`와 함께 409를, 더 이상 추천할 게 없으면 errorCode `NO_MORE_RECOMMENDATIONS`와 함께 409를 반환합니다.',
    }),
    ApiResponse({
      status: 201,
      description: 'AI 일정 추천 재생성 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: 'AI 일정 추천 재생성 성공',
          data: {
            recommendedScheduleCount: 3,
            recommendedSchedules: [
              {
                recommendId: 10,
                categoryId: 3,
                categoryTitle: '운동',
                categoryColor: 'BLUE',
                scheduleTitle: '저녁 요가 20분',
                isAdded: false,
              },
              {
                recommendId: 11,
                categoryId: 4,
                categoryTitle: '공부',
                categoryColor: 'GREEN',
                scheduleTitle: '알고리즘 문제 풀이',
                isAdded: false,
              },
              {
                recommendId: 12,
                categoryId: 5,
                categoryTitle: '독서',
                categoryColor: 'BLUE',
                scheduleTitle: '에세이 한 편 읽기',
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
        '오늘 작성된 일기가 없음(CONFLICT), 카테고리가 하나도 없음(NO_CATEGORY), 또는 더 이상 추천할 일정이 없음(NO_MORE_RECOMMENDATIONS)',
      content: {
        'application/json': {
          examples: {
            noDiary: {
              summary: '오늘 작성된 일기가 없음',
              value: {
                resultType: 'FAIL',
                code: 409,
                errorCode: 'CONFLICT',
                reason: '오늘 작성된 일기가 없습니다.',
                data: null,
              },
            },
            noCategory: {
              summary: '카테고리가 하나도 없음',
              value: {
                resultType: 'FAIL',
                code: 409,
                errorCode: 'NO_CATEGORY',
                reason: '일정 추천을 받으려면 먼저 카테고리를 생성해야 합니다.',
                data: null,
              },
            },
            noMoreRecommendations: {
              summary: '더 이상 추천할 일정이 없음',
              value: {
                resultType: 'FAIL',
                code: 409,
                errorCode: 'NO_MORE_RECOMMENDATIONS',
                reason: '더 이상 추천할 수 있는 일정이 없습니다.',
                data: null,
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description:
        '서버 내부 오류, 또는 AI 응답이 비어있거나(AI_EMPTY_RESPONSE) 파싱할 수 없음(AI_RESPONSE_PARSE_ERROR)',
      content: {
        'application/json': {
          examples: {
            internalError: {
              summary: '서버 내부 오류',
              value: {
                resultType: 'FAIL',
                code: 500,
                errorCode: 'INTERNAL_SERVER_ERROR',
                reason: '서버 내부 오류가 발생했습니다',
                data: null,
              },
            },
            aiEmptyResponse: {
              summary: 'AI가 빈 응답을 반환함',
              value: {
                resultType: 'FAIL',
                code: 500,
                errorCode: 'AI_EMPTY_RESPONSE',
                reason: 'AI가 빈 응답을 반환했습니다.',
                data: null,
              },
            },
            aiResponseParseError: {
              summary: 'AI 응답을 파싱할 수 없음',
              value: {
                resultType: 'FAIL',
                code: 500,
                errorCode: 'AI_RESPONSE_PARSE_ERROR',
                reason: 'AI 응답을 파싱할 수 없습니다.',
                data: null,
              },
            },
          },
        },
      },
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

// 일기별 AI 일정 추천 조회
export function FindRecommendationsByDiarySwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '일기별 AI 일정 추천 조회',
      description:
        '오늘 일기인지 여부와 무관하게, 특정 diaryId에 연결된 AI 추천 일정 목록을 조회합니다.',
    }),
    ApiParam({
      name: 'diaryId',
      type: Number,
      description: '일기 ID',
    }),
    ApiResponse({
      status: 200,
      description: '일기별 AI 일정 추천 조회 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '일기별 AI 일정 추천 조회 성공',
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
      status: 500,
      description: '서버 내부 오류',
    }),
  );
}
