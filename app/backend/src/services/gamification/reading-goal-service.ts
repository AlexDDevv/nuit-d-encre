import { Between } from "typeorm";
import { ReadingGoal } from "../../database/entities/gamification/reading-goal";
import { User } from "../../database/entities/user/user";
import { UserBook } from "../../database/entities/user/user-book";
import { ReadingStatus, UserActionType } from "../../types/types";
import { parisYear } from "../../utils/paris-date";
import { xpKeys } from "../../utils/xp-keys";
import { grantXpService } from "../grind/grant-xp-service";

export const READING_GOAL_MAX_TARGET = 500;
const XP_PER_TARGET_BOOK = 10;
const MAX_GOAL_XP = 500;

/** XP du défi atteint : 10 par livre visé, plafonnée à 500. */
export function readingGoalXp(target: number): number {
    return Math.min(target * XP_PER_TARGET_BOOK, MAX_GOAL_XP);
}

/** Livres « lus » dont la date de fin tombe dans l'année. */
export function countBooksReadInYear(
    userId: string,
    year: number,
): Promise<number> {
    return UserBook.count({
        where: {
            user: { id: userId },
            status: ReadingStatus.READ,
            finishedAt: Between(`${year}-01-01`, `${year}-12-31`),
        },
    });
}

/**
 * Accorde l'XP du défi de l'année en cours s'il vient d'être atteint. Une
 * seule fois par année (`xpKeys.readingGoal`) : baisser puis remonter
 * l'objectif, ou repasser sous la barre, ne rapporte rien de plus.
 */
export async function checkReadingGoal(user: User): Promise<boolean> {
    const year = parisYear();
    const goal = await ReadingGoal.findOne({
        where: { user: { id: user.id }, year },
    });
    if (!goal) return false;

    const booksRead = await countBooksReadInYear(user.id, year);
    if (booksRead < goal.target) return false;

    return grantXpService(user, UserActionType.READING_GOAL_REACHED, {
        xpKey: xpKeys.readingGoal(year),
        xp: readingGoalXp(goal.target),
        targetId: goal.id,
        metadata: { year, target: goal.target },
    });
}
