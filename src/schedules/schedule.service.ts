import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { CategoryEntity } from '../categories/entities/category.entity';
import {
  BadRequestException as CustomBadRequestException,
  NotFoundException as CustomNotFoundException,
} from '../global/error/custom.exception';
import { GetSchedulesQueryDto } from './schedule.dto';
import { ScheduleEntity } from './schedule.entity';

interface ScheduleRaw {
  scheduleId: ScheduleEntity['scheduleId'];
  categoryId: CategoryEntity['categoryId'];
  categoryName: CategoryEntity['categoryName'];
  categoryColor: CategoryEntity['categoryColor'];
  title: ScheduleEntity['title'];
  content: ScheduleEntity['content'];
  date: ScheduleEntity['date'];
  groupId: ScheduleEntity['groupId'];
  isCompleted: ScheduleEntity['isCompleted'];
  repeatType: ScheduleEntity['repeatType'];
  repeatStartDate: ScheduleEntity['repeatStartDate'];
  repeatEndDate: ScheduleEntity['repeatEndDate'];
  repeatDays: ScheduleEntity['repeatDays'];
  createdAt: ScheduleEntity['createdAt'];
  updatedAt: ScheduleEntity['updatedAt'];
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
        '시작일은 종료일보다 늦을 수 없습니다.',
        'INVALID_DATE_RANGE',
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
          '카테고리를 찾을 수 없습니다.',
          'CATEGORY_NOT_FOUND',
        );
      }
    }

    const queryBuilder = this.createScheduleListQuery(userId);

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
      queryBuilder.andWhere(
        'schedule.categoryId = :categoryId',
        {
          categoryId,
        },
      );
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
      .orderBy('schedule.date', 'ASC')
      .addOrderBy('schedule.createdAt', 'ASC')
      .addOrderBy('schedule.scheduleId', 'ASC')
      .getRawMany<ScheduleRaw>();

    return schedules.map((schedule) =>
      this.toScheduleResponse(schedule),
    );
  }

  async getUpcomingSchedules(userId: number) {
    const schedules = await this.createScheduleListQuery(userId)
      .andWhere('schedule.isCompleted = :isCompleted', {
        isCompleted: false,
      })
      .andWhere(
        `schedule.date >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date`,
      )
      .orderBy('schedule.date', 'ASC')
      .addOrderBy('schedule.createdAt', 'ASC')
      .addOrderBy('schedule.scheduleId', 'ASC')
      .take(3)
      .getRawMany<ScheduleRaw>();

    return schedules.map((schedule) =>
      this.toScheduleResponse(schedule),
    );
  }

  private createScheduleListQuery(
    userId: number,
  ): SelectQueryBuilder<ScheduleEntity> {
    return this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoin(
        CategoryEntity,
        'category',
        [
          'category.categoryId = schedule.categoryId',
          'category.userId = :userId',
          'category.deletedAt IS NULL',
        ].join(' AND '),
        {
          userId,
        },
      )
      .where('schedule.userId = :userId', {
        userId,
      })
      .select([
        'schedule.scheduleId AS "scheduleId"',
        'category.categoryId AS "categoryId"',
        'category.categoryName AS "categoryName"',
        'category.categoryColor AS "categoryColor"',
        'schedule.title AS "title"',
        'schedule.content AS "content"',
        'schedule.date AS "date"',
        'schedule.groupId AS "groupId"',
        'schedule.isCompleted AS "isCompleted"',
        'schedule.repeatType AS "repeatType"',
        'schedule.repeatStartDate AS "repeatStartDate"',
        'schedule.repeatEndDate AS "repeatEndDate"',
        'schedule.repeatDays AS "repeatDays"',
        'schedule.createdAt AS "createdAt"',
        'schedule.updatedAt AS "updatedAt"',
      ]);
  }

  private toScheduleResponse(schedule: ScheduleRaw) {
    return {
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
    };
  }
}
