import type { ReactNode } from "react";
import { ApolloError } from "@apollo/client";
import type { GRAPHQL_ERROR_CODES } from "@/lib/graphqlErrors";

/** Motif d'illustration littéraire associé à chaque type d'erreur. */
export type ErrorMotif =
    | "emptyShelf"
    | "candle"
    | "brokenSeal"
    | "lockedTome"
    | "bookmark"
    | "inkwell";

/** Contenu éditorial d'une page d'erreur (catalogue « Nuit d'Encre »). */
export interface ErrorContent {
    /** Code HTTP affiché en grand chiffre embossé. Vide pour le cas générique. */
    code: string;
    label: string;
    motif: ErrorMotif;
    /** Référence de catalogue affichée en suréclat (eyebrow). */
    ref: string;
    message: string;
    /** Indication complémentaire optionnelle (ex. 401). */
    hint?: string;
    /** Libellé d'accessibilité du bloc d'alerte. */
    aria: string;
}

/** Détails techniques réels d'une erreur, affichés en mode développement. */
export interface ErrorTechDetails {
    type: string;
    status?: string;
    message?: string;
    data?: string;
    stack?: string;
}

/** Props du terminal flottant des détails techniques. */
export interface TechNoticeProps {
    tech: ErrorTechDetails;
}

/** Ligne clé/valeur de la sortie du terminal. */
export interface TechLineProps {
    label: string;
    tone?: "destructive" | "accent";
    children: ReactNode;
}

/** Position absolue (px, viewport) d'une fenêtre déplaçable. */
export interface FloatingPosition {
    x: number;
    y: number;
}

/** Options de `assertEntityLoaded` (utils/ficheForm.ts). */
export interface AssertEntityLoadedOptions<E> {
    enabled: boolean;
    entity: E | null | undefined;
    error?: ApolloError;
    isLoading: boolean;
    notFoundMessage: string;
    loadErrorMessage: string;
}

/** Code `extensions.code` renvoyé par le backend (lib/graphqlErrors.ts). */
export type GraphQLErrorCode =
    (typeof GRAPHQL_ERROR_CODES)[keyof typeof GRAPHQL_ERROR_CODES];

/** Opération dont l'échec est traduit en toast par `parseGraphQLError`. */
export type ErrorContext =
    | "createBook"
    | "updateBook"
    | "deleteBook"
    | "createAuthor"
    | "updateAuthor"
    | "createReview"
    | "updateReview"
    | "deleteReview"
    | "voteOnReview"
    | "toggleRecommendation"
    | "createUserBook"
    | "updateUserBook"
    | "deleteUserBook"
    | "createBookReviewComment"
    | "deleteBookReviewComment"
    | "setReadingGoal"
    | "clearReadingGoal";

/**
 * Règle de traduction d'une erreur : reconnue à son code, et si besoin à un
 * extrait de message pour départager deux erreurs de même code (livre ou
 * catégorie introuvable).
 */
export interface ErrorRule {
    code: GraphQLErrorCode;
    matches?: string;
    title: string;
    description: string;
}

/** Titre et description du toast affiché. */
export interface ErrorResult {
    title: string;
    description: string;
}
