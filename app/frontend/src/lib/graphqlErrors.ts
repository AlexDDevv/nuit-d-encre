import { ApolloError } from "@apollo/client";

/**
 * Codes `extensions.code` renvoyés par le backend (middlewares/format-error.ts),
 * déduits du statut HTTP de l'erreur. À privilégier sur le message, qui peut
 * changer.
 */
export const GRAPHQL_ERROR_CODES = {
    notFound: "NOT_FOUND",
    unauthenticated: "UNAUTHENTICATED",
    forbidden: "FORBIDDEN",
    badUserInput: "BAD_USER_INPUT",
    conflict: "CONFLICT",
    tooManyRequests: "TOO_MANY_REQUESTS",
    internal: "INTERNAL_SERVER_ERROR",
    // Codes propres (AppError.withCode côté back).
    emailNotVerified: "EMAIL_NOT_VERIFIED",
    invalidToken: "INVALID_TOKEN",
} as const;

/** Vrai si l'une des erreurs GraphQL porte le code donné. */
export function hasGraphQLErrorCode(error: unknown, code: string): boolean {
    if (!(error instanceof ApolloError)) return false;
    return error.graphQLErrors.some((e) => e.extensions?.code === code);
}

/** Ressource absente (ou identifiant mal formé) : afficher une page 404. */
export function isNotFoundError(error: unknown): boolean {
    return hasGraphQLErrorCode(error, GRAPHQL_ERROR_CODES.notFound);
}
