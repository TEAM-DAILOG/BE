import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('User')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({
    type: 'varchar',
    length: 30,
    nullable: false,
    comment: '사용자 이름',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
    comment: '이메일',
  })
  email: string | null;

  @Column({
    name: 'profile_image_url',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '프로필 이미지',
  })
  profileImageUrl: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '비밀번호',
  })
  password: string | null;

  @Column({
    name: 'provider_id',
    type: 'varchar',
    length: 200,
    nullable: true,
    unique: true,
    comment: '소셜 로그인 식별자 아이디',
  })
  providerId: string | null;

  @Column({
    name: 'is_ai_summary',
    type: 'boolean',
    nullable: false,
    default: false,
    comment: 'AI 일기 요약 여부',
  })
  isAiSummary: boolean;

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
