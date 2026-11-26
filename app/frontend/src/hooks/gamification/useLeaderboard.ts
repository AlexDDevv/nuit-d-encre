import { useQuery } from "@apollo/client";
import { GET_LEADERBOARD } from "@/graphql/gamification/leaderboard";
import {
    Leaderboard,
    LeaderboardPeriod,
    LeaderboardScope,
} from "@/types/types";

/** Classement des lecteurs (top 50) et position du lecteur connecté. */
export function useLeaderboard(
    period: LeaderboardPeriod,
    scope: LeaderboardScope,
) {
    const { data, loading, error } = useQuery<{ leaderboard: Leaderboard }>(
        GET_LEADERBOARD,
        { variables: { period, scope } },
    );

    return {
        entries: data?.leaderboard.entries ?? [],
        viewer: data?.leaderboard.viewer ?? null,
        loading,
        error,
    };
}
