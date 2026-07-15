import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ScheduleRepeatGroupEntity } from './schedule-repeat-group.entity';

@Entity('schedule')
export class ScheduleEntity {
  @PrimaryGeneratedColumn({
    name: 'schedule_id',
    type: 'int',
  })
  scheduleId: number;

  @Column({
    name: 'user_id',
    type: 'int',
  })
  userId: number;

  @Column({
    name: 'category_id',
    type: 'int',
  })
  categoryId: number;

  @Column({
    name: 'group_id',
    type: 'int',
    nullable: true,
  })
  groupId: number | null;

  @ManyToOne(
    () => ScheduleRepeatGroupEntity,
    {
      nullable: true,
    },
  )
  @JoinColumn({
    name: 'group_id',
    referencedColumnName: 'groupId',
  })
  repeatGroup: ScheduleRepeatGroupEntity | null;

  @Column({
    type: 'varchar',
    length: 50,
  })
  title: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  content: string | null;

  @Column({
    type: 'date',
  })
  date: string;

  @Column({
    name: 'is_completed',
    type: 'boolean',
    default: false,
  })
  isCompleted: boolean;

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
