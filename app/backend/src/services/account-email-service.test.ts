import { createHash } from "node:crypto";
import * as argon2 from "argon2";
import { EmailToken } from "../database/entities/user/email-token";
import { User } from "../database/entities/user/user";
import { makeUser } from "../test/factories";
import {
    requestPasswordReset,
    requestVerificationEmail,
    resetPassword,
    verifyEmail,
} from "./account-email-service";
import { MailMessage, setMailSender } from "./mail/mail-service";

const NOW = new Date("2026-11-27T12:00:00Z");
const sha256 = (raw: string) => createHash("sha256").update(raw).digest("hex");

let sent: MailMessage[];
// Table `email_token` en mémoire : les tests lisent l'état persisté plutôt
// que les appels faits au repository.
let tokens: EmailToken[];
let reader: User;

type Where = {
    id?: string;
    tokenHash?: string;
    purpose?: string;
    user?: { id: string };
};

const matches = (token: EmailToken, where: Where) =>
    (!where.id || token.id === where.id) &&
    (!where.tokenHash || token.tokenHash === where.tokenHash) &&
    (!where.purpose || token.purpose === where.purpose) &&
    (!where.user || token.user.id === where.user.id);

/** Jeton en clair du lien contenu dans le dernier mail envoyé. */
const linkToken = (message = sent[sent.length - 1]) =>
    new URL(message.text.match(/https?:\/\/\S+/)![0]).searchParams.get(
        "token",
    )!;

beforeEach(() => {
    jest.restoreAllMocks();
    jest.useFakeTimers({ now: NOW });
    sent = [];
    tokens = [];
    reader = makeUser("user-1");
    reader.email = "reader@example.com";
    setMailSender({ send: async (message) => void sent.push(message) });

    jest.spyOn(User, "findOne").mockImplementation(async (options) =>
        (options as { where: { email: string } }).where.email === reader.email
            ? reader
            : null,
    );
    jest.spyOn(User.prototype, "save").mockImplementation(async function (
        this: User,
    ) {
        return this;
    });
    jest.spyOn(EmailToken, "create").mockImplementation(
        (data) => Object.assign(new EmailToken(), data) as EmailToken,
    );
    jest.spyOn(EmailToken.prototype, "save").mockImplementation(async function (
        this: EmailToken,
    ) {
        this.id = `token-${tokens.length + 1}`;
        this.createdAt = new Date();
        tokens.push(this);
        return this;
    });
    jest.spyOn(EmailToken, "findOne").mockImplementation(async (options) => {
        const found = tokens.filter((t) =>
            matches(t, (options as { where: Where }).where),
        );
        return found[found.length - 1] ?? null;
    });
    jest.spyOn(EmailToken, "delete").mockImplementation(async (where) => {
        const before = tokens.length;
        tokens = tokens.filter((t) => !matches(t, where as Where));
        return { affected: before - tokens.length, raw: [] };
    });
});

afterEach(() => {
    jest.useRealTimers();
    setMailSender(null);
});

// Risque : un lien inventé, expiré, déjà utilisé ou remplacé valide une
// adresse.
describe("verifyEmail", () => {
    it("valide l'adresse avec le lien reçu", async () => {
        await requestVerificationEmail(reader.email);

        await verifyEmail(linkToken());

        expect(reader.emailVerifiedAt).toEqual(NOW);
    });

    it("refuse un lien inventé", async () => {
        await expect(verifyEmail("invente")).rejects.toMatchObject({
            code: "INVALID_TOKEN",
        });
    });

    it("refuse un lien expiré", async () => {
        await requestVerificationEmail(reader.email);
        jest.setSystemTime(NOW.getTime() + 24 * 60 * 60 * 1000);

        await expect(verifyEmail(linkToken())).rejects.toMatchObject({
            code: "INVALID_TOKEN",
        });
        expect(reader.emailVerifiedAt).toBeUndefined();
    });

    it("ne sert qu'une fois, même pour deux requêtes simultanées", async () => {
        await requestVerificationEmail(reader.email);
        const raw = linkToken();

        const results = await Promise.allSettled([
            verifyEmail(raw),
            verifyEmail(raw),
        ]);

        expect(results.map((r) => r.status).sort()).toEqual([
            "fulfilled",
            "rejected",
        ]);
    });

    it("invalide le lien précédent quand un nouveau est envoyé", async () => {
        await requestVerificationEmail(reader.email);
        const first = linkToken();
        jest.setSystemTime(NOW.getTime() + 2 * 60 * 1000);
        await requestVerificationEmail(reader.email);

        await expect(verifyEmail(first)).rejects.toMatchObject({
            code: "INVALID_TOKEN",
        });
        await expect(verifyEmail(linkToken())).resolves.toBeUndefined();
    });
});

// Risque : une fuite de la base donne des liens utilisables.
describe("stockage des jetons", () => {
    it("ne conserve que le hash du jeton envoyé", async () => {
        await requestPasswordReset(reader.email);

        const raw = linkToken();
        expect(tokens).toHaveLength(1);
        expect(tokens[0].tokenHash).toBe(sha256(raw));
        expect(tokens[0].tokenHash).not.toContain(raw);
    });
});

// Risque : un mot de passe réinitialisé laisse des sessions ouvertes, un lien
// de vérification sert à changer le mot de passe, ou une faute de saisie
// grille le lien.
describe("resetPassword", () => {
    it("change le mot de passe, révoque les sessions et vérifie l'adresse", async () => {
        reader.tokenVersion = 4;
        reader.emailVerifiedAt = null;
        await requestPasswordReset(reader.email);

        await resetPassword(linkToken(), "Nouveau2?");

        expect(await argon2.verify(reader.hashedPassword!, "Nouveau2?")).toBe(
            true,
        );
        expect(reader.tokenVersion).toBe(5);
        expect(reader.emailVerifiedAt).toEqual(NOW);
    });

    it("refuse un lien de vérification d'adresse", async () => {
        await requestVerificationEmail(reader.email);

        await expect(
            resetPassword(linkToken(), "Nouveau2?"),
        ).rejects.toMatchObject({ code: "INVALID_TOKEN" });
        expect(reader.hashedPassword).toBeUndefined();
    });

    it("garde le lien utilisable après un mot de passe refusé", async () => {
        await requestPasswordReset(reader.email);
        const raw = linkToken();

        await expect(resetPassword(raw, "faible")).rejects.toMatchObject({
            statusCode: 400,
        });
        await expect(resetPassword(raw, "Nouveau2?")).resolves.toBeUndefined();
    });
});

// Risque : les formulaires publics révèlent quels comptes existent ou servent
// à inonder une boîte mail.
describe("demandes de lien", () => {
    it("répond sans erreur ni envoi pour une adresse inconnue", async () => {
        await expect(
            requestPasswordReset("inconnu@example.com"),
        ).resolves.toBeUndefined();
        expect(sent).toHaveLength(0);
    });

    it("n'envoie pas de lien de vérification à un compte déjà vérifié", async () => {
        reader.emailVerifiedAt = new Date("2026-01-01");

        await requestVerificationEmail(reader.email);

        expect(sent).toHaveLength(0);
    });

    it("n'envoie qu'un mail par minute au même compte", async () => {
        await requestPasswordReset(reader.email);
        jest.setSystemTime(NOW.getTime() + 30 * 1000);
        await requestPasswordReset(reader.email);
        jest.setSystemTime(NOW.getTime() + 61 * 1000);
        await requestPasswordReset(reader.email);

        expect(sent).toHaveLength(2);
    });
});
