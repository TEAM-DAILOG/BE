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

  @Column({
    name: 'date',
    type: 'date',
    nullable: true,
    transformer: {
      // DB에 저장할때는 그대로
      to: (value: string | null) => value,
      // DB에서 읽을 떄 Date 객체로 와도 YYYY-MM-DD 문자열로 보장
      from: (value: string | Date | null) => {
        if (!value) return null;
        if (typeof value === 'string') return value;
        return value.toISOString().split('T')[0];
      },
    },
  })
  date: string | null;
}
