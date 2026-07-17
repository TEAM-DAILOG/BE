import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CategoryColor {
  BLUE = 'BLUE',
  BROWN = 'BROWN',
  GREEN = 'GREEN',
  PURPLE = 'PURPLE',
  PINK = 'PINK',
}

@Entity('Category')
export class CategoryEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'category_id', type: 'int' })
  categoryId: number;

  @Column({
    name: 'category_name',
    type: 'varchar',
    length: 30,
    nullable: false,
    comment: '카테고리명',
  })
  categoryName: string;

  @Column({
    name: 'category_color',
    type: 'enum',
    enum: CategoryColor,
    enumName: 'category_color_enum',
    nullable: false,
    comment: '카테고리 색',
  })
  categoryColor: CategoryColor;

  @Column({
    name: 'user_id',
    type: 'int',
    nullable: false,
    comment: '사용자 아이디',
  })
  userId: number;

  @Column({
    name: 'category_order',
    type: 'int',
    nullable: false,
    comment: '카테고리 순서',
  })
  categoryOrder: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    comment: '생성일',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
    comment: '수정일',
  })
  updatedAt: Date | null;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
    comment: '삭제일',
  })
  deletedAt: Date | null;
}
