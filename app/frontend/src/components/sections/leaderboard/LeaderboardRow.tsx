import UserLink from "@/components/sections/profile/UserLink";
import LevelBadge from "@/components/sections/shared/LevelBadge";
import { cn } from "@/lib/utils";
import { formatRank } from "@/lib/leaderboard";
import { LeaderboardEntryProps } from "@/types/types";

/** Ligne du classement au-delà du podium : rang, lecteur, niveau, titre, XP. */
export default function LeaderboardRow({
    entry,
    isViewer,
}: LeaderboardEntryProps) {
    const { rank, xp, user } = entry;

    return (
        <li
            className={cn(
                "border-border flex items-center gap-3 rounded-lg border px-3 py-2.5 sm:gap-4 sm:px-4",
                isViewer
                    ? "border-primary/50 bg-primary/10"
                    : "bg-card/40 border-border/70",
            )}
            aria-current={isViewer ? "true" : undefined}
        >
            <span className="text-muted-foreground w-9 shrink-0 text-right font-mono text-sm font-bold">
                {formatRank(rank)}
            </span>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                <UserLink
                    id={user.id}
                    userName={user.userName}
                    avatar={user.avatar}
                    size="sm"
                />
                <LevelBadge level={user.level} />
                {user.title && (
                    <span className="text-muted-foreground font-quote hidden truncate text-sm italic sm:inline">
                        {user.title.label}
                    </span>
                )}
            </div>
            <span className="text-primary font-title shrink-0 text-sm font-bold">
                {xp.toLocaleString("fr-FR")}&nbsp;XP
            </span>
        </li>
    );
}
