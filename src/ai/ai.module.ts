import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionEntity } from './entities/ai.question.entity';
import { AnswerEntity } from './entities/ai.answer.entity';
import { DiaryQuestionEntity } from './entities/ai.diary.question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionEntity,
      AnswerEntity,
      DiaryQuestionEntity,
    ]),
  ],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class AiModule {}
