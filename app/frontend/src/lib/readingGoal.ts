import { ReadingGoalProgress } from "@/types/types";

export const READING_GOAL_MAX_TARGET = 500;

/** Avancement du défi, borné à 100 % (on peut dépasser son objectif). */
export function goalRatio(
    goal: Pick<ReadingGoalProgress, "booksRead" | "target">,
): number {
    if (goal.target <= 0) return 0;
    return Math.min(goal.booksRead / goal.target, 1);
}

/** Phrase d'avancement : reste à lire, objectif atteint ou dépassé. */
export function goalStatusLabel(goal: ReadingGoalProgress): string {
    const left = goal.target - goal.booksRead;
    if (left > 0) {
        return `Encore ${left} livre${left > 1 ? "s" : ""} pour relever le défi`;
    }
    const extra = -left;
    return extra > 0
        ? `Défi relevé, et ${extra} livre${extra > 1 ? "s" : ""} de plus`
        : "Défi relevé";
}
