import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user";

export const EmailTokenPurpose = {
    VerifyEmail: "verify_email",
    ResetPassword: "reset_password",
} as const;

export type EmailTokenPurpose =
    (typeof EmailTokenPurpose)[keyof typeof EmailTokenPurpose];

/**
 * Jeton à usage unique envoyé par email (vérification d'adresse, mot de passe
 * oublié). Seul son hash SHA-256 est stocké : une fuite de la base ne donne
 * aucun lien utilisable. Non exposé en GraphQL, effacé avec le compte.
 */
@Entity({ name: "email_token" })
@Index("IDX_email_token_user_purpose", ["user", "purpose"])
export class EmailToken extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE", nullable: false })
    user!: User;

    @Column({
        type: "enum",
        enum: Object.values(EmailTokenPurpose),
        enumName: "email_token_purpose_enum",
    })
    purpose!: EmailTokenPurpose;

    @Column({ type: "varchar", length: 64, unique: true })
    tokenHash!: string;

    @Column({ type: "timestamptz" })
    expiresAt!: Date;

    @CreateDateColumn({ type: "timestamptz" })
    createdAt!: Date;
}
