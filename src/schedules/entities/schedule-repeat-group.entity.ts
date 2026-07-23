import { BaseModel } from '@/src/global/base-model';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum RepeatType {
  NONE = 'NONE',
  MULTIPLE = 'MULTIPLE',
  PERIOD = 'PERIOD',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

@Entity('ScheduleRepeatGroup')
export class ScheduleRepeatGroupEntity extends BaseModel {
  @PrimaryGeneratedColumn({
    name: 'group_id',
    type: 'int',
  })
  groupId: number;

  @Column({
    name: 'user_id',
    type: 'int',
  })
  userId: number;

  @Column({
    name: 'repeat_type',
    type: 'enum',
    enum: RepeatType,
    enumName: 'schedule_repeat_group_repeat_type_enum',
  })
  repeatType: RepeatType;

  @Column({
    name: 'repeat_start_date',
    type: 'date',
    nullable: true,
  })
  repeatStartDate: string | null;

  @Column({
    name: 'repeat_end_date',
    type: 'date',
    nullable: true,
  })
  repeatEndDate: string | null;

  @Column({
    name: 'repeat_days',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  repeatDays: string | null;
}
