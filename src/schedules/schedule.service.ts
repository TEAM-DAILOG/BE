import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CategoryEntity, CategoryColor } from '../categories/entities/category.entity';
import {
  BadRequestException as CustomBadRequestException,
  NotFoundException as CustomNotFoundException,
} from '../global/error/custom.exception';
import { GetSchedulesQueryDto } from './schedule.dto';
import { ScheduleEntity } from './schedule.entity';

interface ScheduleRawResult {
  scheduleId: number;
  categoryId: number;
  categoryName: string;
  categoryColor: CategoryColor;
  title: string;
  content: string | null;
  date: string;
  groupId: number | null;
  isCompleted: boolean;
  repeatType: string;
  repeatStartDate: string | null;
  repeatEndDate: string | null;
  repeatDays: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepository: Repository<ScheduleEntity>,

    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async getSchedules(
    userId: number,
    query: GetSchedulesQueryDto,
  ) {
    const {
      startDate,
      endDate,
      categoryId,
      isCompleted,
    } = query;

    if (startDate && endDate && startDate > endDate) {
      throw new CustomBadRequestException(
        'INVALID_DATE_RANGE',
        '시작일은 종료일보다 늦을 수 없습니다.',
      );
    }

    if (categoryId !== undefined) {
      const category = await this.categoryRepository.findOne({
        where: {
          categoryId,
          userId,
        },
      });

      if (!category) {
        throw new CustomNotFoundException(
          'CATEGORY_NOT_FOUND',
          '카테고리를 찾을 수 없습니다.',
        );
      }
    }

    const queryBuilder = this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoin(
        CategoryEntity,
        'category',
        `
          category.categoryId = schedule.categoryId
          AND category.userId = :userId
          AND category.deletedAt IS NULL
        `,
        { userId },
      )
      .where('schedule.userId = :userId', { userId });

    if (startDate) {
      queryBuilder.andWhere('schedule.date >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('schedule.date <= :endDate', {
        endDate,
      });
    }

    if (categoryId !== undefined) {
      queryBuilder.andWhere('schedule.categoryId = :categoryId', {
        categoryId,
      });
    }

    if (isCompleted !== undefined) {
      queryBuilder.andWhere(
        'schedule.isCompleted = :isCompleted',
        {
          isCompleted,
        },
      );
    }

    const schedules = await queryBuilder
      .select('schedule.scheduleId', 'scheduleId')
      .addSelect('category.categoryId', 'categoryId')
      .addSelect('category.categoryName', 'categoryName')
      .addSelect('category.categoryColor', 'categoryColor')
      .addSelect('schedule.title', 'title')
      .addSelect('schedule.content', 'content')
      .addSelect('schedule.date', 'date')
      .addSelect('schedule.groupId', 'groupId')
      .addSelect('schedule.isCompleted', 'isCompleted')
      .addSelect('schedule.repeatType', 'repeatType')
      .addSelect('schedule.repeatStartDate', 'repeatStartDate')
      .addSelect('schedule.repeatEndDate', 'repeatEndDate')
      .addSelect('schedule.repeatDays', 'repeatDays')
      .addSelect('schedule.createdAt', 'createdAt')
      .addSelect('schedule.updatedAt', 'updatedAt')
      .orderBy('schedule.date', 'ASC')
      .addOrderBy('schedule.createdAt', 'ASC')
      .addOrderBy('schedule.scheduleId', 'ASC')
      .getRawMany<ScheduleRawResult>();

    return schedules.map((schedule) => ({
      scheduleId: schedule.scheduleId,
      category: {
        categoryId: schedule.categoryId,
        categoryName: schedule.categoryName,
        categoryColor: schedule.categoryColor,
      },
      title: schedule.title,
      content: schedule.content,
      date: schedule.date,
      groupId: schedule.groupId,
      isCompleted: schedule.isCompleted,
      repeatType: schedule.repeatType,
      repeatStartDate: schedule.repeatStartDate,
      repeatEndDate: schedule.repeatEndDate,
      repeatDays: schedule.repeatDays,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    }));
  }
}