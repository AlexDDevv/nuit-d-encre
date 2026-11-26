import { useState } from "react";
import { LuTarget } from "react-icons/lu";
import Button from "@/components/UI/Button";
import { useToast } from "@/hooks/toast/useToast";
import { useReadingGoal } from "@/hooks/gamification/useReadingGoal";
import { goalRatio, goalStatusLabel } from "@/lib/readingGoal";
import { parseGraphQLError } from "@/utils/graphql-error";
import { ReadingGoalCardProps } from "@/types/types";
import ReadingGoalForm from "./ReadingGoalForm";
import { Card, SectionHeading } from "./ProfileUI";

/**
 * Défi de lecture de l'année : jauge des livres lus (datés dans l'année)
 * face à l'objectif. Le propriétaire le fixe, le modifie ou l'abandonne ; un
 * visiteur ne le voit que si la bibliothèque est partagée et le défi lancé.
 */
export default function ReadingGoalCard({
    userId,
    isOwner,
}: ReadingGoalCardProps) {
    const { showToast } = useToast();
    const { goal, loading, saveGoal, clearGoal, isSaving, isClearing } =
        useReadingGoal(isOwner ? undefined : userId);
    const [editing, setEditing] = useState(false);
    const year = goal?.year ?? new Date().getFullYear();

    if (loading && !goal) return null;
    if (!goal && !isOwner) return null;

    const handleSave = async (target: number) => {
        try {
            await saveGoal(target);
            setEditing(false);
        } catch (error) {
            const { title, description } = parseGraphQLError(
                error,
                "setReadingGoal",
            );
            showToast({ type: "error", title, description });
        }
    };

    const handleClear = async () => {
        try {
            await clearGoal();
            setEditing(false);
        } catch (error) {
            const { title, description } = parseGraphQLError(
                error,
                "clearReadingGoal",
            );
            showToast({ type: "error", title, description });
        }
    };

    return (
        <Card glow={false} className="p-5 md:p-6">
            <SectionHeading icon={LuTarget}>Défi {year}</SectionHeading>

            {!goal ? (
                <div className="flex flex-col gap-4">
                    <p className="text-muted-foreground font-body text-sm leading-relaxed">
                        Combien de livres lirez-vous cette année ? Chaque livre
                        passé en « Lu » ou daté dans l'année fait avancer la
                        jauge.
                    </p>
                    <ReadingGoalForm
                        submitLabel="Me lancer le défi"
                        loading={isSaving}
                        onSubmit={handleSave}
                    />
                </div>
            ) : editing ? (
                <ReadingGoalForm
                    defaultTarget={goal.target}
                    submitLabel="Enregistrer"
                    loading={isSaving}
                    onSubmit={handleSave}
                    onCancel={() => setEditing(false)}
                />
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-title text-foreground text-2xl font-bold">
                            {goal.booksRead}
                            <span className="text-muted-foreground text-base font-medium">
                                {" "}
                                / {goal.target} livre
                                {goal.target > 1 ? "s" : ""}
                            </span>
                        </p>
                        <p className="text-primary font-body text-sm">
                            {goalStatusLabel(goal)}
                        </p>
                    </div>
                    <div
                        role="progressbar"
                        aria-label={`Défi de lecture ${goal.year}`}
                        aria-valuemin={0}
                        aria-valuemax={goal.target}
                        aria-valuenow={Math.min(goal.booksRead, goal.target)}
                        className="bg-muted h-2.5 overflow-hidden rounded-full"
                    >
                        <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,hsl(36_42%_52%),hsl(43_64%_84%))] transition-[width] duration-700"
                            style={{ width: `${goalRatio(goal) * 100}%` }}
                        />
                    </div>
                    {isOwner && (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-muted-foreground font-body text-xs">
                                {goal.booksRead >= goal.target
                                    ? `+${goal.rewardXp} XP gagnés pour ce défi.`
                                    : `+${goal.rewardXp} XP à l'arrivée.`}
                            </p>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="text"
                                    size="xs"
                                    onClick={() => setEditing(true)}
                                >
                                    Modifier
                                </Button>
                                <Button
                                    variant="destructiveGhost"
                                    size="xs"
                                    onClick={handleClear}
                                    loading={isClearing}
                                    disabled={isClearing}
                                >
                                    Abandonner
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
