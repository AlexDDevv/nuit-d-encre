import { useMutation, useQuery } from "@apollo/client";
import {
    CLEAR_READING_GOAL,
    GET_READING_GOAL,
    SET_READING_GOAL,
} from "@/graphql/gamification/readingGoal";
import { ReadingGoalProgress } from "@/types/types";

// Atteindre le défi rapporte de l'XP : niveau et barre du profil suivent.
const REFRESH_AFTER_CHANGE = ["ReadingGoal", "GetUserProfile", "Whoami"];

/**
 * Défi de lecture de l'année en cours. `userId` : celui d'un autre lecteur
 * (null si sa bibliothèque est privée) ; par défaut le sien.
 */
export function useReadingGoal(userId?: string) {
    const { data, loading } = useQuery<{
        readingGoal: ReadingGoalProgress | null;
    }>(GET_READING_GOAL, { variables: { userId } });

    const [setGoal, { loading: isSaving }] = useMutation(SET_READING_GOAL, {
        refetchQueries: REFRESH_AFTER_CHANGE,
        awaitRefetchQueries: true,
    });
    const [clearGoal, { loading: isClearing }] = useMutation(
        CLEAR_READING_GOAL,
        { refetchQueries: ["ReadingGoal"], awaitRefetchQueries: true },
    );

    return {
        goal: data?.readingGoal ?? null,
        loading,
        saveGoal: (target: number) =>
            setGoal({ variables: { data: { target } } }),
        clearGoal: () => clearGoal(),
        isSaving,
        isClearing,
    };
}
