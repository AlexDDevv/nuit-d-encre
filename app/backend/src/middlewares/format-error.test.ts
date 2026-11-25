import { GraphQLError, GraphQLFormattedError } from "graphql";
import {
    ArgumentValidationError,
    AuthenticationError,
    AuthorizationError,
} from "type-graphql";
import { ValidationError } from "class-validator";
import { QueryFailedError } from "typeorm";
import { AppError } from "./error-handler";
import { codeForStatus, formatError } from "./format-error";

// Apollo transmet l'erreur du resolver enveloppée dans une GraphQLError.
const wrap = (error: Error) =>
    new GraphQLError(error.message, { originalError: error, path: ["field"] });
const formatted: GraphQLFormattedError = {
    message: "brut",
    path: ["field"],
    extensions: { code: "INTERNAL_SERVER_ERROR" },
};

describe("formatError", () => {
    beforeEach(() => jest.spyOn(console, "error").mockImplementation(() => {}));
    afterEach(() => jest.restoreAllMocks());

    it("déballe une AppError et déduit le code de son statut", () => {
        const result = formatError(
            formatted,
            wrap(new AppError("Book not found", 404, "NotFoundError")),
        );
        expect(result).toEqual({
            message: "Book not found",
            path: ["field"],
            locations: undefined,
            extensions: { code: "NOT_FOUND" },
        });
    });

    it("n'envoie jamais additionalInfo au client", () => {
        const result = formatError(
            formatted,
            wrap(new AppError("Failed", 500, "DatabaseError", "detail SQL")),
        );
        expect(JSON.stringify(result)).not.toContain("detail SQL");
        expect(result.extensions?.code).toBe("INTERNAL_SERVER_ERROR");
    });

    it("renvoie les contraintes de validation sans la valeur saisie", () => {
        const issue = Object.assign(new ValidationError(), {
            property: "limit",
            value: 500,
            target: { limit: 500 },
            constraints: { max: "limit must not be greater than 100" },
        });
        const result = formatError(
            formatted,
            wrap(new ArgumentValidationError([issue])),
        );
        expect(result.extensions).toEqual({
            code: "BAD_USER_INPUT",
            validationErrors: [
                {
                    property: "limit",
                    constraints: { max: "limit must not be greater than 100" },
                    children: undefined,
                },
            ],
        });
        expect(JSON.stringify(result)).not.toContain("500");
    });

    it("distingue session absente et rôle insuffisant, message conservé", () => {
        const unauth = formatError(formatted, wrap(new AuthenticationError()));
        const forbidden = formatError(
            formatted,
            wrap(new AuthorizationError()),
        );
        expect(unauth.extensions?.code).toBe("UNAUTHENTICATED");
        expect(forbidden.extensions?.code).toBe("FORBIDDEN");
        expect(forbidden.message).toContain("Access denied");
    });

    it("traite un identifiant mal formé comme une ressource introuvable", () => {
        const driverError = Object.assign(
            new Error('invalid input syntax for type uuid: "abc"'),
            { code: "22P02" },
        );
        const result = formatError(
            formatted,
            wrap(new QueryFailedError("SELECT ...", [], driverError)),
            true,
        );
        expect(result.extensions).toEqual({ code: "NOT_FOUND" });
        expect(result.message).toBe("Ressource introuvable");
    });

    it("masque une erreur inattendue en production", () => {
        const result = formatError(
            formatted,
            wrap(new Error('relation "user" does not exist')),
            true,
        );
        expect(result.message).toBe("Erreur interne du serveur");
        expect(result.extensions).toEqual({ code: "INTERNAL_SERVER_ERROR" });
    });

    it("garde l'erreur brute en développement pour le débogage", () => {
        const result = formatError(formatted, wrap(new Error("boom")), false);
        expect(result).toBe(formatted);
    });

    it("laisse passer les erreurs de requête émises par graphql-js", () => {
        const parse: GraphQLFormattedError = {
            message: "Syntax Error",
            extensions: { code: "GRAPHQL_PARSE_FAILED" },
        };
        expect(formatError(parse, new GraphQLError("Syntax Error"), true)).toBe(
            parse,
        );
    });
});

describe("codeForStatus", () => {
    it.each([
        [400, "BAD_USER_INPUT"],
        [401, "UNAUTHENTICATED"],
        [403, "FORBIDDEN"],
        [404, "NOT_FOUND"],
        [409, "CONFLICT"],
        [429, "TOO_MANY_REQUESTS"],
        [502, "INTERNAL_SERVER_ERROR"],
        [418, "BAD_REQUEST"],
    ])("%i → %s", (status, code) => {
        expect(codeForStatus(status)).toBe(code);
    });
});
