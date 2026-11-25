import { IsInt, IsOptional, Max, Min } from "class-validator";
import { Field, InputType, Int } from "type-graphql";
import { MAX_PAGE_SIZE } from "../../../utils/pagination";

/**
 * Pagination commune : toute query de liste étend cette classe plutôt que de
 * redéclarer `page` / `limit`, pour hériter du plafond.
 */
@InputType()
export class PaginationInput {
    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(MAX_PAGE_SIZE)
    limit?: number;
}
