import { gql } from "@apollo/client";

const READING_GOAL_FIELDS = `
    year
    target
    booksRead
    rewardXp
`;

export const GET_READING_GOAL = gql`
    query ReadingGoal($userId: ID) {
        readingGoal(userId: $userId) {
            ${READING_GOAL_FIELDS}
        }
    }
`;

export const SET_READING_GOAL = gql`
    mutation SetReadingGoal($data: SetReadingGoalInput!) {
        setReadingGoal(data: $data) {
            ${READING_GOAL_FIELDS}
        }
    }
`;

export const CLEAR_READING_GOAL = gql`
    mutation ClearReadingGoal {
        clearReadingGoal
    }
`;
