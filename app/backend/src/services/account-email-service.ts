import { createHash, randomBytes } from "node:crypto";
import * as argon2 from "argon2";
import {
    EmailToken,
    EmailTokenPurpose,
} from "../database/entities/user/email-token";
import { User } from "../database/entities/user/user";
import { AppError } from "../middlewares/error-handler";
import { isPasswordCompliant } from "../utils/password-policy";
import { getMailSender } from "./mail/mail-service";
import { resetPasswordMessage, verifyEmailMessage } from "./mail/templates";

export const VERIFY_EMAIL_TTL_HOURS = 24;
export const RESET_PASSWORD_TTL_MINUTES = 60;
// Délai minimal entre deux envois au même compte : un formulaire public ne
// doit pas servir à inonder une boîte mail.
export const EMAIL_RESEND_COOLDOWN_MS = 60 * 1000;

export const INVALID_TOKEN_CODE = "INVALID_TOKEN";

const hashToken = (raw: string): string =>
    createHash("sha256").update(raw).digest("hex");

const invalidToken = () =>
    new AppError("Invalid or expired link", 400).withCode(INVALID_TOKEN_CODE);

/** Origine publique du front, pour les liens des emails. */
const appUrl = (): string => {
    const url = process.env.APP_URL;
    if (url) return url.replace(/\/+$/, "");
    if (process.env.NODE_ENV === "production") {
        throw new AppError("APP_URL is not defined", 500);
    }
    return "http://localhost:5173";
};

const link = (path: string, raw: string): string =>
    `${appUrl()}/${path}?token=${encodeURIComponent(raw)}`;

/**
 * Crée un jeton à usage unique et renvoie sa valeur en clair (seul le hash est
 * stocké). Les jetons précédents du même usage sont supprimés : seul le
 * dernier lien envoyé fonctionne.
 */
async function issueToken(
    user: User,
    purpose: EmailTokenPurpose,
    ttlMs: number,
): Promise<string> {
    await EmailToken.delete({ user: { id: user.id }, purpose });
    const raw = randomBytes(32).toString("base64url");
    await EmailToken.create({
        user,
        purpose,
        tokenHash: hashToken(raw),
        expiresAt: new Date(Date.now() + ttlMs),
    }).save();
    return raw;
}

/**
 * Consomme un jeton : il est supprimé avant toute vérification d'expiration,
 * si bien qu'un lien ne sert qu'une fois, même en cas de requêtes
 * simultanées (une seule suppression réussit).
 */
async function consumeToken(
    raw: string,
    purpose: EmailTokenPurpose,
): Promise<User> {
    const token = await EmailToken.findOne({
        where: { tokenHash: hashToken(raw), purpose },
        relations: { user: true },
    });
    if (!token) throw invalidToken();

    const { affected } = await EmailToken.delete({ id: token.id });
    if (!affected) throw invalidToken();
    if (token.expiresAt.getTime() <= Date.now()) throw invalidToken();

    return token.user;
}

/** Vrai si un lien de cet usage a été envoyé au compte il y a moins d'une minute. */
async function sentRecently(
    user: User,
    purpose: EmailTokenPurpose,
): Promise<boolean> {
    const last = await EmailToken.findOne({
        where: { user: { id: user.id }, purpose },
        order: { createdAt: "DESC" },
    });
    return (
        !!last &&
        Date.now() - last.createdAt.getTime() < EMAIL_RESEND_COOLDOWN_MS
    );
}

/** Envoie le lien de vérification d'adresse (après l'inscription). */
export async function sendVerificationEmail(user: User): Promise<void> {
    const raw = await issueToken(
        user,
        EmailTokenPurpose.VerifyEmail,
        VERIFY_EMAIL_TTL_HOURS * 60 * 60 * 1000,
    );
    await getMailSender().send(
        verifyEmailMessage(
            user.email,
            user.userName,
            link("verifier-email", raw),
            VERIFY_EMAIL_TTL_HOURS,
        ),
    );
}

/**
 * Renvoi du lien de vérification depuis un formulaire public. Ne dit jamais
 * si le compte existe : l'appelant répond pareil dans tous les cas.
 */
export async function requestVerificationEmail(email: string): Promise<void> {
    const user = await User.findOne({ where: { email } });
    if (!user || user.emailVerifiedAt) return;
    if (await sentRecently(user, EmailTokenPurpose.VerifyEmail)) return;
    await sendVerificationEmail(user);
}

export async function verifyEmail(raw: string): Promise<void> {
    const user = await consumeToken(raw, EmailTokenPurpose.VerifyEmail);
    if (!user.emailVerifiedAt) {
        user.emailVerifiedAt = new Date();
        await user.save();
    }
}

/**
 * Lien de réinitialisation du mot de passe. Même réponse que le compte existe
 * ou non. Un compte Google sans mot de passe peut ainsi en définir un.
 */
export async function requestPasswordReset(email: string): Promise<void> {
    const user = await User.findOne({ where: { email } });
    if (!user) return;
    if (await sentRecently(user, EmailTokenPurpose.ResetPassword)) return;

    const raw = await issueToken(
        user,
        EmailTokenPurpose.ResetPassword,
        RESET_PASSWORD_TTL_MINUTES * 60 * 1000,
    );
    await getMailSender().send(
        resetPasswordMessage(
            user.email,
            user.userName,
            link("reinitialiser-mot-de-passe", raw),
            RESET_PASSWORD_TTL_MINUTES,
        ),
    );
}

/**
 * Nouveau mot de passe depuis le lien reçu par email. Toutes les sessions
 * ouvertes sont révoquées. Le lien prouve la possession de l'adresse, qui
 * devient vérifiée.
 */
export async function resetPassword(
    raw: string,
    newPassword: string,
): Promise<void> {
    // Contrôle avant de consommer le jeton : un mot de passe refusé ne doit
    // pas griller le lien.
    if (!isPasswordCompliant(newPassword)) {
        throw new AppError(
            "Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un symbole.",
            400,
            "ValidationError",
        );
    }

    const user = await consumeToken(raw, EmailTokenPurpose.ResetPassword);
    user.hashedPassword = await argon2.hash(newPassword);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    user.emailVerifiedAt ??= new Date();
    await user.save();
}
