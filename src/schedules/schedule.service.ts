import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

import { CategoryEntity } from '../categories/entities/category.entity';
import {
  BadRequestException as CustomBadRequestException,
  NotFoundException as CustomNotFoundException,
} from '../global/error/custom.exception';
import {
  CreateScheduleDto,
  GetSchedulesQueryDto,
  UpdateScheduleDto,
} from './schedule.dto';
import { ScheduleEntity } from './schedule.entity';
import {
  RepeatType,
  ScheduleRepeatGroupEntity,
} from './schedule-repeat-group.entity';

const MAX_SCHEDULE_CREATION_COUNT = 365;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const VALID_REPEAT_DAYS = [
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
  'SUN',
] as const;

type RepeatDay = (typeof VALID_REPEAT_DAYS)[number];

const WEEKDAY_NUMBER: Record<RepeatDay, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

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
  repeatType: RepeatType | null;
  repeatStartDate: ScheduleRepeatGroupEntity['repeatStartDate'];
  repeatEndDate: ScheduleRepeatGroupEntity['repeatEndDate'];
  repeatDays: ScheduleRepeatGroupEntity['repeatDays'];
  createdAt: ScheduleEntity['createdAt'];
  updatedAt: ScheduleEntity['updatedAt'];
}

interface ScheduleCreationPlan {
  dates: string[];
  repeatStartDate: string | null;
  repeatEndDate: string | null;
  repeatDays: string | null;
}

export interface CreateScheduleResult {
  scheduleId: number | null;
  groupId: number | null;
  createdCount: number;
}

export interface UpdateScheduleResult {
  scheduleId: number | null;
  groupId: number | null;
  createdCount: number;
  updatedCount: number;
  deletedCount: number;
}

export interface UpdatedSchedule {
  scheduleId: number;
  categoryId: number;
  title: string;
  content: string | null;
  date: string;
  groupId: number | null;
  isCompleted: boolean;
  repeatType: RepeatType;
  repeatStartDate: string | null;
  repeatEndDate: string | null;
  repeatDays: string | null;
}

