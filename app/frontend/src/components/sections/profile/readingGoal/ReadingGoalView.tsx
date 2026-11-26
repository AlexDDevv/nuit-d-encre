import ProgressGauge from "@/components/UI/ProgressGauge";
import { cn } from "@/lib/utils";
import { booksWord, goalRatio, goalTagline } from "@/lib/readingGoal";
import { ReadingGoalViewProps } from "@/types/types";

/**
 * Défi lancé : compteur, phrase d'avancement et jauge à gauche, sceau d'XP à
 * droite (plein une fois le serment tenu).
 */
export default function ReadingGoalView({
    goal,
    visitorOf,
}: ReadingGoalViewProps) {
    const { booksRead, target, year, rewardXp } = goal;
    const done = booksRead >= target;
    const extra = booksRead - target;

    return (
        <div className="flex flex-wrap items-stretch gap-x-8 gap-y-6">
            <div className="flex min-w-0 flex-[999_1_420px] flex-col justify-center gap-4">
                <div className="flex flex-wrap items-end gap-4">
                    <span className="font-quote text-primary text-8xl font-medium leading-[0.85] [font-variant-numeric:oldstyle-nums]">
                        {booksRead}
                    </span>
                    <div className="flex flex-col gap-1 pb-1.5">
                        <span className="text-secondary-foreground text-lg">
                            sur{" "}
                            <strong className="font-title font-bold">
                                {target}
                            </strong>{" "}
                            {booksWord(target)}
                        </span>
                        <span className="font-title text-muted-foreground tracking-label text-xs uppercase">
                            lus en {year}
                        </span>
                    </div>
                    {extra > 0 && (
                        <span className="bg-secondary text-secondary-foreground font-quote mb-2 rounded-full px-3 py-1 text-lg italic">
                            et {extra} {booksWord(extra)} de plus
                        </span>
                    )}
                </div>

                <p className="font-quote text-primary max-w-[52ch] text-xl leading-snug">
                    {goalTagline(goal, visitorOf)}
                </p>

                <ProgressGauge
                    showScale
                    ratio={goalRatio(goal)}
                    valueNow={Math.min(booksRead, target)}
                    valueMax={target}
                    label={
                        visitorOf
                            ? `Défi de lecture ${year} de ${visitorOf}`
                            : `Votre défi de lecture ${year}`
                    }
                    valueText={`${booksRead} ${booksWord(booksRead)} lus sur ${target}${
                        extra > 0 ? `, objectif dépassé de ${extra}` : ""
                    }`}
                />
            </div>

            <div className="bg-muted/55 border-border flex min-w-0 flex-[1_1_240px] flex-col items-center justify-center gap-3 rounded-xl border px-5 py-5 text-center">
                <div
                    aria-hidden="true"
                    className={cn(
                        "border-primary size-26 p-1.25 rounded-full border-2",
                        done && "bg-primary",
                    )}
                >
                    <div
                        className={cn(
                            "font-title flex size-full flex-col items-center justify-center rounded-full border border-dashed",
                            done
                                ? "text-primary-foreground border-primary-foreground/50"
                                : "text-primary border-primary/50",
                        )}
                    >
                        <span className="text-2xl font-bold leading-none">
                            {rewardXp}
                        </span>
                        <span className="tracking-caps mt-1 text-xs">XP</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="font-title text-primary font-medium">
                        {done
                            ? visitorOf
                                ? `XP gagnés par ${visitorOf}`
                                : "XP gagnés"
                            : "XP à l'arrivée"}
                    </span>
                    <span className="font-quote text-muted-foreground italic">
                        {done
                            ? `Accordés une seule fois pour ${year}.`
                            : visitorOf
                              ? "Si le serment est tenu."
                              : "10 XP par livre visé, une seule fois par année."}
                    </span>
                </div>
            </div>
        </div>
    );
}
