import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { RecommendEntity } from '../entities/ai-recommend.entitiy';
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

  // 하루에 일기는 하나만 작성 가능하다는 전제 하에 오늘 일기를 조회한다
  private async findTodayDiary(userId: number): Promise<DiaryEntity | null> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.diaryRepository.findOne({
      where: {
        userId,
        createdAt: Between(startOfDay, endOfDay),
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

    return this.categoryRepository.save(
      this.categoryRepository.create({
        userId,
        categoryName: item.newCategoryName ?? '기타',
        categoryColor: CategoryColor.BLUE,
      }),
    );
  }

  // 한 번 호출에 정확히 하나의 일정만 추천한다. 오늘 이미 추천된 일정과
  // 겹치지 않는 새 일정은 AI가 프롬프트(GEMINI_RECOMMEND_PROMPT) 기준으로 직접 판단한다.
  async createRecommendation(
    userId: number,
  ): Promise<RecommendCreateResponseDTO> {
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

    const item = await this.geminiService.generateRecommendation(
      diary.content,
      ownedCategories.map((category) => ({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
      })),
      todaysRecommends.map((recommend) => recommend.title),
    );

    if (!item.scheduleTitle) {
      throw new ConflictException(
        '더 이상 추천할 수 있는 일정이 없습니다.',
        'NO_MORE_RECOMMENDATIONS',
      );
    }

    const category = await this.resolveCategory(item, userId, ownedCategories);

    const recommend = await this.recommendRepository.save(
      this.recommendRepository.create({
        diary,
        category,
        title: item.scheduleTitle,
        isAdded: false,
      }),
    );

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
