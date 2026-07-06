import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserAlarmEntity } from "./entities/user-alarm.entity";
import { PushTokenEntity } from "./entities/push-token.entity";
import { ReminderEntity } from "./entities/reminder.entity";

@Module({
    imports: [TypeOrmModule.forFeature([UserAlarmEntity, PushTokenEntity, ReminderEntity])],
    controllers: [],
    providers: [],
})
export class AlarmsModule {}