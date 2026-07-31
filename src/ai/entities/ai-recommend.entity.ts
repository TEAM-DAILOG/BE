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

export enum RecommendType {
  DIARY = 'DIARY', // 최초/추가 생성 — 일기 화면에 고정으로 보이는 배치
  ADDITIONAL = 'ADDITIONAL', // 통계에서 재생성한 배치 중 최신 것 (diary당 최대 1세트만 존재)
  ARCHIVED = 'ARCHIVED', // 재생성으로 밀려난 예전 ADDITIONAL 배치 — 삭제하지 않고 보관만
}

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
    name: 'type',
    type: 'enum',
    enum: RecommendType,
    enumName: 'recommend_type_enum',
    default: RecommendType.DIARY,
    comment: '추천 배치 종류 (일기 고정 / 통계 최신 재생성 / 보관된 예전 재생성)',
  })
  type: RecommendType;

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

  @ManyToOne(() => DiaryEntity, { nullable: false })
  @JoinColumn({ name: 'diary_id' })
  diary: DiaryEntity;

  @ManyToOne(() => CategoryEntity, { nullable: false })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;
}
