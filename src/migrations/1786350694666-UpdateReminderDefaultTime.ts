import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateReminderDefaultTime1786350694666 implements MigrationInterface {
    name = 'UpdateReminderDefaultTime1786350694666'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Reminder" ALTER COLUMN "time" SET DEFAULT '09:00:00'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Reminder" ALTER COLUMN "time" SET DEFAULT '18:00:00'`);
    }

}
