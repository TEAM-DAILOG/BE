import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DiaryEntity } from './entities/diary.entity';
import { DiaryImageEntity } from './entities/diary-image.entity';
import { DiaryType } from './enums/diary-type.enum';
import { CreateDiaryDto, UpdateDiaryDto } from './diary.dto';

import { NotFoundException } from '../global/error/custom.exception';

@Injectable()
export class DiaryService {
  constructor(
    @InjectRepository(DiaryEntity)
    private readonly diaryRepository: Repository<DiaryEntity>,

    @InjectRepository(DiaryImageEntity)
    private readonly diaryImageRepository: Repository<DiaryImageEntity>,
  ) {}

  private async findOneDiaryEntity(
    diaryId: number,
  ): Promise<DiaryEntity> {
    const diary = await this.diaryRepository.findOne({
      where: { diaryId },
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
    const diary = this.diaryRepository.create({
      userId,
      diaryTitle: dto.title,
      content: dto.content,
      diaryType:
        dto.questionId == null
          ? DiaryType.FREE
          : DiaryType.QUESTION,
    });

    const savedDiary = await this.diaryRepository.save(diary);

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

  async findAllDiary(
    userId: number,
  ): Promise<DiaryEntity[]> {
    return this.diaryRepository.find({
      where: { userId },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOneDiary(
    diaryId: number,
  ): Promise<DiaryEntity> {
    return this.findOneDiaryEntity(diaryId);
  }

  async updateDiary(
    diaryId: number,
    dto: UpdateDiaryDto,
  ): Promise<DiaryEntity> {
    const diary = await this.findOneDiaryEntity(diaryId);

    diary.diaryTitle = dto.title ?? diary.diaryTitle;
    diary.content = dto.content ?? diary.content;

    return this.diaryRepository.save(diary);
  }

  async deleteDiary(
    diaryId: number,
  ) {
    await this.findOneDiaryEntity(diaryId);

    await this.diaryImageRepository.softDelete({
      diaryId,
    });

    return this.diaryRepository.softDelete(diaryId);
  }
}