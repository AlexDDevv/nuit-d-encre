import Cookies from "cookies";
import { User } from "../database/entities/user/user";
import { AppError } from "../middlewares/error-handler";
import { whoami } from "../services/auth-service";
import { Context } from "../types/types";

/**
 * Construit le `getUser` du contexte : lit le cookie de session au premier
 * appel et mémoïse le résultat pour toute la requête (authChecker, resolvers
 * et DataLoaders partagent la même résolution). Sans session valide : `null`.
 */
export function createUserResolver(cookies: Cookies): () => Promise<User | null> {
    let userPromise: Promise<User | null> | undefined;
    return () => {
        if (!userPromise) {
            userPromise = whoami(cookies).catch(() => null);
        }
        return userPromise;
    };
}

/** Utilisateur courant, ou `null` pour un visiteur (queries publiques). */
export function getCurrentUser(context: Context): Promise<User | null> {
    return context.getUser();
}

/**
 * Utilisateur courant, ou 401. À utiliser dans tout resolver qui agit au nom
 * de l'utilisateur, y compris derrière `@Authorized()`.
 */
export async function requireUser(context: Context): Promise<User> {
    const user = await context.getUser();
    if (!user) {
        throw new AppError("Non authentifié", 401, "UnauthorizedError");
    }
    return user;
}
