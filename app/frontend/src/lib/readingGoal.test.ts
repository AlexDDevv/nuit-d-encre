import { describe, expect, it } from "vitest";
import { goalRatio, goalRewardXp, isGoalXpCapped } from "./readingGoal";

describe("goalRatio", () => {
    it("borne l'avancement à 100 %", () => {
        expect(goalRatio({ booksRead: 6, target: 24 })).toBe(0.25);
        expect(goalRatio({ booksRead: 30, target: 24 })).toBe(1);
    });
});

// Miroir de reading-goal-service.ts : l'XP promise doit être celle accordée.
describe("goalRewardXp", () => {
    it("donne 10 XP par livre visé, plafonnés à 500", () => {
        expect(goalRewardXp(24)).toBe(240);
        expect(goalRewardXp(50)).toBe(500);
        expect(goalRewardXp(52)).toBe(500);
        expect(isGoalXpCapped(50)).toBe(false);
        expect(isGoalXpCapped(52)).toBe(true);
    });
});
