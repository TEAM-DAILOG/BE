import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RepeatType {
  NONE = 'NONE',
  MULTIPLE = 'MULTIPLE',
  PERIOD = 'PERIOD',
  WEEKLY = 'WEEKLY',
}

@Entity('ScheduleRepeatGroup')
export class ScheduleRepeatGroupEntity {
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

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
  })
  updatedAt: Date | null;
}
