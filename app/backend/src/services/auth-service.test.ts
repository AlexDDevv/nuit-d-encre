import * as argon2 from "argon2";
import Cookies from "cookies";
import jwt from "jsonwebtoken";
import { dataSource } from "../database/config/datasource";
import { User } from "../database/entities/user/user";
import { makeUser } from "../test/factories";
import { CloudinaryService } from "./cloudinary.service";
import {
    changePassword,
    login,
    resolveOrCreateGoogleUser,
    setProfileImage,
    whoami,
} from "./auth-service";

jest.mock("../database/config/datasource", () => ({
    dataSource: { getRepository: jest.fn() },
}));
jest.mock("./cloudinary.service");

const JWT_SECRET = "test-secret";
const PASSWORD = "Motdepasse1!";

const repository = { findOne: jest.fn() };
const uploadImage = CloudinaryService.prototype.uploadImage as jest.Mock;

function makeCookies(token?: string) {
    return {
        get: jest.fn(() => token),
        set: jest.fn(),
    } as unknown as Cookies & { get: jest.Mock; set: jest.Mock };
}

async function userWithPassword(password = PASSWORD): Promise<User> {
    const user = makeUser("user-1");
    user.hashedPassword = await argon2.hash(password);
    return user;
}

beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
});

beforeEach(() => {
    jest.restoreAllMocks();
    (dataSource.getRepository as jest.Mock).mockReturnValue(repository);
    jest.spyOn(User.prototype, "save").mockImplementation(async function (
        this: User,
    ) {
        return this;
    });
});

// Risque : connexion avec un mauvais mot de passe, cookie de session non
// httpOnly ou non signé, énumération des emails par message d'erreur, ou
// session conservée 30 jours sans « Se souvenir de moi » (poste partagé).
describe("login", () => {
    it("pose un cookie httpOnly signé contenant un JWT de l'utilisateur", async () => {
        repository.findOne.mockResolvedValue(await userWithPassword());
        const cookies = makeCookies();

        const response = await login("reader@example.com", PASSWORD, cookies);

        expect(response.cookieSet).toBe(true);
        const [name, token, options] = cookies.set.mock.calls[0];
        expect(name).toBe("token");
        expect(options).toMatchObject({
            httpOnly: true,
            sameSite: "strict",
            signed: true,
        });
        expect(jwt.verify(token, JWT_SECRET)).toMatchObject({ id: "user-1" });
    });

    it("sans « Se souvenir de moi », pose un cookie de session et un jeton d'un jour", async () => {
        repository.findOne.mockResolvedValue(await userWithPassword());
        const cookies = makeCookies();

        await login("reader@example.com", PASSWORD, cookies, false);

        const [, token, options] = cookies.set.mock.calls[0];
        expect(options.maxAge).toBeUndefined();
        const { iat, exp } = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
        expect(exp! - iat!).toBe(24 * 60 * 60);
    });

    it("avec « Se souvenir de moi », garde le cookie et le jeton 30 jours", async () => {
        repository.findOne.mockResolvedValue(await userWithPassword());
        const cookies = makeCookies();

        await login("reader@example.com", PASSWORD, cookies, true);

        const [, token, options] = cookies.set.mock.calls[0];
        expect(options.maxAge).toBe(30 * 24 * 60 * 60 * 1000);
        const { iat, exp } = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
        expect(exp! - iat!).toBe(30 * 24 * 60 * 60);
    });

    it("refuse un mauvais mot de passe avec une 401 sans poser de cookie", async () => {
        repository.findOne.mockResolvedValue(await userWithPassword());
        const cookies = makeCookies();

        await expect(
            login("reader@example.com", "Mauvais1!", cookies),
        ).rejects.toMatchObject({ statusCode: 401 });
        expect(cookies.set).not.toHaveBeenCalled();
    });

    it("refuse un email inconnu avec la même erreur qu'un mauvais mot de passe", async () => {
        repository.findOne.mockResolvedValue(null);

        await expect(
            login("inconnu@example.com", PASSWORD, makeCookies()),
        ).rejects.toMatchObject({
            statusCode: 401,
            message: "Invalid identifiers",
        });
    });

    it("refuse la connexion par mot de passe d'un compte Google sans mot de passe", async () => {
        const googleUser = makeUser("google-user");
        googleUser.hashedPassword = null;
        repository.findOne.mockResolvedValue(googleUser);

        await expect(
            login("reader@example.com", PASSWORD, makeCookies()),
        ).rejects.toMatchObject({ statusCode: 401 });
    });
});

