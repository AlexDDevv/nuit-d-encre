import { describe, expect, it } from "vitest";
import {
    formatPeriodXp,
    formatRank,
    leaderboardFooter,
    monogram,
    rankParts,
    tiedRanks,
} from "./leaderboard";

describe("formatRank", () => {
    it("écrit 1er pour la première place, puis Ne", () => {
        expect(formatRank(1)).toBe("1er");
        expect(formatRank(2)).toBe("2e");
        expect(formatRank(73)).toBe("73e");
        expect(rankParts(1)).toEqual({ num: "1", suffix: "er" });
        expect(rankParts(12)).toEqual({ num: "12", suffix: "e" });
    });
});

describe("formatPeriodXp", () => {
    it("précise la période", () => {
        expect(formatPeriodXp(40, "MONTH")).toBe("40 XP ce mois-ci");
        expect(formatPeriodXp(40, "ALL_TIME")).toBe(
            "40 XP depuis l'inscription",
        );
    });

    it("sépare les milliers à la française", () => {
        expect(formatPeriodXp(12400, "ALL_TIME")).toMatch(/^12\s400 XP/);
    });
});

describe("monogram", () => {
    it("prend les deux premières majuscules d'un pseudo composé", () => {
        expect(monogram("EliseLit")).toBe("EL");
        expect(monogram("MarcDesPages")).toBe("MD");
    });

    it("retombe sur les deux premières lettres", () => {
        expect(monogram("Insomniaque")).toBe("IN");
        expect(monogram("zoé")).toBe("ZO");
    });
});

describe("tiedRanks", () => {
    it("repère les rangs partagés", () => {
        const ranks = [1, 2, 2, 4, 5, 5, 5].map((rank) => ({ rank }));
        expect([...tiedRanks(ranks)]).toEqual([2, 5]);
    });
});

describe("leaderboardFooter", () => {
    it("annonce la prochaine remise à zéro mensuelle", () => {
        expect(leaderboardFooter("MONTH", new Date(2026, 10, 26, 12))).toBe(
            "Nouvelle joute le 1er décembre, dans 5 jours.",
        );
        expect(leaderboardFooter("MONTH", new Date(2026, 10, 30, 12))).toBe(
            "Nouvelle joute le 1er décembre, demain.",
        );
    });

    it("rappelle que le cumul ne repart jamais de zéro", () => {
        expect(leaderboardFooter("ALL_TIME")).toBe(
            "Le classement de toujours ne repart jamais de zéro.",
        );
    });
});
