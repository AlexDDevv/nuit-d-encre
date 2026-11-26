import { AuthCheckerFn, AuthenticationError, ResolverData } from "type-graphql";
import { makeContext, makeUser } from "../test/factories";
import { Context, Roles } from "../types/types";
import { customAuthChecker } from "./auth-checker";

function check(context: Context, roles: string[]) {
    return (customAuthChecker as AuthCheckerFn<Context>)(
        { context } as ResolverData<Context>,
        roles,
    );
}

// Risque : un visiteur ou un rôle insuffisant passe @Authorized.
describe("customAuthChecker", () => {
    it("refuse un visiteur sans session valide comme non authentifié, rôles exigés ou non", async () => {
        await expect(check(makeContext(null), [])).rejects.toBeInstanceOf(
            AuthenticationError,
        );
        await expect(
            check(makeContext(null), [Roles.Admin]),
        ).rejects.toBeInstanceOf(AuthenticationError);
    });

    it("autorise tout utilisateur connecté quand aucun rôle n'est exigé", async () => {
        await expect(check(makeContext(makeUser("user-1")), [])).resolves.toBe(
            true,
        );
    });

    it("refuse un utilisateur dont le rôle n'est pas exigé", async () => {
        await expect(
            check(makeContext(makeUser("user-1", Roles.User)), [Roles.Admin]),
        ).resolves.toBe(false);
    });

    it("autorise un utilisateur ayant l'un des rôles exigés", async () => {
        await expect(
            check(makeContext(makeUser("admin", Roles.Admin)), [
                Roles.User,
                Roles.Admin,
            ]),
        ).resolves.toBe(true);
    });
});
