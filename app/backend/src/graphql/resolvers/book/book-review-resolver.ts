/**
 * @packageDocumentation
 * @category Resolvers
 * @description
 * This module provides GraphQL resolvers for book review operations.
 * It handles review creation, retrieval, update, and deletion.
 */

import {
    Arg,
    Authorized,
    Ctx,
    FieldResolver,
    ID,
    Int,
    Mutation,
    Query,
    Resolver,
    Root,
} from "type-graphql";
import { AppError } from "../../../middlewares/error-handler";
import {
    BookReviewSortBy,
    Context,
    UserActionType,
} from "../../../types/types";
import { Book } from "../../../database/entities/book/book";
import { grantXpService } from "../../../services/grind/grant-xp-service";
import { xpKeys } from "../../../utils/xp-keys";
import { clampPagination } from "../../../utils/pagination";
import { isOwnerOrAdmin } from "../../../utils/authorizations";
import { BookReview } from "../../../database/entities/book/bookReview";
import { BookReviewsResult } from "../../../database/filteredResults/books/book-reviews-result";
import { CreateBookReviewInput } from "../../inputs/create/book/create-book-review-input";
import { UpdateBookReviewInput } from "../../inputs/update/book/update-book-review-input";
import { requireUser } from "../../../utils/current-user";

/**
 * BookReview Resolver
 * @description
 * Handles all book review-related GraphQL mutations and queries.
 *
 * Reviews are comprehensive user assessments of books, consisting of a
 * numerical rating and optional text critique. Each user can write only
 * one review per book.
 */
@Resolver(BookReview)
export class BookReviewsResolver {
    /**
     * Query to get a specific review by its ID.
     *
     * @description
     * Retrieves a single review with all its relationships loaded.
     *
     * @param id - The ID of the review to fetch.
     *
     * @returns A BookReview object if found, null otherwise.
     *
     * @example
     * ```graphql
     * query {
     *   bookReview(id: "<uuid>") {
     *     rating
     *     reviewText
     *     user { userName }
     *     book { title }
     *   }
     * }
     * ```
     *
     * @throws AppError - If the review is not found or query fails.
     */
    @Query(() => BookReview, { nullable: true })
    async bookReview(
        @Arg("id", () => ID) id: string,
    ): Promise<BookReview | null> {
        const review = await BookReview.findOne({
            where: { id },
            relations: {
                user: true,
                book: true,
                comments: true,
            },
            // Chronological comments (spec §1, decision 1).
            order: {
                comments: {
                    createdAt: "ASC",
                },
            },
        });

        if (!review) {
            throw new AppError("Review not found", 404, "NotFoundError");
        }

        return review;
    }

    /**
     * Query to get all reviews for a specific book.
     *
     * @description
     * Retrieves all reviews for a given book with pagination and sorting support.
     * By default, sorts by most recent reviews first.
     *
     * @param bookId - The ID of the book to fetch reviews for.
     * @param page - Page number for pagination (default: 1).
     * @param limit - Number of reviews per page (default: 10).
     * @param sortBy - Sort order: "recent" (newest first), "oldest", "rating_high", "rating_low", "helpful" (default: "recent").
     *
     * @returns An object containing reviews and pagination metadata.
     *
     * @example
     * ```graphql
     * query {
     *   bookReviews(bookId: "<uuid>", page: 1, limit: 10, sortBy: "helpful") {
     *     reviews {
     *       rating
     *       reviewText
     *       user { userName }
     *       helpfulCount
     *     }
     *     totalCount
     *     page
     *     limit
     *   }
     * }
     * ```
     *
     * @throws AppError - If the book is not found or query fails.
     */
    @Query(() => BookReviewsResult)
    async bookReviews(
        @Arg("bookId", () => ID) bookId: string,
        @Arg("page", () => Int, { defaultValue: 1 }) page: number,
        @Arg("limit", () => Int, { defaultValue: 10 }) limit: number,
        @Arg("sortBy", () => BookReviewSortBy, {
            defaultValue: BookReviewSortBy.RECENT,
        })
        sortBy: BookReviewSortBy,
    ): Promise<BookReviewsResult> {
        ({ page, limit } = clampPagination(page, limit));
        // Verify book exists
        const book = await Book.findOne({ where: { id: bookId } });
        if (!book) {
            throw new AppError("Book not found", 404, "NotFoundError");
        }

        const totalCount = await BookReview.count({
            where: { book: { id: bookId } },
        });

        let reviews: BookReview[];

        if (sortBy === BookReviewSortBy.HELPFUL) {
            const rawIds = await BookReview.createQueryBuilder("review")
                .select("review.id", "id")
                .addSelect(
                    `(SELECT COUNT(*) FROM "book_review_vote" "bv" WHERE "bv"."reviewId" = "review"."id" AND "bv"."isHelpful" = true)`,
                    "helpfulCount",
                )
                .where("review.bookId = :bookId", { bookId })
                .orderBy('"helpfulCount"', "DESC")
                .addOrderBy("review.createdAt", "DESC")
                .limit(limit)
                .offset((page - 1) * limit)
                .getRawMany();

            const ids: string[] = rawIds.map((r: any) => String(r.id));

            // Step 2 - fetch full entities for those IDs (no skip/take = no DISTINCT pagination).
            if (ids.length === 0) {
                reviews = [];
            } else {
                const reviewsData = await BookReview.createQueryBuilder(
                    "review",
                )
                    .leftJoinAndSelect("review.user", "user")
                    .leftJoinAndSelect("review.comments", "comments")
                    .whereInIds(ids)
                    .addOrderBy("comments.createdAt", "ASC")
                    .getMany();

                // Restore the sorted order from step 1.
                reviews = ids
                    .map((id) => reviewsData.find((r) => r.id === id)!)
                    .filter(Boolean);
            }
        } else {
            const query = BookReview.createQueryBuilder("review")
                .leftJoinAndSelect("review.user", "user")
                .leftJoinAndSelect("review.comments", "comments")
                .where("review.bookId = :bookId", { bookId });

            switch (sortBy) {
                case BookReviewSortBy.OLDEST:
                    query.orderBy("review.createdAt", "ASC");
                    break;
                case BookReviewSortBy.RATING_HIGH:
                    query.orderBy("review.rating", "DESC");
                    break;
                case BookReviewSortBy.RATING_LOW:
                    query.orderBy("review.rating", "ASC");
                    break;
                case BookReviewSortBy.RECENT:
                default:
                    query.orderBy("review.createdAt", "DESC");
                    break;
            }

            // Chronological comments (spec §1, decision 1) — appended after
            // the review-level orderBy so it does not affect review sorting.
            query.addOrderBy("comments.createdAt", "ASC");

            query.skip((page - 1) * limit).take(limit);
            reviews = await query.getMany();
        }

        return { reviews, totalCount, page, limit };
    }

