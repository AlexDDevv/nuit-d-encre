import { registerEnumType } from "type-graphql";

export type XPResultType = {
    newXP: number;
    newLevel: number;
    levelUp: boolean;
};

export type GrantXPOptions = {
    // Identifie ce qui est récompensé : une même clé ne rapporte de l'XP
    // qu'une seule fois par utilisateur et par type d'action.
    xpKey: string;
    targetId?: string;
    metadata?: Record<string, any>;
};

export enum LeaderboardPeriod {
    MONTH = "MONTH",
    ALL_TIME = "ALL_TIME",
}

export enum LeaderboardScope {
    ALL = "ALL",
    FOLLOWING = "FOLLOWING",
}

registerEnumType(LeaderboardPeriod, {
    name: "LeaderboardPeriod",
    description: "Mois en cours (heure de Paris) ou depuis l'inscription",
});
registerEnumType(LeaderboardScope, {
    name: "LeaderboardScope",
    description: "Tous les lecteurs, ou les abonnements du lecteur et lui-même",
});
