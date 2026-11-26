import { Link } from "react-router-dom";
import LevelBadge from "@/components/sections/shared/LevelBadge";
import { cn } from "@/lib/utils";
import { formatRank, formatXp, rankParts } from "@/lib/leaderboard";
import { LeaderboardEntryProps } from "@/types/types";
import LeaderboardAvatar from "./LeaderboardAvatar";
import { LEVEL_PILL_CLASS, YOU_PILL_CLASS } from "./leaderboardStyles";

/** Ligne du classement après le podium : rang, lecteur, niveau, titre, XP. */
export default function LeaderboardRow({
    entry,
    isViewer,
    tied = false,
}: LeaderboardEntryProps) {
    const { rank, xp, user } = entry;
    const { num, suffix } = rankParts(rank);

    return (
        <li
            aria-current={isViewer ? "true" : undefined}
            className={cn(
                "hover:border-primary sm:px-4.5 flex items-center gap-2.5 rounded-xl border-2 px-2.5 py-2.5 transition-all duration-200 hover:scale-[1.015] motion-reduce:hover:scale-100 sm:gap-3.5 sm:py-3",
                isViewer
                    ? "border-primary/75 bg-secondary"
                    : "border-border bg-card",
            )}
        >
            <span className="text-muted-foreground font-quote sm:w-11.5 w-8 shrink-0 text-right text-lg font-medium leading-none sm:text-[22px]">
                <span className="sr-only">Rang </span>
                {num}
                <sup className="text-[0.55em]">{suffix}</sup>
                {tied && (
                    <span className="mt-0.75 block text-xs italic">
                        ex æquo
                    </span>
                )}
            </span>
            <LeaderboardAvatar
                userName={user.userName}
                avatar={user.avatar}
                className="h-8.5 w-8.5 sm:h-10.5 sm:w-10.5 text-[13px] sm:text-[15px]"
                style={
                    isViewer
                        ? { boxShadow: "0 0 0 2px hsl(43 59% 81%)" }
                        : undefined
                }
            />
            <div className="gap-0.75 flex min-w-0 flex-1 flex-col">
                <div className="flex min-w-0 items-center gap-2">
                    <Link
                        to={`/profil/${user.id}`}
                        aria-label={`Voir le profil de ${user.userName}${isViewer ? " (vous)" : ""}, ${formatRank(rank)}${tied ? " ex æquo" : ""}, ${formatXp(xp)} XP`}
                        className="text-primary font-body bg-size-[0%_1px] hover:bg-size-[100%_1px] focus-visible:bg-size-[100%_1px] min-w-0 truncate bg-[linear-gradient(hsl(43_59%_81%/0.6),hsl(43_59%_81%/0.6))] bg-left-bottom bg-no-repeat pb-px text-sm font-bold transition-[background-size] duration-300 ease-out focus-visible:outline-none sm:text-base"
                    >
                        {user.userName}
                    </Link>
                    <LevelBadge
                        level={user.level}
                        className={LEVEL_PILL_CLASS}
                    />
                    {isViewer && <span className={YOU_PILL_CLASS}>Vous</span>}
                </div>
                {user.title && (
                    <span className="text-muted-foreground font-quote truncate text-sm italic leading-tight sm:text-base">
                        {user.title.label}
                    </span>
                )}
            </div>
            <span className="text-primary font-quote shrink-0 text-right text-[17px] font-medium tabular-nums sm:text-[22px]">
                {formatXp(xp)}
                <span className="text-muted-foreground font-body hidden text-xs font-bold tracking-wider sm:inline">
                    {" "}
                    XP
                </span>
            </span>
        </li>
    );
}
