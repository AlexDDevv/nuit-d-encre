import Cookies from "cookies";
import { User } from "../database/entities/user/user";
import { Loaders } from "../graphql/dataloaders";

export type Context = {
    cookies: Cookies;
    ip: string;
    loaders: Loaders;
    /**
     * Utilisateur de la session, résolu au premier appel puis mémoïsé pour
     * toute la requête. Seule source de vérité sur l'utilisateur courant :
     * passer par `requireUser` / `getCurrentUser` (utils/current-user.ts).
     */
    getUser: () => Promise<User | null>;
};
