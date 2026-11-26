import Cookies from "cookies";
import { whoami } from "../services/auth-service";
import { makeContext, makeUser } from "../test/factories";
import {
    createUserResolver,
    getCurrentUser,
    requireUser,
} from "./current-user";
import { AppError } from "../middlewares/error-handler";

jest.mock("../services/auth-service");

const whoamiMock = whoami as jest.Mock;
const cookies = {} as Cookies;

// Risque : la session est relue à chaque champ (coût) ou une session invalide
// fait échouer une query publique.
describe("createUserResolver", () => {
    beforeEach(() => whoamiMock.mockReset());

    it("ne lit la session qu'une fois par requête", async () => {
        const user = makeUser("user-1");
        whoamiMock.mockResolvedValue(user);
        const getUser = createUserResolver(cookies);

        await expect(getUser()).resolves.toBe(user);
        await expect(getUser()).resolves.toBe(user);
        expect(whoamiMock).toHaveBeenCalledTimes(1);
    });

    it("renvoie null sans session valide au lieu de lever", async () => {
        whoamiMock.mockRejectedValue(new Error("No token provided"));

        await expect(createUserResolver(cookies)()).resolves.toBeNull();
    });
});

// Risque : un visiteur passe un resolver qui exige une session.
describe("requireUser / getCurrentUser", () => {
    it("renvoie l'utilisateur de la session", async () => {
        const user = makeUser("user-1");
        await expect(requireUser(makeContext(user))).resolves.toBe(user);
        await expect(getCurrentUser(makeContext(user))).resolves.toBe(user);
    });

    it("lève un 401 pour un visiteur, getCurrentUser renvoie null", async () => {
        await expect(requireUser(makeContext(null))).rejects.toMatchObject({
            statusCode: 401,
        });
        await expect(requireUser(makeContext(null))).rejects.toBeInstanceOf(
            AppError,
        );
        await expect(getCurrentUser(makeContext(null))).resolves.toBeNull();
    });
});
