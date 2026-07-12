import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserAlarmEntity } from './user-alarm.entity';
import { BaseModel } from '@/src/global/base-model';

@Entity('Reminder')
export class ReminderEntity extends BaseModel {
  @PrimaryGeneratedColumn()
  reminderId: number;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '알람 요일',
  })
  days: string[] | null;

  @Column({
    type: 'time',
    nullable: true,
    comment: '알람 시간',
  })
  time: string | null;

  @OneToOne(() => UserAlarmEntity, (userAlarm) => userAlarm.reminder, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'alarm_id' })
  userAlarm: UserAlarmEntity;
}
