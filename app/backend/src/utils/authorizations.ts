import { User } from "../database/entities/user/user";
import { Roles } from "../types/types";

/**
 * Checks if the current user is either the owner of the resource or has admin role.
 *
 * @param ownerId - The user ID of the resource owner.
 * @param currentUser - The currently authenticated user (`requireUser(context)`).
 *
 * @returns `true` if the current user is the owner or has an admin role; otherwise `false`.
 *
 * @example
 * ```ts
 * const isAuthorized = isOwnerOrAdmin(book.user.id, await requireUser(context))
 * if (!isAuthorized) {
 *   throw new AppError("Not authorized", 403, "ForbiddenError")
 * }
 * ```
 */
export function isOwnerOrAdmin(
    ownerId: string,
    currentUser: User | null | undefined,
): boolean {
    if (!currentUser) return false;
    return ownerId === currentUser.id || currentUser.role === Roles.Admin;
}
