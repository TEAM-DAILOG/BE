import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionEntity } from './entities/ai-question.entity';
import { AnswerEntity } from './entities/ai-answer.entity';
import { DiaryQuestionEntity } from './entities/ai-diary-question.entity';
import { RecommendEntity } from './entities/ai-recommend.entitiy';
import { AiController } from './ai.controller';
import { AiAnswerController } from './ai-answer.controller';
import { AiService } from './ai.service';
import { GeminiService } from './gemini.service';
import { DiariesModule } from '../diaries/diary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionEntity,
      AnswerEntity,
      DiaryQuestionEntity,
      RecommendEntity,
    ]),
    DiariesModule,
  ],
  controllers: [AiController, AiAnswerController],
  providers: [AiService, GeminiService],
  exports: [TypeOrmModule],
})
export class AiModule {}
