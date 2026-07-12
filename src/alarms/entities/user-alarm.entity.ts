import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReminderEntity } from './reminder.entity';
import { UserEntity } from '@/src/users/entities/user.entity';
import { BaseModel } from '@/src/global/base-model';

@Entity('UserAlarm')
export class UserAlarmEntity extends BaseModel {
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



  @OneToOne(() => ReminderEntity, (reminder) => reminder.userAlarm)
  reminder: ReminderEntity;

  @OneToOne(() => UserEntity, (user) => user.userAlarm)
  user: UserEntity;
}
