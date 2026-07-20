import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SoftDeleteModel } from '../../global/base-model';
import { DiaryType } from '../enums/diary-type.enum';

@Entity('Diary')
export class DiaryEntity extends SoftDeleteModel {
  @PrimaryGeneratedColumn({
    name: 'diary_id',
    type: 'int',
  })
  diaryId: number;

  @Column({
    name: 'user_id',
    type: 'int',
    comment: '사용자 아이디',
  })
  userId: number;

  @Column({
    name: 'diary_type',
    type: 'enum',
    enum: DiaryType,
    enumName: 'diary_type_enum',
    comment: '일기 유형',
  })
  diaryType: DiaryType;

  @Column({
    name: 'diary_title',
    type: 'varchar',
    length: 50,
    comment: '일기 제목',
  })
  diaryTitle: string;

  @Column({
    type: 'text',
    comment: '일기 내용',
  })
  content: string;

  @Column({
    name: 'ai_summary',
    type: 'text',
    nullable: true,
    comment: 'AI 일기 요약',
  })
  aiSummary: string | null;
}
