import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

// 통계 메인 조회
export function GetMainStatsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '통계 메인 조회',
      description:
        '이번 달 가장 많이 사용한 카테고리, 오늘의 AI 추천 일정, AI 기반 스트레스 분석을 함께 반환합니다. 이번 달 등록된 일정이 없으면 mostFrequentCategory는 null입니다. 오늘 작성된 일기가 없으면 stress는 안내 문구로 대체됩니다.',
    }),
    ApiResponse({
      status: 200,
      description: '통계 메인 조회 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '통계 메인 조회 성공',
          data: {
            mostFrequentCategory: {
              categoryId: 3,
              categoryName: '운동',
              categoryColor: 'BLUE',
            },
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
            stress:
              '최근 일정이 많아 피로가 쌓여 있을 수 있어요. 짧은 산책으로 기분 전환해보세요.',
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
        '이번 달 가장 많이 사용한 카테고리와, 카테고리별 사용 횟수·일정 목록을 사용 횟수 내림차순으로 반환합니다. 이번 달 등록된 일정이 없으면 mostFrequentCategory는 null, categoryRankInfo는 빈 배열입니다.',
    }),
    ApiResponse({
      status: 200,
      description: '일정 통계 상세 조회 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '일정 통계 상세 조회 성공',
          data: {
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
                  { scheduleId: 1, title: '아침 러닝', date: '2026-07-18' },
                  { scheduleId: 2, title: '헬스장 등록', date: '2026-07-16' },
                  { scheduleId: 7, title: '저녁 스트레칭', date: '2026-07-14' },
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
                    date: '2026-07-18',
                  },
                  {
                    scheduleId: 4,
                    title: '알고리즘 문제풀이',
                    date: '2026-07-19',
                  },
                ],
              },
              {
                categoryId: 5,
                categoryName: '취미',
                count: 1,
                categoryColor: 'PINK',
                schedules: [
                  { scheduleId: 6, title: '영화 보기', date: '2026-07-18' },
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
        '이번 달(targetMonth) 기준 완료되지 않은 일정 개수, 비율(%), 목록을 반환합니다.',
    }),
    ApiResponse({
      status: 200,
      description: '미완료 일정 조회 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '미완료 일정 조회 성공',
          data: {
            incompletedScheduleCount: 3,
            incompletedScheduleRate: 42.9,
            targetMonth: '2026-07',
            incompletedSchedules: [
              {
                scheduleId: 4,
                title: '알고리즘 문제풀이',
                date: '2026-07-19',
                categoryId: 4,
                categoryName: '공부',
                categoryColor: 'GREEN',
              },
              {
                scheduleId: 1,
                title: '아침 러닝',
                date: '2026-07-18',
                categoryId: 3,
                categoryName: '운동',
                categoryColor: 'BLUE',
              },
              {
                scheduleId: 6,
                title: '영화 보기',
                date: '2026-07-18',
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
      description: '이번 달 기준 완료된 일정 개수와 목록을 반환합니다.',
    }),
    ApiResponse({
      status: 200,
      description: '완료된 일정 조회 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '완료된 일정 조회 성공',
          data: {
            completedScheduleCount: 4,
            completedSchedules: [
              {
                scheduleId: 2,
                title: '헬스장 등록',
                date: '2026-07-16',
                categoryId: 3,
                categoryName: '운동',
                categoryColor: 'BLUE',
              },
              {
                scheduleId: 5,
                title: '기타 연습',
                date: '2026-07-17',
                categoryId: 5,
                categoryName: '취미',
                categoryColor: 'PINK',
              },
              {
                scheduleId: 8,
                title: '독서 30분',
                date: '2026-07-15',
                categoryId: 4,
                categoryName: '공부',
                categoryColor: 'GREEN',
              },
              {
                scheduleId: 9,
                title: '아침 요가',
                date: '2026-07-14',
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
