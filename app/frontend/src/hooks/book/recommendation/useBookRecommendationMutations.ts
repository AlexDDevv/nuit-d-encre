import { ApolloCache, useMutation } from "@apollo/client";
import { TOGGLE_BOOK_RECOMMENDATION } from "@/graphql/book/book-recommendation";

/**
 * Recommandation d'un livre par l'utilisateur courant (ajout ou retrait).
 *
 * @returns
 * - toggleBookRecommendation(bookId) : crée ou retire la recommandation et
 *   met à jour la fiche en cache (`recommendationCount`, `hasUserRecommended`) ;
 * - isTogglingBookRecommendation, toggleBookRecommendationError,
 *   resetToggleBookRecommendationError.
 *
 * @example
 * ```ts
 * const { toggleBookRecommendation } = useBookRecommendationMutations();
 * const result = await toggleBookRecommendation(book.id);
 * result?.action; // "created" | "deleted"
 * ```
 */
export function useBookRecommendationMutations() {
    // ************************ TOGGLE ************************
    const [
        toggleBookRecommendationMutation,
        {
            loading: isTogglingBookRecommendation,
            error: toggleBookRecommendationError,
            reset: resetToggleBookRecommendationError,
        },
    ] = useMutation(TOGGLE_BOOK_RECOMMENDATION, {
        // Met à jour la fiche en cache : compteur et état « recommandé par
        // moi », lus par la page livre (plus de requête dédiée).
        update(cache: ApolloCache<unknown>, { data }, { variables }) {
            const action = data?.toggleBookRecommendation?.action;
            const bookId = variables?.data?.bookId;
            if (!action || !bookId) return;

            cache.modify({
                id: cache.identify({ __typename: "Book", id: bookId }),
                fields: {
                    recommendationCount: (existing: number = 0) =>
                        action === "created"
                            ? existing + 1
                            : Math.max(0, existing - 1),
                    hasUserRecommended: () => action === "created",
                },
            });
        },
    });

    const toggleBookRecommendation = async (
        bookId: string,
    ): Promise<{ recommendation: unknown; action: string } | undefined> => {
        const result = await toggleBookRecommendationMutation({
            variables: { data: { bookId } },
        });
        return result.data?.toggleBookRecommendation;
    };

    return {
        // toggle
        toggleBookRecommendation,
        isTogglingBookRecommendation,
        toggleBookRecommendationError,
        resetToggleBookRecommendationError,
    };
}