    /**
     * Mutation to create a new book review.
     *
     * @description
     * Creates a new review for a book. Each user can only write one review per book.
     * Awards XP to the user, with bonus XP for detailed reviews (>200 characters).
     *
     * @param data - The input data containing book ID, rating, and optional review text.
     * @param context - GraphQL context containing the authenticated user.
     *
     * @returns The newly created BookReview object.
     *
     * @example
     * ```graphql
     * mutation {
     *   createBookReview(data: {
     *     bookId: "<uuid>"
     *     rating: 5
     *     reviewText: "A masterpiece of modern literature..."
     *   }) {
     *     id
     *     rating
     *     reviewText
     *     user { userName }
     *   }
     * }
     * ```
     *
     * @throws AppError - If user not found, book not found, review already exists, or creation fails.
     */
    @Authorized()
    @Mutation(() => BookReview)
    async createBookReview(
        @Arg("data", () => CreateBookReviewInput) data: CreateBookReviewInput,
        @Ctx() context: Context,
    ): Promise<BookReview> {
        const user = await requireUser(context);

        // Check if book exists
        const book = await Book.findOne({
            where: { id: data.bookId },
        });

        if (!book) {
            throw new AppError("Book not found", 404, "NotFoundError");
        }

        // Check if user has already reviewed this book
        const existingReview = await BookReview.findOne({
            where: {
                user: { id: user.id },
                book: { id: book.id },
            },
        });

        if (existingReview) {
            throw new AppError(
                "You have already reviewed this book. Use updateBookReview to modify your review.",
                409,
                "ConflictError",
            );
        }

        // Create new review
        const newReview = new BookReview();
        newReview.rating = data.rating;
        newReview.reviewText = data.reviewText;
        newReview.user = user;
        newReview.book = book;

        await newReview.save();

        // Grant XP for writing a review
        await grantXpService(user, UserActionType.REVIEW_CREATED, {
            xpKey: xpKeys.book(book.id),
            targetId: newReview.id,
            metadata: {
                bookTitle: book.title,
                rating: data.rating,
            },
        });

        // Bonus XP for detailed reviews (>200 characters)
        if (data.reviewText && data.reviewText.length > 200) {
            await grantXpService(user, UserActionType.DETAILED_REVIEW_BONUS, {
                xpKey: xpKeys.book(book.id),
                targetId: newReview.id,
                metadata: {
                    bookTitle: book.title,
                    textLength: data.reviewText.length,
                },
            });
        }

        return newReview;
    }

