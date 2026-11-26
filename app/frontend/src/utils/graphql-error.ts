import { ApolloError } from "@apollo/client";
import { GRAPHQL_ERROR_CODES } from "@/lib/graphqlErrors";
import { ErrorContext, ErrorResult, ErrorRule } from "@/types/types";

const {
    notFound,
    forbidden,
    unauthenticated,
    conflict,
    tooManyRequests,
    badUserInput,
} = GRAPHQL_ERROR_CODES;

/** Session absente ou expirée, quelle que soit l'opération. */
const signInRequired = (action: string): ErrorRule => ({
    code: unauthenticated,
    title: "Connexion requise",
    description: `Vous devez être connecté pour ${action}.`,
});

/** Règles communes à toutes les opérations, évaluées après les règles propres. */
const COMMON_RULES: ErrorRule[] = [
    {
        code: tooManyRequests,
        title: "Trop de tentatives",
        description: "Patientez quelques minutes avant de réessayer.",
    },
];

/**
 * Traduction des erreurs par opération. Les règles sont évaluées dans
 * l'ordre : la plus spécifique d'abord (code + extrait de message), la plus
 * générale ensuite (code seul).
 */
const ERROR_MAP: Record<
    ErrorContext,
    { rules: ErrorRule[]; fallback: ErrorResult }
