import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { FaXmark } from "react-icons/fa6";
import LibraryGridCard from "@/components/sections/library/LibraryGridCard";
import LibraryListRow from "@/components/sections/library/LibraryListRow";
import BookShelf from "@/components/sections/library/BookShelf";
import LayoutButtons from "@/components/sections/library/UI/LayoutButtons";
import StatusFilterSegments from "@/components/sections/library/UI/StatusFilterSegments";
import SelectCategory from "@/components/sections/book/SelectCategory";
import Pagination from "@/components/UI/Pagination";
import { useUserBooksData } from "@/hooks/userBook/useUserBooksData";
import { useUserBookStatusCounts } from "@/hooks/userBook/useUserBookStatusCounts";
import { useUserBookMutations } from "@/hooks/userBook/useUserBookMutations";
import { useToast } from "@/hooks/toast/useToast";
import { useAuthContext } from "@/hooks/auth/useAuthContext";
import { GET_USER_PROFILE } from "@/graphql/user/profile";
import {
    GRAPHQL_ERROR_CODES,
    hasGraphQLErrorCode,
    isNotFoundError,
} from "@/lib/graphqlErrors";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/constants/bookStatus";
import {
    BookCardLibraryProps,
    LayoutOptionsValue,
    UserBookStatus,
} from "@/types/types";

const STATUS_STATS: { value: UserBookStatus; label: string }[] = [
    { value: "TO_READ", label: "À lire" },
    { value: "READING", label: "En cours" },
    { value: "READ", label: "Lu" },
    { value: "PAUSED", label: "En pause" },
];

function StatChip({
    value,
    label,
    dotClass,
    primary,
}: {
    value: number;
    label: string;
    dotClass?: string;
    primary?: boolean;
}) {
    return (
        <span
            className={cn(
                "font-body inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs",
                primary
                    ? "border-primary/40 text-primary bg-[hsl(43_59%_81%/0.12)]"
                    : "border-border text-muted-foreground bg-[hsl(20_3%_16%/0.6)]",
            )}
        >
            {dotClass && (
                <span className={cn("h-2 w-2 rounded-full", dotClass)} />
            )}
            <span className="text-foreground font-mono font-medium">
                {value}
            </span>
            <span className="opacity-85">{label}</span>
        </span>
    );
}

/**
 * Bibliothèque : la sienne sur /library, celle d'un autre lecteur en lecture
 * seule sur /profil/:id/bibliotheque (si son propriétaire la partage).
 */
