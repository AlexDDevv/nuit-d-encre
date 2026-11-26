import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import SegmentedTabs from "@/components/UI/SegmentedTabs";
import Button from "@/components/UI/Button";
import Ornament from "@/components/sections/shared/Ornament";
import LeaderboardPodium from "@/components/sections/leaderboard/LeaderboardPodium";
import LeaderboardRow from "@/components/sections/leaderboard/LeaderboardRow";
import LeaderboardViewerBanner from "@/components/sections/leaderboard/LeaderboardViewerBanner";
import LeaderboardEmpty from "@/components/sections/leaderboard/LeaderboardEmpty";
import { LeaderboardListSkeleton } from "@/components/UI/skeleton/LeaderboardSkeleton";
import { useLeaderboard } from "@/hooks/gamification/useLeaderboard";
import { useAuthContext } from "@/hooks/auth/useAuthContext";
import { GET_USER_PROFILE } from "@/graphql/user/profile";
import {
    LEADERBOARD_ROWS_PREVIEW,
    leaderboardFooter,
    tiedRanks,
} from "@/lib/leaderboard";
import {
    LeaderboardPeriod,
    LeaderboardScope,
    SegmentedOption,
} from "@/types/types";

const PERIODS: SegmentedOption<LeaderboardPeriod>[] = [
    { value: "MONTH", label: "Ce mois-ci" },
    { value: "ALL_TIME", label: "Depuis toujours" },
];

const SCOPES: SegmentedOption<LeaderboardScope>[] = [
    { value: "ALL", label: "Tous les lecteurs" },
    { value: "FOLLOWING", label: "Mes abonnements" },
];

const TABS_CLASS =
    "hover:border-primary/55 bg-card w-full rounded-xl transition-colors duration-200 sm:w-auto";

/**
 * Page « Classement » : lecteurs ordonnés par XP gagnée ce mois-ci (remise à
 * zéro chaque mois) ou depuis toujours, parmi tous ou parmi ses abonnements.
 * Podium, places suivantes (dépliables) et position du lecteur hors du top.
 */
