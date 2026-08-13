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
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}

export class MostFrequentCategoryDTO {
  categoryId: number;
  categoryName: string;
  categoryColor: CategoryColor;
  constructor(category: CategoryEntity) {
    this.categoryId = category.categoryId;
    this.categoryName = category.categoryName;
    this.categoryColor = category.categoryColor;
  }
}

export class StatsMainDTO {
  lastMonth: number;
  lastMonthCompletionRate: number;
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
  scheduleId: number;
  title: string;
  date: string;
}

export class CategoryRankInfoDTO {
  categoryId: number;
  categoryName: string;
  count: number;
  categoryColor: CategoryColor;
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
  targetYear: number;
  targetMonth: number;
  mostFrequentCategory: MostFrequentCategoryDTO | null;
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
  scheduleId: number;
  title: string;
  date: string;
  categoryId: number;
  categoryName: string;
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
  incompletedScheduleCount: number;
  completionRate: number;
  targetYear: number;
  targetMonth: number;
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
  completedScheduleCount: number;
  targetYear: number;
  targetMonth: number;
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
