import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionEntity } from './entities/ai-question.entity';
import { AnswerEntity } from './entities/ai-answer.entity';
import { DiaryQuestionEntity } from './entities/ai-diary-question.entity';
import { RecommendEntity } from './entities/ai-recommend.entitiy';
import { DiaryEntity } from '../diaries/entities/diary.entity';
import { AiController } from './ai.controller';
import { QuestionService } from './services/ai-question.service';
import { AnswerService } from './services/ai-answer.service';
import { RecommendService } from './services/ai-recommend.service';
import { GeminiService } from './services/ai-gemini.service';
import { DiariesModule } from '../diaries/diary.module';
import { CategoryModule } from '../categories/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionEntity,
      AnswerEntity,
      DiaryQuestionEntity,
      RecommendEntity,
      DiaryEntity,
    ]),
    DiariesModule,
    CategoryModule,
  ],
  controllers: [AiController],
  providers: [QuestionService, AnswerService, RecommendService, GeminiService],
  exports: [TypeOrmModule],
})
export class AiModule {}
