import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SoftDeleteModel } from '../../global/base-model';

@Entity('DiaryImage')
export class DiaryImageEntity extends SoftDeleteModel {
  @PrimaryGeneratedColumn({
    name: 'diary_image_id',
    type: 'int',
  })
  diaryImageId: number;

  @Column({
    name: 'diary_id',
    type: 'int',
    nullable: false,
    comment: '일기 아이디',
  })
  diaryId: number;

  @Column({
    name: 'image_url',
    type: 'varchar',
    length: 200,
    nullable: false,
    comment: '이미지 주소(S3 URL)',
  })
  imageUrl: string;
}
