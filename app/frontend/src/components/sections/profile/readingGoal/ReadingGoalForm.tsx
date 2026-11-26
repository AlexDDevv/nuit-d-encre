import { useForm } from "react-hook-form";
import { LuFeather, LuMinus, LuPlus } from "react-icons/lu";
import Banner from "@/components/UI/Banner/Banner";
import XpPill from "@/components/UI/Banner/XpPill";
import Button from "@/components/UI/Button";
import ProgressGauge from "@/components/UI/ProgressGauge";
import { Input } from "@/components/UI/form/Input";
import { cn } from "@/lib/utils";
import {
    READING_GOAL_MAX_TARGET,
    booksWord,
    goalDraftPreview,
    goalRatio,
    goalRewardXp,
    isGoalXpCapped,
} from "@/lib/readingGoal";
import { ReadingGoalFormData, ReadingGoalFormProps } from "@/types/types";

const PRESETS = [
    { value: 12, hint: "un par mois" },
    { value: 24, hint: "deux par mois" },
    { value: 52, hint: "un par semaine" },
] as const;

const TARGET_RULES = {
    valueAsNumber: true,
    required: "Choisissez un nombre entier de 1 à 500.",
    validate: (value: number) =>
        (Number.isInteger(value) &&
            value >= 1 &&
            value <= READING_GOAL_MAX_TARGET) ||
        "Choisissez un nombre entier de 1 à 500.",
} as const;

/**
 * Lancer ou modifier le défi. À gauche, l'invitation (création) ou le rappel
 * de l'avancement avec l'aperçu du nouvel objectif (modification) ; à droite,
 * les objectifs courants, le compteur libre et la récompense annoncée.
 */
