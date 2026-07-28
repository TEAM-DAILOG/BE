import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { ScheduleEntity } from '../schedules/entities/schedule.entity';
import { CategoryEntity } from '../categories/entities/category.entity';
import { DiaryEntity } from '../diaries/entities/diary.entity';
import { RecommendService } from '../ai/services/ai-recommend.service';
import { GeminiService } from '../ai/services/ai-gemini.service';
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
import { getTodayUtcRange, toIsoDateTime } from '../global/date.util';

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

    @InjectRepository(DiaryEntity)
    private readonly diaryRepository: Repository<DiaryEntity>,

    private readonly recommendService: RecommendService,
    private readonly geminiService: GeminiService,
  ) {}

  private async getMonthSchedules(
    userId: number,
    year?: number,
    month?: number,
  ): Promise<ScheduleEntity[]> {
    const { startDate, endDate } = getMonthRange(year, month);

    return this.scheduleRepository.find({
      where: { userId, date: Between(startDate, endDate) },
    });
  }

  private async findTodayDiary(userId: number): Promise<DiaryEntity | null> {
    const { start, end } = getTodayUtcRange();

    return this.diaryRepository.findOne({
      where: { userId, createdAt: Between(start, end) },
    });
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

  async getMainStats(userId: number): Promise<StatsMainDTO> {
    const schedules = await this.getMonthSchedules(userId);
    const mostFrequentCategory = await this.findMostFrequentCategory(schedules);
    const recommendedSchedules = await this.getRecommendedSchedules(userId);

    const todayDiary = await this.findTodayDiary(userId);
    const stress = todayDiary
      ? await this.geminiService.generateStressInsight(
          todayDiary.content,
          schedules.map((schedule) => ({
            title: schedule.title,
            date: schedule.date,
          })),
        )
      : '오늘 작성된 일기가 없어 스트레스를 분석할 수 없습니다.';

    return new StatsMainDTO(mostFrequentCategory, recommendedSchedules, stress);
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

    const rate =
      schedules.length === 0
        ? 0
        : Math.round((incompleted.length / schedules.length) * 1000) / 10;

    return new IncompletedScheduleStatsDTO(
      incompleted.length,
      rate,
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
