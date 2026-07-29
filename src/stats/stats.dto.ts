import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  CategoryColor,
  CategoryEntity,
} from '../categories/entities/category.entity';
import { ScheduleEntity as Schedule } from '../schedules/entities/schedule.entity';
import { RecommendDTO } from '../ai/dto/ai-recommend.dto';
import { toIsoDateTime } from '../global/date.util';

// year/month를 안 넘기면 이번 달(UTC) 기준으로 조회한다
export class StatsMonthQueryDto {
  @ApiPropertyOptional({ example: 2026, description: '조회할 연도' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({ example: 5, description: '조회할 월(1~12)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}

export class MostFrequentCategoryDTO {
  @ApiProperty({ description: '가장 많이 사용한 카테고리 ID입니다' })
  categoryId: number;

  @ApiProperty({ description: '가장 많이 사용한 카테고리 이름입니다' })
  categoryName: string;

  @ApiProperty({
    description: '가장 많이 사용한 카테고리의 색깔입니다',
    enum: CategoryColor,
  })
  categoryColor: CategoryColor;

  constructor(category: CategoryEntity) {
    this.categoryId = category.categoryId;
    this.categoryName = category.categoryName;
    this.categoryColor = category.categoryColor;
  }
}

export class StatsMainDTO {
  @ApiProperty({ description: '지난 달(1~12) 입니다' })
  lastMonth: number;

  @ApiProperty({ description: '지난 달 일정 달성률(%) 입니다' })
  lastMonthCompletionRate: number;

  @ApiProperty({ description: '추천일정 목록 입니다' })
  recommendedSchedules: RecommendDTO[];

  constructor(
    lastMonth: number,
    lastMonthCompletionRate: number,
    recommendedSchedules: RecommendDTO[],
  ) {
    this.lastMonth = lastMonth;
    this.lastMonthCompletionRate = lastMonthCompletionRate;
    this.recommendedSchedules = recommendedSchedules;
  }
}

//카테고리 현재 구현
export class CategoryRankScheduleDTO {
  @ApiProperty({ description: '스케쥴 id입니다' })
  scheduleId: number;

  @ApiProperty({ description: '스케쥴 제목입니다' })
  title: string;

  @ApiProperty({
    description: '스케쥴 날짜입니다',
    example: '2026-07-19T00:00:00Z',
  })
  date: string;
}

export class CategoryRankInfoDTO {
  @ApiProperty({ description: '카테고리 ID입니다' })
  categoryId: number;

  @ApiProperty({ description: '카테고리 이름입니다' })
  categoryName: string;

  @ApiProperty({ description: '카테고리 사용 횟수입니다' })
  count: number;

  @ApiProperty({ description: '카테고리 색깔입니다', enum: CategoryColor })
  categoryColor: CategoryColor;

  @ApiProperty({ description: '카테고리별 스케쥴 목록입니다' })
  schedules: CategoryRankScheduleDTO[];

  constructor(
    category: CategoryEntity,
    count: number,
    schedules: CategoryRankScheduleDTO[],
  ) {
    this.categoryId = category.categoryId;
    this.categoryName = category.categoryName;
    this.count = count;
    this.categoryColor = category.categoryColor;
    this.schedules = schedules;
  }
}

export class ScheduleDetailDTO {
  @ApiProperty({ description: '분석 대상 연도 입니다', example: 2026 })
  targetYear: number;

  @ApiProperty({ description: '분석 대상 월(1~12) 입니다', example: 5 })
  targetMonth: number;

  @ApiProperty({
    description:
      '가장 많이 사용된 카테고리 정보입니다 (해당 월 등록된 일정이 없으면 null)',
    nullable: true,
  })
  mostFrequentCategory: MostFrequentCategoryDTO | null;

  @ApiProperty({ description: '카테고리별 사용 횟수 정보입니다' })
  categoryRankInfo: CategoryRankInfoDTO[];

  constructor(
    targetYear: number,
    targetMonth: number,
    mostFrequentCategory: MostFrequentCategoryDTO | null,
    categoryRankInfo: CategoryRankInfoDTO[],
  ) {
    this.targetYear = targetYear;
    this.targetMonth = targetMonth;
    this.mostFrequentCategory = mostFrequentCategory;
    this.categoryRankInfo = categoryRankInfo;
  }
}

export class ScheduleStatsDTO {
  @ApiProperty({ description: '스케쥴 Id입니다' })
  scheduleId: number;

  @ApiProperty({ description: '스케쥴 제목입니다' })
  title: string;

  @ApiProperty({
    description: '스케쥴 날짜입니다',
    example: '2026-07-19T00:00:00Z',
  })
  date: string;

  @ApiProperty({ description: '스케쥴 카테고리 Id입니다' })
  categoryId: number;

  @ApiProperty({ description: '스케쥴 카테고리 이름입니다' })
  categoryName: string;

  @ApiProperty({
    description: '스케쥴 카테고리 색깔입니다',
    enum: CategoryColor,
  })
  categoryColor: CategoryColor;

  constructor(schedule: Schedule, category: CategoryEntity) {
    this.scheduleId = schedule.scheduleId;
    this.title = schedule.title;
    this.date = toIsoDateTime(schedule.date);
    this.categoryId = category.categoryId;
    this.categoryName = category.categoryName;
    this.categoryColor = category.categoryColor;
  }
}

export class IncompletedScheduleStatsDTO {
  @ApiProperty({ description: '완료되지 않은 스케쥴 개수입니다' })
  incompletedScheduleCount: number;

  @ApiProperty({ description: '일정 달성률(%) 입니다' })
  completionRate: number;

  @ApiProperty({ description: '분석 대상 연도 입니다', example: 2026 })
  targetYear: number;

  @ApiProperty({ description: '분석 대상 월(1~12) 입니다', example: 5 })
  targetMonth: number;

  @ApiProperty({ description: '완료되지 않은 스케쥴 목록입니다' })
  incompletedSchedules: ScheduleStatsDTO[];

  constructor(
    incompletedScheduleCount: number,
    completionRate: number,
    targetYear: number,
    targetMonth: number,
    incompletedSchedules: ScheduleStatsDTO[],
  ) {
    this.incompletedScheduleCount = incompletedScheduleCount;
    this.completionRate = completionRate;
    this.targetYear = targetYear;
    this.targetMonth = targetMonth;
    this.incompletedSchedules = incompletedSchedules;
  }
}

export class CompletedScheduleStatsDTO {
  @ApiProperty({ description: '완료된 스케쥴 개수입니다' })
  completedScheduleCount: number;

  @ApiProperty({ description: '분석 대상 연도 입니다', example: 2026 })
  targetYear: number;

  @ApiProperty({ description: '분석 대상 월(1~12) 입니다', example: 5 })
  targetMonth: number;

  @ApiProperty({ description: '완료된 스케쥴 목록입니다' })
  completedSchedules: ScheduleStatsDTO[];

  constructor(
    completedScheduleCount: number,
    targetYear: number,
    targetMonth: number,
    completedSchedules: ScheduleStatsDTO[],
  ) {
    this.completedScheduleCount = completedScheduleCount;
    this.targetYear = targetYear;
    this.targetMonth = targetMonth;
    this.completedSchedules = completedSchedules;
  }
}
