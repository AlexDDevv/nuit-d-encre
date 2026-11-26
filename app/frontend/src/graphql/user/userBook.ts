import { gql } from "@apollo/client";

export const GET_USER_BOOKS = gql`
    query UserBooks($filters: UserBooksQueryInput, $userId: ID) {
        userBooks(filters: $filters, userId: $userId) {
            userBooks {
                id
                isFavorite
                favoriteRank
                book {
                    id
                    title
                    coverUrl
                    author {
                        id
                        firstname
                        lastname
                    }
                    category {
                        id
                        name
                    }
                    pageCount
                    publishedYear
                    publisher
                    format
                    averageRating
                    recommendationCount
                    reviewCount
                }
                status
                finishedAt
            }
            totalCount
            page
            limit
        }
    }
`;

export const GET_USER_BOOK_STATUS_COUNTS = gql`
    query UserBookStatusCounts($userId: ID) {
        userBookStatusCounts(userId: $userId) {
            total
            toRead
            reading
            read
            paused
            abandoned
        }
    }
`;

export const GET_USER_BOOK = gql`
    query UserBook($userBookId: ID!) {
        userBook(id: $userBookId) {
            id
            book {
                id
                title
                author {
                    id
                    firstname
                    lastname
                }
                category {
                    id
                    name
                }
                pageCount
                publishedYear
                publisher
                averageRating
                recommendationCount
                reviewCount
            }
            status
        }
    }
`;

export const CREATE_USER_BOOK = gql`
    mutation CreateUserBook($data: CreateUserBookInput!) {
        createUserBook(data: $data) {
            id
            book {
                id
                title
            }
            status
        }
    }
`;

export const UPDATE_USER_BOOK = gql`
    mutation UpdateUserBook($data: UpdateUserBookInput!) {
        updateUserBook(data: $data) {
            id
            book {
                id
                title
            }
            status
            finishedAt
        }
    }
`;

export const DELETE_USER_BOOK = gql`
    mutation DeleteUserBook($userBookId: ID!) {
        deleteUserBook(id: $userBookId) {
            id
        }
    }
`;

/**
 * Sélecteur de favoris : seulement ce que la modale affiche. La requête de la
 * page Bibliothèque calculerait en plus note, compteurs et méta pour chaque
 * livre (jusqu'à 100).
 */
export const GET_FAVORITE_PICKER_BOOKS = gql`
    query FavoritePickerBooks($filters: UserBooksQueryInput) {
        userBooks(filters: $filters) {
            userBooks {
                id
                favoriteRank
                book {
                    id
                    title
                    coverUrl
                    publishedYear
                    author {
                        id
                        firstname
                        lastname
                    }
                    category {
                        id
                        name
                    }
                }
            }
        }
    }
`;
