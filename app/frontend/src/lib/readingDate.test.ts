import { describe, expect, it } from "vitest";
import { formatReadingDate, todayInputValue } from "./readingDate";

describe("dates de lecture", () => {
    it("formate la date du jour pour un champ date", () => {
        expect(todayInputValue(new Date(2026, 2, 5, 23, 59))).toBe(
            "2026-03-05",
        );
    });

    it("affiche une date AAAA-MM-JJ en toutes lettres, sans glisser d'un jour", () => {
        expect(formatReadingDate("2026-03-01")).toBe("1 mars 2026");
        expect(formatReadingDate("2026-12-31")).toBe("31 décembre 2026");
    });
});
