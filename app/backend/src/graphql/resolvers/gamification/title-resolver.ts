import { Authorized, Query, Resolver } from "type-graphql";
import { Title } from "../../../database/entities/gamification/title";
import { Roles } from "../../../types/types";

@Resolver(Title)
export class TitleResolver {
    @Authorized(Roles.Admin)
    @Query(() => [Title])
    async getTitles(): Promise<Title[]> {
        return Title.find({ order: { minLevel: "ASC" } });
    }
}
