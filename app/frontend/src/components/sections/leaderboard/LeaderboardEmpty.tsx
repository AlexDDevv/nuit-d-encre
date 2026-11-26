import Button from "@/components/UI/Button";
import { LeaderboardEmptyProps } from "@/types/types";

function Candle() {
    return (
        <svg
            aria-hidden="true"
            width="34"
            height="62"
            viewBox="0 0 34 62"
            fill="none"
            stroke="hsl(43 59% 81%)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path
                className="candle"
                d="M17 4c4 6 6 9 6 13a6 6 0 0 1-12 0c0-4 2-7 6-13z"
                fill="hsl(38 85% 62% / .35)"
            />
            <path d="M17 23v4" />
            <rect x="10" y="27" width="14" height="30" rx="2" />
            <path d="M4 59h26" />
        </svg>
    );
}

/** Podium vide en pointillés, à la chandelle : la première place est à prendre. */
export default function LeaderboardEmpty({
    period,
    scope,
    noFollows,
    onShowAll,
}: LeaderboardEmptyProps) {
    const month = period === "MONTH";
    let title: string;
    let text = "La première place est à prendre.";

    if (noFollows) {
        title = "Vous ne suivez encore aucun lecteur.";
        text =
            "Suivez quelques lecteurs dont les critiques vous parlent : vous pourrez vous mesurer à eux ici, entre initiés.";
    } else if (scope === "FOLLOWING") {
        title = month
            ? "Aucun de vos abonnements n'a encore gagné d'XP ce mois-ci."
            : "Aucun de vos abonnements n'a encore gagné d'XP.";
    } else {
        title = month
            ? "Personne n'a encore gagné d'XP ce mois-ci."
            : "Personne n'a encore gagné d'XP.";
    }

    return (
        <section
            aria-labelledby="leaderboard-empty-title"
            className="flex flex-col items-center pt-7 text-center"
        >
            <div
                aria-hidden="true"
                className="max-w-130 pt-17.5 relative flex w-full items-end justify-center gap-3"
            >
                <span className="podium-glow podium-glow-soft" />
                <div className="absolute left-1/2 top-1 z-10 -translate-x-1/2">
                    <Candle />
                </div>
                <div className="font-quote text-muted-foreground/70 h-17.5 max-w-35 border-subtle-foreground/40 flex flex-1 basis-0 justify-center rounded-t-lg border-2 border-b-0 border-dashed pt-2.5 text-2xl">
                    II
                </div>
                <div className="font-quote text-primary/80 border-primary/55 h-26 relative z-10 flex max-w-40 flex-1 basis-0 justify-center rounded-t-lg border-2 border-b-0 border-dashed pt-3 text-3xl">
                    I
                </div>
                <div className="font-quote text-muted-foreground/70 h-12.5 max-w-35 border-subtle-foreground/40 flex flex-1 basis-0 justify-center rounded-t-lg border-2 border-b-0 border-dashed pt-2 text-xl">
                    III
                </div>
            </div>
            <div
                aria-hidden="true"
                className="bg-secondary max-w-140 h-1 w-full rounded-sm"
            />
            <h2
                id="leaderboard-empty-title"
                className="text-primary font-quote max-w-130 mt-8 text-3xl font-medium leading-tight"
            >
                {title}
            </h2>
            <p className="text-muted-foreground font-quote max-w-115 mt-2.5 text-lg italic leading-snug">
                {text}
            </p>
            {noFollows && (
                <Button variant="primary" className="mt-6" onClick={onShowAll}>
                    Voir tous les lecteurs
                </Button>
            )}
        </section>
    );
}
