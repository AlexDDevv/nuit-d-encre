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
        chip: "border-[hsl(0_0%_42%/0.55)] bg-[hsl(20_12%_23%/0.7)] text-[hsl(20_12%_78%)]",
        dot: "bg-[hsl(20_12%_62%)]",
    },
    READING: {
        chip: "border-primary/45 bg-[hsl(43_30%_25%/0.5)] text-primary",
        dot: "bg-primary",
    },
    READ: {
        chip: "border-[hsl(140_33%_46%/0.5)] bg-[hsl(140_33%_36%/0.22)] text-[hsl(140_48%_72%)]",
        dot: "bg-[hsl(140_45%_60%)]",
    },
    PAUSED: {
        chip: "border-[hsl(25_78%_51%/0.5)] bg-[hsl(25_78%_51%/0.16)] text-[hsl(25_82%_70%)]",
        dot: "bg-[hsl(25_80%_62%)]",
    },
    ABANDONED: {
        chip: "border-[hsl(0_30%_45%/0.45)] bg-[hsl(0_20%_24%/0.45)] text-[hsl(0_22%_70%)]",
        dot: "bg-[hsl(0_28%_55%)]",
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
