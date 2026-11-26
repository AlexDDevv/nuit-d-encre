import { describe, expect, it } from "vitest";
import { goalRewardXp, isGoalXpCapped } from "./readingGoal";

// Risque : l'XP promise dans le formulaire diffère de celle accordée par
// reading-goal-service.ts (10 XP par livre visé, plafond 500).
describe("goalRewardXp", () => {
    it("donne 10 XP par livre visé, plafonnés à 500", () => {
        expect(goalRewardXp(24)).toBe(240);
        expect(goalRewardXp(50)).toBe(500);
        expect(goalRewardXp(52)).toBe(500);
        expect(isGoalXpCapped(50)).toBe(false);
        expect(isGoalXpCapped(52)).toBe(true);
    });
});
