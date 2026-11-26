import { cn } from "@/lib/utils";

const PULSE = "bg-muted animate-pulse motion-reduce:animate-none";

/** Podium et lignes du classement en pulsation. */
export function LeaderboardListSkeleton() {
    const podium = [
        { avatar: "h-10 w-10 sm:h-20 sm:w-20", socle: "h-15 sm:h-23" },
        { avatar: "h-12 w-12 sm:h-26 sm:w-26", socle: "h-22 sm:h-33" },
        { avatar: "h-10 w-10 sm:h-20 sm:w-20", socle: "h-10 sm:h-16" },
    ];
    return (
        <div aria-busy="true" aria-live="polite">
            <span className="sr-only">Chargement du classement…</span>
            <div
                aria-hidden="true"
                className="flex items-end justify-center gap-1.5 pt-12 sm:gap-4"
            >
                {podium.map((step, i) => (
                    <div
                        key={i}
                        className="max-w-55 flex flex-1 basis-0 flex-col items-center"
                    >
                        <div className="border-border bg-card py-4.5 flex w-full flex-col items-center gap-2.5 rounded-xl border-2 px-3">
                            <span
                                className={cn(
                                    PULSE,
                                    "rounded-full",
                                    step.avatar,
                                )}
                            />
                            <span
                                className={cn(
                                    PULSE,
                                    "h-3.5 w-[70%] rounded-md",
                                )}
                            />
                            <span
                                className={cn(PULSE, "h-3 w-[45%] rounded-md")}
                            />
                            <span
                                className={cn(PULSE, "h-5 w-[55%] rounded-md")}
                            />
                        </div>
                        <div
                            className={cn(
                                PULSE,
                                "mt-2.5 w-[86%] rounded-t-lg",
                                step.socle,
                            )}
                        />
                    </div>
                ))}
            </div>
            <div aria-hidden="true" className="bg-muted h-1 rounded-sm" />
            <div aria-hidden="true" className="mt-8 flex flex-col gap-2">
                {[1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4].map((opacity) => (
                    <div
                        key={opacity}
                        style={{ opacity }}
                        className="border-border bg-card px-4.5 flex items-center gap-3.5 rounded-xl border-2 py-3"
                    >
                        <span
                            className={cn(
                                PULSE,
                                "h-4.5 w-7.5 ml-3.5 rounded-md",
                            )}
                        />
                        <span
                            className={cn(
                                PULSE,
                                "h-10.5 w-10.5 shrink-0 rounded-full",
                            )}
                        />
                        <div className="flex flex-1 flex-col gap-2">
                            <span
                                className={cn(PULSE, "h-3 w-[40%] rounded-md")}
                            />
                            <span
                                className={cn(
                                    PULSE,
                                    "h-2.5 w-[26%] rounded-md",
                                )}
                            />
                        </div>
                        <span className={cn(PULSE, "h-4.5 w-16 rounded-md")} />
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Squelette plein écran de la page Classement (fallback de route). */
export default function LeaderboardSkeleton() {
    return (
        <section className="max-w-204 mx-auto w-full px-3.5 py-5 sm:px-6 sm:py-12">
            <LeaderboardListSkeleton />
        </section>
    );
}
