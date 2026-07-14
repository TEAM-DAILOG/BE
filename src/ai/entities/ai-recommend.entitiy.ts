import { CategoryEntity } from '@/src/categories/entities/category.entity';
import { DiaryEntity } from '@/src/diaries/entities/diary.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
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

  //TODO: 카테고리 연결
  @ManyToOne(() => DiaryEntity, { nullable: false })
  @JoinColumn({ name: 'diary_id' })
  diary: DiaryEntity;

  @ManyToOne(() => CategoryEntity, { nullable: false })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;
}
