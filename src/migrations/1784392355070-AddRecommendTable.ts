import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecommendTable1784392355070 implements MigrationInterface {
    name = 'AddRecommendTable1784392355070'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Recommend" ("recommend_id" SERIAL NOT NULL, "title" character varying(500) NOT NULL, "is_added" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "diary_id" integer NOT NULL, "category_id" integer NOT NULL, CONSTRAINT "PK_7da40106b9759590f2cf74e2623" PRIMARY KEY ("recommend_id")); COMMENT ON COLUMN "Recommend"."recommend_id" IS '추천ID'; COMMENT ON COLUMN "Recommend"."title" IS '추천 일정 제목'; COMMENT ON COLUMN "Recommend"."is_added" IS '일정 추가 여부'; COMMENT ON COLUMN "Recommend"."created_at" IS '생성일자'`);
        await queryRunner.query(`ALTER TABLE "Recommend" ADD CONSTRAINT "FK_7011b481daa90a8ddba3e54171e" FOREIGN KEY ("diary_id") REFERENCES "diary"("diary_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Recommend" ADD CONSTRAINT "FK_d97f6b6f385aa7ac27343455ebb" FOREIGN KEY ("category_id") REFERENCES "Category"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Recommend" DROP CONSTRAINT "FK_d97f6b6f385aa7ac27343455ebb"`);
        await queryRunner.query(`ALTER TABLE "Recommend" DROP CONSTRAINT "FK_7011b481daa90a8ddba3e54171e"`);
        await queryRunner.query(`DROP TABLE "Recommend"`);
    }

}
