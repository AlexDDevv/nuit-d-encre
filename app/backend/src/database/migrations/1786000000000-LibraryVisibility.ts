import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Partage de bibliothèque : un interrupteur par utilisateur, privé par
 * défaut (y compris pour les comptes existants, qui n'ont jamais choisi),
 * remplace le flag `isPublic` par entrée, jamais exposé dans l'interface.
 */
export class LibraryVisibility1786000000000 implements MigrationInterface {
    name = "LibraryVisibility1786000000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" ADD COLUMN "isLibraryPublic" boolean NOT NULL DEFAULT false`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_book" DROP COLUMN "isPublic"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user_book" ADD COLUMN "isPublic" boolean NOT NULL DEFAULT true`,
        );
        await queryRunner.query(
            `ALTER TABLE "user" DROP COLUMN "isLibraryPublic"`,
        );
    }
}
