import { In } from "typeorm";
import { BookReview } from "../../database/entities/book/bookReview";
import { BookReviewVote } from "../../database/entities/book/bookReviewVote";
import { User } from "../../database/entities/user/user";
import { UserBook } from "../../database/entities/user/user-book";

type GetUser = () => Promise<User | null>;

/**
 * Vote de l'utilisateur courant sur chaque critique : true (utile), false
 * (pas utile), null (pas de vote, ou visiteur). Une requête pour toute la
 * page de critiques au lieu d'une requête réseau par critique.
 */
export function makeMyVoteBatch(getUser: GetUser) {
    return async (
        reviewIds: readonly string[],
    ): Promise<(boolean | null)[]> => {
        const user = await getUser();
        if (!user) return reviewIds.map(() => null);
        const votes = await BookReviewVote.find({
            where: {
                user: { id: user.id },
                review: { id: In([...reviewIds]) },
            },
            relations: { review: true },
        });
        const byReview = new Map(votes.map((v) => [v.review.id, v.isHelpful]));
        return reviewIds.map((id) => byReview.get(id) ?? null);
    };
}

/** Critique de l'utilisateur courant pour chaque livre (null si aucune). */
export function makeMyReviewBatch(getUser: GetUser) {
    return async (
        bookIds: readonly string[],
    ): Promise<(BookReview | null)[]> => {
        const user = await getUser();
        if (!user) return bookIds.map(() => null);
        const reviews = await BookReview.find({
            where: { user: { id: user.id }, book: { id: In([...bookIds]) } },
            relations: { book: true },
        });
        const byBook = new Map(reviews.map((r) => [r.book.id, r]));
        return bookIds.map((id) => byBook.get(id) ?? null);
    };
}

/** Entrée de bibliothèque de l'utilisateur courant pour chaque livre (null si absent). */
export function makeMyUserBookBatch(getUser: GetUser) {
    return async (bookIds: readonly string[]): Promise<(UserBook | null)[]> => {
        const user = await getUser();
        if (!user) return bookIds.map(() => null);
        const entries = await UserBook.find({
            where: { user: { id: user.id }, book: { id: In([...bookIds]) } },
            relations: { book: true },
        });
        const byBook = new Map(entries.map((e) => [e.book.id, e]));
        return bookIds.map((id) => byBook.get(id) ?? null);
    };
}
