import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Statut de lecture « abandonné » (DNF). Sans XP ni action dans le fil :
 * visible seulement dans la bibliothèque.
 */
export class AddAbandonedReadingStatus1788000000000 implements MigrationInterface {
    name = "AddAbandonedReadingStatus1788000000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TYPE "public"."user_book_status_enum" ADD VALUE IF NOT EXISTS 'abandoned'`,
        );
    }

    /** PostgreSQL ne retire pas une valeur d'enum : le type est recréé, les livres abandonnés repassent en pause. */
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `UPDATE "user_book" SET "status" = 'paused' WHERE "status" = 'abandoned'`,
        );
        await queryRunner.query(
            `ALTER TYPE "public"."user_book_status_enum" RENAME TO "user_book_status_enum_old"`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."user_book_status_enum" AS ENUM('to_read', 'reading', 'read', 'paused')`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_book" ALTER COLUMN "status" DROP DEFAULT`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_book" ALTER COLUMN "status" TYPE "public"."user_book_status_enum" USING "status"::text::"public"."user_book_status_enum"`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_book" ALTER COLUMN "status" SET DEFAULT 'to_read'`,
        );
        await queryRunner.query(
            `DROP TYPE "public"."user_book_status_enum_old"`,
        );
    }
}
