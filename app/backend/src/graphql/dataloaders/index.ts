import DataLoader from "dataloader";
import { User } from "../../database/entities/user/user";
import { Title } from "../../database/entities/gamification/title";
import {
    batchAverageRating,
    batchReviewCount,
    batchRecommendationCount,
    batchReviewVoteCounts,
    ReviewVoteCounts,
} from "./book-aggregate-loaders";
import { batchTitles } from "./title-loader";
import { makeMyReviewBatch, makeMyVoteBatch } from "./viewer-review-loaders";
import { BookReview } from "../../database/entities/book/bookReview";
import {
    makeUserFlagBatch,
    reviewedBookIds,
    recommendedBookIds,
    libraryBookIds,
} from "./user-book-flag-loaders";
import {
    batchFollowerCount,
    batchFollowingCount,
    makeIsFollowedByMeBatch,
} from "./follow-loaders";

export type Loaders = {
    averageRating: DataLoader<string, number | null>;
    reviewCount: DataLoader<string, number>;
    recommendationCount: DataLoader<string, number>;
    title: DataLoader<number, Title | null>;
    hasUserReviewed: DataLoader<string, boolean>;
    hasUserRecommended: DataLoader<string, boolean>;
    isInLibrary: DataLoader<string, boolean>;
    followerCount: DataLoader<string, number>;
    followingCount: DataLoader<string, number>;
    isFollowedByMe: DataLoader<string, boolean>;
    myVote: DataLoader<string, boolean | null>;
    reviewVoteCounts: DataLoader<string, ReviewVoteCounts>;
    myReview: DataLoader<string, BookReview | null>;
};

/**
 * Construit un jeu de DataLoaders neuf pour UNE requête HTTP.
 * Ne jamais partager entre requêtes : le cache par-loader mélangerait
 * les données entre utilisateurs.
 *
 * @param getUser - résolution mémoïsée (lazy) de l'utilisateur courant.
 */
export function createLoaders(getUser: () => Promise<User | null>): Loaders {
    return {
        averageRating: new DataLoader((ids) => batchAverageRating(ids)),
        reviewCount: new DataLoader((ids) => batchReviewCount(ids)),
        recommendationCount: new DataLoader((ids) =>
            batchRecommendationCount(ids),
        ),
        title: new DataLoader((levels) => batchTitles(levels)),
        hasUserReviewed: new DataLoader(
            makeUserFlagBatch(reviewedBookIds, getUser),
        ),
        hasUserRecommended: new DataLoader(
            makeUserFlagBatch(recommendedBookIds, getUser),
        ),
        isInLibrary: new DataLoader(makeUserFlagBatch(libraryBookIds, getUser)),
        followerCount: new DataLoader((ids) => batchFollowerCount(ids)),
        followingCount: new DataLoader((ids) => batchFollowingCount(ids)),
        isFollowedByMe: new DataLoader(makeIsFollowedByMeBatch(getUser)),
        myVote: new DataLoader(makeMyVoteBatch(getUser)),
        reviewVoteCounts: new DataLoader((ids) => batchReviewVoteCounts(ids)),
        myReview: new DataLoader(makeMyReviewBatch(getUser)),
    };
}
