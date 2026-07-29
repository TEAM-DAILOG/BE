import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { ScheduleEntity } from '../schedules/entities/schedule.entity';
import { CategoryEntity } from '../categories/entities/category.entity';
import { RecommendService } from '../ai/services/ai-recommend.service';
import { ConflictException } from '../global/error/custom.exception';
import {
  MostFrequentCategoryDTO,
  StatsMainDTO,
  CategoryRankScheduleDTO,
  CategoryRankInfoDTO,
  ScheduleDetailDTO,
  ScheduleStatsDTO,
  IncompletedScheduleStatsDTO,
  CompletedScheduleStatsDTO,
} from './stats.dto';
import { RecommendDTO } from '../ai/dto/ai-recommend.dto';
import { toIsoDateTime } from '../global/date.util';

// year/month를 안 넘기면 이번 달(UTC) 기준으로 범위를 계산한다
function getMonthRange(
  year?: number,
  month?: number,
): {
  targetYear: number;
  targetMonth: number;
  startDate: string;
  endDate: string;
} {
  const now = new Date();
  const targetYear = year ?? now.getUTCFullYear();
  const targetMonthIndex = month ? month - 1 : now.getUTCMonth();
  const targetMonth = targetMonthIndex + 1;
  const monthStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();

  return {
    targetYear,
    targetMonth,
    startDate: `${monthStr}-01`,
    endDate: `${monthStr}-${String(lastDay).padStart(2, '0')}`,
  };
}

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepository: Repository<ScheduleEntity>,

    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,

    private readonly recommendService: RecommendService,
  ) {}

  // 카테고리가 soft-delete된 일정은 통계 전체(개수/목록/비율)에서 제외한다
  private async getMonthSchedules(
    userId: number,
    year?: number,
    month?: number,
  ): Promise<ScheduleEntity[]> {
    const { startDate, endDate } = getMonthRange(year, month);

    const schedules = await this.scheduleRepository.find({
      where: { userId, date: Between(startDate, endDate) },
    });

    const categories = await this.categoryRepository.find({
      where: { userId },
    });
    const categoryIds = new Set(categories.map((c) => c.categoryId));

    return schedules.filter((schedule) => categoryIds.has(schedule.categoryId));
  }

  private async findMostFrequentCategory(
    schedules: ScheduleEntity[],
  ): Promise<MostFrequentCategoryDTO | null> {
    if (schedules.length === 0) {
      return null;
    }

    const counts = new Map<number, number>();

    for (const schedule of schedules) {
      counts.set(
        schedule.categoryId,
        (counts.get(schedule.categoryId) ?? 0) + 1,
      );
    }

    const [topCategoryId] = [...counts.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0];

    const category = await this.categoryRepository.findOneBy({
      categoryId: topCategoryId,
    });

    return category ? new MostFrequentCategoryDTO(category) : null;
  }

  // 오늘 일기가 없으면 AI 추천 목록 대신 빈 배열을 반환한다
  private async getRecommendedSchedules(
    userId: number,
  ): Promise<RecommendDTO[]> {
    try {
      const list = await this.recommendService.getTodayRecommendations(userId);

      return list.recommendedSchedules;
    } catch (error) {
      if (error instanceof ConflictException) {
        return [];
      }

      throw error;
    }
  }

  private getLastMonth(): { year: number; month: number } {
    const now = new Date();
    const lastMonthDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
    );

    return {
      year: lastMonthDate.getUTCFullYear(),
      month: lastMonthDate.getUTCMonth() + 1,
    };
  }

  async getMainStats(userId: number): Promise<StatsMainDTO> {
    const { year: lastYear, month: lastMonth } = this.getLastMonth();
    const lastMonthSchedules = await this.getMonthSchedules(
      userId,
      lastYear,
      lastMonth,
    );

    const lastMonthCompletionRate =
      lastMonthSchedules.length === 0
        ? 0
        : Math.round(
            (lastMonthSchedules.filter((schedule) => schedule.isCompleted)
              .length /
              lastMonthSchedules.length) *
              1000,
          ) / 10;

    const recommendedSchedules = await this.getRecommendedSchedules(userId);

    return new StatsMainDTO(
      lastMonth,
      lastMonthCompletionRate,
      recommendedSchedules,
    );
  }

  async getScheduleDetail(
    userId: number,
    year?: number,
    month?: number,
  ): Promise<ScheduleDetailDTO> {
    const { targetYear, targetMonth } = getMonthRange(year, month);
    const schedules = await this.getMonthSchedules(userId, year, month);
    const mostFrequentCategory = await this.findMostFrequentCategory(schedules);

    const categories = await this.categoryRepository.find({
      where: { userId },
    });

    const categoryRankInfo = categories
      .map((category) => {
        const categorySchedules = schedules.filter(
          (schedule) => schedule.categoryId === category.categoryId,
        );

        return new CategoryRankInfoDTO(
          category,
          categorySchedules.length,
          categorySchedules.map(
            (schedule): CategoryRankScheduleDTO => ({
              scheduleId: schedule.scheduleId,
              title: schedule.title,
              date: toIsoDateTime(schedule.date),
            }),
          ),
        );
      })
      .filter((info) => info.count > 0)
      .sort((a, b) => b.count - a.count);

    return new ScheduleDetailDTO(
      targetYear,
      targetMonth,
      mostFrequentCategory,
      categoryRankInfo,
    );
  }

  async getPendingStats(
    userId: number,
    year?: number,
    month?: number,
  ): Promise<IncompletedScheduleStatsDTO> {
    const { targetYear, targetMonth } = getMonthRange(year, month);
    const schedules = await this.getMonthSchedules(userId, year, month);
    const incompleted = schedules.filter((schedule) => !schedule.isCompleted);
    const incompletedSchedules = await this.toScheduleStatsDTOs(
      incompleted,
      userId,
    );

    const completedCount = schedules.length - incompleted.length;
    const completionRate =
      schedules.length === 0
        ? 0
        : Math.round((completedCount / schedules.length) * 1000) / 10;

    return new IncompletedScheduleStatsDTO(
      incompleted.length,
      completionRate,
      targetYear,
      targetMonth,
      incompletedSchedules,
    );
  }

  async getCompletedStats(
    userId: number,
    year?: number,
    month?: number,
  ): Promise<CompletedScheduleStatsDTO> {
    const { targetYear, targetMonth } = getMonthRange(year, month);
    const schedules = await this.getMonthSchedules(userId, year, month);
    const completed = schedules.filter((schedule) => schedule.isCompleted);
    const completedSchedules = await this.toScheduleStatsDTOs(
      completed,
      userId,
    );

    return new CompletedScheduleStatsDTO(
      completed.length,
      targetYear,
      targetMonth,
      completedSchedules,
    );
  }

  private async toScheduleStatsDTOs(
    schedules: ScheduleEntity[],
    userId: number,
  ): Promise<ScheduleStatsDTO[]> {
    const categories = await this.categoryRepository.find({
      where: { userId },
    });
    const categoryMap = new Map(
      categories.map((category) => [category.categoryId, category]),
    );

    return schedules
      .map((schedule) => {
        const category = categoryMap.get(schedule.categoryId);

        return category ? new ScheduleStatsDTO(schedule, category) : null;
      })
      .filter((dto): dto is ScheduleStatsDTO => dto !== null);
  }
}
