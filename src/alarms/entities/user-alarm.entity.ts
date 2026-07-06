import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReminderEntity } from './reminder.entity';

@Entity('UserAlarm')
export class UserAlarmEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  alarmId: number;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'PUSH 알람 여부',
  })
  isPush: boolean;

  @Column({
    type: 'boolean',
    default: false,
    comment: '일기 작성 알람 여부',
  })
  isDiary: boolean;

  @Column({
    type: 'boolean',
    default: false,
    comment: '일기 답장 알람 여부',
  })
  isDiaryReply: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
    comment: '생성일',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    comment: '수정일',
  })
  updatedAt: Date;

  @OneToOne(() => ReminderEntity, (reminder) => reminder.userAlarm)
  reminder: ReminderEntity;
}