export default function UserLibrary() {
    const { id: ownerId } = useParams<{ id: string }>();
    const { user: currentUser } = useAuthContext();
    const readOnly = !!ownerId && ownerId !== currentUser?.id;
    const libraryUserId = readOnly ? ownerId : undefined;

    const { data: ownerData } = useQuery(GET_USER_PROFILE, {
        variables: { id: ownerId },
        skip: !readOnly,
    });
    const ownerName: string | undefined = ownerData?.getUserProfile?.userName;

    const [layout, setLayout] = useState<LayoutOptionsValue>("grid");
    const [selectedStatus, setSelectedStatus] = useState<UserBookStatus | "">(
        "",
    );
    const [deletingUserBookId, setDeletingUserBookId] = useState<string | null>(
        null,
    );
    const [searchParams, setSearchParams] = useSearchParams();
    const { showToast } = useToast();

    const {
        userBooks,
        totalCount,
        currentPage,
        setCurrentPage,
        PER_PAGE,
        statusLabelMap,
        filters,
        setFilters,
        userBooksError,
    } = useUserBooksData({ mode: "library", userId: libraryUserId });

    const { counts, countByStatus } = useUserBookStatusCounts(libraryUserId);

    const hasCategory = !!searchParams.get("categoryId");
    const hasAnyFilter = !!selectedStatus || filters.length > 0 || hasCategory;

    const handleStatusChange = (statusEnum: UserBookStatus | "") => {
        setSelectedStatus(statusEnum);
        const label = statusEnum ? statusLabelMap[statusEnum] : "";
        setFilters(label ? [label] : []);
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        setSelectedStatus("");
        setFilters([]);
        setCurrentPage(1);
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("category");
        newParams.delete("categoryId");
        setSearchParams(newParams);
    };

    const { updateUserBook, isUpdatingUserBook, deleteUserBook } =
        useUserBookMutations();

    const handleStatusBookChange = async ({
        userBookId,
        status,
    }: {
        userBookId: string;
        status: UserBookStatus;
    }) => {
        try {
            await updateUserBook({ id: userBookId, status });
            showToast({
                type: "success",
                title: "Succès",
                description:
                    "La modification du statut de votre livre a bien été prise en compte !",
            });
        } catch {
            showToast({
                type: "error",
                title: "Erreur",
                description:
                    "La modification du statut de votre livre a échoué...",
            });
        }
    };

    const handleDeleteUserBook = async (userBookId: string) => {
        setDeletingUserBookId(userBookId);
        try {
            await deleteUserBook(userBookId);
        } finally {
            setDeletingUserBookId(null);
        }
    };

    // Après tous les hooks : la Response levée est captée par le routeur.
    if (readOnly && userBooksError) {
        if (
            hasGraphQLErrorCode(userBooksError, GRAPHQL_ERROR_CODES.forbidden)
        ) {
            throw new Response("Cette bibliothèque est privée", {
                status: 403,
            });
        }
        if (isNotFoundError(userBooksError)) {
            throw new Response("Lecteur introuvable", { status: 404 });
        }
        throw new Response("Impossible de charger la bibliothèque", {
            status: 500,
        });
    }

    return (
        <section className="max-w-330 mx-auto flex w-full flex-col gap-8">
            {/* ── EN-TÊTE ÉDITORIAL ── */}
            <header>
                <div className="mb-3 flex items-center gap-2.5">
                    <span className="bg-primary/50 h-px w-8" />
                    {readOnly ? (
                        <Link
                            to={`/profil/${ownerId}`}
                            className="hover:text-primary focus-visible:ring-ring font-quote rounded-sm text-sm italic tracking-wide text-[hsl(43_30%_62%)] transition-colors focus-visible:outline-none focus-visible:ring-2"
                        >
                            La collection de {ownerName ?? "ce lecteur"}
                        </Link>
                    ) : (
                        <span className="font-quote text-sm italic tracking-wide text-[hsl(43_30%_62%)]">
                            Votre collection
                        </span>
                    )}
                </div>
                <h1 className="text-foreground font-quote text-balance text-5xl leading-none">
                    {readOnly ? "Ses rayons" : "Vos rayons"}
                </h1>
                <p className="text-muted-foreground font-quote mt-4 max-w-2xl text-base italic leading-relaxed">
                    {readOnly
                        ? "Les ouvrages de sa collection, rangés, repris, mis de côté ou attendus à la chandelle."
                        : "Les ouvrages que vous avez fait entrer dans la maison, rangés, repris, mis de côté ou attendus à la chandelle."}
                </p>

                {counts.total > 0 && (
                    <div className="mt-6 flex flex-wrap items-center gap-2.5">
                        <StatChip
                            value={counts.total}
                            label={`ouvrage${counts.total > 1 ? "s" : ""} en tout`}
                            primary
                        />
                        {STATUS_STATS.map((s) => (
                            <StatChip
                                key={s.value}
                                value={countByStatus[s.value]}
                                label={s.label}
                                dotClass={STATUS_COLORS[s.value].dot}
                            />
                        ))}
                    </div>
                )}
            </header>

            {/* ── BARRE DE CONTRÔLE ── */}
            <div className="border-border sticky top-0 z-30 -mx-4 border-y bg-[hsl(20_3%_17%/0.86)] px-4 py-4 backdrop-blur-sm sm:mx-0 sm:rounded-xl sm:border-2 sm:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <StatusFilterSegments
                        selectedStatus={selectedStatus}
                        onStatusChange={handleStatusChange}
                        countByStatus={countByStatus}
                        total={counts.total}
                    />
                    <div className="flex items-center gap-2">
                        <SelectCategory />
                        {hasAnyFilter && (
                            <button
                                type="button"
                                onClick={clearAllFilters}
                                className="text-muted-foreground hover:text-primary focus-visible:ring-ring font-body inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2"
                            >
                                <FaXmark size={13} aria-hidden="true" /> Tout
                                effacer
                            </button>
                        )}
                        <span className="bg-border hidden h-7 w-px lg:inline" />
                        <LayoutButtons
                            activeLayout={layout}
                            onLayoutChange={setLayout}
                        />
                    </div>
                </div>
            </div>

            {layout === "shelf" ? (
                <div className="max-w-180 grid w-full auto-rows-min grid-cols-[repeat(auto-fill,7rem)] items-start justify-start gap-10">
                    {userBooks.map((userBook: BookCardLibraryProps) => (
                        <BookShelf
                            key={userBook.id}
                            book={userBook.book}
                            status={userBook.status}
                            isFavorite={userBook.isFavorite}
                            favoriteRank={userBook.favoriteRank}
                        />
                    ))}
                </div>
            ) : layout === "grid" ? (
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5">
                    {userBooks.map((userBook: BookCardLibraryProps) => (
                        <LibraryGridCard
                            key={userBook.id}
                            id={userBook.id}
                            book={userBook.book}
                            status={userBook.status}
                            isFavorite={userBook.isFavorite}
                            favoriteRank={userBook.favoriteRank}
                            layout={layout}
                            onStatusChange={handleStatusBookChange}
                            isUpdatingUserBook={isUpdatingUserBook}
                            handleDeleteUserBook={handleDeleteUserBook}
                            isDeletingUserBook={
                                deletingUserBookId === userBook.id
                            }
                            readOnly={readOnly}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {userBooks.map((userBook: BookCardLibraryProps) => (
                        <LibraryListRow
                            key={userBook.id}
                            id={userBook.id}
                            book={userBook.book}
                            status={userBook.status}
                            isFavorite={userBook.isFavorite}
                            favoriteRank={userBook.favoriteRank}
                            layout={layout}
                            onStatusChange={handleStatusBookChange}
                            isUpdatingUserBook={isUpdatingUserBook}
                            handleDeleteUserBook={handleDeleteUserBook}
                            isDeletingUserBook={
                                deletingUserBookId === userBook.id
                            }
                            readOnly={readOnly}
                        />
                    ))}
                </div>
            )}
            <Pagination
                className="mx-auto my-0 w-max"
                currentPage={currentPage}
                totalCount={totalCount}
                perPage={PER_PAGE.library}
                onPageChange={setCurrentPage}
            />
        </section>
    );
}
