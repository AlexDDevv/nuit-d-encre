import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Défi de lecture annuel : un objectif par lecteur et par année, effacé avec
 * le compte. Index de comptage de la progression : livres d'un lecteur par
 * date de fin de lecture.
 */
export class AddReadingGoal1789000000000 implements MigrationInterface {
    name = "AddReadingGoal1789000000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "reading_goal" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "year" integer NOT NULL, "target" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "UQ_reading_goal_user_year" UNIQUE ("userId", "year"), CONSTRAINT "PK_reading_goal" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "reading_goal" ADD CONSTRAINT "FK_reading_goal_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_book_user_finished" ON "user_book" ("userId", "finishedAt")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_user_book_user_finished"`);
        await queryRunner.query(`DROP TABLE "reading_goal"`);
    }
}
