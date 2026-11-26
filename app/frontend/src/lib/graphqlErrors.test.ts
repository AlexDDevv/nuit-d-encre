import { ApolloError } from "@apollo/client";
import { GraphQLError } from "graphql";
import { describe, expect, it } from "vitest";
import { hasGraphQLErrorCode, isNotFoundError } from "./graphqlErrors";

const apolloError = (...codes: string[]) =>
    new ApolloError({
        graphQLErrors: codes.map(
            (code) => new GraphQLError("x", { extensions: { code } }),
        ),
    });

// Risque : une erreur serveur est prise pour une ressource absente (ou
// l'inverse) et la page affiche une fausse 404.
describe("hasGraphQLErrorCode", () => {
    it("détecte le code parmi les erreurs GraphQL", () => {
        expect(
            hasGraphQLErrorCode(
                apolloError("FORBIDDEN", "NOT_FOUND"),
                "NOT_FOUND",
            ),
        ).toBe(true);
        expect(hasGraphQLErrorCode(apolloError("FORBIDDEN"), "NOT_FOUND")).toBe(
            false,
        );
    });

    it("renvoie false pour une erreur qui n'est pas une ApolloError", () => {
        expect(hasGraphQLErrorCode(new Error("réseau"), "NOT_FOUND")).toBe(
            false,
        );
        expect(hasGraphQLErrorCode(undefined, "NOT_FOUND")).toBe(false);
    });
});

// Risque : une page affiche « introuvable » pour une panne serveur.
describe("isNotFoundError", () => {
    it("ne confond pas une erreur serveur avec une ressource absente", () => {
        expect(isNotFoundError(apolloError("NOT_FOUND"))).toBe(true);
        expect(isNotFoundError(apolloError("INTERNAL_SERVER_ERROR"))).toBe(
            false,
        );
    });
});
