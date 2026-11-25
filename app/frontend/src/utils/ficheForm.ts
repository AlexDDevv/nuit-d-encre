import { FieldValues, UseFormSetError } from "react-hook-form";
import { parseGraphQLError } from "@/utils/graphql-error";
import { isNotFoundError } from "@/lib/graphqlErrors";
import { AssertEntityLoadedOptions, ErrorContext } from "@/types/types";

/**
 * Garde de chargement d'une fiche (livre, auteur, liste de catégories) :
 * lève une `Response` captée par le routeur lorsque l'entité requise est
 * absente (404) ou en erreur (404 si le backend répond NOT_FOUND, 500 sinon).
 */
export function assertEntityLoaded<E>({
    enabled,
    entity,
    error,
    isLoading,
    notFoundMessage,
    loadErrorMessage,
}: AssertEntityLoadedOptions<E>) {
    if (!enabled) return;

    if (!entity && error) {
        const isNotFound = isNotFoundError(error);
        throw new Response(isNotFound ? notFoundMessage : loadErrorMessage, {
            status: isNotFound ? 404 : 500,
        });
    }

    if (!isLoading && !entity) {
        throw new Response(notFoundMessage, { status: 404 });
    }
}

type ToastFn = (options: {
    type?: "success" | "error" | "warning" | "info";
    title: string;
    description?: string;
}) => void;

/**
 * Exécute une mutation de fiche (création/modification) avec la gestion
 * commune : toast de succès, navigation, et report de l'erreur GraphQL sur le
 * champ racine + toast d'erreur.
 */
export async function runFicheMutation<
    R extends { id: string },
    T extends FieldValues,
>({
    perform,
    success,
    errorOperation,
    setError,
    showToast,
    onSuccess,
}: {
    perform: () => Promise<R | null | undefined>;
    success: { title: string; description: string };
    errorOperation: ErrorContext;
    setError: UseFormSetError<T>;
    showToast: ToastFn;
    onSuccess: (result: R) => void;
}) {
    try {
        const result = await perform();

        showToast({
            type: "success",
            title: success.title,
            description: success.description,
        });

        if (result && result.id) {
            onSuccess(result);
        }
    } catch (err) {
        const { title, description } = parseGraphQLError(err, errorOperation);
        setError("root", { message: description });
        showToast({ type: "error", title, description });
    }
}
