import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Vérification d'email et mot de passe oublié.
 *
 * - `user.emailVerifiedAt` : null tant que l'adresse n'est pas prouvée ; la
 *   connexion par mot de passe est refusée sans elle. Les comptes Google
 *   (adresse garantie par Google) et l'admin sont marqués vérifiés ; les
 *   autres comptes existants devront vérifier leur adresse.
 * - `email_token` : jetons à usage unique envoyés par email, stockés hachés
 *   (SHA-256), effacés avec le compte.
 */
export class EmailVerification1790000000000 implements MigrationInterface {
    name = "EmailVerification1790000000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" ADD COLUMN "emailVerifiedAt" TIMESTAMP WITH TIME ZONE`,
        );
        await queryRunner.query(
            `UPDATE "user" SET "emailVerifiedAt" = now() WHERE "googleId" IS NOT NULL OR "role" = 'admin'`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."email_token_purpose_enum" AS ENUM('verify_email', 'reset_password')`,
        );
        await queryRunner.query(
            `CREATE TABLE "email_token" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "purpose" "public"."email_token_purpose_enum" NOT NULL, "tokenHash" character varying(64) NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "UQ_email_token_hash" UNIQUE ("tokenHash"), CONSTRAINT "PK_email_token" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "email_token" ADD CONSTRAINT "FK_email_token_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_email_token_user_purpose" ON "email_token" ("userId", "purpose")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "email_token"`);
        await queryRunner.query(
            `DROP TYPE "public"."email_token_purpose_enum"`,
        );
        await queryRunner.query(
            `ALTER TABLE "user" DROP COLUMN "emailVerifiedAt"`,
        );
    }
}
