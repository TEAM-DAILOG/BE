import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Answer')
export class AnswerEntity {
  @PrimaryGeneratedColumn({ name: 'answer_id', type: 'int' })
  answerId: number;

  @Column({ name: 'answer', type: 'text' })
  answer: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    comment: '생성일',
  })
  createdAt: Date;
}
