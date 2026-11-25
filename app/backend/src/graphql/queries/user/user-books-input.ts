/**
 * @packageDocumentation
 * @category GraphQL Inputs
 * @description
 * Input used to query the authenticated user's library (UserBook entries),
 * extending the generic book query filters with UserBook-specific filters.
 */

import { Field, InputType } from "type-graphql";
import { IsOptional, IsEnum } from "class-validator";
import { BooksQueryInput } from "../books/books-query-input";
import { ReadingStatus } from "../../../types/types";

/**
 * UserLibraryQueryInput
 * @description
 * Extends base book filters with user-specific flags:
 * - `status`: filter by reading status (UserBook).
 */
@InputType()
export class UserBooksQueryInput extends BooksQueryInput {
    @Field(() => [ReadingStatus], { nullable: true })
    @IsOptional()
    @IsEnum(ReadingStatus, { each: true })
    status?: ReadingStatus[];
}
