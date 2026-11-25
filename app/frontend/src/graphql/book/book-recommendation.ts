import { gql } from "@apollo/client";

export const TOGGLE_BOOK_RECOMMENDATION = gql`
    mutation ToggleBookRecommendation($data: CreateBookRecommendationInput!) {
        toggleBookRecommendation(data: $data) {
            recommendation {
                id
                user {
                    id
                }
            }
            action
        }
    }
`;
