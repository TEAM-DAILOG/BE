import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseModel {
  @CreateDateColumn({
    name: 'created_at',
    nullable: false,
    type: 'timestamp',
    comment: '생성시간',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp',
    comment: '수정시간',
  })
  updatedAt: Date;
}

export abstract class SoftDeleteModel extends BaseModel {
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    comment: 'softDelete 삭제시간',
  })
  deletedAt: Date | null;
}
