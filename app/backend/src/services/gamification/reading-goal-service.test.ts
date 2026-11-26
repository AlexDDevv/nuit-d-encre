import { ReadingGoal } from "../../database/entities/gamification/reading-goal";
import { UserBook } from "../../database/entities/user/user-book";
import { makeUser } from "../../test/factories";
import { UserActionType } from "../../types/types";
import { parisYear } from "../../utils/paris-date";
import { grantXpService } from "../grind/grant-xp-service";
import { checkReadingGoal, readingGoalXp } from "./reading-goal-service";

jest.mock("../grind/grant-xp-service");

const grantXp = grantXpService as jest.Mock;
const user = makeUser("user-1");

function goal(target: number): ReadingGoal {
    const g = new ReadingGoal();
    g.id = "goal-1";
    g.year = parisYear();
    g.target = target;
    return g;
}

describe("readingGoalXp", () => {
    it("donne 10 XP par livre visé, plafonnés à 500", () => {
        expect(readingGoalXp(1)).toBe(10);
        expect(readingGoalXp(24)).toBe(240);
        expect(readingGoalXp(200)).toBe(500);
    });
});

describe("checkReadingGoal", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    it("n'accorde rien sans défi pour l'année", async () => {
        jest.spyOn(ReadingGoal, "findOne").mockResolvedValue(null);
        const count = jest.spyOn(UserBook, "count");

        await expect(checkReadingGoal(user)).resolves.toBe(false);
        expect(count).not.toHaveBeenCalled();
        expect(grantXp).not.toHaveBeenCalled();
    });

    it("n'accorde rien tant que l'objectif n'est pas atteint", async () => {
        jest.spyOn(ReadingGoal, "findOne").mockResolvedValue(goal(12));
        jest.spyOn(UserBook, "count").mockResolvedValue(11);

        await checkReadingGoal(user);
        expect(grantXp).not.toHaveBeenCalled();
    });

    it("récompense l'objectif atteint une fois par année", async () => {
        jest.spyOn(ReadingGoal, "findOne").mockResolvedValue(goal(12));
        jest.spyOn(UserBook, "count").mockResolvedValue(12);
        grantXp.mockResolvedValue(true);

        await expect(checkReadingGoal(user)).resolves.toBe(true);
        expect(grantXp).toHaveBeenCalledWith(
            user,
            UserActionType.READING_GOAL_REACHED,
            expect.objectContaining({
                xpKey: `reading-goal:${parisYear()}`,
                xp: 120,
            }),
        );
    });
});
