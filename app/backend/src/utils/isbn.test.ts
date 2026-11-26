import { normalizeIsbn13 } from "./isbn";

// Risque : un ISBN non normalisé est injecté dans l'URL d'une API externe ou
// enregistré en double.
describe("normalizeIsbn13", () => {
    it("retire tirets et espaces", () => {
        expect(normalizeIsbn13("978-2-07 036822-8")).toBe("9782070368228");
    });

    it.each([
        ["trop court", "978207036822"],
        ["avec lettres", "978207036822X"],
        ["injection de paramètre", "9782070368228&q=autre"],
        ["vide", ""],
    ])("refuse un ISBN %s", (_label, raw) => {
        expect(() => normalizeIsbn13(raw)).toThrow(
            expect.objectContaining({ statusCode: 400 }),
        );
    });
});
