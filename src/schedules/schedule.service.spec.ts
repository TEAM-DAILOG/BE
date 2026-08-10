import { DataSource, EntityManager, Repository } from 'typeorm';

import { CategoryEntity } from '../categories/entities/category.entity';
import {
  BadRequestException as CustomBadRequestException,
  NotFoundException as CustomNotFoundException,
} from '../global/error/custom.exception';
import {
  RepeatType,
  ScheduleRepeatGroupEntity,
} from './entities/schedule-repeat-group.entity';
import { ScheduleEntity } from './entities/schedule.entity';
import { ScheduleService } from './schedule.service';

describe('ScheduleService.deleteSchedule', () => {
  const userId = 1;
  const scheduleId = 10;

  let service: ScheduleService;
  let scheduleRepository: {
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
    delete: jest.Mock;
    count: jest.Mock;
  };
  let repeatGroupRepository: {
    findOne: jest.Mock;
    delete: jest.Mock;
  };
  let groupSchedulesQueryBuilder: {
    setLock: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    getMany: jest.Mock;
  };

  const createSchedule = (
    groupId: number | null,
    targetScheduleId = scheduleId,
  ): ScheduleEntity => ({
    scheduleId: targetScheduleId,
    userId,
    categoryId: 1,
    groupId,
    repeatGroup: null,
    title: '일정',
    content: null,
    date: '2026-08-10',
    isCompleted: false,
    createdAt: new Date('2026-08-10T00:00:00.000Z'),
    updatedAt: new Date('2026-08-10T00:00:00.000Z'),
  });

  const createRepeatGroup = (
    repeatType: RepeatType,
  ): ScheduleRepeatGroupEntity => ({
    groupId: 20,
    userId,
    repeatType,
    repeatStartDate: '2026-08-01',
    repeatEndDate: '2026-08-31',
    repeatDays: null,
    isLastDayOfMonth: false,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
  });

  beforeEach(() => {
    groupSchedulesQueryBuilder = {
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    scheduleRepository = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(groupSchedulesQueryBuilder),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      count: jest.fn().mockResolvedValue(1),
    };
    repeatGroupRepository = {
      findOne: jest.fn(),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const manager = {
      getRepository: jest.fn((entity) =>
        entity === ScheduleEntity ? scheduleRepository : repeatGroupRepository,
      ),
    } as unknown as EntityManager;
    const dataSource = {
      transaction: jest.fn(
        (operation: (entityManager: EntityManager) => Promise<unknown>) =>
          operation(manager),
      ),
    } as unknown as DataSource;

    service = new ScheduleService(
      scheduleRepository as unknown as Repository<ScheduleEntity>,
      {} as Repository<CategoryEntity>,
      dataSource,
    );
  });

  it('PERIOD 일정을 scope=ALL로 요청하면 반복 그룹 전체를 삭제한다', async () => {
    const schedule = createSchedule(20);
    const groupSchedules = [
      schedule,
      createSchedule(20, 11),
      createSchedule(20, 12),
    ];
    scheduleRepository.findOne.mockResolvedValue(schedule);
    repeatGroupRepository.findOne.mockResolvedValue(
      createRepeatGroup(RepeatType.PERIOD),
    );
    groupSchedulesQueryBuilder.getMany.mockResolvedValue(groupSchedules);

    await expect(
      service.deleteSchedule(userId, scheduleId, 'ALL'),
    ).resolves.toEqual({ scheduleId });

    expect(groupSchedulesQueryBuilder.getMany).toHaveBeenCalledTimes(1);
    expect(scheduleRepository.delete).toHaveBeenCalledWith([10, 11, 12]);
    expect(repeatGroupRepository.delete).toHaveBeenCalledWith({
      groupId: 20,
      userId,
    });
  });

  it('PERIOD 일정을 scope=SINGLE로 요청하면 데이터 삭제 없이 거부한다', async () => {
    const schedule = createSchedule(20);
    scheduleRepository.findOne.mockResolvedValue(schedule);
    repeatGroupRepository.findOne.mockResolvedValue(
      createRepeatGroup(RepeatType.PERIOD),
    );

    await expect(
      service.deleteSchedule(userId, scheduleId, 'SINGLE'),
    ).rejects.toMatchObject<Partial<CustomBadRequestException>>({
      statusCode: 400,
      errorCode: 'BAD_REQUEST',
      reason: '기간 반복 일정은 전체 삭제만 가능합니다.',
    });

    expect(scheduleRepository.delete).not.toHaveBeenCalled();
    expect(scheduleRepository.count).not.toHaveBeenCalled();
    expect(repeatGroupRepository.delete).not.toHaveBeenCalled();
  });

  it('다른 반복 타입은 scope=SINGLE 기존 삭제 동작을 유지한다', async () => {
    const schedule = createSchedule(20);
    scheduleRepository.findOne.mockResolvedValue(schedule);
    repeatGroupRepository.findOne.mockResolvedValue(
      createRepeatGroup(RepeatType.WEEKLY),
    );

    await expect(
      service.deleteSchedule(userId, scheduleId, 'SINGLE'),
    ).resolves.toEqual({ scheduleId });

    expect(scheduleRepository.delete).toHaveBeenCalledWith({
      scheduleId,
      userId,
    });
    expect(scheduleRepository.count).toHaveBeenCalledWith({
      where: { groupId: 20, userId },
    });
    expect(repeatGroupRepository.delete).not.toHaveBeenCalled();
  });

  it('단일 일정은 scope=SINGLE 기존 삭제 동작을 유지한다', async () => {
    const schedule = createSchedule(null);
    scheduleRepository.findOne.mockResolvedValue(schedule);

    await expect(
      service.deleteSchedule(userId, scheduleId, 'SINGLE'),
    ).resolves.toEqual({ scheduleId });

    expect(repeatGroupRepository.findOne).not.toHaveBeenCalled();
    expect(scheduleRepository.delete).toHaveBeenCalledWith({
      scheduleId,
      userId,
    });
    expect(scheduleRepository.count).not.toHaveBeenCalled();
  });

  it('존재하지 않거나 다른 사용자 소유인 일정은 기존 NotFound 에러를 유지한다', async () => {
    scheduleRepository.findOne.mockResolvedValue(null);

    await expect(
      service.deleteSchedule(userId, scheduleId, 'SINGLE'),
    ).rejects.toMatchObject<Partial<CustomNotFoundException>>({
      statusCode: 404,
      errorCode: 'SCHEDULE_NOT_FOUND',
      reason: '일정을 찾을 수 없습니다.',
    });

    expect(scheduleRepository.findOne).toHaveBeenCalledWith({
      where: { scheduleId, userId },
    });
    expect(scheduleRepository.delete).not.toHaveBeenCalled();
    expect(repeatGroupRepository.delete).not.toHaveBeenCalled();
  });
});
