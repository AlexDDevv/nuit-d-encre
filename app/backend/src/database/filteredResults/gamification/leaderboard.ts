import { Field, Int, ObjectType } from "type-graphql";
import { User } from "../../entities/user/user";

/** Rang et XP d'un lecteur sur la période ; ex æquo au même rang. */
@ObjectType()
export class LeaderboardStanding {
    @Field(() => Int)
    rank!: number;

    @Field(() => Int)
    xp!: number;
}

@ObjectType()
export class LeaderboardEntry extends LeaderboardStanding {
    @Field(() => User)
    user!: User;
}

@ObjectType()
export class Leaderboard {
    @Field(() => [LeaderboardEntry])
    entries!: LeaderboardEntry[];

    /** Position du lecteur connecté, même hors du top ; null sans XP sur la période. */
    @Field(() => LeaderboardStanding, { nullable: true })
    viewer!: LeaderboardStanding | null;
}
