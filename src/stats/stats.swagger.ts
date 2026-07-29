import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

const yearQuery = () =>
  ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    example: 2026,
    description: '조회할 연도 (안 넘기면 이번 달 기준)',
  });

const monthQuery = () =>
  ApiQuery({
    name: 'month',
    required: false,
    type: Number,
    example: 5,
    description: '조회할 월, 1~12 (안 넘기면 이번 달 기준)',
  });

// 통계 메인 조회
export function GetMainStatsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '통계 메인 조회',
      description:
        '지난 달 일정 달성률과 오늘의 AI 추천 일정을 함께 반환합니다. 지난 달 등록된 일정이 없으면 lastMonthCompletionRate는 0입니다.',
    }),
    ApiResponse({
      status: 200,
      description: '통계 메인 조회 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '통계 메인 조회 성공',
          data: {
            lastMonth: 6,
            lastMonthCompletionRate: 66.7,
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

// 일정 통계 상세 조회
export function GetScheduleDetailSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '일정 통계 상세 조회',
      description:
        'year, month를 넘기면 해당 월, 안 넘기면 이번 달 기준으로 가장 많이 사용한 카테고리와 카테고리별 사용 횟수·일정 목록을 사용 횟수 내림차순으로 반환합니다. 해당 월에 등록된 일정이 없으면 mostFrequentCategory는 null, categoryRankInfo는 빈 배열입니다.',
    }),
    yearQuery(),
    monthQuery(),
    ApiResponse({
      status: 200,
      description: '일정 통계 상세 조회 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '일정 통계 상세 조회 성공',
          data: {
            targetYear: 2026,
            targetMonth: 5,
            mostFrequentCategory: {
              categoryId: 3,
              categoryName: '운동',
              categoryColor: 'BLUE',
            },
            categoryRankInfo: [
              {
                categoryId: 3,
                categoryName: '운동',
                count: 3,
                categoryColor: 'BLUE',
                schedules: [
                  {
                    scheduleId: 1,
                    title: '아침 러닝',
                    date: '2026-07-18T00:00:00Z',
                  },
                  {
                    scheduleId: 2,
                    title: '헬스장 등록',
                    date: '2026-07-16T00:00:00Z',
                  },
                  {
                    scheduleId: 7,
                    title: '저녁 스트레칭',
                    date: '2026-07-14T00:00:00Z',
                  },
                ],
              },
              {
                categoryId: 4,
                categoryName: '공부',
                count: 2,
                categoryColor: 'GREEN',
                schedules: [
                  {
                    scheduleId: 3,
                    title: 'TypeScript 스터디',
                    date: '2026-07-18T00:00:00Z',
                  },
                  {
                    scheduleId: 4,
                    title: '알고리즘 문제풀이',
                    date: '2026-07-19T00:00:00Z',
                  },
                ],
              },
              {
                categoryId: 5,
                categoryName: '취미',
                count: 1,
                categoryColor: 'PINK',
                schedules: [
                  {
                    scheduleId: 6,
                    title: '영화 보기',
                    date: '2026-07-18T00:00:00Z',
                  },
                ],
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

// 미완료 일정 조회
export function GetPendingStatsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '미완료 일정 조회',
      description:
        'year, month를 넘기면 해당 월(targetMonth), 안 넘기면 이번 달 기준 완료되지 않은 일정 개수, 달성률(%), 목록을 반환합니다.',
    }),
    yearQuery(),
    monthQuery(),
    ApiResponse({
      status: 200,
      description: '미완료 일정 조회 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '미완료 일정 조회 성공',
          data: {
            incompletedScheduleCount: 3,
            completionRate: 57.1,
            targetYear: 2026,
            targetMonth: 7,
            incompletedSchedules: [
              {
                scheduleId: 4,
                title: '알고리즘 문제풀이',
                date: '2026-07-19T00:00:00Z',
                categoryId: 4,
                categoryName: '공부',
                categoryColor: 'GREEN',
              },
              {
                scheduleId: 1,
                title: '아침 러닝',
                date: '2026-07-18T00:00:00Z',
                categoryId: 3,
                categoryName: '운동',
                categoryColor: 'BLUE',
              },
              {
                scheduleId: 6,
                title: '영화 보기',
                date: '2026-07-18T00:00:00Z',
                categoryId: 5,
                categoryName: '취미',
                categoryColor: 'PINK',
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

// 완료된 일정 조회
export function GetCompletedStatsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '완료된 일정 조회',
      description:
        'year, month를 넘기면 해당 월, 안 넘기면 이번 달 기준 완료된 일정 개수와 목록을 반환합니다.',
    }),
    yearQuery(),
    monthQuery(),
    ApiResponse({
      status: 200,
      description: '완료된 일정 조회 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '완료된 일정 조회 성공',
          data: {
            completedScheduleCount: 4,
            targetYear: 2026,
            targetMonth: 5,
            completedSchedules: [
              {
                scheduleId: 2,
                title: '헬스장 등록',
                date: '2026-07-16T00:00:00Z',
                categoryId: 3,
                categoryName: '운동',
                categoryColor: 'BLUE',
              },
              {
                scheduleId: 5,
                title: '기타 연습',
                date: '2026-07-17T00:00:00Z',
                categoryId: 5,
                categoryName: '취미',
                categoryColor: 'PINK',
              },
              {
                scheduleId: 8,
                title: '독서 30분',
                date: '2026-07-15T00:00:00Z',
                categoryId: 4,
                categoryName: '공부',
                categoryColor: 'GREEN',
              },
              {
                scheduleId: 9,
                title: '아침 요가',
                date: '2026-07-14T00:00:00Z',
                categoryId: 3,
                categoryName: '운동',
                categoryColor: 'BLUE',
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
