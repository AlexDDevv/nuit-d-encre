/**
 * @packageDocumentation
 * @category Resolvers
 * @description
 * This module provides GraphQL resolvers for book recommendation operations.
 * It handles creating and removing recommendations in a toggle fashion.
 */

import { Arg, Authorized, Ctx, Mutation, Resolver } from "type-graphql";
import { AppError } from "../../../middlewares/error-handler";
import { Context, UserActionType } from "../../../types/types";
import { Book } from "../../../database/entities/book/book";
import { grantXpService } from "../../../services/grind/grant-xp-service";
import { xpKeys } from "../../../utils/xp-keys";
import { BookRecommendation } from "../../../database/entities/book/bookRecommendation";
import { CreateBookRecommendationInput } from "../../inputs/create/book/create-book-recommendation-input";
import { BookRecommendationToggleResult } from "../../../database/filteredResults/books/book-recommendation-result";
import { requireUser } from "../../../utils/current-user";

/**
 * BookRecommendation Resolver
 * @description
 * Handles all book recommendation-related GraphQL mutations and queries.
 *
 * Recommendations are lightweight endorsements that users can toggle on/off.
 * Unlike reviews, they contain no text or rating - just a simple "I recommend this book".
 */
@Resolver(BookRecommendation)
export class BookRecommendationsResolver {
    /**
     * Mutation to toggle a book recommendation.
     *
     * @description
     * This is the primary way to manage recommendations. It works as a toggle:
     * - If the user hasn't recommended the book → creates a new recommendation
     * - If the user has already recommended it → removes the recommendation
     *
     * This approach is more user-friendly than separate create/delete mutations
     * as it simplifies the frontend logic (one button that toggles state).
     *
     * @param data - Input containing the book ID to recommend.
     * @param context - GraphQL context containing the authenticated user.
     *
     * @returns An object with:
     * - `recommendation`: The BookRecommendation object (null if removed)
     * - `action`: "created" or "removed" to indicate what happened
     *
     * @example
     * ```graphql
     * mutation {
     *   toggleBookRecommendation(data: { bookId: "<uuid>" }) {
     *     recommendation {
     *       id
     *       book { title }
     *     }
     *     action
     *   }
     * }
     * ```
     *
     * @throws AppError - If user is not found, book doesn't exist, or operation fails.
     */
    @Authorized()
    @Mutation(() => BookRecommendationToggleResult)
    async toggleBookRecommendation(
        @Arg("data", () => CreateBookRecommendationInput)
        data: CreateBookRecommendationInput,
        @Ctx() context: Context,
    ): Promise<BookRecommendationToggleResult> {
        const user = await requireUser(context);

        // Check if book exists
        const book = await Book.findOne({
            where: { id: data.bookId },
        });

        if (!book) {
            throw new AppError("Book not found", 404, "NotFoundError");
        }

        // Check if recommendation already exists
        const existingRecommendation = await BookRecommendation.findOne({
            where: {
                user: { id: user.id },
                book: { id: book.id },
            },
            relations: {
                user: true,
                book: true,
            },
        });

        // If exists, remove it
        if (existingRecommendation) {
            await existingRecommendation.remove();

            return {
                recommendation: null,
                action: "removed",
            };
        }

        // Otherwise, create new recommendation
        const newRecommendation = new BookRecommendation();
        newRecommendation.user = user;
        newRecommendation.book = book;

        await newRecommendation.save();

        // Grant XP for recommending a book
        await grantXpService(user, UserActionType.BOOK_RECOMMENDED, {
            xpKey: xpKeys.book(book.id),
            targetId: book.id,
            metadata: { title: book.title },
        });

        return {
            recommendation: newRecommendation,
            action: "created",
        };
    }
}
