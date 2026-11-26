import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ProgressGaugeProps } from "@/types/types";

const QUARTERS = [25, 50, 75];

/**
 * Jauge dorée de progression (XP du profil, défi de lecture) : remplissage
 * animé au montage, brillance qui la parcourt, graduations aux quarts et
 * losange au front. `compact` : barre mince et sobre des aperçus.
 */
export default function ProgressGauge({
    ratio,
    label,
    valueNow,
    valueMax,
    valueText,
    showScale = false,
    compact = false,
}: ProgressGaugeProps) {
    const pct = Math.round(Math.min(Math.max(ratio, 0), 1) * 1000) / 10;
    const [shown, setShown] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setShown(pct), 150);
        return () => clearTimeout(t);
    }, [pct]);

    const motion =
        "duration-[1.4s] ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none";

    return (
        <div className="flex flex-col gap-2">
            <div
                role="progressbar"
                aria-label={label}
                aria-valuemin={0}
                aria-valuemax={valueMax}
                aria-valuenow={valueNow}
                aria-valuetext={valueText}
                className={cn(
                    "border-border relative rounded-full border",
                    compact
                        ? "bg-card h-2.5"
                        : "bg-muted h-3.5 shadow-[inset_0_1px_2px_hsl(20_10%_8%/0.6)]",
                )}
            >
                {/* Piste rognée : le reflet la parcourt en entier, le losange reste dehors. */}
                <span
                    aria-hidden="true"
                    className={cn(
                        "absolute inset-0 overflow-hidden rounded-full",
                        !compact && "xp-shimmer",
                    )}
                >
                    {!compact &&
                        QUARTERS.map((q) => (
                            <span
                                key={q}
                                className="inset-y-0.75 bg-accent absolute w-px"
                                style={{ left: `${q}%` }}
                            />
                        ))}
                    <span
                        className={cn(
                            "absolute inset-y-0 left-0 rounded-full transition-[width]",
                            motion,
                            compact
                                ? "bg-[hsl(43_55%_74%)]"
                                : "bg-linear-to-b from-[hsl(43_62%_84%)] to-[hsl(43_48%_66%)] shadow-[0_0_14px_-1px_hsl(43_59%_70%/0.7)]",
                        )}
                        style={{ width: `${shown}%` }}
                    />
                </span>
                {!compact && (
                    <span
                        aria-hidden="true"
                        className={cn(
                            "bg-primary border-card -ml-1.75 -mt-1.75 absolute top-1/2 size-3.5 rotate-45 border-2 shadow-[0_0_0_1px_hsl(43_59%_81%)] transition-[left]",
                            motion,
                        )}
                        style={{ left: `${shown}%` }}
                    />
                )}
            </div>
            {showScale && (
                <div
                    aria-hidden="true"
                    className="text-muted-foreground flex justify-between text-xs"
                >
                    <span>0</span>
                    <span>{Math.round(pct)} %</span>
                    <span>{valueMax}</span>
                </div>
            )}
        </div>
    );
}
