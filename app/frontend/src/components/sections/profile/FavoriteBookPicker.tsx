import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { FaStar } from "react-icons/fa6";
import BookCover from "@/components/sections/book/BookCover";
import SearchField from "@/components/sections/shared/fields/SearchField";
import ModalCloseButton from "@/components/UI/ModalCloseButton";
import { useModalTransition } from "@/hooks/modal/useModalTransition";
import { PLACE_LABEL } from "@/components/sections/library/favoriteBook/podium";
import {
    SET_FAVORITE_BOOK,
    GET_USER_FAVORITE_BOOKS,
} from "@/graphql/user/profile";
import { GET_FAVORITE_PICKER_BOOKS } from "@/graphql/user/userBook";
import { useDebounce } from "@/hooks/search/useDebounce";
import { Skeleton } from "@/components/UI/skeleton/Skeleton";
import { cn } from "@/lib/utils";
import { FavoriteBookPickerProps, UserBook } from "@/types/types";

/** Plafond serveur des listes (MAX_PAGE_SIZE côté backend). */
const FAVORITE_PICKER_LIMIT = 100;

/** Lignes fantômes du premier chargement, au gabarit des vraies lignes. */
const SKELETON_ROWS = 5;

function PickerRowSkeleton() {
    return (
        <li
            aria-hidden="true"
            className="border-border bg-sunken/60 flex items-center gap-3.5 rounded-xl border px-3 py-2.5"
        >
            <Skeleton className="aspect-2/3 w-11 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-3 w-2/5" />
            </div>
        </li>
    );
}

