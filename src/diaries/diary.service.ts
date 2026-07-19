import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DiaryEntity } from './entities/diary.entity';
import { DiaryImageEntity } from './entities/diary-image.entity';
import { DiaryType } from './enums/diary-type.enum';
import { CreateDiaryDto, UpdateDiaryDto } from './diary.dto';

import { NotFoundException } from '../global/error/custom.exception';
import { QuestionService } from '../ai/services/ai-question.service';

@Injectable()
export class DiaryService {
  constructor(
    @InjectRepository(DiaryEntity)
    private readonly diaryRepository: Repository<DiaryEntity>,

    @InjectRepository(DiaryImageEntity)
    private readonly diaryImageRepository: Repository<DiaryImageEntity>,

    @Inject(forwardRef(() => QuestionService))
    private readonly questionService: QuestionService,
  ) {}

  /**
   * 사용자 권한 검증용
   */
  private async findOneDiaryEntity(
    diaryId: number,
    userId: number,
  ): Promise<DiaryEntity> {
    const diary = await this.diaryRepository.findOne({
      where: {
        diaryId,
        userId,
      },
    });

    if (!diary) {
      throw new NotFoundException('존재하지 않는 일기입니다.');
    }

    return diary;
  }

  /**
   * AI 서비스에서 사용하는 조회
   */
  async findOneDiary(
    diaryId: number,
  ): Promise<DiaryEntity> {
    const diary = await this.diaryRepository.findOne({
      where: {
        diaryId,
      },
    });

    if (!diary) {
      throw new NotFoundException('존재하지 않는 일기입니다.');
    }

    return diary;
  }
  async createDiary(
  userId: number,
  dto: CreateDiaryDto,
): Promise<DiaryEntity> {
  console.log('========== Create Diary ==========');
  console.log(dto);
  console.log('questionId:', dto.questionId);
  console.log('typeof questionId:', typeof dto.questionId);
  console.log('questionId == null:', dto.questionId == null);
  console.log('==================================');

  const isQuestionDiary =
    !!dto.questionId;

  console.log('isQuestionDiary:', isQuestionDiary);

  const diary = this.diaryRepository.create({
    userId,
    diaryTitle: dto.title,
    content: dto.content,
    diaryType: isQuestionDiary
      ? DiaryType.QUESTION
      : DiaryType.FREE,
  });

  const savedDiary = await this.diaryRepository.save(diary);

  if (isQuestionDiary) {
    await this.questionService.linkDiaryQuestion(
      dto.questionId!,
      savedDiary.diaryId,
    );
  }

  const images = dto.images ?? [];

  if (images.length > 0) {
    const diaryImages = images.map((image) =>
      this.diaryImageRepository.create({
        diaryId: savedDiary.diaryId,
        imageUrl: image,
      }),
    );

    await this.diaryImageRepository.save(diaryImages);
  }

  return savedDiary;
}

  async findAllDiary(userId: number): Promise<DiaryEntity[]> {
    return this.diaryRepository.find({
      where: { userId },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findDiaryDetail(
    diaryId: number,
    userId: number,
  ) {
    const diary = await this.findOneDiaryEntity(
      diaryId,
      userId,
    );

    const images = await this.diaryImageRepository.find({
      where: { diaryId },
    });

    let questionContent: string | null = null;

    if (diary.diaryType === DiaryType.QUESTION) {
      const diaryQuestion =
        await this.questionService.getDiaryQuestion(diaryId);

      questionContent = diaryQuestion.questionContent;
    }

    return {
      diaryId: diary.diaryId,
      userId: diary.userId,
      diaryType: diary.diaryType,
      diaryTitle: diary.diaryTitle,
      content: diary.content,
      aiSummary: diary.aiSummary,
      createdAt: diary.createdAt,
      updatedAt: diary.updatedAt,
      questionContent,
      images: images.map((image) => image.imageUrl),
    };
  }

  async updateDiary(
    diaryId: number,
    userId: number,
    dto: UpdateDiaryDto,
  ): Promise<DiaryEntity> {
    const diary = await this.findOneDiaryEntity(
      diaryId,
      userId,
    );

    diary.diaryTitle = dto.title ?? diary.diaryTitle;
    diary.content = dto.content ?? diary.content;

    return this.diaryRepository.save(diary);
  }

  async deleteDiary(
    diaryId: number,
    userId: number,
  ) {
    await this.findOneDiaryEntity(
      diaryId,
      userId,
    );

    await this.diaryImageRepository.softDelete({
      diaryId,
    });

    return this.diaryRepository.softDelete(diaryId);
  }
}