export default function Classement() {
    const { user } = useAuthContext();
    const [period, setPeriod] = useState<LeaderboardPeriod>("MONTH");
    const [scope, setScope] = useState<LeaderboardScope>("ALL");
    const [expanded, setExpanded] = useState(false);
    const { entries, viewer, loading } = useLeaderboard(period, scope);

    // Nombre d'abonnements : note de portée et état « vous ne suivez personne ».
    const { data: profileData } = useQuery(GET_USER_PROFILE, {
        variables: { id: user?.id },
        skip: !user || scope !== "FOLLOWING",
    });
    const followingCount: number | undefined =
        profileData?.getUserProfile?.followingCount;

    const tied = useMemo(() => tiedRanks(entries), [entries]);
    const viewerShown = entries.some((entry) => entry.user.id === user?.id);
    const rest = entries.slice(3);
    const shownRows = expanded ? rest : rest.slice(0, LEADERBOARD_ROWS_PREVIEW);
    const hiddenCount = rest.length - shownRows.length;
    const last = entries[entries.length - 1];
    const showViewerBanner = !!last && !viewerShown && user?.role !== "admin";

    const changePeriod = (next: LeaderboardPeriod) => {
        setPeriod(next);
        setExpanded(false);
    };
    const changeScope = (next: LeaderboardScope) => {
        setScope(next);
        setExpanded(false);
    };

    const subtitle =
        period === "MONTH"
            ? "L'XP gagnée depuis le premier du mois. Tout repart de zéro le mois prochain."
            : "L'XP accumulée depuis l'inscription de chaque lecteur.";

    return (
        <section className="max-w-204 mx-auto w-full px-3.5 pb-14 pt-5 sm:px-6 sm:pb-20 sm:pt-12">
            <header className="flex flex-col items-center gap-2.5 text-center">
                <Ornament width="w-12" />
                <h1 className="text-primary font-quote text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
                    Classement
                </h1>
                <p className="text-muted-foreground font-quote max-w-130 text-lg italic leading-snug sm:text-xl">
                    {subtitle}
                </p>
            </header>

            <div className="mt-8 flex flex-col items-stretch gap-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-7 sm:gap-y-4">
                <SegmentedTabs
                    options={PERIODS}
                    value={period}
                    onChange={changePeriod}
                    ariaLabel="Période du classement"
                    fullWidth
                    className={TABS_CLASS}
                />
                <SegmentedTabs
                    options={SCOPES}
                    value={scope}
                    onChange={changeScope}
                    ariaLabel="Lecteurs classés"
                    fullWidth
                    className={TABS_CLASS}
                />
            </div>

            {scope === "FOLLOWING" && !!followingCount && (
                <p className="text-muted-foreground mt-3.5 text-center text-xs">
                    Vous et les {followingCount} lecteur
                    {followingCount > 1 ? "s" : ""} que vous suivez.
                </p>
            )}

            <div
                aria-hidden="true"
                className="mb-2 mt-9 flex items-center gap-3"
            >
                <span className="bg-border h-px flex-1" />
                <span className="border-primary/70 h-1.5 w-1.5 rotate-45 border" />
                <span className="bg-border h-px flex-1" />
            </div>

            {loading && entries.length === 0 ? (
                <LeaderboardListSkeleton />
            ) : entries.length === 0 ? (
                <LeaderboardEmpty
                    period={period}
                    scope={scope}
                    noFollows={scope === "FOLLOWING" && followingCount === 0}
                    onShowAll={() => changeScope("ALL")}
                />
            ) : (
                <>
                    <LeaderboardPodium entries={entries} viewerId={user?.id} />

                    {showViewerBanner && (
                        <LeaderboardViewerBanner
                            standing={viewer}
                            period={period}
                            lastXp={last.xp}
                            lastRank={entries.length}
                        />
                    )}

                    {shownRows.length > 0 && (
                        <section
                            aria-labelledby="leaderboard-rows-title"
                            className="mt-9"
                        >
                            <div className="mb-3.5 flex items-center gap-3">
                                <h2
                                    id="leaderboard-rows-title"
                                    className="text-muted-foreground font-title tracking-label text-xs font-bold uppercase"
                                >
                                    Les places suivantes
                                </h2>
                                <span
                                    aria-hidden="true"
                                    className="bg-border h-px flex-1"
                                />
                                <span className="text-muted-foreground text-xs">
                                    XP{" "}
                                    {period === "MONTH" ? "du mois" : "cumulée"}
                                </span>
                            </div>
                            <ol
                                aria-label="Classement à partir de la 4e place"
                                className="m-0 flex list-none flex-col gap-2 p-0"
                            >
                                {shownRows.map((entry) => (
                                    <LeaderboardRow
                                        key={entry.user.id}
                                        entry={entry}
                                        isViewer={entry.user.id === user?.id}
                                        tied={tied.has(entry.rank)}
                                    />
                                ))}
                            </ol>
                            {hiddenCount > 0 && (
                                <div className="mt-5 flex justify-center">
                                    <Button
                                        variant="outline"
                                        className="border-secondary"
                                        aria-expanded={false}
                                        onClick={() => setExpanded(true)}
                                    >
                                        Afficher les {hiddenCount} places
                                        suivantes
                                    </Button>
                                </div>
                            )}
                        </section>
                    )}
                </>
            )}

            <footer className="mt-12 flex flex-col items-center gap-3 text-center">
                <div aria-hidden="true" className="flex items-center gap-2">
                    <span className="bg-primary/60 h-1.25 w-1.25 rotate-45" />
                    <span className="bg-primary h-1.75 w-1.75 rotate-45" />
                    <span className="bg-primary/60 h-1.25 w-1.25 rotate-45" />
                </div>
                <p className="text-muted-foreground font-quote text-lg italic">
                    {leaderboardFooter(period)}
                </p>
            </footer>
        </section>
    );
}
