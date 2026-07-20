import { MigrationInterface, QueryRunner } from "typeorm";

export class FixRemainingConstraints1784562357183 implements MigrationInterface {
    name = 'FixRemainingConstraints1784562357183'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "UserAgreement_user_agreement_id_seq" OWNED BY "UserAgreement"."user_agreement_id"`);
        await queryRunner.query(`ALTER TABLE "UserAgreement" ALTER COLUMN "user_agreement_id" SET DEFAULT nextval('"UserAgreement_user_agreement_id_seq"')`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "Schedule_schedule_id_seq" OWNED BY "Schedule"."schedule_id"`);
        await queryRunner.query(`ALTER TABLE "Schedule" ALTER COLUMN "schedule_id" SET DEFAULT nextval('"Schedule_schedule_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "DiaryQuestion" DROP CONSTRAINT "FK_af4bd8f20531902a8b52b84aac3"`);
        await queryRunner.query(`ALTER TABLE "Recommend" DROP CONSTRAINT "FK_7011b481daa90a8ddba3e54171e"`);
        await queryRunner.query(`ALTER TABLE "Answer" DROP CONSTRAINT "FK_856c60f9641d3932a537ebd2c2c"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "Diary_diary_id_seq" OWNED BY "Diary"."diary_id"`);
        await queryRunner.query(`ALTER TABLE "Diary" ALTER COLUMN "diary_id" SET DEFAULT nextval('"Diary_diary_id_seq"')`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "DiaryImage_diary_image_id_seq" OWNED BY "DiaryImage"."diary_image_id"`);
        await queryRunner.query(`ALTER TABLE "DiaryImage" ALTER COLUMN "diary_image_id" SET DEFAULT nextval('"DiaryImage_diary_image_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "Recommend" ADD CONSTRAINT "FK_7011b481daa90a8ddba3e54171e" FOREIGN KEY ("diary_id") REFERENCES "Diary"("diary_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "DiaryQuestion" ADD CONSTRAINT "FK_af4bd8f20531902a8b52b84aac3" FOREIGN KEY ("diary_id") REFERENCES "Diary"("diary_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Answer" ADD CONSTRAINT "FK_856c60f9641d3932a537ebd2c2c" FOREIGN KEY ("diary_id") REFERENCES "Diary"("diary_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Answer" DROP CONSTRAINT "FK_856c60f9641d3932a537ebd2c2c"`);
        await queryRunner.query(`ALTER TABLE "DiaryQuestion" DROP CONSTRAINT "FK_af4bd8f20531902a8b52b84aac3"`);
        await queryRunner.query(`ALTER TABLE "Recommend" DROP CONSTRAINT "FK_7011b481daa90a8ddba3e54171e"`);
        await queryRunner.query(`ALTER TABLE "DiaryImage" ALTER COLUMN "diary_image_id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "DiaryImage_diary_image_id_seq"`);
        await queryRunner.query(`ALTER TABLE "Diary" ALTER COLUMN "diary_id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "Diary_diary_id_seq"`);
        await queryRunner.query(`ALTER TABLE "Answer" ADD CONSTRAINT "FK_856c60f9641d3932a537ebd2c2c" FOREIGN KEY ("diary_id") REFERENCES "Diary"("diary_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Recommend" ADD CONSTRAINT "FK_7011b481daa90a8ddba3e54171e" FOREIGN KEY ("diary_id") REFERENCES "Diary"("diary_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "DiaryQuestion" ADD CONSTRAINT "FK_af4bd8f20531902a8b52b84aac3" FOREIGN KEY ("diary_id") REFERENCES "Diary"("diary_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Schedule" ALTER COLUMN "schedule_id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "Schedule_schedule_id_seq"`);
        await queryRunner.query(`ALTER TABLE "UserAgreement" ALTER COLUMN "user_agreement_id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "UserAgreement_user_agreement_id_seq"`);
    }

}
