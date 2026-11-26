import { dataSource } from "../../../database/config/datasource";
import { User } from "../../../database/entities/user/user";
import { makeContext, makeUser } from "../../../test/factories";
import { LeaderboardPeriod, LeaderboardScope } from "../../../types/types";
import { LeaderboardResolver } from "./leaderboard-resolver";

const me = makeUser("me");

// Risque : un visiteur lit le classement, l'admin y figure, ou « Mes
// abonnements » montre des comptes non suivis.
describe("LeaderboardResolver.leaderboard", () => {
    const resolver = new LeaderboardResolver();
    let query: jest.SpyInstance;

    beforeEach(() => {
        jest.restoreAllMocks();
        query = jest.spyOn(dataSource, "query");
    });

    function mockRows(
        top: { id: string; score: number; rank: number }[],
        own: { id: string; score: number; rank: number }[],
    ) {
        query.mockImplementation(async (sql: string) =>
            sql.includes("LIMIT") ? top : own,
        );
        jest.spyOn(User, "find").mockImplementation(async () =>
            top.map((row) => makeUser(row.id)),
        );
    }

    it("refuse un visiteur sans rien lire", async () => {
        await expect(
            resolver.leaderboard(
                LeaderboardPeriod.MONTH,
                LeaderboardScope.ALL,
                makeContext(null),
            ),
        ).rejects.toMatchObject({ statusCode: 401 });
        expect(query).not.toHaveBeenCalled();
    });

    it("exclut l'admin du classement, sur les deux périodes", async () => {
        mockRows([], []);
        for (const period of Object.values(LeaderboardPeriod)) {
            await resolver.leaderboard(
                period,
                LeaderboardScope.ALL,
                makeContext(me),
            );
        }
        for (const [sql] of query.mock.calls) {
            expect(sql).toContain(`u."role" <> 'admin'`);
        }
    });

    it("restreint « Mes abonnements » aux comptes suivis et à soi", async () => {
        mockRows([], []);
        await resolver.leaderboard(
            LeaderboardPeriod.ALL_TIME,
            LeaderboardScope.FOLLOWING,
            makeContext(me),
        );
        for (const [sql, params] of query.mock.calls) {
            expect(sql).toContain(`"user_follow"`);
            expect(params).toEqual(["me"]);
        }
    });

    it("garde l'ordre du classement et place le lecteur hors du top", async () => {
        mockRows(
            [
                { id: "a", score: 300, rank: 1 },
                { id: "b", score: 120, rank: 2 },
                { id: "c", score: 120, rank: 2 },
            ],
            [{ id: "me", score: 40, rank: 73 }],
        );
        const result = await resolver.leaderboard(
            LeaderboardPeriod.MONTH,
            LeaderboardScope.ALL,
            makeContext(me),
        );

        expect(result.entries.map((e) => [e.user.id, e.rank, e.xp])).toEqual([
            ["a", 1, 300],
            ["b", 2, 120],
            ["c", 2, 120],
        ]);
        expect(result.viewer).toEqual({ rank: 73, xp: 40 });
    });

    it("renvoie viewer null sans XP sur la période", async () => {
        mockRows([], []);
        const result = await resolver.leaderboard(
            LeaderboardPeriod.MONTH,
            LeaderboardScope.ALL,
            makeContext(me),
        );
        expect(result).toEqual({ entries: [], viewer: null });
    });
});
