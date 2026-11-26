import { Brackets, SelectQueryBuilder } from "typeorm";
import { User } from "../database/entities/user/user";
import { Roles, UserActionType } from "../types/types";

/**
 * Actions qui révèlent le contenu d'une bibliothèque. Elles ne sont visibles
 * des autres que si son propriétaire la partage (`User.isLibraryPublic`).
 * Les contributions publiques (critiques, recommandations, fiches) restent
 * toujours visibles.
 */
export const LIBRARY_ACTION_TYPES: readonly UserActionType[] = [
    UserActionType.BOOK_ADDED_TO_LIBRARY,
    UserActionType.BOOK_FINISHED,
    UserActionType.READING_GOAL_REACHED,
];

/** Le visiteur peut-il voir la bibliothèque (et son activité) du propriétaire ? */
export function canViewLibrary(
    viewer: User | null | undefined,
    owner: Pick<User, "id" | "isLibraryPublic">,
): boolean {
    if (owner.isLibraryPublic) return true;
    if (!viewer) return false;
    return viewer.id === owner.id || viewer.role === Roles.Admin;
}

/**
 * Restreint une requête sur `user_actions` aux actions visibles par le
 * visiteur : retire les actions de bibliothèque des comptes qui ne la
 * partagent pas, sauf les siennes. Règle appliquée à la lecture : basculer
 * le partage cache ou réaffiche aussi l'activité passée.
 *
 * @param actionAlias - alias de l'entité UserActions dans la requête.
 * @param userAlias - alias de la relation `user` jointe.
 */
export function onlyVisibleActions<T extends object>(
    qb: SelectQueryBuilder<T>,
    viewer: User | null | undefined,
    actionAlias: string,
    userAlias: string,
): SelectQueryBuilder<T> {
    if (viewer?.role === Roles.Admin) return qb;
    return qb.andWhere(
        new Brackets((w) => {
            w.where(`${actionAlias}.type NOT IN (:...libraryActionTypes)`, {
                libraryActionTypes: LIBRARY_ACTION_TYPES,
            }).orWhere(`${userAlias}.isLibraryPublic = true`);
            if (viewer) {
                w.orWhere(`${userAlias}.id = :visibilityViewerId`, {
                    visibilityViewerId: viewer.id,
                });
            }
        }),
    );
}
