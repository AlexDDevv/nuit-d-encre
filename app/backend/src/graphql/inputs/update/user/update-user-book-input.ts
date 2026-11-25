/**
 * @packageDocumentation
 * @category GraphQL Inputs
 * @description
 * This module defines the GraphQL input type used to update a UserBook entry.
 * It supports partial updates of reading status, rating/review, recommendation,
 * reading dates, and visibility. The target entry can be identified by `id`
 * or, alternatively, by `bookId` (unique per user).
 */

import { Field, ID, InputType } from "type-graphql";
import { IsEnum, IsOptional, Validate, IsDate } from "class-validator";
import { ReadingStatus } from "../../../../types/types";
import { EndAfterStart } from "../../../helpers/endAfterStart";

/**
 * UpdateUserBookInput
 * @description
 * Represents the payload to update an existing user-book relationship.
 *
 * Identification:
 * - `id` (preferred) or `bookId` (unique per user). One of them is required.
 *
 * Updatable fields (all optional):
 * - `status`: reading status.
 * - `startedAt`: reading start date.
 * - `finishedAt`: reading finish date (must be >= startedAt if both provided).
 *
 * Notes:
 * - The user is inferred from the authenticated context on the server.
 * - If both `id` and `bookId` are provided, the resolver may prioritize `id`.
 *
 * @example
 * ```graphql
 * mutation UpdateEntry($input: UpdateUserBookInput!) {
 *   updateUserBook(input: $input) {
 *     id
 *     status
 *     rating
 *     review
 *     recommended
 *     startedAt
 *     finishedAt
 *   }
 * }
 *
 * # Variables
 * {
 *   "input": {
 *     "bookId": 42,
 *     "status": "PAUSED",
 *   }
 * }
 * ```
 */
@InputType()
export class UpdateUserBookInput {
    /** Target by UserBook primary key (preferred) */
    @Field(() => ID)
    id!: string;

    /** Reading status */
    @Field(() => ReadingStatus, { nullable: true })
    @IsOptional()
    @IsEnum(ReadingStatus)
    status?: ReadingStatus;

    /** Visibility flag (public/private) */

    /** Reading start date */
    @Field({ nullable: true })
    @IsOptional()
    @IsDate()
    startedAt?: Date;

    /** Reading finish date (>= startedAt) */
    @Field({ nullable: true })
    @IsOptional()
    @IsDate()
    @Validate(EndAfterStart)
    finishedAt?: Date;
}
