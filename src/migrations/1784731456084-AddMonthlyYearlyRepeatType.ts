import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMonthlyYearlyRepeatType1784731456084 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."schedule_repeat_group_repeat_type_enum" ADD VALUE IF NOT EXISTS 'MONTHLY'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."schedule_repeat_group_repeat_type_enum" ADD VALUE IF NOT EXISTS 'YEARLY'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."schedule_repeat_group_repeat_type_enum" RENAME TO "schedule_repeat_group_repeat_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."schedule_repeat_group_repeat_type_enum" AS ENUM('NONE', 'MULTIPLE', 'PERIOD', 'WEEKLY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "ScheduleRepeatGroup" ALTER COLUMN "repeat_type" TYPE "public"."schedule_repeat_group_repeat_type_enum" USING "repeat_type"::text::"public"."schedule_repeat_group_repeat_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."schedule_repeat_group_repeat_type_enum_old"`,
    );
  }
}
