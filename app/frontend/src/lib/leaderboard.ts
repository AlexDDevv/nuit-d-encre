import { LeaderboardPeriod } from "@/types/types";

/** Rang en ordinal français abrégé : 1er, 2e, 73e. */
export function formatRank(rank: number): string {
    return rank === 1 ? "1er" : `${rank}e`;
}

/** « 1 240 XP ce mois-ci » / « 1 240 XP au total ». */
export function formatPeriodXp(xp: number, period: LeaderboardPeriod): string {
    const amount = `${xp.toLocaleString("fr-FR")} XP`;
    return period === "MONTH" ? `${amount} ce mois-ci` : `${amount} au total`;
}
