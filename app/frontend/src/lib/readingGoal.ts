import { ReadingGoalChip, ReadingGoalProgress } from "@/types/types";

export const READING_GOAL_MAX_TARGET = 500;

// Miroir de reading-goal-service.ts (backend) : 10 XP par livre visé, plafond 500.
const XP_PER_TARGET_BOOK = 10;
const MAX_GOAL_XP = 500;

type GoalCount = Pick<ReadingGoalProgress, "booksRead" | "target">;

/** « livre » ou « livres » selon le nombre. */
export function booksWord(count: number): string {
    return count >= 2 ? "livres" : "livre";
}

/** XP qu'un objectif rapportera à l'arrivée (aperçu du formulaire). */
export function goalRewardXp(target: number): number {
    return Math.min(target * XP_PER_TARGET_BOOK, MAX_GOAL_XP);
}

/** L'XP d'un objectif de cette taille atteint-elle le plafond ? */
export function isGoalXpCapped(target: number): boolean {
    return target * XP_PER_TARGET_BOOK > MAX_GOAL_XP;
}

/** Avancement du défi, borné à 100 % (on peut dépasser son objectif). */
export function goalRatio(goal: GoalCount): number {
    if (goal.target <= 0) return 0;
    return Math.min(goal.booksRead / goal.target, 1);
}

/** Sous-titre de la carte, du point de vue du lecteur ou d'un visiteur. */
export function goalSubtitle(
    goal: ReadingGoalProgress,
    visitorOf?: string,
): string {
    const { booksRead, target, year } = goal;
    if (visitorOf) {
        return `${visitorOf} a lu ${booksRead} ${booksWord(booksRead)} sur ${target}`;
    }
    if (booksRead > target) return "Serment tenu, et au-delà";
    if (booksRead === target) return "Serment tenu";
    if (booksRead === 0) {
        return `Le serment est prêté : ${target} ${booksWord(target)} en ${year}`;
    }
    return `Le serment de ${year} : ${target} ${booksWord(target)}`;
}

/** Phrase d'avancement : reste à lire, objectif atteint ou dépassé. */
export function goalTagline(
    goal: ReadingGoalProgress,
    visitorOf?: string,
): string {
    const { booksRead, target, year } = goal;
    const left = target - booksRead;
    const extra = -left;

    if (visitorOf) {
        if (extra > 0) {
            return `Serment tenu, et ${extra} ${booksWord(extra)} de plus.`;
        }
        if (left === 0) return `${visitorOf} a tenu son serment de ${year}.`;
        if (booksRead === 0) {
            return "Son serment vient d'être prêté ; la première page reste à tourner.";
        }
        return `Encore ${left} ${booksWord(left)} pour tenir son serment.`;
    }
    if (extra > 0) {
        return `${target} livres promis, ${booksRead} lus : la parole est tenue, et la lecture continue.`;
    }
    if (left === 0) {
        return `${target} ${booksWord(target)} lus en ${year}. Vous avez tenu parole, page après page.`;
    }
    if (booksRead === 0) {
        return `La première page reste à tourner. Dès votre premier livre lu et daté en ${year}, la jauge s'éclairera.`;
    }
    return `Encore ${left} ${booksWord(left)} à lire pour tenir votre serment.`;
}

/** Pastille d'état de l'en-tête. */
export function goalChip(goal: GoalCount): ReadingGoalChip {
    if (goal.booksRead > goal.target) {
        return { label: "Au-delà du serment", tone: "done" };
    }
    if (goal.booksRead === goal.target) {
        return { label: "Serment tenu", tone: "done" };
    }
    if (goal.booksRead === 0) {
        return { label: "Tout juste lancé", tone: "deep" };
    }
    return { label: "En cours", tone: "deep" };
}

/** Aperçu, en modification, de ce que donnerait le nouvel objectif. */
export function goalDraftPreview(goal: GoalCount, draft: number): string {
    if (!Number.isInteger(draft) || draft < 1) {
        return "Indiquez un objectif pour voir la jauge.";
    }
    if (draft === goal.target) {
        const left = Math.max(0, goal.target - goal.booksRead);
        return `Objectif inchangé : encore ${left} ${booksWord(left)} à lire.`;
    }
    if (goal.booksRead >= draft) {
        return `Avec ${draft}, l'objectif serait déjà atteint.`;
    }
    const left = draft - goal.booksRead;
    return `Avec ${draft} : encore ${left} ${booksWord(left)} à lire.`;
}
