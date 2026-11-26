import { useForm } from "react-hook-form";
import Button from "@/components/UI/Button";
import { Input } from "@/components/UI/form/Input";
import { READING_GOAL_MAX_TARGET } from "@/lib/readingGoal";
import { ReadingGoalFormData, ReadingGoalFormProps } from "@/types/types";

/** Saisie de l'objectif : nombre de livres visé pour l'année. */
export default function ReadingGoalForm({
    defaultTarget = 12,
    submitLabel,
    loading,
    onSubmit,
    onCancel,
}: ReadingGoalFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ReadingGoalFormData>({
        defaultValues: { target: defaultTarget },
    });

    return (
        <form
            onSubmit={handleSubmit(({ target }) => onSubmit(target))}
            className="flex flex-col gap-3 sm:flex-row sm:items-start"
        >
            <div className="flex items-center gap-2.5">
                <label
                    htmlFor="reading-goal-target"
                    className="text-muted-foreground font-body shrink-0 text-sm"
                >
                    Objectif
                </label>
                <div className="w-24">
                    <Input
                        id="reading-goal-target"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={READING_GOAL_MAX_TARGET}
                        errorMessage={errors.target?.message}
                        hideErrorMessage
                        {...register("target", {
                            valueAsNumber: true,
                            required: "Indiquez un nombre de livres",
                            min: { value: 1, message: "Au moins un livre" },
                            max: {
                                value: READING_GOAL_MAX_TARGET,
                                message: `Au plus ${READING_GOAL_MAX_TARGET} livres`,
                            },
                        })}
                    />
                </div>
                <span className="text-muted-foreground font-body text-sm">
                    livres
                </span>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={loading}
                    disabled={loading}
                >
                    {submitLabel}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="text"
                        size="sm"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Annuler
                    </Button>
                )}
            </div>
            {errors.target && (
                <p className="text-destructive text-xs sm:self-center">
                    {errors.target.message}
                </p>
            )}
        </form>
    );
}
