import { clampPagination, MAX_PAGE_SIZE } from "./pagination";

// Risque : une liste publique renvoie une page non bornée.
describe("clampPagination", () => {
    it("laisse passer des valeurs valides", () => {
        expect(clampPagination(2, 10)).toEqual({ page: 2, limit: 10 });
    });

    it("plafonne la taille de page", () => {
        expect(clampPagination(1, 100000).limit).toBe(MAX_PAGE_SIZE);
    });

    it("ramène les valeurs nulles ou négatives à 1", () => {
        expect(clampPagination(0, 0)).toEqual({ page: 1, limit: 1 });
        expect(clampPagination(-3, -5)).toEqual({ page: 1, limit: 1 });
    });
});
