import { IconType } from "react-icons";

import { Book } from "./book";
import { User } from "./user";

export type UserBookStatus =
    "TO_READ" | "READING" | "READ" | "PAUSED" | "ABANDONED";

export interface UserBook {
    id: string;
    book: Book;
    user: User;
    status: UserBookStatus;
    startedAt?: string | null;
    /** Date de fin de lecture `YYYY-MM-DD` ; compte pour le défi de son année. */
    finishedAt?: string | null;
    isFavorite: boolean;
    favoriteRank: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserBookInput {
    bookId: string;
    status: UserBookStatus;
    startedAt?: string;
    finishedAt?: string;
}

export interface UpdateUserBookInput {
    id?: string;
    status?: UserBookStatus;
    startedAt?: string | null;
    finishedAt?: string | null;
}

export type FinishedAtFieldProps = {
    userBookId: string;
    finishedAt?: string | null;
    onChange?: (userBookId: string, finishedAt: string | null) => void;
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
};

export type UserBookStatusConfig = {
    icon: IconType;
    label: string;
    value: UserBookStatus;
};

/* ──────────────────────────── Props de composants ──────────────────────────── */

export type SelectBookStatusProps = {
    value?: UserBookStatus;
    onChange?: (status: UserBookStatus) => void;
    disabled?: boolean;
    /** Colore le déclencheur selon le statut courant (utilisé dans la bibliothèque). */
    colored?: boolean;
    /** Classes supplémentaires pour le déclencheur (ex. largeur). */
    className?: string;
};

export interface FavoriteBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    userBookId: string;
    book: Book;
    isFavorite: boolean;
    favoriteRank: number | null;
}

/** Options de useUserBooksData : `userId` pour consulter la bibliothèque partagée d'un autre lecteur. */
export interface UseUserBooksOptions {
    mode: "library" | "home";
    userId?: string;
}
