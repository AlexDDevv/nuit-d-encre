import { describe, expect, it } from "vitest";
import { formatPeriodXp, formatRank } from "./leaderboard";

describe("formatRank", () => {
    it("écrit 1er pour la première place, puis Ne", () => {
        expect(formatRank(1)).toBe("1er");
        expect(formatRank(2)).toBe("2e");
        expect(formatRank(73)).toBe("73e");
    });
});

describe("formatPeriodXp", () => {
    it("précise la période", () => {
        expect(formatPeriodXp(40, "MONTH")).toBe("40 XP ce mois-ci");
        expect(formatPeriodXp(40, "ALL_TIME")).toBe("40 XP au total");
    });

    it("sépare les milliers à la française", () => {
        expect(formatPeriodXp(12400, "ALL_TIME")).toMatch(/^12\s400 XP/);
    });
});
