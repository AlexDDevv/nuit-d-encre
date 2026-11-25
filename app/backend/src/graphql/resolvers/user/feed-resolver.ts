import {
    Arg,
    Authorized,
    Ctx,
    Int,
    Query,
    Resolver,
} from "type-graphql";
import { UserActions } from "../../../database/entities/user/user-actions";
import { UserFollow } from "../../../database/entities/user/user-follow";
import { Context } from "../../../types/types";
import { FeedEntry } from "./feed-entry";
import { onlyVisibleActions } from "../../../utils/visibility";
import { requireUser } from "../../../utils/current-user";

/** Projette une action (avec sa relation `user`) vers un FeedEntry. */
export function toFeedEntry(action: UserActions): FeedEntry {
    return {
        id: action.id,
        type: action.type,
        metadata: action.metadata ?? null,
        targetId: action.targetId ?? null,
        createdAt: action.createdAt,
        actor: {
            id: action.user.id,
            userName: action.user.userName,
            avatar: action.user.avatar ?? null,
            level: action.user.level,
        },
    };
}

@Resolver()
export class FeedResolver {
    /** Activité des comptes suivis, actions de bibliothèque privée exclues. */
    @Authorized()
    @Query(() => [FeedEntry])
    async activityFeed(
        @Arg("limit", () => Int, { defaultValue: 20 }) limit: number,
        @Arg("offset", () => Int, { defaultValue: 0 }) offset: number,
        @Ctx() context: Context,
    ): Promise<FeedEntry[]> {
        const me = await requireUser(context);

        const qb = UserActions.createQueryBuilder("action")
            .innerJoinAndSelect("action.user", "user")
            .innerJoin(
                UserFollow,
                "follow",
                '"follow"."followingId" = "user"."id" AND "follow"."followerId" = :meId',
                { meId: me.id },
            )
            .orderBy("action.createdAt", "DESC")
            .take(Math.min(Math.max(limit, 1), 50))
            .skip(Math.max(offset, 0));

        const actions = await onlyVisibleActions(qb, me, "action", "user").getMany();
        return actions.map(toFeedEntry);
    }

    /** Activité de tous les lecteurs (découverte), mêmes règles de visibilité. */
    @Authorized()
    @Query(() => [FeedEntry])
    async globalActivityFeed(
        @Arg("limit", () => Int, { defaultValue: 20 }) limit: number,
        @Ctx() context: Context,
    ): Promise<FeedEntry[]> {
        const me = await requireUser(context);

        const qb = UserActions.createQueryBuilder("action")
            .innerJoinAndSelect("action.user", "user")
            .orderBy("action.createdAt", "DESC")
            .take(Math.min(Math.max(limit, 1), 50));

        const actions = await onlyVisibleActions(qb, me, "action", "user").getMany();
        return actions.map(toFeedEntry);
    }
}
