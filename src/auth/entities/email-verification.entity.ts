import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum EmailVerificationPurpose {
  SIGNUP = 'SIGNUP',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

@Entity('EmailVerification')
@Unique('UQ_EMAIL_VERIFICATION_EMAIL_PURPOSE', ['email', 'purpose'])
export class EmailVerificationEntity {
  @PrimaryGeneratedColumn({ name: 'email_verification_id', type: 'int' })
  emailVerificationId: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({
    type: 'enum',
    enum: EmailVerificationPurpose,
    enumName: 'email_verification_purpose_enum',
    nullable: false,
  })
  purpose: EmailVerificationPurpose;

  @Column({
    name: 'code_hash',
    type: 'varchar',
    length: 64,
    nullable: false,
  })
  codeHash: string;

  @Column({
    name: 'code_expires_at',
    type: 'timestamp',
    nullable: false,
  })
  codeExpiresAt: Date;

  @Column({
    name: 'failed_attempts',
    type: 'int',
    nullable: false,
    default: 0,
  })
  failedAttempts: number;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: false })
  sentAt: Date;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  @Column({
    name: 'verification_token_hash',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  verificationTokenHash: string | null;

  @Column({
    name: 'verification_token_expires_at',
    type: 'timestamp',
    nullable: true,
  })
  verificationTokenExpiresAt: Date | null;

  @Column({ name: 'consumed_at', type: 'timestamp', nullable: true })
  consumedAt: Date | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: false,
  })
  updatedAt: Date;
}
