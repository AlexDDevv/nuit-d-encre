import { buildSchema, parse, specifiedRules, validate } from "graphql";
import { queryLimitsRule } from "./query-limits";

const schema = buildSchema(`
    type Author { id: ID! name: String books: [Book!]! }
    type Book { id: ID! title: String author: Author! }
    type Query { books: [Book!]! author(id: ID!): Author }
`);

const errors = (query: string, maxDepth = 4, maxFields = 20) =>
    validate(schema, parse(query), [
        ...specifiedRules,
        queryLimitsRule({ maxDepth, maxFields }),
    ]).map((e) => e.message);

// Risque : une requête trop profonde ou trop large (alias, fragments) passe et
// surcharge le serveur.
describe("queryLimitsRule", () => {
    it("accepte une requête dans les limites", () => {
        expect(errors("{ books { title author { name } } }")).toEqual([]);
    });

    it("refuse une requête trop profonde", () => {
        expect(
            errors(
                "{ books { author { books { author { books { id } } } } } }",
            ),
        ).toEqual([expect.stringContaining("trop profonde : 6 niveaux")]);
    });

    it("suit les fragments et les fragments inline", () => {
        const query = `
            fragment Deep on Author { books { author { books { id } } } }
            { books { author { ... on Author { ...Deep } } } }
        `;
        expect(errors(query)).toEqual([
            expect.stringContaining("trop profonde : 6 niveaux"),
        ]);
    });

    it("compte les alias pour bloquer les requêtes trop larges", () => {
        const aliases = Array.from(
            { length: 30 },
            (_, i) => `a${i}: books { id }`,
        );
        expect(errors(`{ ${aliases.join(" ")} }`, 4, 50)).toEqual([
            expect.stringContaining("trop large : 60 champs"),
        ]);
    });

    it("ne compte pas l'introspection", () => {
        expect(
            errors(
                "{ __schema { types { fields { type { ofType { name } } } } } }",
                2,
            ),
        ).toEqual([]);
    });

    it("mesure une seule fois un fragment répété", () => {
        const query = `
            fragment F on Book { id title }
            { books { ...F ...F ...F } }
        `;
        expect(errors(query)).toEqual([]);
    });
});
