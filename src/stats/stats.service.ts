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

function getCurrentMonthRange(): {
  targetMonth: string;
  startDate: string;
  endDate: string;
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const targetMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
  const lastDay = new Date(year, month + 1, 0).getDate();

  return {
    targetMonth,
    startDate: `${targetMonth}-01`,
    endDate: `${targetMonth}-${String(lastDay).padStart(2, '0')}`,
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

  // 이번 달(targetMonth) 고정 — 다른 달 조회는 아직 지원하지 않음
  private async getThisMonthSchedules(
    userId: number,
  ): Promise<ScheduleEntity[]> {
    const { startDate, endDate } = getCurrentMonthRange();

    return this.scheduleRepository.find({
      where: { userId, date: Between(startDate, endDate) },
    });
  }

  private async findTodayDiary(userId: number): Promise<DiaryEntity | null> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.diaryRepository.findOne({
      where: { userId, createdAt: Between(startOfDay, endOfDay) },
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
    const schedules = await this.getThisMonthSchedules(userId);
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

  async getScheduleDetail(userId: number): Promise<ScheduleDetailDTO> {
    const schedules = await this.getThisMonthSchedules(userId);
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
              date: schedule.date,
            }),
          ),
        );
      })
      .filter((info) => info.count > 0)
      .sort((a, b) => b.count - a.count);

    return new ScheduleDetailDTO(mostFrequentCategory, categoryRankInfo);
  }

  async getPendingStats(userId: number): Promise<IncompletedScheduleStatsDTO> {
    const { targetMonth } = getCurrentMonthRange();
    const schedules = await this.getThisMonthSchedules(userId);
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
      targetMonth,
      incompletedSchedules,
    );
  }

  async getCompletedStats(userId: number): Promise<CompletedScheduleStatsDTO> {
    const schedules = await this.getThisMonthSchedules(userId);
    const completed = schedules.filter((schedule) => schedule.isCompleted);
    const completedSchedules = await this.toScheduleStatsDTOs(
      completed,
      userId,
    );

    return new CompletedScheduleStatsDTO(completed.length, completedSchedules);
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
