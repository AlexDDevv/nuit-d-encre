import { describe, expect, it } from "vitest";
import { leaderboardFooter, tiedRanks } from "./leaderboard";

// Risque : des ex æquo ne sont pas signalés comme tels sur le podium.
describe("tiedRanks", () => {
    it("repère les rangs partagés", () => {
        const ranks = [1, 2, 2, 4, 5, 5, 5].map((rank) => ({ rank }));
        expect([...tiedRanks(ranks)]).toEqual([2, 5]);
    });
});

// Risque : le compte à rebours vers la remise à zéro mensuelle se décale d'un
// jour en fin de mois.
describe("leaderboardFooter", () => {
    it("annonce la prochaine remise à zéro mensuelle", () => {
        expect(leaderboardFooter("MONTH", new Date(2026, 10, 26, 12))).toBe(
            "Nouvelle joute le 1er décembre, dans 5 jours.",
        );
        expect(leaderboardFooter("MONTH", new Date(2026, 10, 30, 12))).toBe(
            "Nouvelle joute le 1er décembre, demain.",
        );
    });
});
