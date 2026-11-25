import { makeUser } from "../test/factories";
import { Roles } from "../types/types";
import { canViewLibrary } from "./visibility";

const owner = (isLibraryPublic: boolean) => ({ id: "owner", isLibraryPublic });

describe("canViewLibrary", () => {
    it("ouvre une bibliothèque partagée à tous, visiteurs compris", () => {
        expect(canViewLibrary(null, owner(true))).toBe(true);
        expect(canViewLibrary(makeUser("other"), owner(true))).toBe(true);
    });

    it("réserve une bibliothèque privée à son propriétaire et à l'admin", () => {
        expect(canViewLibrary(null, owner(false))).toBe(false);
        expect(canViewLibrary(makeUser("other"), owner(false))).toBe(false);
        expect(canViewLibrary(makeUser("owner"), owner(false))).toBe(true);
        expect(
            canViewLibrary(makeUser("admin", Roles.Admin), owner(false)),
        ).toBe(true);
    });
});
