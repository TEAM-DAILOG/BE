import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastDayOfMonthToScheduleRepeatGroup1785054460904 implements MigrationInterface {
  name = 'AddLastDayOfMonthToScheduleRepeatGroup1785054460904';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ScheduleRepeatGroup" ADD "is_last_day_of_month" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ScheduleRepeatGroup" DROP COLUMN "is_last_day_of_month"`,
    );
  }
}
