import { LuMegaphone } from "react-icons/lu";

/** En-tête de l'onglet « Bannières » + pastille d'état actif/inactif. */
export default function BannerTabHeader({ active }: { active: boolean }) {
    return (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-3">
                <span className="border-primary/40 bg-linear-to-b from-primary/15 text-primary grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 to-transparent">
                    <LuMegaphone size={20} />
                </span>
                <div>
                    <h2 className="font-quote text-foreground text-2xl font-medium leading-tight">
                        Composer une bannière
                    </h2>
                    <p className="font-body text-muted-foreground mt-0.5 max-w-xl text-sm leading-snug">
                        Choisissez l'état, rédigez le message et définissez le
                        lien du bouton. L'aperçu se met à jour en direct.
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:pb-1">
                {active ? (
                    <span className="border-primary/45 bg-primary/10 font-body text-primary inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em]">
                        <span className="bg-primary h-2 w-2 animate-pulse rounded-full" />{" "}
                        Une bannière est active
                    </span>
                ) : (
                    <span className="border-border bg-muted/50 font-body text-muted-foreground inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em]">
                        <span className="bg-muted-foreground/50 h-2 w-2 rounded-full" />{" "}
                        Aucune bannière active
                    </span>
                )}
            </div>
        </div>
    );
}
