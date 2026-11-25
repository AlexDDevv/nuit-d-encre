import { BookReview } from "../../database/entities/book/bookReview";
import { BookRecommendation } from "../../database/entities/book/bookRecommendation";
import { BookReviewVote } from "../../database/entities/book/bookReviewVote";

/**
 * Re-mappe des lignes `{ key, value }` sur la liste de clés demandées,
 * en respectant l'ordre et en comblant les clés absentes par `fallback`.
 * (DataLoader exige un tableau aligné sur les clés en entrée.)
 */
export function mapRowsToKeys<K extends string | number, V>(
    keys: readonly K[],
    rows: { key: K; value: V }[],
    fallback: V,
): V[] {
    const byKey = new Map<K, V>(rows.map((r) => [r.key, r.value]));
    return keys.map((k) => byKey.get(k) ?? fallback);
}

export async function batchAverageRating(
    ids: readonly string[],
): Promise<(number | null)[]> {
    try {
        const raw = await BookReview.createQueryBuilder("review")
            .select("review.bookId", "bookId")
            .addSelect("AVG(review.rating)", "avg")
            .where("review.bookId IN (:...ids)", { ids })
            .groupBy("review.bookId")
            .getRawMany<{ bookId: string; avg: string }>();

        const rows = raw.map((r) => {
            const avg = Number(r.avg);
            return {
                key: r.bookId,
                value: Number.isFinite(avg) ? parseFloat(avg.toFixed(2)) : null,
            };
        });
        return mapRowsToKeys<string, number | null>(ids, rows, null);
    } catch (error) {
        // Dégradation gracieuse : un échec DB ne casse pas la requête
        // catalogue, la carte s'affiche sans note (comportement historique).
        console.error("Error batching average ratings:", error);
        return ids.map(() => null);
    }
}

export async function batchReviewCount(
    ids: readonly string[],
): Promise<number[]> {
    try {
        const raw = await BookReview.createQueryBuilder("review")
            .select("review.bookId", "bookId")
            .addSelect("COUNT(*)", "count")
            .where("review.bookId IN (:...ids)", { ids })
            .groupBy("review.bookId")
            .getRawMany<{ bookId: string; count: string }>();

        const rows = raw.map((r) => ({
            key: r.bookId,
            value: Number(r.count),
        }));
        return mapRowsToKeys<string, number>(ids, rows, 0);
    } catch (error) {
        console.error("Error batching review counts:", error);
        return ids.map(() => 0);
    }
}

export async function batchRecommendationCount(
    ids: readonly string[],
): Promise<number[]> {
    try {
        const raw = await BookRecommendation.createQueryBuilder("reco")
            .select("reco.bookId", "bookId")
            .addSelect("COUNT(*)", "count")
            .where("reco.bookId IN (:...ids)", { ids })
            .groupBy("reco.bookId")
            .getRawMany<{ bookId: string; count: string }>();

        const rows = raw.map((r) => ({
            key: r.bookId,
            value: Number(r.count),
        }));
        return mapRowsToKeys<string, number>(ids, rows, 0);
    } catch (error) {
        console.error("Error batching recommendation counts:", error);
        return ids.map(() => 0);
    }
}

/** Compteurs de votes d'une critique. */
export type ReviewVoteCounts = { helpful: number; notHelpful: number };

/**
 * Votes « utile » / « pas utile » par critique, en un GROUP BY pour toute la
 * page. Toujours à jour, y compris dans la réponse d'une mutation de vote
 * (la critique renvoyée n'a pas ses votes chargés).
 */
export async function batchReviewVoteCounts(
    reviewIds: readonly string[],
): Promise<ReviewVoteCounts[]> {
    const raw = await BookReviewVote.createQueryBuilder("vote")
        .select("vote.reviewId", "reviewId")
        .addSelect("COUNT(*) FILTER (WHERE vote.isHelpful)", "helpful")
        .addSelect("COUNT(*) FILTER (WHERE NOT vote.isHelpful)", "notHelpful")
        .where("vote.reviewId IN (:...reviewIds)", { reviewIds })
        .groupBy("vote.reviewId")
        .getRawMany<{
            reviewId: string;
            helpful: string;
            notHelpful: string;
        }>();

    const rows = raw.map((r) => ({
        key: r.reviewId,
        value: { helpful: Number(r.helpful), notHelpful: Number(r.notHelpful) },
    }));
    return mapRowsToKeys<string, ReviewVoteCounts>(reviewIds, rows, {
        helpful: 0,
        notHelpful: 0,
    });
}
