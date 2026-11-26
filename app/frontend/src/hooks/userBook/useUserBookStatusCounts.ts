import { useQuery } from "@apollo/client";
import { GET_USER_BOOK_STATUS_COUNTS } from "@/graphql/user/userBook";
import { UserBookStatus } from "@/types/types";

type StatusCounts = {
    total: number;
    toRead: number;
    reading: number;
    read: number;
    paused: number;
    abandoned: number;
};

const EMPTY: StatusCounts = {
    total: 0,
    toRead: 0,
    reading: 0,
    read: 0,
    paused: 0,
    abandoned: 0,
};

/**
 * Compteurs d'ouvrages de la bibliothèque par statut (toute la collection),
 * pour l'en-tête « Vos rayons » et les segments de filtre. `userId` : celle
 * d'un autre lecteur (si partagée) ; par défaut la sienne.
 */
export function useUserBookStatusCounts(userId?: string) {
    const { data, loading, error, refetch } = useQuery<{
        userBookStatusCounts: StatusCounts;
    }>(GET_USER_BOOK_STATUS_COUNTS, { variables: { userId } });

    const counts = data?.userBookStatusCounts ?? EMPTY;

    /** Compteur par statut d'énumération (TO_READ, READING, READ, PAUSED, ABANDONED). */
    const countByStatus: Record<UserBookStatus, number> = {
        TO_READ: counts.toRead,
        READING: counts.reading,
        READ: counts.read,
        PAUSED: counts.paused,
        ABANDONED: counts.abandoned,
    };

    return {
        counts,
        countByStatus,
        isLoadingCounts: loading,
        countsError: error,
        refetchCounts: refetch,
    };
}
