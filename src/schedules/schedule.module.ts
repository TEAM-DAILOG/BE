import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryEntity } from '../categories/entities/category.entity';
import { ScheduleController } from './schedule.controller';
import { ScheduleEntity } from './schedule.entity';
import { ScheduleRepeatGroupEntity } from './schedule-repeat-group.entity';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScheduleEntity,
      ScheduleRepeatGroupEntity,
      CategoryEntity,
    ]),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class SchedulesModule {}
