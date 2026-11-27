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

function storedToken(overrides: Partial<EmailToken> = {}): EmailToken {
    return Object.assign(new EmailToken(), {
        id: "token-1",
        purpose: "reset_password",
        tokenHash: sha256("raw-token"),
        expiresAt: new Date(NOW.getTime() + 60_000),
        createdAt: NOW,
        user: makeUser("user-1"),
        ...overrides,
    });
}

/** Jeton en clair extrait du lien du dernier mail envoyé. */
const tokenFromLastMail = () =>
    new URL(
        sent[sent.length - 1].text.match(/https?:\/\/\S+/)![0],
    ).searchParams.get("token")!;

beforeEach(() => {
    jest.restoreAllMocks();
    jest.useFakeTimers({ now: NOW });
    sent = [];
    setMailSender({ send: async (message) => void sent.push(message) });
    jest.spyOn(User.prototype, "save").mockImplementation(async function (
        this: User,
    ) {
        return this;
    });
    jest.spyOn(EmailToken.prototype, "save").mockImplementation(async function (
        this: EmailToken,
    ) {
        return this;
    });
    jest.spyOn(EmailToken, "create").mockImplementation(
        (data) => Object.assign(new EmailToken(), data) as EmailToken,
    );
    jest.spyOn(EmailToken, "delete").mockResolvedValue({
        affected: 1,
        raw: [],
    });
});

afterEach(() => {
    jest.useRealTimers();
    setMailSender(null);
});

// Risque : un lien inventé, expiré ou déjà utilisé valide une adresse ou
// change un mot de passe.
describe("consommation d'un lien", () => {
    it("refuse un jeton inconnu", async () => {
        jest.spyOn(EmailToken, "findOne").mockResolvedValue(null);

        await expect(verifyEmail("inconnu")).rejects.toMatchObject({
            code: "INVALID_TOKEN",
        });
    });

    it("refuse un jeton expiré", async () => {
        const user = makeUser("user-1");
        jest.spyOn(EmailToken, "findOne").mockResolvedValue(
            storedToken({
                purpose: "verify_email",
                expiresAt: new Date(NOW.getTime() - 1),
                user,
            }),
        );

        await expect(verifyEmail("raw-token")).rejects.toMatchObject({
            code: "INVALID_TOKEN",
        });
        expect(user.emailVerifiedAt).toBeUndefined();
    });

    it("ne sert qu'une fois, même pour deux requêtes simultanées", async () => {
        jest.spyOn(EmailToken, "findOne").mockResolvedValue(
            storedToken({ purpose: "verify_email" }),
        );
        // L'autre requête a déjà supprimé le jeton.
        jest.spyOn(EmailToken, "delete").mockResolvedValue({
            affected: 0,
            raw: [],
        });

        await expect(verifyEmail("raw-token")).rejects.toMatchObject({
            code: "INVALID_TOKEN",
        });
    });

    it("cherche le jeton par son hash, jamais en clair", async () => {
        const findOne = jest
            .spyOn(EmailToken, "findOne")
            .mockResolvedValue(storedToken({ purpose: "verify_email" }));

        await verifyEmail("raw-token");

        expect(findOne.mock.calls[0][0]).toMatchObject({
            where: { tokenHash: sha256("raw-token") },
        });
    });
});

// Risque : un mot de passe réinitialisé laisse des sessions ouvertes, ou un
// mot de passe faible grille le lien.
describe("resetPassword", () => {
    it("change le mot de passe, révoque les sessions et vérifie l'adresse", async () => {
        const user = makeUser("user-1");
        user.tokenVersion = 4;
        user.emailVerifiedAt = null;
        jest.spyOn(EmailToken, "findOne").mockResolvedValue(
            storedToken({ user }),
        );

        await resetPassword("raw-token", "Nouveau2?");

        expect(await argon2.verify(user.hashedPassword!, "Nouveau2?")).toBe(
            true,
        );
        expect(user.tokenVersion).toBe(5);
        expect(user.emailVerifiedAt).toEqual(NOW);
    });

    it("refuse un mot de passe faible sans consommer le lien", async () => {
        const findOne = jest.spyOn(EmailToken, "findOne");

        await expect(
            resetPassword("raw-token", "faible"),
        ).rejects.toMatchObject({ statusCode: 400 });
        expect(findOne).not.toHaveBeenCalled();
        expect(EmailToken.delete).not.toHaveBeenCalled();
    });
});

// Risque : les formulaires publics révèlent quels comptes existent, servent à
// inonder une boîte mail, ou stockent un lien utilisable en base.
describe("demandes de lien", () => {
    it("n'envoie rien pour une adresse inconnue, sans erreur", async () => {
        jest.spyOn(User, "findOne").mockResolvedValue(null);

        await expect(
            requestPasswordReset("inconnu@example.com"),
        ).resolves.toBeUndefined();
        expect(sent).toHaveLength(0);
    });

    it("n'envoie pas de lien de vérification à un compte déjà vérifié", async () => {
        const user = makeUser("user-1");
        user.emailVerifiedAt = new Date("2026-01-01");
        jest.spyOn(User, "findOne").mockResolvedValue(user);

        await requestVerificationEmail("reader@example.com");

        expect(sent).toHaveLength(0);
    });

    it("n'envoie pas deux liens au même compte en moins d'une minute", async () => {
        jest.spyOn(User, "findOne").mockResolvedValue(makeUser("user-1"));
        jest.spyOn(EmailToken, "findOne").mockResolvedValue(
            storedToken({ createdAt: new Date(NOW.getTime() - 30_000) }),
        );

        await requestPasswordReset("reader@example.com");

        expect(sent).toHaveLength(0);
    });

    it("stocke le hash du jeton envoyé, pas le jeton", async () => {
        const user = makeUser("user-1");
        user.email = "reader@example.com";
        jest.spyOn(User, "findOne").mockResolvedValue(user);
        jest.spyOn(EmailToken, "findOne").mockResolvedValue(null);

        await requestPasswordReset("reader@example.com");

        const raw = tokenFromLastMail();
        const stored = (EmailToken.create as jest.Mock).mock.calls[0][0];
        expect(sent[0].to).toBe("reader@example.com");
        expect(stored.tokenHash).toBe(sha256(raw));
        expect(stored.tokenHash).not.toContain(raw);
    });
});
