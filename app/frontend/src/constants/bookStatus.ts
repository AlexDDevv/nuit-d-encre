import { UserBookStatus, UserBookStatusConfig } from "@/types/types";
import {
    LuBookmarkPlus,
    LuBookOpenCheck,
    LuPause,
    LuBookCheck,
    LuBookX,
} from "react-icons/lu";

/**
 * Couleurs par statut de lecture (classes Tailwind), pour colorer le sélecteur
 * de statut et les pastilles dans la bibliothèque : à lire = neutre, en cours =
 * doré, lu = vert, en pause = ambre, abandonné = rouge sourd et éteint.
 */
export const STATUS_COLORS: Record<
    UserBookStatus,
    { chip: string; dot: string }
> = {
    TO_READ: {
        chip: "border-status-to-read-border bg-status-to-read-surface text-status-to-read",
        dot: "bg-status-to-read-dot",
    },
    READING: {
        chip: "border-status-reading-border bg-status-reading-surface text-status-reading",
        dot: "bg-status-reading-dot",
    },
    READ: {
        chip: "border-status-read-border bg-status-read-surface text-status-read",
        dot: "bg-status-read-dot",
    },
    PAUSED: {
        chip: "border-status-paused-border bg-status-paused-surface text-status-paused",
        dot: "bg-status-paused-dot",
    },
    ABANDONED: {
        chip: "border-status-abandoned-border bg-status-abandoned-surface text-status-abandoned",
        dot: "bg-status-abandoned-dot",
    },
};

export const BOOK_STATES: readonly UserBookStatusConfig[] = [
    {
        icon: LuBookmarkPlus,
        label: "À lire",
        value: "TO_READ",
    },
    {
        icon: LuBookOpenCheck,
        label: "En cours",
        value: "READING",
    },
    {
        icon: LuPause,
        label: "En pause",
        value: "PAUSED",
    },
    {
        icon: LuBookCheck,
        label: "Lu",
        value: "READ",
    },
    {
        icon: LuBookX,
        label: "Abandonné",
        value: "ABANDONED",
    },
] as const;
