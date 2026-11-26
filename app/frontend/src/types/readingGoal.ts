export type ReadingGoalProgress = {
    year: number;
    target: number;
    booksRead: number;
    /** XP accordée à l'arrivée (une fois par année). */
    rewardXp: number;
};

export type ReadingGoalChip = {
    label: string;
    /** `deep` : défi en cours ; `done` : serment tenu (pastille pleine). */
    tone: "deep" | "done";
};

export type ReadingGoalCardProps = {
    userId: string;
    /** Pseudo du lecteur, pour les textes vus par un visiteur. */
    userName: string;
    isOwner: boolean;
};

export type ReadingGoalViewProps = {
    goal: ReadingGoalProgress;
    /** Pseudo du lecteur quand un visiteur regarde la carte. */
    visitorOf?: string;
};

export type ReadingGoalFormProps = {
    year: number;
    /** Défi en cours : le formulaire sert alors à le modifier. */
    goal?: ReadingGoalProgress;
    loading: boolean;
    /** Titre et description de l'échec du dernier enregistrement. */
    error?: { title: string; description: string } | null;
    onSubmit: (target: number) => void;
    onCancel?: () => void;
};

export type ReadingGoalFormData = {
    target: number;
};

export type ReadingGoalAbandonProps = {
    goal: ReadingGoalProgress;
    loading: boolean;
    onKeep: () => void;
    onConfirm: () => void;
};
