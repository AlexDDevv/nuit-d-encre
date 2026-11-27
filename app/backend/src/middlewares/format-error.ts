import { unwrapResolverError } from "@apollo/server/errors";
import { GraphQLFormattedError } from "graphql";
import {
    ArgumentValidationError,
    AuthenticationError,
    AuthorizationError,
} from "type-graphql";
import { ValidationError } from "class-validator";
import { QueryFailedError } from "typeorm";
import { AppError } from "./error-handler";

type ValidationIssue = {
    property: string;
    constraints?: Record<string, string>;
    children?: ValidationIssue[];
};

/** Projette une erreur class-validator sans `target` ni `value` (saisie). */
function toIssue(error: ValidationError): ValidationIssue {
    return {
        property: error.property,
        constraints: error.constraints,
        children: error.children?.length
            ? error.children.map(toIssue)
            : undefined,
    };
}

/** Code GraphQL (`extensions.code`) déduit du statut HTTP d'une AppError. */
export function codeForStatus(statusCode: number): string {
    switch (statusCode) {
        case 400:
            return "BAD_USER_INPUT";
        case 401:
            return "UNAUTHENTICATED";
        case 403:
            return "FORBIDDEN";
        case 404:
            return "NOT_FOUND";
        case 409:
            return "CONFLICT";
        case 429:
            return "TOO_MANY_REQUESTS";
        default:
            return statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "BAD_REQUEST";
    }
}

// Erreurs émises par Apollo / graphql-js avant toute exécution de resolver :
// déjà propres, renvoyées telles quelles.
const CLIENT_ERROR_CODES = new Set([
    "GRAPHQL_PARSE_FAILED",
    "GRAPHQL_VALIDATION_FAILED",
    "BAD_USER_INPUT",
    "BAD_REQUEST",
    "OPERATION_RESOLUTION_FAILURE",
    "PERSISTED_QUERY_NOT_FOUND",
    "PERSISTED_QUERY_NOT_SUPPORTED",
]);

/**
 * Format unique des erreurs renvoyées au client.
 *
 * - `AppError` : message conservé, code déduit du statut. `additionalInfo`
 *   (souvent un message technique) n'est jamais envoyé, seulement journalisé.
 * - Validation class-validator : propriété + contraintes, sans renvoyer la
 *   valeur saisie.
 * - Identifiant mal formé (PostgreSQL 22P02) : NOT_FOUND.
 * - `@Authorized` refusé : UNAUTHENTICATED / FORBIDDEN, message type-graphql
 *   conservé (le front le reconnaît).
 * - Toute autre erreur (BDD, bug) : journalisée, et masquée en production.
 */
export function formatError(
    formattedError: GraphQLFormattedError,
    error: unknown,
    isProduction = process.env.NODE_ENV === "production",
): GraphQLFormattedError {
    const original = unwrapResolverError(error);
    const base = {
        locations: formattedError.locations,
        path: formattedError.path,
    };

    if (original instanceof AppError) {
        if (original.statusCode >= 500) {
            console.error(
                "AppError",
                original.message,
                original.additionalInfo ?? "",
            );
        }
        return {
            ...base,
            message: original.message,
            extensions: {
                code: original.code ?? codeForStatus(original.statusCode),
            },
        };
    }

    // Identifiant mal formé (slug d'URL tronqué, id inventé) : le cast uuid
    // de PostgreSQL échoue (22P02). Pour le client, la ressource n'existe pas.
    if (
        original instanceof QueryFailedError &&
        (original as QueryFailedError & { code?: string }).code === "22P02"
    ) {
        return {
            ...base,
            message: "Ressource introuvable",
            extensions: { code: "NOT_FOUND" },
        };
    }

    if (original instanceof ArgumentValidationError) {
        return {
            ...base,
            message: "Données invalides",
            extensions: {
                code: "BAD_USER_INPUT",
                validationErrors:
                    original.extensions.validationErrors.map(toIssue),
            },
        };
    }

    if (original instanceof AuthenticationError) {
        return {
            ...base,
            message: original.message,
            extensions: { code: "UNAUTHENTICATED" },
        };
    }

    if (original instanceof AuthorizationError) {
        return {
            ...base,
            message: original.message,
            extensions: { code: "FORBIDDEN" },
        };
    }

    const code = formattedError.extensions?.code;
    if (typeof code === "string" && CLIENT_ERROR_CODES.has(code)) {
        return formattedError;
    }

    console.error("Unexpected GraphQL error:", original);
    if (!isProduction) return formattedError;
    return {
        ...base,
        message: "Erreur interne du serveur",
        extensions: { code: "INTERNAL_SERVER_ERROR" },
    };
}
