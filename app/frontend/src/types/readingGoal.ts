export type ReadingGoalProgress = {
    year: number;
    target: number;
    booksRead: number;
    /** XP accordée à l'arrivée (une fois par année). */
    rewardXp: number;
};

export type ReadingGoalCardProps = {
    userId: string;
    isOwner: boolean;
};

export type ReadingGoalFormProps = {
    defaultTarget?: number;
    submitLabel: string;
    loading: boolean;
    onSubmit: (target: number) => void;
    onCancel?: () => void;
};

export type ReadingGoalFormData = {
    target: number;
};
