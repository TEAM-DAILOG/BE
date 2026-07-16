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
    }),
    ApiResponse({
      status: 500,
      description: '서버 내부 오류',
    }),
  );
}
