/** Teinte par rang du podium : or, argent, bronze. */
export const PODIUM_TINTS = [
    "hsl(43 59% 81%)",
    "hsl(35 9% 76%)",
    "hsl(24 52% 60%)",
] as const;

export const podiumTint = (rank: number) => PODIUM_TINTS[Math.min(rank, 3) - 1];

/** Badge « Niv. N » du classement : pastille brun doré (LevelBadge restylé). */
export const LEVEL_PILL_CLASS =
    "font-body h-5.5 rounded-lg border-0 bg-secondary px-2 text-xs text-secondary-foreground";

/** Badge « Vous ». */
export const YOU_PILL_CLASS =
    "font-body bg-primary text-primary-foreground inline-flex h-5.5 shrink-0 items-center rounded-lg px-2 text-xs font-bold";
