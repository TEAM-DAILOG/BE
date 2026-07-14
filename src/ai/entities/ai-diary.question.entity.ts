import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
}
