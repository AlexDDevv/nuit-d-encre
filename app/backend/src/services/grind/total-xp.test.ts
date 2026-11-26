import { totalXp } from "./total-xp";
import { addUserXP } from "./user-xp-service";

// Risque : le classement « depuis toujours » perd ou invente de l'XP lors des
// passages de niveau.
describe("totalXp", () => {
    it("vaut l'XP du niveau au niveau 1", () => {
        expect(totalXp(1, 40)).toBe(40);
    });

    it("retrouve toute l'XP accordée, quel que soit le découpage des gains", () => {
        const gains = [50, 70, 100, 30, 150, 50, 300, 1000, 70, 30];
        let state = { xp: 0, level: 1 };
        let granted = 0;
        for (const gain of gains) {
            const { newXP, newLevel } = addUserXP(state.xp, state.level, gain);
            state = { xp: newXP, level: newLevel };
            granted += gain;
            expect(totalXp(state.level, state.xp)).toBe(granted);
        }
        expect(state.level).toBeGreaterThan(5);
    });
});
