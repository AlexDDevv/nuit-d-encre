import Banner from "@/components/UI/Banner/Banner";
import { formatPeriodXp, formatRank, formatXp } from "@/lib/leaderboard";
import { LeaderboardViewerBannerProps } from "@/types/types";

/**
 * Position du lecteur absent du classement affiché (bannière de l'app) : son
 * rang et l'écart avec la dernière place, ou une invitation s'il n'a pas
 * encore d'XP sur la période.
 */
export default function LeaderboardViewerBanner({
    standing,
    period,
    lastXp,
    lastRank,
}: LeaderboardViewerBannerProps) {
    if (!standing) {
        return (
            <Banner
                variant="info"
                icon="moon"
                className="mt-7"
                title={
                    period === "MONTH"
                        ? "Vous n'avez pas encore gagné d'XP ce mois-ci."
                        : "Vous n'avez pas encore gagné d'XP."
                }
            >
                Votre nom apparaîtra ici dès votre premier point d'XP.
            </Banner>
        );
    }

    const gap = Math.max(0, lastXp - standing.xp);
    const pct = Math.max(
        4,
        Math.min(100, Math.round((standing.xp / lastXp) * 100)),
    );
    const places = lastRank === 50 ? "cinquante" : String(lastRank);

    return (
        <Banner
            variant="info"
            icon="moon"
            className="mt-7"
            title={`Vous : ${formatRank(standing.rank)} · ${formatPeriodXp(standing.xp, period)}`}
        >
            <p>
                Encore {formatXp(gap)} XP et votre nom rejoint les {places}{" "}
                premiers.
            </p>
            <div className="mt-2.5 max-w-60">
                <div className="mb-1 flex justify-between gap-3">
                    <span>Vous</span>
                    <span>
                        {formatRank(lastRank)} place · {formatXp(lastXp)} XP
                    </span>
                </div>
                <div
                    role="img"
                    aria-label={`${formatXp(standing.xp)} XP sur les ${formatXp(lastXp)} XP de la ${formatRank(lastRank)} place`}
                    className="bg-background h-1.5 overflow-hidden rounded-sm"
                >
                    <div
                        className="bg-primary h-full rounded-sm"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>
        </Banner>
    );
}
