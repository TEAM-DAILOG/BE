import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserAlarmEntity } from "./user-alarm.entity";
@Entity('Reminder')
export class ReminderEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    reminderId: number;

    @Column({
        type: 'jsonb',
        nullable: true,
        comment: '알람 요일'
    })
    days: string[] | null;

    @Column({
        type: 'time',
        nullable: true,
        comment: '알람 시간'
    })
    time: string | null;

    @OneToOne(() => UserAlarmEntity, (userAlarm) => userAlarm.reminder)
    @JoinColumn({ name: 'alarm_id' })
    userAlarm: UserAlarmEntity;
}