import { useState } from "react";
import { LuBookOpen, LuFlag, LuPencil } from "react-icons/lu";
import Button from "@/components/UI/Button";
import Diamond from "@/components/UI/Diamond";
import ReadingGoalSkeleton from "@/components/UI/skeleton/ReadingGoalSkeleton";
import { useToast } from "@/hooks/toast/useToast";
import { useReadingGoal } from "@/hooks/gamification/useReadingGoal";
import { goalChip, goalSubtitle } from "@/lib/readingGoal";
import { parseGraphQLError } from "@/utils/graphql-error";
import { ReadingGoalCardProps } from "@/types/types";
import { Card, Ornament, Pill, SectionHeading } from "../ProfileUI";
import ReadingGoalAbandon from "./ReadingGoalAbandon";
import ReadingGoalForm from "./ReadingGoalForm";
import ReadingGoalView from "./ReadingGoalView";

type Mode = "view" | "edit" | "abandon";

/**
 * Défi de lecture de l'année : jauge des livres lus (datés dans l'année)
 * face à l'objectif. Le propriétaire le fixe, le modifie ou l'abandonne ; un
 * visiteur ne le voit que si la bibliothèque est partagée et le défi lancé.
 */
export default function ReadingGoalCard({
    userId,
    userName,
    isOwner,
}: ReadingGoalCardProps) {
    const { showToast } = useToast();
    const { goal, loading, saveGoal, clearGoal, isSaving, isClearing } =
        useReadingGoal(isOwner ? undefined : userId);
    const [mode, setMode] = useState<Mode>("view");
    const [saveError, setSaveError] = useState<{
        title: string;
        description: string;
    } | null>(null);
    const year = goal?.year ?? new Date().getFullYear();

    if (loading && !goal) return isOwner ? <ReadingGoalSkeleton /> : null;
    if (!goal && !isOwner) return null;

    const visitorOf = isOwner ? undefined : userName;
    const editing = !goal || mode === "edit";

    const handleSave = async (target: number) => {
        setSaveError(null);
        try {
            await saveGoal(target);
            setMode("view");
        } catch (error) {
            setSaveError(parseGraphQLError(error, "setReadingGoal"));
        }
    };

    const handleClear = async () => {
        try {
            await clearGoal();
            setMode("view");
        } catch (error) {
            const { title, description } = parseGraphQLError(
                error,
                "clearReadingGoal",
            );
            showToast({ type: "error", title, description });
        }
    };

    const leaveForm = () => {
        setSaveError(null);
        setMode("view");
    };

    const chip =
        goal && mode === "edit"
            ? { label: "Modification", tone: "muted" as const }
            : goal
              ? goalChip(goal)
              : null;

    const subtitle = !goal
        ? "Un serment de lecteur, à tenir jusqu'au 31 décembre"
        : mode === "edit"
          ? `Ajuster le serment de ${year}`
          : goalSubtitle(goal, visitorOf);

    return (
        <Card glow={false} className="flex flex-col gap-5 p-5 md:p-6">
            <div>
                <SectionHeading
                    icon={LuBookOpen}
                    right={
                        chip && (
                            <Pill
                                tone={chip.tone === "done" ? "gold" : chip.tone}
                                className={
                                    chip.tone === "done"
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : undefined
                                }
                            >
                                <Diamond className="text-current" />
                                {chip.label}
                            </Pill>
                        )
                    }
                >
                    Défi de lecture {year}
                </SectionHeading>
                <p className="font-quote text-secondary-foreground -mt-2 text-xl italic leading-snug">
                    {subtitle}
                </p>
            </div>

            <Ornament className="w-full" width="flex-1" />

            {editing ? (
                <ReadingGoalForm
                    year={year}
                    goal={goal ?? undefined}
                    loading={isSaving}
                    error={saveError}
                    onSubmit={handleSave}
                    onCancel={goal ? leaveForm : undefined}
                />
            ) : (
                <>
                    <ReadingGoalView goal={goal} visitorOf={visitorOf} />

                    {mode === "abandon" && (
                        <ReadingGoalAbandon
                            goal={goal}
                            loading={isClearing}
                            onKeep={() => setMode("view")}
                            onConfirm={handleClear}
                        />
                    )}

                    <div className="border-border flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t pt-3.5">
                        <span className="font-quote text-muted-foreground italic">
                            Seuls les livres lus et datés en {year} comptent.
                        </span>
                        {isOwner && mode === "view" && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    leftIcon={<LuPencil size={14} />}
                                    ariaLabel="Modifier l'objectif du défi de lecture"
                                    onClick={() => setMode("edit")}
                                >
                                    Modifier
                                </Button>
                                <Button
                                    variant="destructiveGhost"
                                    size="sm"
                                    leftIcon={<LuFlag size={14} />}
                                    ariaLabel="Abandonner le défi de lecture"
                                    onClick={() => setMode("abandon")}
                                >
                                    Abandonner
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </Card>
    );
}
