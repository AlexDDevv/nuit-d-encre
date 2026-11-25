import { gql } from "@apollo/client";

export const VOTE_ON_REVIEW = gql`
    mutation VoteOnReview($data: CreateBookReviewVoteInput!) {
        voteOnReview(data: $data) {
            vote {
                id
                isHelpful
                review {
                    id
                    helpfulCount
                    notHelpfulCount
                    myVote
                }
            }
            action
        }
    }
`;

export const REMOVE_VOTE_ON_REVIEW = gql`
    mutation RemoveVoteOnReview($reviewId: ID!) {
        removeVoteOnReview(reviewId: $reviewId) {
            id
            review {
                id
                helpfulCount
                notHelpfulCount
                myVote
            }
        }
    }
`;

export const TOGGLE_HELPFUL_VOTE = gql`
    mutation ToggleHelpfulVote($reviewId: ID!) {
        toggleHelpfulVote(reviewId: $reviewId) {
            vote {
                id
                isHelpful
                review {
                    id
                    helpfulCount
                    notHelpfulCount
                    myVote
                }
            }
            action
        }
    }
`;
