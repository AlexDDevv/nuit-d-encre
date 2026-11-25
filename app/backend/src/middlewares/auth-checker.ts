import { AuthChecker } from "type-graphql";
import { Context } from "../types/types";

/**
 * `@Authorized()` : exige une session valide. `@Authorized(roles)` : exige en
 * plus l'un des rôles. L'utilisateur vient de `context.getUser()`, mémoïsé
 * pour la requête : les resolvers le relisent via `requireUser` sans requête
 * BDD supplémentaire.
 */
export const customAuthChecker: AuthChecker<Context> = async (
    { context },
    roles: string[],
) => {
    const user = await context.getUser();
    if (!user) return false;
    if (roles.length === 0) return true;
    return roles.includes(user.role);
};
