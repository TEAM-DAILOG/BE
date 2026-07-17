import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Question')
export class QuestionEntity {
  @PrimaryGeneratedColumn({
    name: 'question_id',
    type: 'int',
    comment: '질문ID',
  })
  questionId: number;

  @Column({
    name: 'content',
    type: 'text',
    nullable: false,
    comment: '질문내용',
  })
  content: string;

  @Column({
    name: 'target_date',
    type: 'date',
    nullable: false,
    unique: true,
    comment: '질문 날짜',
  })
  targetDate: string;
}