export default function ReadingGoalForm({
    year,
    goal,
    loading,
    error,
    onSubmit,
    onCancel,
}: ReadingGoalFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isValid },
    } = useForm<ReadingGoalFormData>({
        mode: "onChange",
        defaultValues: { target: goal?.target ?? 24 },
    });

    const draft = Number(watch("target"));
    const valid = isValid && !errors.target;
    const previewTarget = valid ? draft : (goal?.target ?? 1);
    const setTarget = (value: number) =>
        setValue(
            "target",
            Math.min(Math.max(value, 1), READING_GOAL_MAX_TARGET),
            { shouldValidate: true },
        );
    const step = (delta: number) =>
        setTarget(Number.isInteger(draft) ? draft + delta : 1);

    return (
        <form
            onSubmit={handleSubmit(({ target }) => onSubmit(target))}
            className="flex flex-wrap items-stretch gap-x-9 gap-y-6"
        >
            {goal ? (
                <div className="bg-muted/55 border-border flex min-w-0 flex-[1_1_300px] flex-col justify-center gap-3.5 rounded-xl border p-5">
                    <span className="font-title text-muted-foreground text-xs uppercase tracking-[0.16em]">
                        Votre avancement, conservé
                    </span>
                    <div className="flex items-baseline gap-2.5">
                        <span className="font-quote text-primary text-4xl font-medium leading-[0.9]">
                            {goal.booksRead}
                        </span>
                        <span className="text-secondary-foreground text-sm">
                            {booksWord(goal.booksRead)} déjà lu
                            {goal.booksRead >= 2 ? "s" : ""} ·{" "}
                            <span className="whitespace-nowrap">
                                objectif actuel : <strong>{goal.target}</strong>
                            </span>
                        </span>
                    </div>
                    <ProgressGauge
                        compact
                        ratio={goalRatio({
                            booksRead: goal.booksRead,
                            target: previewTarget,
                        })}
                        valueNow={Math.min(goal.booksRead, previewTarget)}
                        valueMax={previewTarget}
                        label="Aperçu de la jauge avec le nouvel objectif"
                    />
                    <p
                        aria-live="polite"
                        className="font-quote text-primary text-lg italic leading-snug"
                    >
                        {goalDraftPreview(goal, valid ? draft : Number.NaN)}
                    </p>
                </div>
            ) : (
                <div className="flex min-w-0 flex-[1_1_300px] flex-col justify-center gap-3.5">
                    <p className="font-quote text-primary text-3xl leading-tight">
                        Combien de livres promettez-vous à l'année {year} ?
                    </p>
                    <p className="text-muted-foreground max-w-[46ch] leading-relaxed">
                        Fixez votre serment de lecteur. Chaque livre lu et daté
                        dans l'année fera monter la jauge, et tenir parole vous
                        rapportera de l'XP.
                    </p>
                    <p className="font-quote text-secondary-foreground italic">
                        Un nombre modeste tenu vaut mieux qu'un grand serment
                        oublié.
                    </p>
                </div>
            )}

            <div className="flex min-w-0 flex-[999_1_420px] flex-col gap-4">
                <fieldset className="flex min-w-0 flex-col gap-2.5">
                    <legend className="font-title text-primary mb-2.5 text-sm font-medium uppercase tracking-[0.14em]">
                        Votre objectif pour {year}
                    </legend>
                    <div className="grid grid-cols-3 gap-2">
                        {PRESETS.map(({ value, hint }) => {
                            const selected = valid && draft === value;
                            return (
                                <Button
                                    key={value}
                                    variant="card"
                                    size="card"
                                    aria-pressed={selected}
                                    ariaLabel={`${value} livres, ${hint}`}
                                    onClick={() => setTarget(value)}
                                    className={cn(
                                        "min-h-16 rounded-2xl px-2 py-3",
                                        selected &&
                                            "border-primary bg-secondary hover:border-primary",
                                    )}
                                >
                                    <span className="flex flex-col items-center gap-0.5">
                                        <span className="font-title text-primary text-2xl leading-none">
                                            {value}
                                        </span>
                                        <span className="font-quote text-secondary-foreground text-sm font-normal italic">
                                            {hint}
                                        </span>
                                    </span>
                                </Button>
                            );
                        })}
                    </div>
                </fieldset>

                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2.5">
                    <label htmlFor="reading-goal-target" className="sr-only">
                        Nombre de livres visé
                    </label>
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="social"
                            size="icon"
                            className="size-11"
                            icon={<LuMinus size={16} />}
                            ariaLabel="Retirer un livre à l'objectif"
                            onClick={() => step(-1)}
                            disabled={valid && draft <= 1}
                        />
                        <div className="w-21">
                            <Input
                                id="reading-goal-target"
                                type="number"
                                inputMode="numeric"
                                autoComplete="off"
                                min={1}
                                max={READING_GOAL_MAX_TARGET}
                                aria-describedby={
                                    errors.target
                                        ? "reading-goal-help"
                                        : undefined
                                }
                                aria-invalid={valid ? "false" : "true"}
                                errorMessage={errors.target?.message}
                                hideErrorMessage
                                className="font-title h-11 text-center text-xl font-bold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                {...register("target", TARGET_RULES)}
                            />
                        </div>
                        <Button
                            variant="social"
                            size="icon"
                            className="size-11"
                            icon={<LuPlus size={16} />}
                            ariaLabel="Ajouter un livre à l'objectif"
                            onClick={() => step(1)}
                            disabled={valid && draft >= READING_GOAL_MAX_TARGET}
                        />
                    </div>
                    {errors.target && (
                        <span
                            id="reading-goal-help"
                            className="text-warning text-sm"
                        >
                            {errors.target.message}
                        </span>
                    )}
                </div>

                <Banner
                    variant="completion"
                    title={
                        goal
                            ? "Avec cet objectif, l'arrivée rapportera"
                            : "À l'arrivée, vous gagnerez"
                    }
                >
                    {valid ? <XpPill amount={goalRewardXp(draft)} /> : "— XP"}{" "}
                    <span className="font-quote italic">
                        {valid && isGoalXpCapped(draft)
                            ? "plafonnés à 500 XP"
                            : "10 XP par livre visé"}
                    </span>
                </Banner>

                {error && (
                    <Banner variant="error" title={error.title}>
                        {error.description} Votre saisie est conservée.
                    </Banner>
                )}

                <div className="flex flex-wrap items-center justify-end gap-2.5">
                    {onCancel && (
                        <Button
                            variant="outline"
                            size="lg"
                            className="text-base"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Annuler
                        </Button>
                    )}
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="text-base"
                        leftIcon={goal ? undefined : <LuFeather size={16} />}
                        loading={loading}
                        disabled={!valid || loading}
                    >
                        {goal ? "Enregistrer" : "Me lancer le défi"}
                    </Button>
                </div>
            </div>
        </form>
    );
}
