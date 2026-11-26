import { describe, expect, it } from "vitest";
import { BOOK_STATES } from "@/constants/bookStatus";
import { UserBookStatus } from "@/types/types";
import {
    languageLabelMap,
    languageLabelToCode,
    statusLabelMap,
} from "./filterMaps";

const STATUSES: UserBookStatus[] = [
    "TO_READ",
    "READING",
    "READ",
    "PAUSED",
    "ABANDONED",
];

// Risque : les filtres de la bibliothèque envoient des libellés que le hook
// retraduit en valeurs d'enum ; un libellé désynchronisé fait disparaître le
// filtre sans erreur visible.
describe("statuts de lecture", () => {
    it("associe au plus un statut par libellé", () => {
        const labels = Object.values(statusLabelMap);
        expect(new Set(labels).size).toBe(labels.length);
    });

    it("utilise les mêmes libellés que le sélecteur de statut", () => {
        for (const state of BOOK_STATES) {
            expect(statusLabelMap[state.value]).toBe(state.label);
        }
    });

    it("propose chaque statut de l'enum dans le sélecteur", () => {
        expect(BOOK_STATES.map((s) => s.value).sort()).toEqual(
            [...STATUSES].sort(),
        );
    });
});

// Risque : le filtre par langue retraduit mal un libellé et ne renvoie rien.
describe("langues", () => {
    it("retrouve le code de chaque langue depuis son libellé", () => {
        for (const [code, label] of Object.entries(languageLabelMap)) {
            expect(languageLabelToCode[label]).toBe(code);
        }
    });

    it("n'associe pas deux langues au même libellé", () => {
        const labels = Object.values(languageLabelMap);
        expect(new Set(labels).size).toBe(labels.length);
    });
});