/** Modale de choix d'un livre de la bibliothèque pour une place du podium. */
export default function FavoriteBookPicker({
    rank,
    userId,
    onClose,
}: FavoriteBookPickerProps) {
    const [query, setQuery] = useState("");
    const { closing, requestClose } = useModalTransition({ onClose });

    // Recherche côté serveur : la liste est plafonnée, un filtre local ne
    // verrait pas les livres au-delà de la première page.
    const search = useDebounce(query.trim(), 300);
    const {
        data,
        previousData,
        loading: loadingBooks,
    } = useQuery(GET_FAVORITE_PICKER_BOOKS, {
        variables: {
            filters: {
                limit: FAVORITE_PICKER_LIMIT,
                search: search || undefined,
            },
        },
    });

    const [setFavoriteBook, { loading }] = useMutation(SET_FAVORITE_BOOK, {
        refetchQueries: [
            { query: GET_USER_FAVORITE_BOOKS, variables: { userId } },
        ],
        onCompleted: requestClose,
    });

    useEffect(() => {
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") requestClose();
        };
        document.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "unset";
            document.removeEventListener("keydown", onKey);
        };
    }, [requestClose]);

    const shown = data ?? previousData;
    const userBooks: UserBook[] = shown?.userBooks?.userBooks ?? [];
    // Premier chargement : rien à montrer encore. Les recherches suivantes
    // gardent les résultats précédents (estompés) jusqu'à la réponse.
    const firstLoad = loadingBooks && !shown;
    const refreshing = loadingBooks && !!shown;

    return (
        <div
            className={cn(
                "z-70 bg-scrim/78 fixed inset-0 flex items-center justify-center px-4 backdrop-blur-[3px]",
                closing ? "overlay-out" : "overlay-in",
            )}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) requestClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="picker-title"
                className={cn(
                    "border-primary/40 max-w-135 bg-popover shadow-modal relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border-2",
                    closing ? "modal-out" : "modal-in",
                )}
            >
                <ModalCloseButton
                    onClick={requestClose}
                    className="absolute right-3.5 top-3.5 z-10"
                />

                {/* en-tête + recherche */}
                <div className="shrink-0 px-5 pt-7 sm:px-8 sm:pt-8">
                    <div className="text-center">
                        <div className="mb-2.5 flex items-center justify-center gap-2.5">
                            <span className="bg-primary/45 h-px w-7" />
                            <FaStar
                                size={13}
                                className="text-primary/70"
                                aria-hidden="true"
                            />
                            <span className="bg-primary/45 h-px w-7" />
                        </div>
                        <h2
                            id="picker-title"
                            className="text-foreground font-quote text-3xl leading-tight tracking-tight"
                        >
                            Choisir un favori
                        </h2>
                        <p className="font-quote text-muted-foreground mx-auto mt-2 max-w-sm text-base italic leading-relaxed">
                            Quel ouvrage prendra la {PLACE_LABEL[rank]} de votre
                            podium{"\u00A0"}?
                        </p>
                    </div>

                    <SearchField
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onClear={() => setQuery("")}
                        placeholder="Rechercher un titre…"
                        aria-label="Rechercher un titre"
                        wrapperClassName="mt-6"
                    />
                </div>

                {/* liste défilable : hauteur fixe pour que la modale ne
                    change pas de taille à l'arrivée des résultats */}
                <ul
                    aria-busy={loadingBooks}
                    className={cn(
                        "border-hairline mt-4 flex h-[min(28rem,55vh)] min-h-0 shrink flex-col gap-2 overflow-y-auto border-t border-dashed px-5 py-4 transition-opacity duration-200 sm:px-8",
                        refreshing && "opacity-60",
                    )}
                >
                    {firstLoad &&
                        Array.from({ length: SKELETON_ROWS }, (_, i) => (
                            <PickerRowSkeleton key={i} />
                        ))}
                    {userBooks.map((ub) => {
                        const author = `${ub.book.author.firstname} ${ub.book.author.lastname}`;
                        const current = ub.favoriteRank === rank;
                        return (
                            <li key={ub.id}>
                                <button
                                    type="button"
                                    disabled={loading || current}
                                    onClick={() =>
                                        setFavoriteBook({
                                            variables: {
                                                userBookId: ub.id,
                                                rank,
                                            },
                                        })
                                    }
                                    className={cn(
                                        "border-border bg-sunken/60 group flex w-full cursor-pointer items-center gap-3.5 rounded-xl border px-3 py-2.5 text-left transition-colors duration-200",
                                        "hover:border-primary/55 focus-visible:ring-primary/60 focus-visible:outline-none focus-visible:ring-2",
                                        "disabled:hover:border-border disabled:cursor-default",
                                        current && "border-primary/40",
                                    )}
                                >
                                    <BookCover
                                        coverUrl={ub.book.coverUrl}
                                        title={ub.book.title}
                                        author={author}
                                        compact
                                        className="border-border aspect-2/3 w-11 shrink-0 rounded-md border"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-foreground font-quote group-hover:text-primary truncate text-lg leading-tight transition-colors">
                                            {ub.book.title}
                                        </p>
                                        <p className="font-body text-muted-foreground mt-0.5 truncate text-xs">
                                            {author}
                                        </p>
                                        {(ub.book.category?.name ||
                                            ub.book.publishedYear) && (
                                            <p className="font-quote text-gold-muted mt-0.5 truncate text-xs italic">
                                                {[
                                                    ub.book.category?.name,
                                                    ub.book.publishedYear,
                                                ]
                                                    .filter(Boolean)
                                                    .join(" · ")}
                                            </p>
                                        )}
                                    </div>
                                    {ub.favoriteRank && (
                                        <span className="bg-primary text-primary-foreground text-xxs inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono font-medium">
                                            <FaStar
                                                size={10}
                                                aria-hidden="true"
                                            />{" "}
                                            {ub.favoriteRank}
                                        </span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                    {!loadingBooks && userBooks.length === 0 && (
                        <li className="text-muted-foreground font-quote py-8 text-center text-base italic">
                            {!search
                                ? "Aucun livre dans votre bibliothèque."
                                : "Aucun titre ne correspond."}
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
