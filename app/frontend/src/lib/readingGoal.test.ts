import { describe, expect, it } from "vitest";
import { goalRatio, goalStatusLabel } from "./readingGoal";

const goal = (booksRead: number, target: number) => ({
    year: 2026,
    target,
    booksRead,
    rewardXp: target * 10,
});

describe("goalRatio", () => {
    it("borne l'avancement à 100 %", () => {
        expect(goalRatio(goal(6, 24))).toBe(0.25);
        expect(goalRatio(goal(30, 24))).toBe(1);
    });
});

describe("goalStatusLabel", () => {
    it("compte ce qui reste à lire, au singulier comme au pluriel", () => {
        expect(goalStatusLabel(goal(22, 24))).toBe(
            "Encore 2 livres pour relever le défi",
        );
        expect(goalStatusLabel(goal(23, 24))).toBe(
            "Encore 1 livre pour relever le défi",
        );
    });

    it("signale l'objectif atteint puis dépassé", () => {
        expect(goalStatusLabel(goal(24, 24))).toBe("Défi relevé");
        expect(goalStatusLabel(goal(25, 24))).toBe(
            "Défi relevé, et 1 livre de plus",
        );
    });
});
