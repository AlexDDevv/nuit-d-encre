import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Version de session : incluse dans le JWT et comparée à chaque requête.
 * L'incrémenter invalide tous les jetons déjà émis (changement de mot de
 * passe). Les jetons antérieurs, sans version, valent 0 : aucun utilisateur
 * n'est déconnecté par le déploiement.
 */
export class AddTokenVersionToUser1787000000000 implements MigrationInterface {
    name = "AddTokenVersionToUser1787000000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" ADD COLUMN "tokenVersion" integer NOT NULL DEFAULT 0`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "tokenVersion"`);
    }
}