export interface DeleteScheduleResult {
  scheduleId: number;
}

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepository: Repository<ScheduleEntity>,

    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,

    private readonly dataSource: DataSource,
  ) {}

  async getSchedules(userId: number, query: GetSchedulesQueryDto) {
    const { startDate, endDate, categoryId, isCompleted } = query;

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
      queryBuilder.andWhere('schedule.categoryId = :categoryId', {
        categoryId,
      });
    }

    if (isCompleted !== undefined) {
      queryBuilder.andWhere('schedule.isCompleted = :isCompleted', {
        isCompleted,
      });
    }

    const schedules = await queryBuilder
      .orderBy('schedule.date', 'ASC')
      .addOrderBy('schedule.createdAt', 'ASC')
      .addOrderBy('schedule.scheduleId', 'ASC')
      .getRawMany<ScheduleRaw>();

    return schedules.map((schedule) => this.toScheduleResponse(schedule));
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

    return schedules.map((schedule) => this.toScheduleResponse(schedule));
  }

  async createSchedule(
    userId: number,
    dto: CreateScheduleDto,
  ): Promise<CreateScheduleResult> {
    const title = dto.title.trim();

    if (!title) {
      throw new CustomBadRequestException('일정 제목을 입력해주세요.');
    }

    const creationPlan = this.createScheduleCreationPlan(dto);

    if (creationPlan.dates.length > MAX_SCHEDULE_CREATION_COUNT) {
      throw new CustomBadRequestException(
        `한 번에 생성할 수 있는 일정은 최대 ${MAX_SCHEDULE_CREATION_COUNT}개입니다.`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const categoryRepository = manager.getRepository(CategoryEntity);

      const category = await categoryRepository.findOne({
        where: {
          categoryId: dto.categoryId,
          userId,
        },
      });

      if (!category) {
        throw new CustomNotFoundException(
          '카테고리를 찾을 수 없습니다.',
          'CATEGORY_NOT_FOUND',
        );
      }

      const scheduleRepository = manager.getRepository(ScheduleEntity);

      if (dto.repeatType === RepeatType.NONE) {
        const schedule = scheduleRepository.create({
          userId,
          categoryId: dto.categoryId,
          groupId: null,
          repeatGroup: null,
          title,
          content: dto.content ?? null,
          date: creationPlan.dates[0],
          isCompleted: false,
        });

        const savedSchedule = await scheduleRepository.save(schedule);

        return {
          scheduleId: savedSchedule.scheduleId,
          groupId: null,
          createdCount: 1,
        };
      }

      const repeatGroupRepository = manager.getRepository(
        ScheduleRepeatGroupEntity,
      );

      const repeatGroup = repeatGroupRepository.create({
        userId,
        repeatType: dto.repeatType,
        repeatStartDate: creationPlan.repeatStartDate,
        repeatEndDate: creationPlan.repeatEndDate,
        repeatDays: creationPlan.repeatDays,
      });

      const savedRepeatGroup = await repeatGroupRepository.save(repeatGroup);

      const schedules = creationPlan.dates.map((date) =>
        scheduleRepository.create({
          userId,
          categoryId: dto.categoryId,
          groupId: savedRepeatGroup.groupId,
          repeatGroup: savedRepeatGroup,
          title,
          content: dto.content ?? null,
          date,
          isCompleted: false,
        }),
      );

      await scheduleRepository.save(schedules);

      return {
        scheduleId: null,
        groupId: savedRepeatGroup.groupId,
        createdCount: schedules.length,
      };
    });
  }

  async updateSchedule(
    userId: number,
    scheduleId: number,
    scope: 'SINGLE' | 'ALL',
    dto: UpdateScheduleDto,
  ): Promise<UpdatedSchedule | UpdateScheduleResult> {
    this.validateUpdateDto(dto);

    return this.dataSource.transaction(async (manager) => {
      const scheduleRepository = manager.getRepository(ScheduleEntity);
      const schedule = await scheduleRepository.findOne({
        where: { scheduleId, userId },
        relations: { repeatGroup: true },
      });

      if (!schedule) {
        throw new CustomNotFoundException(
          '일정을 찾을 수 없습니다.',
          'SCHEDULE_NOT_FOUND',
        );
      }

      await this.validateUpdateCategory(manager, userId, dto);

      if (scope === 'SINGLE') {
        return this.updateSingle(manager, schedule, dto);
      }

      return this.updateAll(manager, userId, schedule, dto);
    });
  }

  async deleteSchedule(
    userId: number,
    scheduleId: number,
    scope: unknown,
  ): Promise<DeleteScheduleResult> {
    if (scope !== 'SINGLE' && scope !== 'ALL') {
      throw new CustomBadRequestException(
        '삭제 범위가 올바르지 않습니다.',
        'INVALID_SCOPE',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const scheduleRepository = manager.getRepository(ScheduleEntity);
      const repeatGroupRepository = manager.getRepository(
        ScheduleRepeatGroupEntity,
      );
      const schedule = await scheduleRepository.findOne({
        where: {
          scheduleId,
          userId,
        },
      });

      if (!schedule) {
        throw new CustomNotFoundException(
          '일정을 찾을 수 없습니다.',
          'SCHEDULE_NOT_FOUND',
        );
      }

      if (scope === 'ALL' && schedule.groupId !== null) {
        await scheduleRepository.delete({
          groupId: schedule.groupId,
          userId,
        });
        await repeatGroupRepository.delete({
          groupId: schedule.groupId,
          userId,
        });
      } else {
        const groupId = schedule.groupId;

        await scheduleRepository.delete({
          scheduleId,
          userId,
        });

        if (groupId !== null) {
          const remainingCount = await scheduleRepository.count({
            where: {
              groupId,
              userId,
            },
          });

          if (remainingCount === 0) {
            await repeatGroupRepository.delete({
              groupId,
              userId,
            });
          }
        }
      }

      return {
        scheduleId,
      };
    });
  }

  private async updateSingle(
    manager: EntityManager,
    schedule: ScheduleEntity,
    dto: UpdateScheduleDto,
  ): Promise<UpdatedSchedule> {
    const repeatFields = [
      'repeatType',
      'repeatStartDate',
      'repeatEndDate',
      'repeatDays',
      'repeatDates',
    ] as const;
    if (repeatFields.some((field) => this.hasOwn(dto, field))) {
      throw new CustomBadRequestException(
        'SINGLE 수정에서는 반복 설정 필드를 변경할 수 없습니다.',
      );
    }

    this.applyBasicUpdates(schedule, dto, true);
    const oldGroupId = schedule.groupId;
    schedule.groupId = null;
    schedule.repeatGroup = null;
    await manager.getRepository(ScheduleEntity).save(schedule);

    if (oldGroupId !== null) {
      const remainingCount = await manager.getRepository(ScheduleEntity).count({
        where: { groupId: oldGroupId, userId: schedule.userId },
      });
      if (remainingCount === 0) {
        await manager
          .getRepository(ScheduleRepeatGroupEntity)
          .delete({ groupId: oldGroupId, userId: schedule.userId });
      }
    }

    return this.toUpdatedSchedule(schedule, null);
  }

  private async updateAll(
    manager: EntityManager,
    userId: number,
    selected: ScheduleEntity,
    dto: UpdateScheduleDto,
  ): Promise<UpdateScheduleResult> {
    if (selected.groupId === null) {
      return this.updateAllFromSingle(manager, userId, selected, dto);
    }

    return this.updateAllFromGroup(manager, userId, selected, dto);
  }

  private async updateAllFromSingle(
    manager: EntityManager,
    userId: number,
    schedule: ScheduleEntity,
    dto: UpdateScheduleDto,
  ): Promise<UpdateScheduleResult> {
    const hasRepeatType = this.hasOwn(dto, 'repeatType');
    const hasRepeatSettings = this.hasAnyOwn(dto, [
      'repeatStartDate',
      'repeatEndDate',
      'repeatDays',
      'repeatDates',
    ]);

    if (!hasRepeatType && hasRepeatSettings) {
      throw new CustomBadRequestException(
        '단일 일정을 반복 일정으로 변경하려면 repeatType이 필요합니다.',
      );
    }

    if (!hasRepeatType || dto.repeatType === RepeatType.NONE) {
      this.assertNoneSettings(dto);
      this.applyBasicUpdates(schedule, dto, true);
      await manager.getRepository(ScheduleEntity).save(schedule);
      return {
        scheduleId: schedule.scheduleId,
        groupId: null,
        createdCount: 0,
        updatedCount: 1,
        deletedCount: 0,
      };
    }

    const plan = this.createUpdatePlan(dto.repeatType!, dto, null, []);
    this.assertMaximumCount(plan.dates.length);
    this.applyBasicUpdates(schedule, dto, false);
    const originalDate = schedule.date;
    const reusedDate = plan.dates.includes(originalDate)
      ? originalDate
      : plan.dates[0];
    if (reusedDate !== originalDate) schedule.isCompleted = false;
    schedule.date = reusedDate;

    const groupRepository = manager.getRepository(ScheduleRepeatGroupEntity);
    const group = await groupRepository.save(
      groupRepository.create({
        userId,
        repeatType: dto.repeatType,
        repeatStartDate: plan.repeatStartDate,
        repeatEndDate: plan.repeatEndDate,
        repeatDays: plan.repeatDays,
      }),
    );
    schedule.groupId = group.groupId;
    schedule.repeatGroup = group;
    const scheduleRepository = manager.getRepository(ScheduleEntity);
    await scheduleRepository.save(schedule);

    const newSchedules = plan.dates
      .filter((date) => date !== reusedDate)
      .map((date) =>
        scheduleRepository.create({
          userId,
          categoryId: schedule.categoryId,
          groupId: group.groupId,
          repeatGroup: group,
          title: schedule.title,
          content: schedule.content,
          date,
          isCompleted: false,
        }),
      );
    if (newSchedules.length) await scheduleRepository.save(newSchedules);

    return {
      scheduleId: null,
      groupId: group.groupId,
      createdCount: newSchedules.length,
      updatedCount: 1,
      deletedCount: 0,
    };
  }

  private async updateAllFromGroup(
    manager: EntityManager,
    userId: number,
    selected: ScheduleEntity,
    dto: UpdateScheduleDto,
  ): Promise<UpdateScheduleResult> {
    const scheduleRepository = manager.getRepository(ScheduleEntity);
    const groupRepository = manager.getRepository(ScheduleRepeatGroupEntity);
    const group = await groupRepository.findOne({
      where: { groupId: selected.groupId!, userId },
    });
    if (!group) {
      throw new CustomNotFoundException(
        '일정을 찾을 수 없습니다.',
        'SCHEDULE_NOT_FOUND',
      );
    }
    const schedules = await scheduleRepository.find({
      where: { groupId: group.groupId, userId },
      order: { date: 'ASC' },
    });
    const hasRuleFields = this.hasAnyOwn(dto, [
      'repeatType',
      'repeatStartDate',
      'repeatEndDate',
      'repeatDays',
      'repeatDates',
    ]);

    if (this.hasOwn(dto, 'date') && dto.repeatType !== RepeatType.NONE) {
      throw new CustomBadRequestException(
        '반복 일정의 날짜 한 건만 변경하려면 scope=SINGLE을 사용해야 합니다.',
      );
    }

    if (dto.repeatType === RepeatType.NONE) {
      this.assertNoneSettings(dto);
      this.applyBasicUpdates(selected, dto, true);
      selected.groupId = null;
      selected.repeatGroup = null;
      const deleted = schedules.filter(
        (schedule) => schedule.scheduleId !== selected.scheduleId,
      );
      if (deleted.length) await scheduleRepository.remove(deleted);
      await scheduleRepository.save(selected);
      await groupRepository.remove(group);
      return {
        scheduleId: selected.scheduleId,
        groupId: null,
        createdCount: 0,
        updatedCount: 1,
        deletedCount: deleted.length,
      };
    }

    if (!hasRuleFields) {
      schedules.forEach((schedule) =>
        this.applyBasicUpdates(schedule, dto, false),
      );
      await scheduleRepository.save(schedules);
      return {
        scheduleId: null,
        groupId: group.groupId,
        createdCount: 0,
        updatedCount: schedules.length,
        deletedCount: 0,
      };
    }

    const targetType = dto.repeatType ?? group.repeatType;
    const plan = this.createUpdatePlan(
      targetType,
      dto,
      group,
      schedules.map(({ date }) => date),
    );
    this.assertMaximumCount(plan.dates.length);
    const byDate = new Map(
      schedules.map((schedule) => [schedule.date, schedule]),
    );
    const kept: ScheduleEntity[] = [];
    const created: ScheduleEntity[] = [];

    for (const date of plan.dates) {
      const existing = byDate.get(date);
      if (existing) {
        this.applyBasicUpdates(existing, dto, false);
        kept.push(existing);
        byDate.delete(date);
      } else {
        created.push(
          scheduleRepository.create({
            userId,
            categoryId: this.hasOwn(dto, 'categoryId')
              ? dto.categoryId!
              : selected.categoryId,
            groupId: group.groupId,
            repeatGroup: group,
            title: this.hasOwn(dto, 'title')
              ? dto.title!.trim()
              : selected.title,
            content: this.hasOwn(dto, 'content')
              ? dto.content!
              : selected.content,
            date,
            isCompleted: false,
          }),
        );
      }
    }
    const deleted = [...byDate.values()];
    if (deleted.length) await scheduleRepository.remove(deleted);
    if (kept.length) await scheduleRepository.save(kept);
    group.repeatType = targetType;
    group.repeatStartDate = plan.repeatStartDate;
    group.repeatEndDate = plan.repeatEndDate;
    group.repeatDays = plan.repeatDays;
    await groupRepository.save(group);
    if (created.length) await scheduleRepository.save(created);

    return {
      scheduleId: null,
      groupId: group.groupId,
      createdCount: created.length,
      updatedCount: kept.length,
      deletedCount: deleted.length,
    };
  }

  private createScheduleCreationPlan(
    dto: CreateScheduleDto,
  ): ScheduleCreationPlan {
    switch (dto.repeatType) {
      case RepeatType.NONE:
        return this.createNonePlan(dto);

      case RepeatType.MULTIPLE:
        return this.createMultiplePlan(dto);

      case RepeatType.PERIOD:
        return this.createPeriodPlan(dto);

      case RepeatType.WEEKLY:
        return this.createWeeklyPlan(dto);
    }
  }

  private validateUpdateDto(dto: UpdateScheduleDto): void {
    if (Object.keys(dto).length === 0) {
      throw new CustomBadRequestException(
        '수정할 정보를 한 개 이상 입력해야 합니다.',
      );
    }

    for (const field of [
      'categoryId',
      'title',
      'date',
      'repeatType',
    ] as const) {
      if (this.hasOwn(dto, field) && dto[field] === null) {
        throw new CustomBadRequestException(`${field}은 null일 수 없습니다.`);
      }
    }

    if (this.hasOwn(dto, 'title') && !dto.title!.trim()) {
      throw new CustomBadRequestException('일정 제목을 입력해주세요.');
    }
    if (this.hasOwn(dto, 'date')) this.validateDate(dto.date!, 'date');
  }

  private async validateUpdateCategory(
    manager: EntityManager,
    userId: number,
    dto: UpdateScheduleDto,
  ): Promise<void> {
    if (!this.hasOwn(dto, 'categoryId')) return;
    const category = await manager.getRepository(CategoryEntity).findOne({
      where: { categoryId: dto.categoryId!, userId },
    });
    if (!category) {
      throw new CustomNotFoundException(
        '카테고리를 찾을 수 없습니다.',
        'CATEGORY_NOT_FOUND',
      );
    }
  }

  private applyBasicUpdates(
    schedule: ScheduleEntity,
    dto: UpdateScheduleDto,
    includeDate: boolean,
  ): void {
    if (this.hasOwn(dto, 'categoryId')) schedule.categoryId = dto.categoryId!;
    if (this.hasOwn(dto, 'title')) schedule.title = dto.title!.trim();
    if (this.hasOwn(dto, 'content')) schedule.content = dto.content ?? null;
    if (includeDate && this.hasOwn(dto, 'date')) schedule.date = dto.date!;
  }

  private createUpdatePlan(
    targetType: RepeatType,
    dto: UpdateScheduleDto,
    currentGroup: ScheduleRepeatGroupEntity | null,
    currentDates: string[],
  ): ScheduleCreationPlan {
    const merged = {
      repeatType: targetType,
      repeatStartDate: this.hasOwn(dto, 'repeatStartDate')
        ? dto.repeatStartDate
        : currentGroup?.repeatStartDate,
      repeatEndDate: this.hasOwn(dto, 'repeatEndDate')
        ? dto.repeatEndDate
        : currentGroup?.repeatEndDate,
      repeatDays: this.hasOwn(dto, 'repeatDays')
        ? dto.repeatDays
        : currentGroup?.repeatDays,
      repeatDates: this.hasOwn(dto, 'repeatDates')
        ? dto.repeatDates
        : currentGroup?.repeatType === RepeatType.MULTIPLE
          ? currentDates
          : undefined,
      date: this.hasOwn(dto, 'date') ? dto.date : undefined,
      categoryId: 1,
      title: 'update',
      content: null,
    } as CreateScheduleDto;

    return this.createScheduleCreationPlan(merged);
  }

  private assertNoneSettings(dto: UpdateScheduleDto): void {
    const invalid = [
      'repeatStartDate',
      'repeatEndDate',
      'repeatDays',
      'repeatDates',
    ].filter((field) => this.hasOwn(dto, field));
    if (invalid.length) {
      throw new CustomBadRequestException(
        `NONE에는 반복 설정 필드를 사용할 수 없습니다: ${invalid.join(', ')}`,
      );
    }
  }

  private assertMaximumCount(count: number): void {
    if (count > MAX_SCHEDULE_CREATION_COUNT) {
      throw new CustomBadRequestException(
        `한 번에 생성할 수 있는 일정은 최대 ${MAX_SCHEDULE_CREATION_COUNT}개입니다.`,
      );
    }
  }

  private toUpdatedSchedule(
    schedule: ScheduleEntity,
    group: ScheduleRepeatGroupEntity | null,
  ): UpdatedSchedule {
    return {
      scheduleId: schedule.scheduleId,
      categoryId: schedule.categoryId,
      title: schedule.title,
      content: schedule.content,
      date: schedule.date,
      groupId: schedule.groupId,
      isCompleted: schedule.isCompleted,
      repeatType: group?.repeatType ?? RepeatType.NONE,
      repeatStartDate: group?.repeatStartDate ?? null,
      repeatEndDate: group?.repeatEndDate ?? null,
      repeatDays: group?.repeatDays ?? null,
    };
  }

  private hasOwn(object: object, property: PropertyKey): boolean {
    return Object.prototype.hasOwnProperty.call(object, property);
  }

  private hasAnyOwn(object: object, properties: PropertyKey[]): boolean {
    return properties.some((property) => this.hasOwn(object, property));
  }

  private createNonePlan(dto: CreateScheduleDto): ScheduleCreationPlan {
    if (!dto.date) {
      throw new CustomBadRequestException(
        '반복하지 않는 일정은 date가 필요합니다.',
      );
    }

    this.assertNoRelatedFields([
      {
        name: 'repeatStartDate',
        value: dto.repeatStartDate,
      },
      {
        name: 'repeatEndDate',
        value: dto.repeatEndDate,
      },
      {
        name: 'repeatDays',
        value: dto.repeatDays,
      },
      {
        name: 'repeatDates',
        value: dto.repeatDates,
      },
    ]);

    this.validateDate(dto.date, 'date');

    return {
      dates: [dto.date],
      repeatStartDate: null,
      repeatEndDate: null,
      repeatDays: null,
    };
  }

  private createMultiplePlan(dto: CreateScheduleDto): ScheduleCreationPlan {
    if (!dto.repeatDates || dto.repeatDates.length === 0) {
      throw new CustomBadRequestException(
        'MULTIPLE 일정은 repeatDates가 필요합니다.',
      );
    }

    this.assertNoRelatedFields([
      {
        name: 'date',
        value: dto.date,
      },
      {
        name: 'repeatStartDate',
        value: dto.repeatStartDate,
      },
      {
        name: 'repeatEndDate',
        value: dto.repeatEndDate,
      },
      {
        name: 'repeatDays',
        value: dto.repeatDays,
      },
    ]);

    dto.repeatDates.forEach((date) => {
      this.validateDate(date, 'repeatDates');
    });

    const uniqueDates = new Set(dto.repeatDates);

    if (uniqueDates.size !== dto.repeatDates.length) {
      throw new CustomBadRequestException(
        'repeatDates에는 중복된 날짜를 입력할 수 없습니다.',
      );
    }

    return {
      dates: [...dto.repeatDates].sort(),
      repeatStartDate: null,
      repeatEndDate: null,
      repeatDays: null,
    };
  }

  private createPeriodPlan(dto: CreateScheduleDto): ScheduleCreationPlan {
    if (!dto.repeatStartDate || !dto.repeatEndDate) {
      throw new CustomBadRequestException(
        'PERIOD 일정은 반복 시작일과 종료일이 필요합니다.',
      );
    }

    this.assertNoRelatedFields([
      {
        name: 'date',
        value: dto.date,
      },
      {
        name: 'repeatDays',
        value: dto.repeatDays,
      },
      {
        name: 'repeatDates',
        value: dto.repeatDates,
      },
    ]);

    this.validateDateRange(dto.repeatStartDate, dto.repeatEndDate);

    return {
      dates: this.generateDateRange(dto.repeatStartDate, dto.repeatEndDate),
      repeatStartDate: dto.repeatStartDate,
      repeatEndDate: dto.repeatEndDate,
      repeatDays: null,
    };
  }

  private createWeeklyPlan(dto: CreateScheduleDto): ScheduleCreationPlan {
    if (!dto.repeatStartDate || !dto.repeatEndDate || !dto.repeatDays) {
      throw new CustomBadRequestException(
        'WEEKLY 일정은 반복 시작일, 종료일, 반복 요일이 필요합니다.',
      );
    }

    this.assertNoRelatedFields([
      {
        name: 'date',
        value: dto.date,
      },
      {
        name: 'repeatDates',
        value: dto.repeatDates,
      },
    ]);

    this.validateDateRange(dto.repeatStartDate, dto.repeatEndDate);

    const repeatDays = this.normalizeRepeatDays(dto.repeatDays);

    const allowedWeekdays = new Set(
      repeatDays.map((repeatDay) => WEEKDAY_NUMBER[repeatDay]),
    );

    const dates = this.generateDateRange(
      dto.repeatStartDate,
      dto.repeatEndDate,
    ).filter((date) => allowedWeekdays.has(this.parseDate(date).getUTCDay()));

    if (dates.length === 0) {
      throw new CustomBadRequestException(
        '반복 기간 내 생성 가능한 일정이 없습니다.',
      );
    }

    return {
      dates,
      repeatStartDate: dto.repeatStartDate,
      repeatEndDate: dto.repeatEndDate,
      repeatDays: repeatDays.join(','),
    };
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
      .leftJoin(
        ScheduleRepeatGroupEntity,
        'repeatGroup',
        [
          'repeatGroup.groupId = schedule.groupId',
          'repeatGroup.userId = :userId',
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
        'repeatGroup.repeatType AS "repeatType"',
        'repeatGroup.repeatStartDate AS "repeatStartDate"',
        'repeatGroup.repeatEndDate AS "repeatEndDate"',
        'repeatGroup.repeatDays AS "repeatDays"',
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
      repeatType: schedule.repeatType ?? RepeatType.NONE,
      repeatStartDate: schedule.repeatStartDate,
      repeatEndDate: schedule.repeatEndDate,
      repeatDays: schedule.repeatDays,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };
  }

  private assertNoRelatedFields(
    fields: {
      name: string;
      value: unknown;
    }[],
  ): void {
    const providedFieldNames = fields
      .filter(({ value }) => this.hasValue(value))
      .map(({ name }) => name);

    if (providedFieldNames.length > 0) {
      throw new CustomBadRequestException(
        `repeatType과 관련 없는 필드가 포함되어 있습니다: ${providedFieldNames.join(', ')}`,
      );
    }
  }

  private normalizeRepeatDays(repeatDays: string): RepeatDay[] {
    const values = repeatDays
      .split(',')
      .map((repeatDay) => repeatDay.trim().toUpperCase());

    const containsInvalidDay = values.some(
      (repeatDay) => !VALID_REPEAT_DAYS.includes(repeatDay as RepeatDay),
    );

    if (containsInvalidDay) {
      throw new CustomBadRequestException(
        'repeatDays는 MON,TUE,WED,THU,FRI,SAT,SUN만 사용할 수 있습니다.',
      );
    }

    return [...new Set(values)] as RepeatDay[];
  }

  private validateDateRange(startDate: string, endDate: string): void {
    this.validateDate(startDate, 'repeatStartDate');
    this.validateDate(endDate, 'repeatEndDate');

    if (startDate > endDate) {
      throw new CustomBadRequestException(
        '시작일은 종료일보다 늦을 수 없습니다.',
        'INVALID_DATE_RANGE',
      );
    }
  }

  private validateDate(value: string, fieldName: string): void {
    if (!DATE_PATTERN.test(value)) {
      throw new CustomBadRequestException(
        `${fieldName}는 올바른 YYYY-MM-DD 날짜여야 합니다.`,
      );
    }

    const parsedDate = this.parseDate(value);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      this.formatDate(parsedDate) !== value
    ) {
      throw new CustomBadRequestException(
        `${fieldName}는 올바른 YYYY-MM-DD 날짜여야 합니다.`,
      );
    }
  }

  private generateDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const currentDate = this.parseDate(startDate);
    const finalDate = this.parseDate(endDate);

    while (currentDate.getTime() <= finalDate.getTime()) {
      dates.push(this.formatDate(currentDate));

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return dates;
  }

  private parseDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);

    return new Date(Date.UTC(year, month - 1, day));
  }

  private formatDate(value: Date): string {
    return value.toISOString().slice(0, 10);
  }

  private hasValue(value: unknown): boolean {
    return value !== undefined && value !== null;
  }
}
