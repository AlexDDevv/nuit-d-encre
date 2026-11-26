/** Lignes du classement en pulsation (podium compris). */
export function LeaderboardListSkeleton() {
    return (
        <div aria-busy="true" aria-label="Chargement du classement">
            <div className="grid grid-cols-3 items-end gap-3 pb-8 pt-4 sm:gap-6">
                {[16, 20, 16].map((size, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <span
                            className="bg-muted animate-pulse rounded-full"
                            style={{
                                width: `${size * 4}px`,
                                height: `${size * 4}px`,
                            }}
                        />
                        <span className="bg-muted/50 h-3 w-16 animate-pulse rounded" />
                        <span className="bg-muted/40 h-3 w-12 animate-pulse rounded" />
                    </div>
                ))}
            </div>
            <ul className="flex flex-col gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <li
                        key={i}
                        className="border-border/70 bg-card/40 flex items-center gap-4 rounded-lg border px-4 py-3"
                    >
                        <span className="bg-muted/50 h-3 w-6 animate-pulse rounded" />
                        <span className="bg-muted h-8 w-8 animate-pulse rounded-full" />
                        <span className="bg-muted/50 h-3 w-32 animate-pulse rounded" />
                        <span className="bg-muted/40 ml-auto h-3 w-12 animate-pulse rounded" />
                    </li>
                ))}
            </ul>
        </div>
    );
}

/** Squelette plein écran de la page Classement (fallback de route). */
export default function LeaderboardSkeleton() {
    return (
        <section className="mx-auto w-full max-w-3xl px-4 py-7 md:px-6 md:py-9">
            <LeaderboardListSkeleton />
        </section>
    );
}
