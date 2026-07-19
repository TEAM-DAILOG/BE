import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DiaryEntity } from './entities/diary.entity';
import { DiaryImageEntity } from './entities/diary-image.entity';

import { DiaryController } from './diary.controller';
import { DiaryService } from './diary.service';
import { AiModule } from '../ai/ai.module';
import { S3Service } from '../global/s3/s3.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([DiaryEntity, DiaryImageEntity]),
    forwardRef(() => AiModule),
  ],

  controllers: [DiaryController],

  providers: [DiaryService, S3Service],

  exports: [DiaryService],
})
export class DiariesModule {}
