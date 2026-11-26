import { LuTrophy } from "react-icons/lu";
import { formatPeriodXp, formatRank } from "@/lib/leaderboard";
import { LeaderboardViewerBannerProps } from "@/types/types";

/** Position du lecteur quand il n'apparaît pas dans le top affiché. */
export default function LeaderboardViewerBanner({
    standing,
    period,
}: LeaderboardViewerBannerProps) {
    return (
        <div className="border-primary/40 bg-primary/10 flex items-center gap-3 rounded-lg border px-4 py-3">
            <LuTrophy className="text-primary shrink-0" size={16} />
            <p className="text-foreground font-body text-sm">
                <span className="font-bold">
                    Vous : {formatRank(standing.rank)}
                </span>
                <span className="text-muted-foreground">
                    {" "}
                    · {formatPeriodXp(standing.xp, period)}
                </span>
            </p>
        </div>
    );
}
