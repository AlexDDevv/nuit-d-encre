import { Link } from "react-router-dom";
import { LuCrown } from "react-icons/lu";
import LevelBadge from "@/components/sections/shared/LevelBadge";
import { cn } from "@/lib/utils";
import { formatRank } from "@/lib/leaderboard";
import { LeaderboardPodiumProps, PodiumStepProps } from "@/types/types";

/** Colonne de chaque place : la première au centre. */
const COLUMNS = [
    "col-start-2",
    "col-start-1 row-start-1",
    "col-start-3 row-start-1",
] as const;

/** Teinte par rang : or, argent, bronze (les ex æquo partagent la teinte). */
const MEDALS = [
    "border-primary text-primary shadow-[0_0_24px_hsl(43_59%_60%/0.25)]",
    "border-[hsl(0_0%_72%)] text-[hsl(0_0%_80%)]",
    "border-[hsl(25_45%_52%)] text-[hsl(25_55%_66%)]",
] as const;

function PodiumStep({ entry, isViewer, place }: PodiumStepProps) {
    const { rank, xp, user } = entry;
    const medal = MEDALS[Math.min(rank, 3) - 1];
    const first = place === 0;
    const initials = user.userName.slice(0, 2).toUpperCase();

    return (
        <li
            className={cn(
                "flex flex-col items-center gap-2 text-center",
                COLUMNS[place],
                first ? "sm:-translate-y-4" : "sm:translate-y-2",
            )}
            aria-current={isViewer ? "true" : undefined}
        >
            {rank === 1 && <LuCrown className="text-primary" size={22} />}
            <Link
                to={`/profil/${user.id}`}
                className="group flex flex-col items-center gap-2"
            >
                {user.avatar ? (
                    <img
                        src={user.avatar}
                        alt=""
                        className={cn(
                            "rounded-full border-2 object-cover",
                            first ? "h-20 w-20" : "h-16 w-16",
                            medal,
                        )}
                    />
                ) : (
                    <span
                        aria-hidden="true"
                        className={cn(
                            "font-quote grid place-items-center rounded-full border-2 bg-[radial-gradient(circle_at_32%_26%,hsl(43_30%_31%),hsl(20_3%_13%)_82%)]",
                            first ? "h-20 w-20 text-2xl" : "h-16 w-16 text-xl",
                            medal,
                        )}
                    >
                        {initials}
                    </span>
                )}
                <span className="text-foreground group-hover:text-primary font-title max-w-32 truncate text-sm font-medium transition-colors">
                    {user.userName}
                </span>
            </Link>
            <LevelBadge level={user.level} />
            <span
                className={cn(
                    "font-title text-sm font-bold",
                    isViewer ? "text-primary" : "text-foreground",
                )}
            >
                {xp.toLocaleString("fr-FR")}&nbsp;XP
            </span>
            <span
                className={cn(
                    "font-mono text-xs font-bold uppercase tracking-widest",
                    medal,
                )}
            >
                {formatRank(rank)}
            </span>
        </li>
    );
}

/** Les trois premiers, la première place au centre et surélevée. */
export default function LeaderboardPodium({
    entries,
    viewerId,
}: LeaderboardPodiumProps) {
    return (
        <ol
            aria-label="Podium"
            className="grid grid-cols-3 items-end gap-3 pt-4 sm:gap-6"
        >
            {entries.slice(0, 3).map((entry, place) => (
                <PodiumStep
                    key={entry.user.id}
                    entry={entry}
                    place={place}
                    isViewer={entry.user.id === viewerId}
                />
            ))}
        </ol>
    );
}
