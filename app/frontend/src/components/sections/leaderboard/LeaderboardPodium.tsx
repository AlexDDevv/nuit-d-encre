import { Link } from "react-router-dom";
import LevelBadge from "@/components/sections/shared/LevelBadge";
import { cn } from "@/lib/utils";
import { interactiveCardShell } from "@/components/UI/cardShell";
import { formatRank, formatXp } from "@/lib/leaderboard";
import { LeaderboardPodiumProps, PodiumStepProps } from "@/types/types";
import LeaderboardAvatar from "./LeaderboardAvatar";
import {
    LEVEL_PILL_CLASS,
    YOU_PILL_CLASS,
    podiumTint,
} from "./leaderboardStyles";

const ROMAN = ["I", "II", "III"] as const;

/** Ordre visuel (1re au centre) ; le DOM garde l'ordre du classement. */
const VISUAL_ORDER = ["order-2", "order-1", "order-3"] as const;
const SOCLE_HEIGHT = ["h-22 sm:h-33", "h-15 sm:h-23", "h-10 sm:h-16"] as const;

function Crown() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 46 32"
            fill="none"
            stroke="hsl(43 59% 81%)"
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="w-8.5 sm:w-11.5 relative z-10 mb-1.5 h-6 sm:h-8"
        >
            <path
                d="M5 26 3 8l11 9 9-14 9 14 11-9-2 18z"
                fill="hsl(43 59% 81% / .14)"
            />
            <path d="M5 30h36" />
            <circle cx="23" cy="3" r="1.6" fill="hsl(43 59% 81%)" />
            <circle cx="3" cy="8" r="1.4" fill="hsl(43 59% 81%)" />
            <circle cx="43" cy="8" r="1.4" fill="hsl(43 59% 81%)" />
            <path d="m23 17 2.5 3-2.5 3-2.5-3z" fill="hsl(43 59% 81%)" />
        </svg>
    );
}

function PodiumStep({ entry, isViewer, place }: PodiumStepProps) {
    const { rank, xp, user } = entry;
    const tint = podiumTint(rank);
    const first = place === 0;

    const identity = (
        <>
            <LeaderboardAvatar
                userName={user.userName}
                avatar={user.avatar}
                className={cn(
                    "mb-1.5",
                    first
                        ? "h-17 w-17 sm:h-26 sm:w-26 text-2xl sm:text-4xl"
                        : "h-13 w-13 text-lg sm:h-20 sm:w-20 sm:text-3xl",
                )}
                style={{
                    boxShadow: `0 0 0 3px hsl(20 3% 17%), 0 0 0 5px ${tint}`,
                }}
            />
            <span className="font-body max-w-full truncate text-sm font-bold sm:text-base">
                {user.userName}
            </span>
        </>
    );

    const details = (
        <div className="flex flex-col items-center gap-1.5 pt-0.5">
            <span className="flex flex-wrap justify-center gap-1.5">
                <LevelBadge level={user.level} className={LEVEL_PILL_CLASS} />
                {isViewer && <span className={YOU_PILL_CLASS}>Vous</span>}
            </span>
            {user.title && (
                <span className="text-muted-foreground font-quote hidden text-base italic leading-tight sm:block">
                    {user.title.label}
                </span>
            )}
            <span
                className="font-quote mt-1 text-xl font-medium tabular-nums leading-none sm:text-[26px]"
                style={{ color: tint }}
            >
                {formatXp(xp)}{" "}
                <span className="text-muted-foreground font-body text-xs font-bold tracking-wider">
                    XP
                </span>
            </span>
        </div>
    );

    return (
        <li
            aria-current={isViewer ? "true" : undefined}
            className={cn(
                "max-w-57 relative flex min-w-0 flex-1 basis-0 flex-col items-center",
                VISUAL_ORDER[place],
            )}
        >
            {first && (
                <>
                    <span aria-hidden="true" className="podium-glow" />
                    <Crown />
                </>
            )}
            <Link
                to={`/profil/${user.id}`}
                aria-label={`Voir le profil de ${user.userName}${isViewer ? " (vous)" : ""}, ${formatRank(rank)}, ${formatXp(xp)} XP`}
                className={cn(
                    interactiveCardShell,
                    "text-primary sm:pt-4.5 z-10 grid w-full px-1.5 pb-3 pt-3 text-center [grid-template-areas:'stack'] motion-reduce:hover:scale-100 sm:px-3 sm:pb-4",
                    isViewer && "border-primary/70 bg-secondary/55",
                )}
            >
                {/* Gabarit invisible du contenu complet : fixe la hauteur finale
                    de la carte, qui ne change pas au survol. */}
                <div
                    aria-hidden="true"
                    className="invisible flex flex-col items-center gap-1.5 [grid-area:stack]"
                >
                    {identity}
                    {details}
                </div>

                <div className="flex flex-col items-center gap-1.5 self-center [grid-area:stack]">
                    {identity}
                    {/* le reste révélé au survol / focus (toujours visible sur mobile) */}
                    <div className="grid w-full grid-rows-[0fr] opacity-0 transition-all duration-300 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 group-hover:grid-rows-[1fr] group-hover:opacity-100 max-sm:grid-rows-[1fr] max-sm:opacity-100">
                        <div className="overflow-hidden">{details}</div>
                    </div>
                </div>
            </Link>
            <div
                aria-hidden="true"
                className={cn(
                    "bg-muted font-quote mt-2.5 flex w-[86%] items-start justify-center rounded-t-lg pt-2 text-2xl font-medium leading-none sm:pt-3 sm:text-[34px]",
                    SOCLE_HEIGHT[place],
                )}
                style={{
                    color: tint,
                    boxShadow: `inset 0 0 0 1px hsl(0 0% 24%), inset 0 3px 0 0 ${tint}`,
                }}
            >
                {ROMAN[Math.min(rank, 3) - 1]}
            </div>
        </li>
    );
}

/**
 * Podium des trois premiers : la 1re place au centre, couronnée et éclairée
 * à la chandelle, sur des socles numérotés en chiffres romains.
 */
export default function LeaderboardPodium({
    entries,
    viewerId,
}: LeaderboardPodiumProps) {
    return (
        <section aria-labelledby="podium-title">
            <h2 id="podium-title" className="sr-only">
                Podium
            </h2>
            <ol className="m-0 flex list-none items-end justify-center gap-1.5 p-0 pt-14 sm:gap-4">
                {entries.slice(0, 3).map((entry, place) => (
                    <PodiumStep
                        key={entry.user.id}
                        entry={entry}
                        place={place}
                        isViewer={entry.user.id === viewerId}
                    />
                ))}
            </ol>
            <div aria-hidden="true" className="bg-secondary h-1 rounded-sm" />
        </section>
    );
}
