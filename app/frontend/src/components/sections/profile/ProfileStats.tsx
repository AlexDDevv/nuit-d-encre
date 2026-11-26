import { IconType } from "react-icons";
import {
    FaBookOpen,
    FaCircleCheck,
    FaPenToSquare,
    FaFeatherPointed,
    FaLock,
    FaThumbsUp,
    FaWandMagicSparkles,
} from "react-icons/fa6";
import { ProfileStats as Stats } from "@/lib/profileActivity";
import { ProfileStatsProps } from "@/types/types";
import { Card, SectionHeading } from "./ProfileUI";

const STAT_META: { key: keyof Stats; label: string; icon: IconType }[] = [
    { key: "added", label: "Livres ajoutés", icon: FaBookOpen },
    { key: "finished", label: "Livres terminés", icon: FaCircleCheck },
    { key: "reviews", label: "Critiques écrites", icon: FaPenToSquare },
    { key: "authors", label: "Auteurs ajoutés", icon: FaFeatherPointed },
    { key: "recommendations", label: "Recommandés", icon: FaThumbsUp },
];

export default function ProfileStats({
    stats,
    privateKeys = [],
}: ProfileStatsProps) {
    return (
        <section className="fade-up">
            <SectionHeading icon={FaWandMagicSparkles}>
                Statistiques
            </SectionHeading>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {STAT_META.map(({ key, label, icon: Icon }) => (
                    <Card
                        key={key}
                        className="group flex min-w-0 items-center gap-2.5 px-3 py-3 sm:gap-3.5 sm:px-4 sm:py-3.5"
                    >
                        <span className="border-border bg-popover text-primary/80 group-hover:border-primary/50 group-hover:text-primary grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 transition-colors duration-200 sm:h-11 sm:w-11">
                            <Icon className="size-4 sm:size-5" />
                        </span>
                        <div className="min-w-0 leading-none">
                            {privateKeys.includes(key) ? (
                                <div
                                    className="text-muted-foreground font-title flex items-center gap-1.5 text-base font-bold sm:text-xl"
                                    title="Ce lecteur ne partage pas sa bibliothèque"
                                >
                                    <FaLock
                                        className="size-3.5 sm:size-4"
                                        aria-hidden="true"
                                    />
                                    Privé
                                </div>
                            ) : (
                                <div className="text-foreground font-title text-xl font-black tracking-tight sm:text-3xl">
                                    {stats[key].toLocaleString("fr-FR")}
                                </div>
                            )}
                            <div className="text-muted-foreground font-body text-xxs sm:tracking-label mt-1 overflow-hidden text-ellipsis font-bold uppercase leading-tight tracking-widest sm:text-xs">
                                {label}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
