import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAlarmEntity } from './entities/user-alarm.entity';
import { PushTokenEntity } from './entities/push-token.entity';
import { ReminderEntity } from './entities/reminder.entity';
import { AlarmsService } from './alarms.service';
import { AlarmsController } from './alarms.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserAlarmEntity,
      PushTokenEntity,
      ReminderEntity,
    ]),
  ],
  controllers: [AlarmsController],
  providers: [AlarmsService],
  exports: [TypeOrmModule],
})
export class AlarmsModule {}
