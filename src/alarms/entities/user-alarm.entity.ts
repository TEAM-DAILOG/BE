import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";// 유저 알람
import { ReminderEntity } from "./reminder.entity";

@Entity('UserAlarm')
export class UserAlarmEntity extends BaseEntity {
    
    @PrimaryGeneratedColumn()
    alarmId: number;

    @Column({
        type: 'boolean',
        default: false,
        comment: 'PUSH 알람 여부'
    })
    isPush: boolean;

    @Column({
        type: 'boolean',
        default: false,
        comment: '일기 작성 알람 여부'
    })
    isDiary: boolean;

    @Column({
        type: 'boolean',
        default: false,
        comment: '일기 답장 알람 여부'
    })
    isDiaryReply: boolean;
    
    @OneToOne(() => ReminderEntity, (reminder) => reminder.userAlarm)
    reminder: ReminderEntity;
}