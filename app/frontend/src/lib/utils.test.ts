import { describe, expect, it } from "vitest";
import { Author, Book } from "@/types/types";
import { hasIncompleteBookInfo, hasIncompleteInfo, slugify } from "./utils";

// Risque : un slug mal formé produit une URL de fiche cassée ou ambiguë.
describe("slugify", () => {
    it("lowercases and replaces spaces with dashes", () => {
        expect(slugify("Le Petit Prince")).toBe("le-petit-prince");
    });

    it("strips accents and special characters", () => {
        expect(slugify("Antoine de Saint-Exupéry")).toBe(
            "antoine-de-saint-exupery",
        );
        expect(slugify("L'Étranger !")).toBe("letranger");
    });

    it("collapses consecutive separators", () => {
        expect(slugify("  Voyage   au bout -- de la nuit  ")).toBe(
            "voyage-au-bout-de-la-nuit",
        );
    });
});

// Risque : le badge « fiche à compléter » diverge de la règle backend qui
// accorde l'XP de complétion (isImportedBookIncomplete).
describe("hasIncompleteBookInfo", () => {
    const completeImportedBook = {
        isImported: true,
        summary: "Un vrai résumé.",
        pageCount: 96,
        category: { name: "Roman" },
        coverUrl: "https://example.com/cover.jpg",
    } as Book;

    it("never flags a book that was not imported", () => {
        expect(
            hasIncompleteBookInfo({
                ...completeImportedBook,
                isImported: false,
                pageCount: 0,
            } as Book),
        ).toBe(false);
    });

    it("accepts an imported book with full information", () => {
        expect(hasIncompleteBookInfo(completeImportedBook)).toBe(false);
    });

    it("flags an imported book with a missing field", () => {
        expect(
            hasIncompleteBookInfo({
                ...completeImportedBook,
                summary: "Importé depuis une source externe.",
            } as Book),
        ).toBe(true);
        expect(
            hasIncompleteBookInfo({
                ...completeImportedBook,
                pageCount: 0,
            } as Book),
        ).toBe(true);
        expect(
            hasIncompleteBookInfo({
                ...completeImportedBook,
                category: { name: "Autre" },
            } as Book),
        ).toBe(true);
    });

    it("est plus strict que le backend sur la couverture", () => {
        // Divergence connue : le front exige une couverture, le backend
        // l'ignore. Un livre importé sans couverture mais complet par ailleurs
        // garde son badge alors que l'XP est déjà accordée. Si le backend
        // ajoute coverUrl à sa règle, supprimer ce test.
        expect(
            hasIncompleteBookInfo({
                ...completeImportedBook,
                coverUrl: undefined,
            } as Book),
        ).toBe(true);
    });
});

// Risque : la complétion d'un auteur affichée diverge de celle qui accorde
// l'XP AUTHOR_COMPLETED.
describe("hasIncompleteInfo", () => {
    const auteurComplet = {
        firstname: "Albert",
        lastname: "Camus",
        birthDate: "1913-11-07",
        nationality: "fr",
        wikipediaUrl: "https://fr.wikipedia.org/wiki/Albert_Camus",
        biography: "Écrivain et philosophe français.",
    } as Author;

    it("accepte un auteur dont les quatre champs d'enrichissement sont remplis", () => {
        expect(hasIncompleteInfo(auteurComplet)).toBe(false);
    });

    it.each(["birthDate", "nationality", "wikipediaUrl", "biography"] as const)(
        "signale un auteur sans %s",
        (field) => {
            expect(
                hasIncompleteInfo({
                    ...auteurComplet,
                    [field]: undefined,
                } as Author),
            ).toBe(true);
            expect(
                hasIncompleteInfo({ ...auteurComplet, [field]: "" } as Author),
            ).toBe(true);
        },
    );

    it("ne tient pas compte des champs facultatifs", () => {
        // officialWebsite et books ne comptent pas dans la complétion.
        expect(
            hasIncompleteInfo({
                ...auteurComplet,
                officialWebsite: undefined,
            } as Author),
        ).toBe(false);
    });
});
