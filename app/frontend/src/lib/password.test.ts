import { describe, expect, it } from "vitest";
import { isPasswordStrong } from "./password";

// Risque : le front accepte un mot de passe que le backend refuse (ou
// l'inverse) ; lib/password.ts doit rester le miroir de password-policy.ts.
describe("isPasswordStrong", () => {
    it("accepte un mot de passe respectant tous les critères", () => {
        expect(isPasswordStrong("Motdepasse1!")).toBe(true);
    });

    it.each([
        ["trop court", "Ab1!"],
        ["sans majuscule", "motdepasse1!"],
        ["sans minuscule", "MOTDEPASSE1!"],
        ["sans chiffre", "Motdepasse!"],
        ["sans symbole", "Motdepasse1"],
        ["trop long", `Ab1!${"a".repeat(252)}`],
    ])("refuse un mot de passe %s", (_label, value) => {
        expect(isPasswordStrong(value)).toBe(false);
    });

    it("ne compte pas une lettre accentuée comme symbole, comme le backend", () => {
        expect(isPasswordStrong("Motdepassé1")).toBe(false);
    });

    it.each(["-", "#", "£", "_", "\\", "/", " ", "`"])(
        "reconnaît « %s » comme symbole",
        (symbol) => {
            expect(isPasswordStrong(`Motdepasse1${symbol}`)).toBe(true);
        },
    );
});
