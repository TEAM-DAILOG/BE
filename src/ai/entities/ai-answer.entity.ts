import { DiaryEntity } from '@/src/diaries/entities/diary.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
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

  @OneToOne(() => DiaryEntity, { nullable: false })
  @JoinColumn({ name: 'diary_id' })
  diary: DiaryEntity;
}
