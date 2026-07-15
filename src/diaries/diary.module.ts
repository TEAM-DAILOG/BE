import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DiaryEntity } from './entities/diary.entity';
import { DiaryImageEntity } from './entities/diary-image.entity';
import { RecommendEntity } from './entities/recommend.entity';
import {DiaryController} from './diary.controller';
import {DiaryService} from './diary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DiaryEntity,
      DiaryImageEntity,
      RecommendEntity,
    ]),
  ],

  controllers: [DiaryController],

  providers: [DiaryService],

  exports: [DiaryService],
})
export class DiariesModule {}