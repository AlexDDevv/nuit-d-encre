import { gql } from "@apollo/client";

export const GET_LEADERBOARD = gql`
    query Leaderboard($period: LeaderboardPeriod!, $scope: LeaderboardScope!) {
        leaderboard(period: $period, scope: $scope) {
            entries {
                rank
                xp
                user {
                    id
                    userName
                    avatar
                    level
                    title {
                        id
                        label
                    }
                }
            }
            viewer {
                rank
                xp
            }
        }
    }
`;
