import { describe, expect, it } from "vitest";
import { parseSpoilers, wrapSpoiler } from "./spoiler";

// Risque : un spoiler mal analysé s'affiche en clair.
describe("parseSpoilers", () => {
    it("renvoie un seul segment de texte sans marqueur", () => {
        expect(parseSpoilers("Un beau livre.")).toEqual([
            { type: "text", value: "Un beau livre." },
        ]);
    });

    it("isole un spoiler au milieu du texte", () => {
        expect(parseSpoilers("À la fin, ||il meurt||, hélas.")).toEqual([
            { type: "text", value: "À la fin, " },
            { type: "spoiler", value: "il meurt" },
            { type: "text", value: ", hélas." },
        ]);
    });

    it("gère plusieurs spoilers et un spoiler sur plusieurs lignes", () => {
        expect(parseSpoilers("||a||\n||b\nc||")).toEqual([
            { type: "spoiler", value: "a" },
            { type: "text", value: "\n" },
            { type: "spoiler", value: "b\nc" },
        ]);
    });

    it("laisse en texte un marqueur sans fermeture", () => {
        expect(parseSpoilers("Choix || ou pas")).toEqual([
            { type: "text", value: "Choix || ou pas" },
        ]);
    });

    it("laisse en texte un spoiler vide ou blanc", () => {
        expect(parseSpoilers("a |||| b")).toEqual([
            { type: "text", value: "a |||| b" },
        ]);
        expect(parseSpoilers("a ||  || b")).toEqual([
            { type: "text", value: "a ||  || b" },
        ]);
    });

    it("reprend l'analyse après un spoiler vide", () => {
        expect(parseSpoilers("|| ||x||")).toEqual([
            { type: "text", value: "|| " },
            { type: "spoiler", value: "x" },
        ]);
    });

    it("renvoie une liste vide pour un texte vide", () => {
        expect(parseSpoilers("")).toEqual([]);
    });
});

// Risque : le bouton spoiler produit un balisage que parseSpoilers ne masque pas.
describe("wrapSpoiler", () => {
    it("accepte une sélection inversée", () => {
        expect(wrapSpoiler("abc", 3, 1).value).toBe("a||bc||");
    });

    it("produit un texte que parseSpoilers reconnaît", () => {
        const { value } = wrapSpoiler("Le coupable est le majordome.", 16, 28);
        expect(parseSpoilers(value)).toContainEqual({
            type: "spoiler",
            value: "le majordome",
        });
    });
});
