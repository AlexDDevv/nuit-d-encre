import { IsOptional, IsArray, IsString, MaxLength } from "class-validator";
import { Field, ID, InputType } from "type-graphql";
import { BookFormat } from "../../../types/types";
import { PaginationInput } from "../shared/pagination-input";

/**
 * Represents the input parameters for querying all books.
 * This input is used to filter, sort, and paginate all books in the app collection.
 *
 * @description
 * This input type defines the filters, sorting, and pagination options
 * for retrieving a paginated list of books.
 *
 * - `search`: filter books by keyword (matches the book title, isbn or author).
 * - `categoryIds`: filter books by one or more category IDs.
 * - `format`: filter books by their format
 * - `language`: filter books by their language
 * - `page` / `limit`: hérités de `PaginationInput` (limit plafonné).
 *
 * The decorators used are:
 * - `@Field({ nullable: true })`: exposes each property to the GraphQL schema as optional.
 * - `@IsOptional()`: marks each field as optional during validation (class-validator).
 */
@InputType()
export class BooksQueryInput extends PaginationInput {
    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    search?: string;

    @Field(() => [ID], { nullable: true })
    @IsOptional()
    @IsArray()
    categoryIds?: string[];

    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    format?: BookFormat[];

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    language?: string;
}
