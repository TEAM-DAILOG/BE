import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DiaryEntity } from '../diaries/entities/diary.entity';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { ScheduleModule } from '../schedules/schedule.module';
import { CategoryModule } from '../categories/category.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DiaryEntity]),
    ScheduleModule,
    CategoryModule,
    AiModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
