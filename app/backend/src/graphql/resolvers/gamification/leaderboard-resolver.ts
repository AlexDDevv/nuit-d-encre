import { Arg, Authorized, Ctx, Query, Resolver } from "type-graphql";
import { In } from "typeorm";
import { dataSource } from "../../../database/config/datasource";
import { User } from "../../../database/entities/user/user";
import {
    Leaderboard,
    LeaderboardEntry,
} from "../../../database/filteredResults/gamification/leaderboard";
import { TOTAL_XP_SQL } from "../../../services/grind/total-xp";
import { requireUser } from "../../../utils/current-user";
import {
    Context,
    LeaderboardPeriod,
    LeaderboardScope,
    Roles,
} from "../../../types/types";

export const LEADERBOARD_SIZE = 50;

/**
 * Début du mois en cours à l'heure de Paris, ramené dans le fuseau de la
 * session : `user_actions.createdAt` est un `timestamp` sans fuseau rempli
 * par `now()`, donc exprimé dans ce fuseau.
 */
const MONTH_START_SQL = `((date_trunc('month', now() AT TIME ZONE 'Europe/Paris') AT TIME ZONE 'Europe/Paris') AT TIME ZONE current_setting('TimeZone'))`;

/** Abonnements du lecteur `$1`, plus lui-même. */
const FOLLOWING_FILTER_SQL = `AND (u."id" = $1 OR u."id" IN (SELECT f."followingId" FROM "user_follow" f WHERE f."followerId" = $1))`;

/**
 * Score de chaque lecteur classé (admin exclu, score nul exclu) : XP gagnée
 * depuis le début du mois, ou XP cumulée depuis l'inscription.
 */
function scoresSql(period: LeaderboardPeriod, scope: LeaderboardScope) {
    const scopeFilter =
        scope === LeaderboardScope.FOLLOWING ? FOLLOWING_FILTER_SQL : "";

    if (period === LeaderboardPeriod.MONTH) {
        return `SELECT u."id", u."userName", SUM(a."xp")::int AS "score"
            FROM "user" u
            JOIN "user_actions" a ON a."userId" = u."id" AND a."createdAt" >= ${MONTH_START_SQL}
            WHERE u."role" <> '${Roles.Admin}' ${scopeFilter}
            GROUP BY u."id"
            HAVING SUM(a."xp") > 0`;
    }
    return `SELECT u."id", u."userName", ${TOTAL_XP_SQL}::int AS "score"
        FROM "user" u
        WHERE u."role" <> '${Roles.Admin}' AND ${TOTAL_XP_SQL} > 0 ${scopeFilter}`;
}

function rankedSql(period: LeaderboardPeriod, scope: LeaderboardScope) {
    return `WITH scores AS (${scoresSql(period, scope)}),
        ranked AS (
            SELECT "id", "userName", "score", RANK() OVER (ORDER BY "score" DESC)::int AS "rank"
            FROM scores
        )`;
}

type RankedRow = { id: string; score: number; rank: number };

@Resolver()
export class LeaderboardResolver {
    /**
     * Classement des lecteurs par XP, top 50, et position du lecteur connecté
     * même hors du top. Données publiques (pseudo, avatar, niveau, titre).
     */
    @Authorized()
    @Query(() => Leaderboard)
    async leaderboard(
        @Arg("period", () => LeaderboardPeriod) period: LeaderboardPeriod,
        @Arg("scope", () => LeaderboardScope) scope: LeaderboardScope,
        @Ctx() context: Context,
    ): Promise<Leaderboard> {
        const viewer = await requireUser(context);
        const ranked = rankedSql(period, scope);
        const usesViewer = scope === LeaderboardScope.FOLLOWING;

        const [rows, viewerRows] = await Promise.all([
            dataSource.query(
                `${ranked} SELECT "id", "score", "rank" FROM ranked
                ORDER BY "rank", "userName", "id" LIMIT ${LEADERBOARD_SIZE}`,
                usesViewer ? [viewer.id] : [],
            ) as Promise<RankedRow[]>,
            dataSource.query(
                `${ranked} SELECT "id", "score", "rank" FROM ranked WHERE "id" = $1`,
                [viewer.id],
            ) as Promise<RankedRow[]>,
        ]);

        const users = rows.length
            ? await User.find({ where: { id: In(rows.map((r) => r.id)) } })
            : [];
        const byId = new Map(users.map((u) => [u.id, u]));

        const entries: LeaderboardEntry[] = rows.flatMap((row) => {
            const user = byId.get(row.id);
            return user ? [{ rank: row.rank, xp: row.score, user }] : [];
        });
        const own = viewerRows[0];

        return {
            entries,
            viewer: own ? { rank: own.rank, xp: own.score } : null,
        };
    }
}