// Risque : un jeton forgé, expiré ou révoqué ouvre une session.
describe("whoami", () => {
    it("refuse un jeton dont la version de session est dépassée", async () => {
        const user = makeUser("user-1");
        user.tokenVersion = 2;
        repository.findOne.mockResolvedValue(user);
        const stale = makeCookies(jwt.sign({ id: "user-1", v: 1 }, JWT_SECRET));

        await expect(whoami(stale)).resolves.toBeNull();
    });

    it("accepte un ancien jeton sans version tant que la version vaut 0", async () => {
        const user = makeUser("user-1");
        user.tokenVersion = 0;
        repository.findOne.mockResolvedValue(user);
        const legacy = makeCookies(jwt.sign({ id: "user-1" }, JWT_SECRET));

        await expect(whoami(legacy)).resolves.toBe(user);
    });

    it("rejette une requête sans jeton", async () => {
        await expect(whoami(makeCookies(undefined))).rejects.toMatchObject({
            statusCode: 401,
        });
    });

    it("rejette un jeton signé avec un autre secret", async () => {
        const forged = jwt.sign({ id: "user-1" }, "autre-secret");

        await expect(whoami(makeCookies(forged))).rejects.toMatchObject({
            statusCode: 401,
        });
        expect(repository.findOne).not.toHaveBeenCalled();
    });

    it("rejette un jeton expiré", async () => {
        const expired = jwt.sign(
            { id: "user-1", exp: Math.floor(Date.now() / 1000) - 60 },
            JWT_SECRET,
        );

        await expect(whoami(makeCookies(expired))).rejects.toMatchObject({
            statusCode: 401,
        });
    });

    it("lit le cookie signé et renvoie l'utilisateur du jeton", async () => {
        const user = makeUser("user-1");
        repository.findOne.mockResolvedValue(user);
        const cookies = makeCookies(jwt.sign({ id: "user-1" }, JWT_SECRET));

        await expect(whoami(cookies)).resolves.toBe(user);
        expect(cookies.get).toHaveBeenCalledWith("token", { signed: true });
        expect(repository.findOne).toHaveBeenCalledWith({
            where: { id: "user-1" },
        });
    });

    it("renvoie null si l'utilisateur du jeton n'existe plus", async () => {
        repository.findOne.mockResolvedValue(null);
        const cookies = makeCookies(jwt.sign({ id: "deleted" }, JWT_SECRET));

        await expect(whoami(cookies)).resolves.toBeNull();
    });
});

// Risque : le changement de mot de passe ne révoque pas les autres sessions,
// raccourcit une session mémorisée (déconnexion surprise) ou
// contourne la politique de mot de passe.
describe("changePassword", () => {
    it("révoque les autres sessions et réémet le cookie de la session en cours", async () => {
        const user = await userWithPassword();
        user.tokenVersion = 3;
        repository.findOne.mockResolvedValue(user);
        const cookies = makeCookies(undefined);

        await changePassword("user-1", PASSWORD, "Nouveau2?", cookies);

        expect(user.tokenVersion).toBe(4);
        const token = (cookies.set as jest.Mock).mock.calls[0][1];
        expect(jwt.verify(token, JWT_SECRET)).toMatchObject({
            id: "user-1",
            v: 4,
        });
    });

    it("réémet une session mémorisée avec la même durée", async () => {
        const user = await userWithPassword();
        repository.findOne.mockResolvedValue(user);
        const cookies = makeCookies(
            jwt.sign({ id: "user-1", v: 0, r: true }, JWT_SECRET),
        );

        await changePassword("user-1", PASSWORD, "Nouveau2?", cookies);

        const [, token, options] = cookies.set.mock.calls[0];
        expect(options.maxAge).toBe(30 * 24 * 60 * 60 * 1000);
        expect(jwt.verify(token, JWT_SECRET)).toMatchObject({ r: true });
    });

    it("remplace le hash quand le mot de passe actuel est correct", async () => {
        const user = await userWithPassword();
        repository.findOne.mockResolvedValue(user);

        await expect(
            changePassword(
                "user-1",
                PASSWORD,
                "Nouveau2?",
                makeCookies(undefined),
            ),
        ).resolves.toBe(true);
        await expect(
            argon2.verify(user.hashedPassword!, "Nouveau2?"),
        ).resolves.toBe(true);
    });

    it("refuse si le mot de passe actuel est incorrect", async () => {
        repository.findOne.mockResolvedValue(await userWithPassword());

        await expect(
            changePassword(
                "user-1",
                "Mauvais1!",
                "Nouveau2?",
                makeCookies(undefined),
            ),
        ).rejects.toMatchObject({ statusCode: 401 });
        expect(User.prototype.save).not.toHaveBeenCalled();
    });

    it.each([
        ["trop court", "Ab1!"],
        ["sans majuscule", "motdepasse1!"],
        ["sans minuscule", "MOTDEPASSE1!"],
        ["sans chiffre", "Motdepasse!"],
        ["sans symbole", "Motdepasse1"],
        ["trop long", `Ab1!${"a".repeat(252)}`],
    ])("refuse un nouveau mot de passe %s", async (_label, newPassword) => {
        repository.findOne.mockResolvedValue(await userWithPassword());

        await expect(
            changePassword(
                "user-1",
                PASSWORD,
                newPassword,
                makeCookies(undefined),
            ),
        ).rejects.toMatchObject({ statusCode: 400 });
        expect(User.prototype.save).not.toHaveBeenCalled();
    });

    it("refuse un compte sans mot de passe local", async () => {
        const googleUser = makeUser("google-user");
        googleUser.hashedPassword = null;
        repository.findOne.mockResolvedValue(googleUser);

        await expect(
            changePassword(
                "google-user",
                PASSWORD,
                "Nouveau2?",
                makeCookies(undefined),
            ),
        ).rejects.toMatchObject({ statusCode: 400 });
    });
});

