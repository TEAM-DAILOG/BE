import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { UserAlarmEntity } from './entities/user-alarm.entity';
import { PushTokenEntity } from './entities/push-token.entity';
import { ReminderEntity } from './entities/reminder.entity';
import { AlarmService } from './services/alarms.service';
import { AlarmController } from './alarms.controller';
import { PushNotificationService } from './services/push-notification.service';
import { AlarmNotificationService } from './services/alarm-notification.service';
import { firebaseAdminProvider } from './firebase-admin.provider';
import { DiaryEntity } from '../diaries/entities/diary.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserAlarmEntity,
            PushTokenEntity,
            ReminderEntity,
            DiaryEntity,
        ]),
        ScheduleModule.forRoot(),
    ],
    controllers: [AlarmController],
    providers: [
        AlarmService,
        PushNotificationService,
        AlarmNotificationService,
        firebaseAdminProvider,
    ],
    exports: [TypeOrmModule, AlarmService],
})
export class AlarmsModule {}
