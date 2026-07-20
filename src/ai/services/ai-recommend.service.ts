import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { getKstTodayRange } from '../../global/kst-date.util';

import { RecommendEntity } from '../entities/ai-recommend.entity';
import {
  RecommendCreateResponseDTO,
  RecommendListDTO,
} from '../dto/ai-recommend.dto';
import { GeminiService, RecommendationItem } from './ai-gemini.service';
import { DiaryEntity } from '../../diaries/entities/diary.entity';
import {
  CategoryColor,
  CategoryEntity,
} from '../../categories/entities/category.entity';
import { ConflictException } from '../../global/error/custom.exception';

const MAX_INITIAL_RECOMMENDATION_COUNT = 3;

@Injectable()
export class RecommendService {
  constructor(
    @InjectRepository(RecommendEntity)
    private readonly recommendRepository: Repository<RecommendEntity>,

    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,

    @InjectRepository(DiaryEntity)
    private readonly diaryRepository: Repository<DiaryEntity>,

    private readonly geminiService: GeminiService,
  ) {}

  // 하루에 일기는 하나만 작성 가능하다는 전제 하에 오늘(KST) 일기를 조회한다
  private async findTodayDiary(userId: number): Promise<DiaryEntity | null> {
    const { start, end } = getKstTodayRange();

    return this.diaryRepository.findOne({
      where: {
        userId,
        createdAt: Between(start, end),
      },
    });
  }

  // ponytail: 새 카테고리 색은 매번 BLUE로 고정 — 색 다양화 필요해지면 그때 로직 추가
  private async resolveCategory(
    item: RecommendationItem,
    userId: number,
    ownedCategories: CategoryEntity[],
  ): Promise<CategoryEntity> {
    const matched =
      item.categoryId != null
        ? ownedCategories.find(
            (category) => category.categoryId === item.categoryId,
          )
        : undefined;

    if (matched) {
      return matched;
    }

    // category.service.ts와 동일한 규칙: 유저의 마지막 순서 다음으로 이어붙임
    const nextOrder =
      ownedCategories.length > 0
        ? Math.max(
            ...ownedCategories.map((category) => category.categoryOrder),
          ) + 1
        : 1;

    return this.categoryRepository.save(
      this.categoryRepository.create({
        userId,
        categoryName: item.newCategoryName ?? '기타',
        categoryColor: CategoryColor.BLUE,
        categoryOrder: nextOrder,
      }),
    );
  }

  // AI가 만든 추천 아이템 하나를 카테고리 연결까지 해서 저장한다.
  // 이번 배치에서 방금 새로 만든 카테고리는 ownedCategories에 반영해 다음 아이템도 재사용하게 한다.
  private async saveRecommendation(
    userId: number,
    diary: DiaryEntity,
    item: RecommendationItem & { scheduleTitle: string },
    ownedCategories: CategoryEntity[],
  ): Promise<RecommendEntity> {
    const category = await this.resolveCategory(item, userId, ownedCategories);

    if (!ownedCategories.some((c) => c.categoryId === category.categoryId)) {
      ownedCategories.push(category);
    }

    return this.recommendRepository.save(
      this.recommendRepository.create({
        diary,
        category,
        title: item.scheduleTitle,
        isAdded: false,
      }),
    );
  }

  // 일기 내용 + 겹치면 안 되는 제목 목록을 넘겨서 정확히 하나만 추천받는다.
  // AI가 더 추천할 게 없다고 판단하면(scheduleTitle이 null) null을 반환한다.
  private async generateOneRecommendation(
    userId: number,
    diary: DiaryEntity,
    ownedCategories: CategoryEntity[],
    excludedTitles: string[],
  ): Promise<RecommendEntity | null> {
    const item = await this.geminiService.generateRecommendation(
      diary.content,
      ownedCategories.map((category) => ({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
      })),
      excludedTitles,
    );

    if (!item.scheduleTitle) {
      return null;
    }

    return this.saveRecommendation(
      userId,
      diary,
      { ...item, scheduleTitle: item.scheduleTitle },
      ownedCategories,
    );
  }

  // 오늘 첫 호출: 기존 추천 목록과 비교할 필요가 없는 전용 프롬프트로, 한 번의 호출로
  // 서로 겹치지 않는 추천을 최대 3개(부족하면 나온 만큼만) 받아 저장한다.
  // 이미 오늘 추천이 하나라도 있으면 addRecommendation을 쓰라고 안내한다.
  async createInitialRecommendations(
    userId: number,
  ): Promise<RecommendListDTO> {
    const diary = await this.findTodayDiary(userId);

    if (!diary) {
      throw new ConflictException('오늘 작성된 일기가 없습니다.');
    }

    const existing = await this.recommendRepository.find({
      where: { diary: { diaryId: diary.diaryId } },
    });

    if (existing.length > 0) {
      throw new ConflictException(
        '오늘의 추천 일정이 이미 생성되었습니다.',
        'ALREADY_INITIALIZED',
      );
    }

    const ownedCategories = await this.categoryRepository.find({
      where: { userId },
    });

    const items = await this.geminiService.generateInitialRecommendations(
      diary.content,
      ownedCategories.map((category) => ({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
      })),
    );

    const created: RecommendEntity[] = [];

    // 프롬프트로 최대 3개를 지시했지만, AI 응답을 완전히 신뢰하지 않고 코드에서도 한 번 더 자른다.
    for (const item of items.slice(0, MAX_INITIAL_RECOMMENDATION_COUNT)) {
      if (!item.scheduleTitle) {
        continue;
      }

      created.push(
        await this.saveRecommendation(
          userId,
          diary,
          { ...item, scheduleTitle: item.scheduleTitle },
          ownedCategories,
        ),
      );
    }

    return new RecommendListDTO(created);
  }

  // 이미 생성된 추천에 하나 더 추가한다. 오늘 기존 추천 전부와 안 겹치는 걸로 판단.
  async addRecommendation(userId: number): Promise<RecommendCreateResponseDTO> {
    const diary = await this.findTodayDiary(userId);

    if (!diary) {
      throw new ConflictException('오늘 작성된 일기가 없습니다.');
    }

    const ownedCategories = await this.categoryRepository.find({
      where: { userId },
    });

    const todaysRecommends = await this.recommendRepository.find({
      where: { diary: { diaryId: diary.diaryId } },
    });

    const recommend = await this.generateOneRecommendation(
      userId,
      diary,
      ownedCategories,
      todaysRecommends.map((r) => r.title),
    );

    if (!recommend) {
      throw new ConflictException(
        '더 이상 추천할 수 있는 일정이 없습니다.',
        'NO_MORE_RECOMMENDATIONS',
      );
    }

    return new RecommendCreateResponseDTO(recommend);
  }

  async getTodayRecommendations(userId: number): Promise<RecommendListDTO> {
    const diary = await this.findTodayDiary(userId);

    if (!diary) {
      throw new ConflictException('오늘 작성된 일기가 없습니다.');
    }

    const recommends = await this.recommendRepository.find({
      where: { diary: { diaryId: diary.diaryId } },
      relations: ['category'],
    });

    return new RecommendListDTO(recommends);
  }
}
