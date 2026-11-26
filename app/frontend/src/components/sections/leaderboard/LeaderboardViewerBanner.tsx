import {
    formatRank,
    formatXp,
    periodPhrase,
    rankParts,
} from "@/lib/leaderboard";
import { LeaderboardViewerBannerProps } from "@/types/types";

function Quill() {
    return (
        <svg
            aria-hidden="true"
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            stroke="hsl(43 59% 81%)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
        >
            <path d="M25 4C14 5 7 12 6 24" />
            <path d="M25 4c-1 8-6 14-14 15" />
            <path d="M6 24 4 27" />
            <path d="M12 13h7" />
        </svg>
    );
}

/**
 * Position du lecteur absent du classement affiché : son rang et l'écart
 * avec la dernière place, ou une invitation s'il n'a pas encore d'XP.
 */
export default function LeaderboardViewerBanner({
    standing,
    period,
    lastXp,
    lastRank,
}: LeaderboardViewerBannerProps) {
    const phrase = periodPhrase(period);
    const gap = standing ? Math.max(0, lastXp - standing.xp) : 0;
    const pct = standing
        ? Math.max(4, Math.min(100, Math.round((standing.xp / lastXp) * 100)))
        : 0;
    const rank = standing ? rankParts(standing.rank) : null;

    return (
        <aside
            aria-label="Votre position"
            className="border-primary/35 bg-secondary text-secondary-foreground py-4.5 mt-7 flex flex-col items-start gap-4 rounded-xl border-2 px-5 sm:flex-row sm:items-center sm:gap-5"
        >
            <div className="flex min-w-0 flex-1 items-center gap-3.5">
                <Quill />
                <div className="min-w-0">
                    {standing && rank ? (
                        <>
                            <p className="font-body text-base leading-snug">
                                Vous :{" "}
                                <strong className="text-primary font-quote text-[22px] font-semibold">
                                    {rank.num}
                                    <sup className="text-[0.55em]">
                                        {rank.suffix}
                                    </sup>
                                </strong>{" "}
                                ·{" "}
                                <strong className="text-primary">
                                    {formatXp(standing.xp)} XP
                                </strong>{" "}
                                {phrase}
                            </p>
                            <p className="font-quote mt-1 text-[17px] italic leading-snug">
                                Encore {formatXp(gap)} XP et votre nom rejoint
                                les {lastRank === 50 ? "cinquante" : lastRank}{" "}
                                premiers.
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="font-body text-base leading-snug">
                                {period === "MONTH"
                                    ? "Vous n'avez pas encore gagné d'XP ce mois-ci."
                                    : "Vous n'avez pas encore gagné d'XP."}
                            </p>
                            <p className="font-quote mt-1 text-[17px] italic leading-snug">
                                Votre nom apparaîtra ici dès votre premier point
                                d'XP.
                            </p>
                        </>
                    )}
                </div>
            </div>
            {standing && (
                <div className="w-47.5 max-w-full shrink-0">
                    <div className="mb-1.5 flex justify-between text-xs">
                        <span>Vous</span>
                        <span>
                            {formatRank(lastRank)} place · {formatXp(lastXp)} XP
                        </span>
                    </div>
                    <div
                        role="img"
                        aria-label={`${formatXp(standing.xp)} XP sur les ${formatXp(lastXp)} XP de la ${formatRank(lastRank)} place`}
                        className="bg-card h-1.5 overflow-hidden rounded-sm"
                    >
                        <div
                            className="bg-primary h-full rounded-sm"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                </div>
            )}
        </aside>
    );
}
