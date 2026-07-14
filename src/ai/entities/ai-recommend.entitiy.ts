import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Recommend')
export class RecommendEntity {
  @PrimaryGeneratedColumn({
    name: 'recommend_id',
    type: 'int',
    comment: '추천ID',
  })
  recommendId: number;

  @Column({
    name: 'title',
    type: 'varchar',
    length: 500,
    nullable: false,
    comment: '추천 일정 제목',
  })
  title: string;

  @Column({
    name: 'is_added',
    type: 'boolean',
    nullable: false,
    default: false,
    comment: '일정 추가 여부',
  })
  isAdded: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    comment: '생성일자',
  })
  createdAt: Date;
}
