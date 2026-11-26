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
};

export type PodiumStepProps = LeaderboardEntryProps & {
    /** Place affichée (0 à 2), qui fixe la colonne et la hauteur. */
    place: number;
};

export type LeaderboardPodiumProps = {
    entries: LeaderboardEntry[];
    viewerId?: string;
};

export type LeaderboardViewerBannerProps = {
    standing: LeaderboardStanding;
    period: LeaderboardPeriod;
};
