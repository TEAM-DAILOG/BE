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

@Entity('schedule')
export class ScheduleEntity {
  @PrimaryGeneratedColumn({ name: 'schedule_id', type: 'int' })
  scheduleId: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'category_id', type: 'int' })
  categoryId: number;

  @Column({ type: 'varchar', length: 50 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'group_id', type: 'int', nullable: true })
  groupId: number | null;

  @Column({ name: 'is_completed', type: 'boolean', default: false })
  isCompleted: boolean;

  @Column({
    name: 'repeat_type',
    type: 'enum',
    enum: RepeatType,
    enumName: 'schedule_repeat_type_enum',
    default: RepeatType.NONE,
  })
  repeatType: RepeatType;

  @Column({ name: 'repeat_end_date', type: 'date', nullable: true })
  repeatEndDate: string | null;

  @Column({ name: 'repeat_start_date', type: 'date', nullable: true })
  repeatStartDate: string | null;

  @Column({ name: 'repeat_days', type: 'varchar', length: 20, nullable: true })
  repeatDays: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
