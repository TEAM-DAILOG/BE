import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from '../../global/base-model';

@Entity('recommend')
export class RecommendEntity extends BaseModel {
  @PrimaryGeneratedColumn({
    name: 'recommend_id',
    type: 'int',
  })
  recommendId: number;

  @Column({
    name: 'category_id',
    type: 'int',
    nullable: false,
    comment: '카테고리 아이디',
  })
  categoryId: number;

  @Column({
    name: 'diary_id',
    type: 'int',
    nullable: false,
    comment: '일기 아이디',
  })
  diaryId: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: '추천 일정 제목',
  })
  title: string;

  @Column({
    name: 'is_added',
    type: 'boolean',
    nullable: false,
    comment: '일정 추가 여부',
  })
  isAdded: boolean;
}