> = {
    createBook: {
        rules: [
            {
                code: notFound,
                title: "Catégorie introuvable",
                description: "La catégorie sélectionnée n'existe pas.",
            },
            signInRequired("ajouter un livre"),
        ],
        fallback: {
            title: "Échec de la création",
            description:
                "Impossible d'enregistrer le livre. Veuillez réessayer.",
        },
    },
    updateBook: {
        rules: [
            {
                code: notFound,
                matches: "Category",
                title: "Catégorie introuvable",
                description: "La catégorie sélectionnée n'existe pas.",
            },
            {
                code: notFound,
                title: "Livre introuvable",
                description: "Ce livre n'existe pas ou a été supprimé.",
            },
            {
                code: forbidden,
                title: "Action non autorisée",
                description: "Vous ne pouvez pas modifier ce livre.",
            },
            signInRequired("modifier un livre"),
        ],
        fallback: {
            title: "Échec de la modification",
            description: "Impossible de modifier le livre. Veuillez réessayer.",
        },
    },
    deleteBook: {
        rules: [
            {
                code: notFound,
                title: "Livre introuvable",
                description: "Ce livre n'existe pas ou a déjà été supprimé.",
            },
            {
                code: forbidden,
                title: "Action non autorisée",
                description:
                    "Vous n'avez pas les droits pour supprimer ce livre.",
            },
            signInRequired("supprimer un livre"),
        ],
        fallback: {
            title: "Échec de la suppression",
            description:
                "Impossible de supprimer le livre. Veuillez réessayer.",
        },
    },
    createAuthor: {
        rules: [signInRequired("ajouter un auteur")],
        fallback: {
            title: "Échec de la création",
            description:
                "Impossible d'enregistrer l'auteur. Veuillez réessayer.",
        },
    },
    updateAuthor: {
        rules: [
            {
                code: notFound,
                title: "Auteur introuvable",
                description: "Cet auteur n'existe pas ou a été supprimé.",
            },
            {
                code: forbidden,
                title: "Action non autorisée",
                description: "Vous ne pouvez pas modifier cet auteur.",
            },
            signInRequired("modifier un auteur"),
        ],
        fallback: {
            title: "Échec de la modification",
            description: "Impossible de modifier l'auteur. Veuillez réessayer.",
        },
    },
    createReview: {
        rules: [
            {
                code: conflict,
                title: "Critique déjà publiée",
                description:
                    "Vous avez déjà écrit une critique pour ce livre. Modifiez-la plutôt.",
            },
            signInRequired("publier une critique"),
        ],
        fallback: {
            title: "Échec de la publication",
            description:
                "Impossible de publier la critique. Veuillez réessayer.",
        },
    },
    updateReview: {
        rules: [
            {
                code: notFound,
                title: "Critique introuvable",
                description: "Cette critique n'existe pas ou a été supprimée.",
            },
            {
                code: forbidden,
                title: "Action non autorisée",
                description: "Vous ne pouvez pas modifier cette critique.",
            },
            signInRequired("modifier une critique"),
        ],
        fallback: {
            title: "Échec de la modification",
            description:
                "Impossible de modifier la critique. Veuillez réessayer.",
        },
    },
    deleteReview: {
        rules: [
            {
                code: notFound,
                title: "Critique introuvable",
                description:
                    "Cette critique n'existe pas ou a déjà été supprimée.",
            },
            {
                code: forbidden,
                title: "Action non autorisée",
                description: "Vous ne pouvez pas supprimer cette critique.",
            },
            signInRequired("supprimer une critique"),
        ],
        fallback: {
            title: "Échec de la suppression",
            description:
                "Impossible de supprimer la critique. Veuillez réessayer.",
        },
    },
    voteOnReview: {
        rules: [
            {
                code: forbidden,
                title: "Vote non autorisé",
                description:
                    "Vous ne pouvez pas voter pour votre propre critique.",
            },
            signInRequired("voter"),
        ],
        fallback: {
            title: "Échec du vote",
            description:
                "Impossible d'enregistrer votre vote. Veuillez réessayer.",
        },
    },
    toggleRecommendation: {
        rules: [
            {
                code: notFound,
                title: "Livre introuvable",
                description: "Ce livre n'existe pas ou a été supprimé.",
            },
            signInRequired("recommander un livre"),
        ],
        fallback: {
            title: "Échec de la recommandation",
            description:
                "Impossible d'enregistrer votre recommandation. Veuillez réessayer.",
        },
    },
    createUserBook: {
        rules: [
            {
                code: conflict,
                title: "Livre déjà ajouté",
                description: "Ce livre est déjà dans votre bibliothèque.",
            },
            signInRequired("ajouter un livre à votre bibliothèque"),
        ],
        fallback: {
            title: "Échec de l'ajout",
            description:
                "Impossible d'ajouter ce livre à votre bibliothèque. Veuillez réessayer.",
        },
    },
    updateUserBook: {
        rules: [
            {
                code: badUserInput,
                matches: "futur",
                title: "Date invalide",
                description:
                    "La date de fin de lecture ne peut pas être dans le futur.",
            },
            {
                code: notFound,
                title: "Entrée introuvable",
                description: "Ce livre n'est plus dans votre bibliothèque.",
            },
            signInRequired("modifier votre bibliothèque"),
        ],
        fallback: {
            title: "Échec de la mise à jour",
            description:
                "Impossible de mettre à jour le statut. Veuillez réessayer.",
        },
    },
    setReadingGoal: {
        rules: [
            {
                code: badUserInput,
                title: "Objectif invalide",
                description: "Choisissez entre 1 et 500 livres.",
            },
            signInRequired("vous lancer un défi de lecture"),
        ],
        fallback: {
            title: "Échec de l'enregistrement",
            description:
                "Impossible d'enregistrer votre défi. Veuillez réessayer.",
        },
    },
    clearReadingGoal: {
        rules: [signInRequired("modifier votre défi de lecture")],
        fallback: {
            title: "Échec de l'abandon",
            description:
                "Impossible d'abandonner votre défi. Veuillez réessayer.",
        },
    },
    deleteUserBook: {
        rules: [
            {
                code: notFound,
                title: "Entrée introuvable",
                description:
                    "Ce livre n'est déjà plus dans votre bibliothèque.",
            },
            signInRequired("modifier votre bibliothèque"),
        ],
        fallback: {
            title: "Échec de la suppression",
            description:
                "Impossible de supprimer ce livre de votre bibliothèque. Veuillez réessayer.",
        },
    },
    createBookReviewComment: {
        rules: [
            {
                code: notFound,
                title: "Critique introuvable",
                description: "Cette critique n'existe pas ou a été supprimée.",
            },
            signInRequired("publier un commentaire"),
        ],
        fallback: {
            title: "Échec de la publication",
            description:
                "Impossible de publier le commentaire. Veuillez réessayer.",
        },
    },
    deleteBookReviewComment: {
        rules: [
            {
                code: notFound,
                title: "Commentaire introuvable",
                description:
                    "Ce commentaire n'existe pas ou a déjà été supprimé.",
            },
            {
                code: forbidden,
                title: "Action non autorisée",
                description: "Vous ne pouvez pas supprimer ce commentaire.",
            },
            signInRequired("supprimer un commentaire"),
        ],
        fallback: {
            title: "Échec de la suppression",
            description:
                "Impossible de supprimer le commentaire. Veuillez réessayer.",
        },
    },
};

/**
 * Traduit l'échec d'une mutation en toast. Reconnaît l'erreur à son code
 * (`extensions.code`, déduit du statut par le backend), pas à son message :
 * renommer un message côté backend ne casse plus l'affichage.
 */
export function parseGraphQLError(
    error: unknown,
    context: ErrorContext,
): ErrorResult {
    const { rules, fallback } = ERROR_MAP[context];

    if (!(error instanceof ApolloError)) {
        return {
            title: "Erreur de connexion",
            description:
                "Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.",
        };
    }

    for (const rule of [...rules, ...COMMON_RULES]) {
        const hit = error.graphQLErrors.some(
            (e) =>
                e.extensions?.code === rule.code &&
                (!rule.matches || e.message.includes(rule.matches)),
        );
        if (hit) return { title: rule.title, description: rule.description };
    }
    return fallback;
}
