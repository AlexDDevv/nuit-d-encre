import type {
    BannerVariant,
    BannerVariantConfig,
} from "@/components/UI/Banner/Banner.types";

export const baseClasses =
    "relative flex flex-col gap-4 overflow-hidden rounded-xl border-2 px-5 py-4 sm:flex-row sm:items-center";

/** Couleurs d'une variante, lues dans les tokens d'état (styles/tokens.css). */
const stateColors = (state: string) => ({
    accent: `var(--color-${state})`,
    onAccent: `var(--color-${state}-foreground)`,
    border: `var(--color-${state}-border)`,
    tint: `var(--color-${state}-surface)`,
    iconBg: `var(--color-${state}-subtle)`,
});

/**
 * Configuration sémantique par variante. La couleur colore bordure / icône /
 * accent - jamais le fond, qui reste une surface sombre légèrement teintée.
 */
export const variantConfig: Record<BannerVariant, BannerVariantConfig> = {
    info: { icon: "info", role: "status", ...stateColors("info") },
    success: { icon: "checkCircle", role: "status", ...stateColors("success") },
    warning: {
        icon: "alertTriangle",
        role: "status",
        ...stateColors("warning"),
    },
    error: { icon: "alertOctagon", role: "alert", ...stateColors("error") },
    completion: {
        icon: "sparkles",
        role: "status",
        gold: true,
        ...stateColors("reward"),
    },
};