    /**
     * Mutation to update an existing book review.
     *
     * @description
     * Updates a review's rating and/or text. Only the review's author can update it.
     * Partial updates are supported (can update just rating or just text).
     *
     * @param data - The input data containing review ID and fields to update.
     * @param context - GraphQL context containing the authenticated user.
     *
     * @returns The updated BookReview object.
     *
     * @example
     * ```graphql
     * mutation {
     *   updateBookReview(data: {
     *     id: "<uuid>"
     *     rating: 4
     *     reviewText: "Revised my opinion after re-reading..."
     *   }) {
     *     id
     *     rating
     *     reviewText
     *     updatedAt
     *   }
     * }
     * ```
     *
     * @throws AppError - If review not found, user unauthorized, or update fails.
     */
    @Authorized()
    @Mutation(() => BookReview)
    async updateBookReview(
        @Arg("data", () => UpdateBookReviewInput) data: UpdateBookReviewInput,
        @Ctx() context: Context,
    ): Promise<BookReview> {
        const user = await requireUser(context);

        const review = await BookReview.findOne({
            where: { id: data.id },
            relations: {
                user: true,
                book: true,
            },
        });

        if (!review) {
            throw new AppError("Review not found", 404, "NotFoundError");
        }

        // Check authorization
        if (!isOwnerOrAdmin(review.user?.id ?? "", user)) {
            throw new AppError(
                "Not authorized to update this review",
                403,
                "ForbiddenError",
            );
        }

        // Update fields if provided
        if (data.rating !== undefined) {
            review.rating = data.rating;
        }

        if (data.reviewText !== undefined) {
            review.reviewText = data.reviewText;
        }

        await review.save();

        return review;
    }

    /**
     * Mutation to delete a book review.
     *
     * @description
     * Permanently deletes a review. Only the review's author or an admin can delete it.
     *
     * @param id - The ID of the review to delete.
     * @param context - GraphQL context containing the authenticated user.
     *
     * @returns The deleted BookReview object (with ID preserved).
     *
     * @example
     * ```graphql
     * mutation {
     *   deleteBookReview(id: "<uuid>") {
     *     id
     *     book { title }
     *   }
     * }
     * ```
     *
     * @throws AppError - If review not found, user unauthorized, or deletion fails.
     */
    @Authorized()
    @Mutation(() => BookReview)
    async deleteBookReview(
        @Arg("id", () => ID) id: string,
        @Ctx() context: Context,
    ): Promise<BookReview> {
        const user = await requireUser(context);

        const review = await BookReview.findOne({
            where: { id },
            relations: {
                user: true,
                book: true,
            },
        });

        if (!review) {
            throw new AppError("Review not found", 404, "NotFoundError");
        }

        // Check authorization
        if (!isOwnerOrAdmin(review.user?.id ?? "", user)) {
            throw new AppError(
                "Not authorized to delete this review",
                403,
                "ForbiddenError",
            );
        }

        const reviewId = review.id;
        await review.remove();
        review.id = reviewId;

        return review;
    }

    /* ========================================================================
     * FIELD RESOLVERS - Computed fields for BookReview entity
     * ======================================================================== */

    /**
     * Field Resolver: Count of helpful votes
     *
     * @description
     * Counts how many users found this review helpful.
     *
     * @param review - The parent BookReview object.
     *
     * @returns Number of "helpful" votes.
     *
     * @example
     * ```graphql
     * query {
     *   bookReview(id: "<uuid>") {
     *     reviewText
     *     helpfulCount
     *   }
     * }
     * ```
     */
    @FieldResolver(() => Int)
    async helpfulCount(
        @Root() review: BookReview,
        @Ctx() context: Context,
    ): Promise<number> {
        return (await context.loaders.reviewVoteCounts.load(review.id)).helpful;
    }

    /**
     * Field Resolver: Count of not helpful votes
     *
     * @description
     * Counts how many users found this review not helpful.
     *
     * @param review - The parent BookReview object.
     *
     * @returns Number of "not helpful" votes.
     *
     * @example
     * ```graphql
     * query {
     *   bookReview(id: "<uuid>") {
     *     reviewText
     *     notHelpfulCount
     *   }
     * }
     * ```
     */
    @FieldResolver(() => Int)
    async notHelpfulCount(
        @Root() review: BookReview,
        @Ctx() context: Context,
    ): Promise<number> {
        return (await context.loaders.reviewVoteCounts.load(review.id))
            .notHelpful;
    }

    /**
     * Field Resolver: Count of comments
     *
     * @description
     * Counts how many comments have been posted on this review.
     *
     * @param review - The parent BookReview object.
     *
     * @returns Number of comments.
     *
     * @example
     * ```graphql
     * query {
     *   bookReview(id: "<uuid>") {
     *     reviewText
     *     commentCount
     *   }
     * }
     * ```
     */
    @FieldResolver(() => Int)
    commentCount(@Root() review: BookReview): number {
        return review.comments?.length ?? 0;
    }

    /**
     * Vote de l'utilisateur courant sur cette critique : true (utile), false
     * (pas utile), null sinon. Évite une requête par critique côté front.
     */
    @FieldResolver(() => Boolean, { nullable: true })
    myVote(
        @Root() review: BookReview,
        @Ctx() context: Context,
    ): Promise<boolean | null> {
        return context.loaders.myVote.load(review.id);
    }
}
