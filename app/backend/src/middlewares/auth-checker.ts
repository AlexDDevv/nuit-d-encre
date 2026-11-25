import { AuthChecker, AuthenticationError } from "type-graphql";
import { Context } from "../types/types";

/**
 * `@Authorized()` : exige une session valide. `@Authorized(roles)` : exige en
 * plus l'un des rôles. Sans session, lève toujours AuthenticationError
 * (UNAUTHENTICATED) : type-graphql renverrait sinon AuthorizationError
 * (FORBIDDEN) dès que des rôles sont exigés, même pour un visiteur. L'utilisateur vient de `context.getUser()`, mémoïsé
 * pour la requête : les resolvers le relisent via `requireUser` sans requête
 * BDD supplémentaire.
 */
export const customAuthChecker: AuthChecker<Context> = async (
    { context },
    roles: string[],
) => {
    const user = await context.getUser();
    if (!user) throw new AuthenticationError();
    if (roles.length === 0) return true;
    return roles.includes(user.role);
};
