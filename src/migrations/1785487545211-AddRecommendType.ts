import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecommendType1785487545211 implements MigrationInterface {
    name = 'AddRecommendType1785487545211'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."recommend_type_enum" AS ENUM('DIARY', 'ADDITIONAL', 'ARCHIVED')`);
        await queryRunner.query(`ALTER TABLE "Recommend" ADD "type" "public"."recommend_type_enum" NOT NULL DEFAULT 'DIARY'`);
        await queryRunner.query(`COMMENT ON COLUMN "Recommend"."type" IS '추천 배치 종류 (일기 고정 / 통계 최신 재생성 / 보관된 예전 재생성)'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "Recommend"."type" IS '추천 배치 종류 (일기 고정 / 통계 최신 재생성 / 보관된 예전 재생성)'`);
        await queryRunner.query(`ALTER TABLE "Recommend" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."recommend_type_enum"`);
    }

}
