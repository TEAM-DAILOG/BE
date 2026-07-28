import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDateToDiary1785250953971 implements MigrationInterface {
  name = 'AddDateToDiary1785250953971';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Diary" ADD "date" date`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Diary" DROP COLUMN "date"`,
    );
  }
}