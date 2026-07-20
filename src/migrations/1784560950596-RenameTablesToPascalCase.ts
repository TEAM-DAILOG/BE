import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameTablesToPascalCase1784560950596 implements MigrationInterface {
    name = 'RenameTablesToPascalCase1784560950596'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // FK 제약 조건 먼저 제거
        await queryRunner.query(`ALTER TABLE "Recommend" DROP CONSTRAINT IF EXISTS "FK_7011b481daa90a8ddba3e54171e"`);
        await queryRunner.query(`ALTER TABLE "DiaryQuestion" DROP CONSTRAINT IF EXISTS "FK_af4bd8f20531902a8b52b84aac3"`);
        await queryRunner.query(`ALTER TABLE "Answer" DROP CONSTRAINT IF EXISTS "FK_856c60f9641d3932a537ebd2c2c"`);

        // 테이블 RENAME
        await queryRunner.query(`ALTER TABLE "diary" RENAME TO "Diary"`);
        await queryRunner.query(`ALTER TABLE "diary_image" RENAME TO "DiaryImage"`);
        await queryRunner.query(`ALTER TABLE "schedule" RENAME TO "Schedule"`);
        await queryRunner.query(`ALTER TABLE "user_agreements" RENAME TO "UserAgreement"`);

        // COMMENT 업데이트
        await queryRunner.query(`COMMENT ON COLUMN "User"."created_at" IS '생성시간'`);
        await queryRunner.query(`COMMENT ON COLUMN "User"."updated_at" IS '수정시간'`);
        await queryRunner.query(`COMMENT ON COLUMN "User"."deleted_at" IS 'softDelete 삭제시간'`);
        await queryRunner.query(`COMMENT ON COLUMN "RefreshToken"."created_at" IS '생성시간'`);
        await queryRunner.query(`COMMENT ON COLUMN "RefreshToken"."updated_at" IS '수정시간'`);
        await queryRunner.query(`COMMENT ON COLUMN "Category"."created_at" IS '생성시간'`);
        await queryRunner.query(`COMMENT ON COLUMN "Category"."updated_at" IS '수정시간'`);
        await queryRunner.query(`COMMENT ON COLUMN "Category"."deleted_at" IS 'softDelete 삭제시간'`);
        await queryRunner.query(`COMMENT ON COLUMN "EmailVerification"."created_at" IS '생성시간'`);
        await queryRunner.query(`ALTER TABLE "EmailVerification" ALTER COLUMN "updated_at" DROP NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "EmailVerification"."updated_at" IS '수정시간'`);

        // FK 제약 조건 재추가 (RENAME된 테이블 참조)
        await queryRunner.query(`ALTER TABLE "UserAgreement" ADD CONSTRAINT "FK_d1ef8fdc1a84b0d76c3ff964fd2" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Schedule" ADD CONSTRAINT "FK_f8258bd73b6e01c82feb446a942" FOREIGN KEY ("group_id") REFERENCES "ScheduleRepeatGroup"("group_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Recommend" ADD CONSTRAINT "FK_7011b481daa90a8ddba3e54171e" FOREIGN KEY ("diary_id") REFERENCES "Diary"("diary_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "DiaryQuestion" ADD CONSTRAINT "FK_af4bd8f20531902a8b52b84aac3" FOREIGN KEY ("diary_id") REFERENCES "Diary"("diary_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Answer" ADD CONSTRAINT "FK_856c60f9641d3932a537ebd2c2c" FOREIGN KEY ("diary_id") REFERENCES "Diary"("diary_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Answer" DROP CONSTRAINT "FK_856c60f9641d3932a537ebd2c2c"`);
        await queryRunner.query(`ALTER TABLE "DiaryQuestion" DROP CONSTRAINT "FK_af4bd8f20531902a8b52b84aac3"`);
        await queryRunner.query(`ALTER TABLE "Recommend" DROP CONSTRAINT "FK_7011b481daa90a8ddba3e54171e"`);
        await queryRunner.query(`ALTER TABLE "Schedule" DROP CONSTRAINT "FK_f8258bd73b6e01c82feb446a942"`);
        await queryRunner.query(`ALTER TABLE "UserAgreement" DROP CONSTRAINT "FK_d1ef8fdc1a84b0d76c3ff964fd2"`);

        await queryRunner.query(`ALTER TABLE "UserAgreement" RENAME TO "user_agreements"`);
        await queryRunner.query(`ALTER TABLE "Schedule" RENAME TO "schedule"`);
        await queryRunner.query(`ALTER TABLE "DiaryImage" RENAME TO "diary_image"`);
        await queryRunner.query(`ALTER TABLE "Diary" RENAME TO "diary"`);

        await queryRunner.query(`COMMENT ON COLUMN "EmailVerification"."updated_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "EmailVerification" ALTER COLUMN "updated_at" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "EmailVerification"."created_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "Answer" ADD CONSTRAINT "FK_856c60f9641d3932a537ebd2c2c" FOREIGN KEY ("diary_id") REFERENCES "diary"("diary_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "DiaryQuestion" ADD CONSTRAINT "FK_af4bd8f20531902a8b52b84aac3" FOREIGN KEY ("diary_id") REFERENCES "diary"("diary_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Recommend" ADD CONSTRAINT "FK_7011b481daa90a8ddba3e54171e" FOREIGN KEY ("diary_id") REFERENCES "diary"("diary_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
