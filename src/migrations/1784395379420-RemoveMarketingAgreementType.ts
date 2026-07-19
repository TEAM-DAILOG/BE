import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveMarketingAgreementType1784395379420 implements MigrationInterface {
  name = 'RemoveMarketingAgreementType1784395379420';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "user_agreements" WHERE "agreement_type" = 'MARKETING'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."agreement_type_enum" RENAME TO "agreement_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."agreement_type_enum" AS ENUM('TERMS_OF_SERVICE', 'PRIVACY_POLICY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_agreements" ALTER COLUMN "agreement_type" TYPE "public"."agreement_type_enum" USING "agreement_type"::"text"::"public"."agreement_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."agreement_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."agreement_type_enum" RENAME TO "agreement_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."agreement_type_enum" AS ENUM('TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'MARKETING')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_agreements" ALTER COLUMN "agreement_type" TYPE "public"."agreement_type_enum" USING "agreement_type"::"text"::"public"."agreement_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."agreement_type_enum_old"`);
  }
}
