import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuestionEntity } from './ai-question.entity';
import { DiaryEntity } from '@/src/diaries/entities/diary.entity';

@Entity('DiaryQuestion')
export class DiaryQuestionEntity {
  @PrimaryGeneratedColumn({
    name: 'diary_question_id',
    type: 'int',
    comment: '일기-질문 아이디',
  })
  diaryQuestionId: number;

  @Column({
    name: 'is_written',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isWritten: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    comment: '생성일자',
  })
  createdAt: Date;

  @ManyToOne(() => QuestionEntity, { nullable: false })
  @JoinColumn({ name: 'question_id' })
  question: QuestionEntity;

  @OneToOne(() => DiaryEntity, { nullable: true })
  @JoinColumn({ name: 'diary_id' })
  diary: DiaryEntity;
}
