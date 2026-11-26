import { ReadingGoal } from "../../../database/entities/gamification/reading-goal";
import { User } from "../../../database/entities/user/user";
import { makeContext, makeUser } from "../../../test/factories";
import { Roles } from "../../../types/types";
import { ReadingGoalResolver } from "./reading-goal-resolver";

jest.mock("../../../services/gamification/reading-goal-service", () => ({
    ...jest.requireActual(
        "../../../services/gamification/reading-goal-service",
    ),
    countBooksReadInYear: jest.fn().mockResolvedValue(3),
    checkReadingGoal: jest.fn().mockResolvedValue(false),
}));

const me = makeUser("me");

function owner(isLibraryPublic: boolean): User {
    const user = makeUser("other");
    user.isLibraryPublic = isLibraryPublic;
    return user;
}

function storedGoal(): ReadingGoal {
    const goal = new ReadingGoal();
    goal.year = 2026;
    goal.target = 12;
    return goal;
}

// Risque : le défi d'une bibliothèque privée fuit, ou un lecteur écrit le défi
// d'un autre.
describe("ReadingGoalResolver", () => {
    const resolver = new ReadingGoalResolver();

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("refuse un visiteur", async () => {
        await expect(
            resolver.readingGoal(makeContext(null)),
        ).rejects.toMatchObject({ statusCode: 401 });
        await expect(
            resolver.setReadingGoal({ target: 12 }, makeContext(null)),
        ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("renvoie sa propre progression", async () => {
        jest.spyOn(ReadingGoal, "findOne").mockResolvedValue(storedGoal());

        await expect(resolver.readingGoal(makeContext(me))).resolves.toEqual({
            year: 2026,
            target: 12,
            booksRead: 3,
            rewardXp: 120,
        });
    });

    it("masque le défi d'un lecteur dont la bibliothèque est privée", async () => {
        jest.spyOn(User, "findOne").mockResolvedValue(owner(false));
        const findGoal = jest.spyOn(ReadingGoal, "findOne");

        await expect(
            resolver.readingGoal(makeContext(me), "other"),
        ).resolves.toBeNull();
        expect(findGoal).not.toHaveBeenCalled();
    });

    it("montre le défi d'une bibliothèque partagée, et toujours à l'admin", async () => {
        jest.spyOn(ReadingGoal, "findOne").mockResolvedValue(storedGoal());

        jest.spyOn(User, "findOne").mockResolvedValue(owner(true));
        await expect(
            resolver.readingGoal(makeContext(me), "other"),
        ).resolves.toMatchObject({ target: 12 });

        jest.spyOn(User, "findOne").mockResolvedValue(owner(false));
        await expect(
            resolver.readingGoal(
                makeContext(makeUser("admin", Roles.Admin)),
                "other",
            ),
        ).resolves.toMatchObject({ target: 12 });
    });

    it("renvoie NOT_FOUND pour un lecteur inconnu", async () => {
        jest.spyOn(User, "findOne").mockResolvedValue(null);

        await expect(
            resolver.readingGoal(makeContext(me), "ghost"),
        ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("n'écrit que le défi de l'utilisateur connecté", async () => {
        const findOne = jest
            .spyOn(ReadingGoal, "findOne")
            .mockResolvedValue(null);
        const save = jest
            .spyOn(ReadingGoal.prototype, "save")
            .mockImplementation(async function (this: ReadingGoal) {
                return this;
            });

        const result = await resolver.setReadingGoal(
            { target: 12 },
            makeContext(me),
        );

        expect(findOne).toHaveBeenCalledWith({
            where: { user: { id: "me" }, year: expect.any(Number) },
        });
        expect(save).toHaveBeenCalledTimes(1);
        expect(save.mock.contexts[0]).toMatchObject({ user: me, target: 12 });
        expect(result).toMatchObject({ target: 12, booksRead: 3 });
    });
});
