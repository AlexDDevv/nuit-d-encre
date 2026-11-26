import { LeaderboardEntry, LeaderboardPeriod } from "@/types/types";

/** Nombre de lignes affichées après le podium avant « Afficher les suivantes ». */
export const LEADERBOARD_ROWS_PREVIEW = 12;

/** Rang en ordinal français abrégé : 1er, 2e, 73e. */
export function formatRank(rank: number): string {
    return rank === 1 ? "1er" : `${rank}e`;
}

/** Rang découpé pour l'affichage en exposant : { num: "1", suffix: "er" }. */
export function rankParts(rank: number): { num: string; suffix: string } {
    return { num: String(rank), suffix: rank === 1 ? "er" : "e" };
}

/** « 1 240 » : séparateur de milliers à la française. */
export function formatXp(xp: number): string {
    return xp.toLocaleString("fr-FR");
}

/** « ce mois-ci » / « depuis l'inscription ». */
export function periodPhrase(period: LeaderboardPeriod): string {
    return period === "MONTH" ? "ce mois-ci" : "depuis l'inscription";
}

/** « 1 240 XP ce mois-ci » / « 1 240 XP depuis l'inscription ». */
export function formatPeriodXp(xp: number, period: LeaderboardPeriod): string {
    return `${formatXp(xp)} XP ${periodPhrase(period)}`;
}

/** Monogramme d'un pseudo : ses deux premières majuscules, sinon ses deux premières lettres. */
export function monogram(userName: string): string {
    const capitals = userName.match(/[A-ZÀ-Ý]/g) ?? [];
    const letters =
        capitals.length >= 2 ? capitals[0] + capitals[1] : userName.slice(0, 2);
    return letters.toUpperCase();
}

/** Rangs partagés par plusieurs lecteurs (ex æquo). */
export function tiedRanks(
    entries: Pick<LeaderboardEntry, "rank">[],
): Set<number> {
    const seen = new Set<number>();
    const tied = new Set<number>();
    for (const { rank } of entries) {
        if (seen.has(rank)) tied.add(rank);
        seen.add(rank);
    }
    return tied;
}

/** Pied de page : prochaine remise à zéro (mois) ou rappel du cumul. */
export function leaderboardFooter(
    period: LeaderboardPeriod,
    now: Date = new Date(),
): string {
    if (period === "ALL_TIME") {
        return "Le classement de toujours ne repart jamais de zéro.";
    }
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const days = Math.ceil((next.getTime() - now.getTime()) / 86_400_000);
    const month = next.toLocaleDateString("fr-FR", { month: "long" });
    return `Nouvelle joute le 1er ${month}${days <= 1 ? ", demain." : `, dans ${days} jours.`}`;
}
