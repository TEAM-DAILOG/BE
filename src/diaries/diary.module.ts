import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DiaryEntity } from './entities/diary.entity';
import { DiaryImageEntity } from './entities/diary-image.entity';
import { RecommendEntity } from './entities/recommend.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DiaryEntity,
      DiaryImageEntity,
      RecommendEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DiariesModule {}