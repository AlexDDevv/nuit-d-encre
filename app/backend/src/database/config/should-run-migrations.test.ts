import { shouldRunMigrations } from "./should-run-migrations";

// Risque : les migrations ne tournent pas au boot en prod, ou ne peuvent plus
// être désactivées.
describe("shouldRunMigrations", () => {
    it("active par défaut quand la variable est absente", () => {
        expect(shouldRunMigrations(undefined)).toBe(true);
    });

    it('active pour toute valeur autre que "false"', () => {
        expect(shouldRunMigrations("true")).toBe(true);
        expect(shouldRunMigrations("")).toBe(true);
        expect(shouldRunMigrations("1")).toBe(true);
    });

    it('désactive uniquement pour la valeur exacte "false"', () => {
        expect(shouldRunMigrations("false")).toBe(false);
    });
});
