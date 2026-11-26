import { useState } from "react";
import { LuCalendarDays, LuCompass, LuInfinity, LuUsers } from "react-icons/lu";
import SegmentedTabs from "@/components/UI/SegmentedTabs";
import Ornament from "@/components/sections/shared/Ornament";
import LeaderboardPodium from "@/components/sections/leaderboard/LeaderboardPodium";
import LeaderboardRow from "@/components/sections/leaderboard/LeaderboardRow";
import LeaderboardViewerBanner from "@/components/sections/leaderboard/LeaderboardViewerBanner";
import { LeaderboardListSkeleton } from "@/components/UI/skeleton/LeaderboardSkeleton";
import { useLeaderboard } from "@/hooks/gamification/useLeaderboard";
import { useAuthContext } from "@/hooks/auth/useAuthContext";
import {
    LeaderboardPeriod,
    LeaderboardScope,
    SegmentedOption,
} from "@/types/types";

const PERIODS: SegmentedOption<LeaderboardPeriod>[] = [
    { value: "MONTH", label: "Ce mois-ci", icon: LuCalendarDays },
    { value: "ALL_TIME", label: "Depuis toujours", icon: LuInfinity },
];

const SCOPES: SegmentedOption<LeaderboardScope>[] = [
    { value: "ALL", label: "Tous les lecteurs", icon: LuCompass },
    { value: "FOLLOWING", label: "Mes abonnements", icon: LuUsers },
];

/**
 * Page « Classement » : lecteurs ordonnés par XP gagnée ce mois-ci (remise à
 * zéro chaque mois) ou depuis toujours, parmi tous ou parmi ses abonnements.
 * Podium, top 50, et position du lecteur s'il est hors du top.
 */
export default function Classement() {
    const { user } = useAuthContext();
    const [period, setPeriod] = useState<LeaderboardPeriod>("MONTH");
    const [scope, setScope] = useState<LeaderboardScope>("ALL");
    const { entries, viewer, loading } = useLeaderboard(period, scope);

    const viewerShown = entries.some((entry) => entry.user.id === user?.id);
    const podium = entries.slice(0, 3);
    const rest = entries.slice(3);

    const subtitle =
        period === "MONTH"
            ? "L'XP gagnée depuis le premier du mois. Tout repart de zéro le mois prochain."
            : "L'XP accumulée depuis l'inscription de chaque lecteur.";

    return (
        <section className="mx-auto w-full max-w-3xl px-4 py-7 md:px-6 md:py-9">
            <div className="mb-7 text-center">
                <Ornament width="w-12" className="mb-3" />
                <h1 className="text-foreground font-quote text-3xl font-medium leading-none md:text-4xl">
                    Classement
                </h1>
                <p className="text-muted-foreground font-body mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed">
                    {subtitle}
                </p>
            </div>

            <div className="mb-8 flex flex-col items-center gap-3">
                <SegmentedTabs
                    options={PERIODS}
                    value={period}
                    onChange={setPeriod}
                    ariaLabel="Période du classement"
                />
                <SegmentedTabs
                    options={SCOPES}
                    value={scope}
                    onChange={setScope}
                    ariaLabel="Lecteurs classés"
                />
            </div>

            {loading && entries.length === 0 ? (
                <LeaderboardListSkeleton />
            ) : entries.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <Ornament width="w-10" />
                    <p className="text-muted-foreground/80 font-quote text-base italic">
                        {period === "MONTH"
                            ? "Personne n'a encore gagné d'XP ce mois-ci. La première place est à prendre."
                            : "Aucun lecteur à classer pour l'instant."}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    <LeaderboardPodium entries={podium} viewerId={user?.id} />
                    {viewer && !viewerShown && (
                        <LeaderboardViewerBanner
                            standing={viewer}
                            period={period}
                        />
                    )}
                    {rest.length > 0 && (
                        <ol className="flex flex-col gap-2">
                            {rest.map((entry) => (
                                <LeaderboardRow
                                    key={entry.user.id}
                                    entry={entry}
                                    isViewer={entry.user.id === user?.id}
                                />
                            ))}
                        </ol>
                    )}
                </div>
            )}
        </section>
    );
}
