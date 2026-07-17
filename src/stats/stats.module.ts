import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DiaryEntity } from '../diaries/entities/diary.entity';
import { ScheduleEntity } from '../schedules/entities/schedule.entity';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { CategoryModule } from '../categories/category.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DiaryEntity, ScheduleEntity]),
    CategoryModule,
    AiModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
