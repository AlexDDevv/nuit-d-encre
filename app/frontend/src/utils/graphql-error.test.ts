import { ApolloError } from "@apollo/client";
import { GraphQLError } from "graphql";
import { describe, expect, it } from "vitest";
import { parseGraphQLError } from "./graphql-error";

const apolloError = (code: string, message = "x") =>
    new ApolloError({
        graphQLErrors: [new GraphQLError(message, { extensions: { code } })],
    });

describe("parseGraphQLError", () => {
    it("reconnaît l'erreur à son code, quel que soit le message", () => {
        expect(
            parseGraphQLError(
                apolloError("FORBIDDEN", "Not authorized to update this book"),
                "updateBook",
            ).title,
        ).toBe("Action non autorisée");
    });

    it("départage deux erreurs de même code par l'extrait de message", () => {
        expect(
            parseGraphQLError(
                apolloError("NOT_FOUND", "Category not found"),
                "updateBook",
            ).title,
        ).toBe("Catégorie introuvable");
        expect(
            parseGraphQLError(
                apolloError("NOT_FOUND", "Book not found"),
                "updateBook",
            ).title,
        ).toBe("Livre introuvable");
    });

    it("signale une session expirée", () => {
        expect(
            parseGraphQLError(apolloError("UNAUTHENTICATED"), "createReview")
                .title,
        ).toBe("Connexion requise");
    });

    it("applique la règle commune de rate limiting", () => {
        expect(
            parseGraphQLError(
                apolloError("TOO_MANY_REQUESTS"),
                "createUserBook",
            ).title,
        ).toBe("Trop de tentatives");
    });

    it("retombe sur le message générique de l'opération", () => {
        expect(
            parseGraphQLError(
                apolloError("INTERNAL_SERVER_ERROR"),
                "deleteBook",
            ).title,
        ).toBe("Échec de la suppression");
    });

    it("distingue une erreur réseau", () => {
        expect(
            parseGraphQLError(new Error("fetch failed"), "voteOnReview").title,
        ).toBe("Erreur de connexion");
    });
});