// Risque : une URL d'image non https (javascript:, http) est enregistrée puis
// rendue.
describe("setProfileImage", () => {
    it.each([
        ["http", "http://res.cloudinary.com/avatar.png"],
        ["javascript", "javascript:alert(1)"],
        ["invalide", "pas une url"],
    ])("refuse une URL %s", async (_label, url) => {
        await expect(
            setProfileImage("user-1", "avatar", url),
        ).rejects.toMatchObject({
            statusCode: 400,
        });
        expect(repository.findOne).not.toHaveBeenCalled();
    });

    it("enregistre une URL https", async () => {
        const user = makeUser("user-1");
        repository.findOne.mockResolvedValue(user);

        const updated = await setProfileImage(
            "user-1",
            "avatar",
            "https://res.cloudinary.com/avatar.png",
        );

        expect(updated.avatar).toBe("https://res.cloudinary.com/avatar.png");
    });

    it("retire la bannière avec null", async () => {
        const user = makeUser("user-1");
        user.banner = "https://res.cloudinary.com/banner.png";
        repository.findOne.mockResolvedValue(user);

        const updated = await setProfileImage("user-1", "banner", null);

        expect(updated.banner).toBeNull();
    });
});

// Risque : la connexion Google crée un doublon, écrase un compte ou crée un
// compte avec mot de passe.
describe("resolveOrCreateGoogleUser", () => {
    const profile = {
        sub: "google-sub",
        email: "reader@example.com",
        name: "Reader",
        picture: "https://lh3.googleusercontent.com/photo.jpg",
    };

    it("renvoie le compte déjà lié à ce googleId", async () => {
        const linked = makeUser("linked");
        repository.findOne.mockResolvedValueOnce(linked);

        await expect(resolveOrCreateGoogleUser(profile)).resolves.toBe(linked);
        expect(User.prototype.save).not.toHaveBeenCalled();
    });

    it("lie un compte existant ayant le même email", async () => {
        const existing = makeUser("existing");
        repository.findOne
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(existing);
        uploadImage.mockResolvedValue("https://res.cloudinary.com/avatar.png");

        const user = await resolveOrCreateGoogleUser(profile);

        expect(user).toBe(existing);
        expect(user.googleId).toBe("google-sub");
        expect(user.avatar).toBe("https://res.cloudinary.com/avatar.png");
        expect(User.prototype.save).toHaveBeenCalled();
    });

    it("crée un compte sans mot de passe avec un nom d'utilisateur libre", async () => {
        repository.findOne
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(makeUser("Reader"))
            .mockResolvedValueOnce(null);
        uploadImage.mockResolvedValue(null);
        const create = jest
            .spyOn(User, "create")
            .mockImplementation((fields) => Object.assign(new User(), fields));

        const user = await resolveOrCreateGoogleUser(profile);

        expect(create).toHaveBeenCalledWith(
            expect.objectContaining({
                email: "reader@example.com",
                googleId: "google-sub",
                userName: "Reader-1",
                hashedPassword: null,
                role: "user",
            }),
        );
        expect(user.avatar).toBeNull();
    });
});
