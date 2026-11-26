import { useForm } from "react-hook-form";
import { LuMinus, LuPlus } from "react-icons/lu";
import Button from "@/components/UI/Button";
import { cn } from "@/lib/utils";
import { READING_GOAL_MAX_TARGET } from "@/lib/readingGoal";
import { ReadingGoalFormData, ReadingGoalFormProps } from "@/types/types";

const PRESETS = [6, 12, 24, 52] as const;

const STEP_BUTTON =
    "border-border text-muted-foreground hover:border-primary/55 hover:text-primary focus-visible:ring-ring grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Saisie de l'objectif : un compteur centré (− / nombre / +), des valeurs
 * rapides (un livre par mois, toutes les deux semaines, par semaine) et le
 * bouton d'action en pleine largeur dessous.
 */
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
        setValue,
        watch,
        formState: { errors },
    } = useForm<ReadingGoalFormData>({
        defaultValues: { target: defaultTarget },
    });

    const target = Number(watch("target")) || 0;
    const setTarget = (value: number) =>
        setValue(
            "target",
            Math.min(Math.max(value, 1), READING_GOAL_MAX_TARGET),
            { shouldValidate: true },
        );

    return (
        <form
            onSubmit={handleSubmit(({ target }) => onSubmit(target))}
            className="flex flex-col items-center gap-4"
        >
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    className={STEP_BUTTON}
                    onClick={() => setTarget(target - 1)}
                    disabled={target <= 1}
                    aria-label="Un livre de moins"
                >
                    <LuMinus size={16} />
                </button>
                <div className="flex flex-col items-center">
                    <label htmlFor="reading-goal-target" className="sr-only">
                        Nombre de livres visé
                    </label>
                    <input
                        id="reading-goal-target"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={READING_GOAL_MAX_TARGET}
                        aria-invalid={errors.target ? "true" : "false"}
                        className="text-foreground font-title w-24 bg-transparent text-center text-4xl font-bold [appearance:textfield] focus-visible:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
                    <span className="text-muted-foreground font-quote text-sm italic">
                        livre{target > 1 ? "s" : ""} cette année
                    </span>
                </div>
                <button
                    type="button"
                    className={STEP_BUTTON}
                    onClick={() => setTarget(target + 1)}
                    disabled={target >= READING_GOAL_MAX_TARGET}
                    aria-label="Un livre de plus"
                >
                    <LuPlus size={16} />
                </button>
            </div>

            <div
                className="flex flex-wrap justify-center gap-2"
                role="group"
                aria-label="Objectifs courants"
            >
                {PRESETS.map((preset) => (
                    <button
                        key={preset}
                        type="button"
                        onClick={() => setTarget(preset)}
                        aria-pressed={target === preset}
                        className={cn(
                            "font-body focus-visible:ring-ring cursor-pointer rounded-full border px-3 py-1 text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2",
                            target === preset
                                ? "border-primary/60 bg-primary/15 text-primary"
                                : "border-border text-muted-foreground hover:text-primary hover:border-primary/40",
                        )}
                    >
                        {preset}
                    </button>
                ))}
            </div>

            {errors.target && (
                <p className="text-destructive text-xs">
                    {errors.target.message}
                </p>
            )}

            <div className="flex w-full flex-col gap-2 sm:max-w-xs">
                <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    fullWidth
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
                        fullWidth
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Annuler
                    </Button>
                )}
            </div>
        </form>
    );
}
