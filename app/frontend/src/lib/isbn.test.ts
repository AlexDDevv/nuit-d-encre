import { describe, expect, it } from "vitest";
import { hasValidIsbn13Checksum } from "./isbn";

// Risque : confirmer en vert un ISBN mal saisi (clé fausse), ou refuser la
// confirmation d'un ISBN juste à cause d'une pondération décalée.
describe("hasValidIsbn13Checksum", () => {
    it("accepte un ISBN-13 dont la clé est juste", () => {
        expect(hasValidIsbn13Checksum("9782070368228")).toBe(true);
    });

    it("refuse une faute de frappe sur un chiffre", () => {
        expect(hasValidIsbn13Checksum("9782070368238")).toBe(false);
    });

    it("refuse deux chiffres voisins inversés", () => {
        expect(hasValidIsbn13Checksum("9782070363828")).toBe(false);
    });

    it("refuse une longueur autre que 13", () => {
        expect(hasValidIsbn13Checksum("978207036822")).toBe(false);
    });
});
