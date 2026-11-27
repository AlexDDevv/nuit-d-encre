import { AppError } from "../../../middlewares/error-handler";
import * as authService from "../../../services/auth-service";
import * as accountEmail from "../../../services/account-email-service";
import { makeContext, makeUser } from "../../../test/factories";
import { AuthResolver } from "./auth-resolver";

jest.mock("../../../database/config/datasource", () => ({
    dataSource: { getRepository: jest.fn() },
}));
jest.mock("../../../services/cloudinary.service");

const resolver = new AuthResolver();
const input = { email: "", password: "Motdepasse1!", userName: "Lecteur" };

beforeEach(() => {
    jest.restoreAllMocks();
});

// Risque : un compte créé avec une adresse jetable, ou une inscription
// annulée parce que le mail de vérification n'a pas pu partir.
describe("register", () => {
    it("refuse une adresse jetable sans créer de compte", async () => {
        const register = jest.spyOn(authService, "register");

        await expect(
            resolver.register(
                { ...input, email: "lecteur@yopmail.com" },
                makeContext(null),
            ),
        ).rejects.toMatchObject({ statusCode: 400 });
        expect(register).not.toHaveBeenCalled();
    });

    it("crée le compte même si l'envoi du mail échoue", async () => {
        const user = makeUser("user-1");
        jest.spyOn(authService, "register").mockResolvedValue(user);
        jest.spyOn(accountEmail, "sendVerificationEmail").mockRejectedValue(
            new Error("Brevo indisponible"),
        );
        jest.spyOn(console, "error").mockImplementation(() => {});

        await expect(
            resolver.register(
                { ...input, email: "lecteur@gmail.com" },
                makeContext(null),
            ),
        ).resolves.toBe(user);
    });
});

// Risque : le refus « adresse non vérifiée » masqué en 401 générique, et le
// front ne peut plus proposer de renvoyer le lien.
describe("login", () => {
    it("transmet le code EMAIL_NOT_VERIFIED", async () => {
        jest.spyOn(authService, "login").mockRejectedValue(
            new AppError("Email not verified", 403).withCode(
                "EMAIL_NOT_VERIFIED",
            ),
        );

        await expect(
            resolver.login(
                { email: "lecteur@gmail.com", password: "Motdepasse1!" },
                makeContext(null),
            ),
        ).rejects.toMatchObject({ code: "EMAIL_NOT_VERIFIED" });
    });
});
