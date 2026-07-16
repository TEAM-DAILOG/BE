import { ApiProperty } from '@nestjs/swagger';
import {
  CategoryColor,
  CategoryEntity,
} from '../categories/entities/category.entity';
import { ScheduleEntity as Schedule } from '../schedules/entities/schedule.entity';
import { RecommendDTO } from '../ai/dto/ai-recommend.dto';

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
  @ApiProperty({
    description:
      '가장 많이 사용한 카테고리정보 (이번 달 등록된 일정이 없으면 null)',
    nullable: true,
  })
  mostFrequentCategory: MostFrequentCategoryDTO | null;

  @ApiProperty({ description: '추천일정 목록 입니다' })
  recommendedSchedules: RecommendDTO[];

  @ApiProperty({ description: '스트레스 관련 정보 입니다' })
  stress: string;

  constructor(
    mostFrequentCategory: MostFrequentCategoryDTO | null,
    recommendedSchedules: RecommendDTO[],
    stress: string,
  ) {
    this.mostFrequentCategory = mostFrequentCategory;
    this.recommendedSchedules = recommendedSchedules;
    this.stress = stress;
  }
}

//카테고리 현재 구현
export class CategoryRankScheduleDTO {
  @ApiProperty({ description: '스케쥴 id입니다' })
  scheduleId: number;

  @ApiProperty({ description: '스케쥴 제목입니다' })
  title: string;

  @ApiProperty({ description: '스케쥴 날짜입니다' })
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
  @ApiProperty({
    description:
      '가장 많이 사용된 카테고리 정보입니다 (이번 달 등록된 일정이 없으면 null)',
    nullable: true,
  })
  mostFrequentCategory: MostFrequentCategoryDTO | null;

  @ApiProperty({ description: '카테고리별 사용 횟수 정보입니다' })
  categoryRankInfo: CategoryRankInfoDTO[];

  constructor(
    mostFrequentCategory: MostFrequentCategoryDTO | null,
    categoryRankInfo: CategoryRankInfoDTO[],
  ) {
    this.mostFrequentCategory = mostFrequentCategory;
    this.categoryRankInfo = categoryRankInfo;
  }
}

export class ScheduleStatsDTO {
  @ApiProperty({ description: '스케쥴 Id입니다' })
  scheduleId: number;

  @ApiProperty({ description: '스케쥴 제목입니다' })
  title: string;

  @ApiProperty({ description: '스케쥴 날짜입니다' })
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
    this.date = schedule.date;
    this.categoryId = category.categoryId;
    this.categoryName = category.categoryName;
    this.categoryColor = category.categoryColor;
  }
}

export class IncompletedScheduleStatsDTO {
  @ApiProperty({ description: '완료되지 않은 스케쥴 개수입니다' })
  incompletedScheduleCount: number;

  @ApiProperty({ description: '완료되지 않은 스케쥴비율입니다' })
  incompletedScheduleRate: number;

  @ApiProperty({ description: '분석 대상 월 입니다' })
  targetMonth: string;

  @ApiProperty({ description: '완료되지 않은 스케쥴 목록입니다' })
  incompletedSchedules: ScheduleStatsDTO[];

  constructor(
    incompletedScheduleCount: number,
    incompletedScheduleRate: number,
    targetMonth: string,
    incompletedSchedules: ScheduleStatsDTO[],
  ) {
    this.incompletedScheduleCount = incompletedScheduleCount;
    this.incompletedScheduleRate = incompletedScheduleRate;
    this.targetMonth = targetMonth;
    this.incompletedSchedules = incompletedSchedules;
  }
}

export class CompletedScheduleStatsDTO {
  @ApiProperty({ description: '완료된 스케쥴 개수입니다' })
  completedScheduleCount: number;

  @ApiProperty({ description: '완료된 스케쥴 목록입니다' })
  completedSchedules: ScheduleStatsDTO[];

  constructor(
    completedScheduleCount: number,
    completedSchedules: ScheduleStatsDTO[],
  ) {
    this.completedScheduleCount = completedScheduleCount;
    this.completedSchedules = completedSchedules;
  }
}
