import { IsOptional, IsString } from "class-validator"
import { Field, InputType } from "type-graphql"
import { PaginationInput } from "../shared/pagination-input"

/**
 * Represents the input parameters for querying all authors.
 * This input is used to filter, sort, and paginate all authors in the app collection.
 *
 * @description
 * This input type defines the filters, sorting, and pagination options
 * for retrieving a paginated list of authors.
 *
 * - `search`: filter authors by firstname and lastname.
 * - `page` / `limit`: hérités de `PaginationInput` (limit plafonné).
 *
 * All fields are optional, allowing flexible and partial filtering.
 * 
 * The decorators used are:
 * - `@Field({ nullable: true })`: exposes each property to the GraphQL schema as optional.
 * - `@IsOptional()`: marks each field as optional during validation (class-validator).
 */
@InputType()
export class AuthorsQueryInput extends PaginationInput {
	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	search?: string
}
