import type { CSSProperties } from "react";

export type LeaderboardPeriod = "MONTH" | "ALL_TIME";
export type LeaderboardScope = "ALL" | "FOLLOWING";

export type LeaderboardUser = {
    id: string;
    userName: string;
    avatar?: string | null;
    level: number;
    title?: { id: string; label: string } | null;
};

export type LeaderboardStanding = {
    rank: number;
    xp: number;
};

export type LeaderboardEntry = LeaderboardStanding & {
    user: LeaderboardUser;
};

export type Leaderboard = {
    entries: LeaderboardEntry[];
    viewer: LeaderboardStanding | null;
};

export type LeaderboardEntryProps = {
    entry: LeaderboardEntry;
    isViewer: boolean;
    /** Rang partagé avec un autre lecteur. */
    tied?: boolean;
};

export type PodiumStepProps = LeaderboardEntryProps & {
    /** Place affichée (0 à 2) : la première au centre et surélevée. */
    place: number;
};

export type LeaderboardPodiumProps = {
    entries: LeaderboardEntry[];
    viewerId?: string;
};

export type LeaderboardAvatarProps = {
    userName: string;
    avatar?: string | null;
    className?: string;
    style?: CSSProperties;
};

export type LeaderboardViewerBannerProps = {
    /** Position du lecteur, ou null s'il n'a pas gagné d'XP sur la période. */
    standing: LeaderboardStanding | null;
    period: LeaderboardPeriod;
    /** XP et rang de la dernière place affichée (cible à rejoindre). */
    lastXp: number;
    lastRank: number;
};

export type LeaderboardEmptyProps = {
    period: LeaderboardPeriod;
    scope: LeaderboardScope;
    /** Le lecteur ne suit personne (portée « Mes abonnements »). */
    noFollows: boolean;
    onShowAll: () => void;
};
