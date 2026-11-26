import { parisToday, parisYear } from "./paris-date";

describe("dates à l'heure de Paris", () => {
    it("formate la date du jour en AAAA-MM-JJ", () => {
        expect(parisToday(new Date("2026-03-12T10:00:00Z"))).toBe("2026-03-12");
    });

    it("bascule d'année à minuit à Paris, pas en UTC", () => {
        // 23 h 30 UTC le 31 décembre = 0 h 30 à Paris le 1er janvier.
        const now = new Date("2026-12-31T23:30:00Z");
        expect(parisToday(now)).toBe("2027-01-01");
        expect(parisYear(now)).toBe(2027);
    });
});
