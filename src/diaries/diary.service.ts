import { Injectable, Inject, forwardRef, ConflictException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DiaryEntity } from './entities/diary.entity';
import { DiaryImageEntity } from './entities/diary-image.entity';
import { DiaryType } from './enums/diary-type.enum';
import { CreateDiaryDto, CreateDiaryResponseDto, DiaryDetailResponseDto, DiaryListResponseDto, UpdateDiaryDto } from './diary.dto';

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

  // 사용자 권한 검증용
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

  // AI 서비스에서 사용하는 조회
  async findOneDiary(diaryId: number): Promise<DiaryEntity> {
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

  // 일기 작성
  async createDiary(userId: number, dto: CreateDiaryDto): Promise<CreateDiaryResponseDto> {
    const isQuestionDiary = !!dto.questionId;


    const existingDiary = await this.diaryRepository.findOne({
    where: {
      userId,
      date: dto.date,
    },
  });

  if (existingDiary) {
    throw new ConflictException('오늘은 이미 일기를 작성했습니다.');
  }

    const diary = this.diaryRepository.create({
      userId,
      diaryTitle: dto.title,
      content: dto.content,
      diaryType: isQuestionDiary ? DiaryType.QUESTION : DiaryType.FREE,
      date: dto.date,
    });

    const savedDiary = await this.diaryRepository.save(diary);

    const { diaryId, userId: uid, date, diaryType, diaryTitle, content, aiSummary } = savedDiary;

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

    return { diaryId, userId: uid, date, diaryType, diaryTitle, content, aiSummary };
  }

  // 전체 일기 조회
  async findAllDiary(userId: number): Promise<DiaryListResponseDto[]> {
    const diaries = await this.diaryRepository.find({
      where: { userId },
      order: {
        createdAt: 'DESC',
      },
    });

    const result = await Promise.all(
    diaries.map(async (diary) => {
      const images = await this.diaryImageRepository.find({
        where: { diaryId: diary.diaryId },
      });

      const { diaryId, userId, date, diaryType, diaryTitle, content, aiSummary } = diary;
      return {
        diaryId, userId, date, diaryType, diaryTitle,
        content, aiSummary, images: images.map((image) => image.imageUrl),
      };
    }),
  );
  return result;
  }

  // 일기 상세 조회
  async findDiaryDetail(diaryId: number, userId: number): Promise<DiaryDetailResponseDto> {
    const diary = await this.findOneDiaryEntity(diaryId, userId);

    const images = await this.diaryImageRepository.find({
      where: { diaryId },
    });

    let questionContent: string | null = null;

    if (diary.diaryType === DiaryType.QUESTION) {
      const diaryQuestion =
        await this.questionService.getDiaryQuestion(diaryId);

      questionContent = diaryQuestion.questionContent;
    }
    const { diaryId: id, userId: uid, date, diaryType, diaryTitle, content, aiSummary } = diary;
  
    return {
    diaryId: id, userId: uid, date, diaryType, diaryTitle,
    content, aiSummary, questionContent,
    images: images.map((image) => image.imageUrl),
  };
  }

  // 일기 수정
  async updateDiary(
    diaryId: number,
    userId: number,
    dto: UpdateDiaryDto,
  ): Promise<DiaryEntity> {
    const diary = await this.findOneDiaryEntity(diaryId, userId);

    diary.diaryTitle = dto.title ?? diary.diaryTitle;
    diary.content = dto.content ?? diary.content;

    return this.diaryRepository.save(diary);
  }

  // 일기 삭제
  async deleteDiary(diaryId: number, userId: number) {
    await this.findOneDiaryEntity(diaryId, userId);

    await this.diaryImageRepository.softDelete({
      diaryId,
    });

    return this.diaryRepository.softDelete(diaryId);
  }
}
