import type { IconType } from "react-icons";
import {
    LuAward,
    LuBookOpen,
    LuCircleCheck,
    LuFeather,
    LuSquarePen,
    LuStar,
    LuTrophy,
    LuThumbsUp,
} from "react-icons/lu";
import type { AdminRecentActivity, UserActionType } from "@/types/types";
import {
    actionLabel,
    formatRelative,
} from "@/components/sections/admin/adminFormat";
import DashBlock from "./DashBlock";

const XP_ICON: Record<UserActionType, IconType> = {
    BOOK_ADDED: LuBookOpen,
    AUTHOR_ADDED: LuFeather,
    BOOK_ADDED_TO_LIBRARY: LuBookOpen,
    BOOK_FINISHED: LuCircleCheck,
    BOOK_RECOMMENDED: LuThumbsUp,
    REVIEW_CREATED: LuSquarePen,
    DETAILED_REVIEW_BONUS: LuSquarePen,
    REVIEW_VOTED_HELPFUL: LuThumbsUp,
    BOOK_IMPORTED: LuBookOpen,
    BOOK_COMPLETED: LuStar,
    AUTHOR_COMPLETED: LuStar,
    READING_GOAL_REACHED: LuTrophy,
};

const XP_VERB: Record<UserActionType, string> = {
    BOOK_ADDED: "a ajouté",
    AUTHOR_ADDED: "a ajouté l'auteur",
    BOOK_ADDED_TO_LIBRARY: "a ajouté à sa bibliothèque",
    BOOK_FINISHED: "a terminé",
    BOOK_RECOMMENDED: "a recommandé",
    REVIEW_CREATED: "a critiqué",
    DETAILED_REVIEW_BONUS: "a détaillé sa critique de",
    REVIEW_VOTED_HELPFUL: "a soutenu une critique de",
    BOOK_IMPORTED: "a importé",
    BOOK_COMPLETED: "a complété",
    AUTHOR_COMPLETED: "a complété l'auteur",
    READING_GOAL_REACHED: "a atteint son défi de lecture",
};

export default function XpJournal({
    actions,
}: {
    actions: AdminRecentActivity["recentActions"];
}) {
    return (
        <DashBlock
            icon={LuAward}
            title="Journal de bord - XP"
            meta="10 dernières actions"
        >
            <div className="relative px-5 py-4">
                <span className="bg-border absolute bottom-5 left-10 top-5 w-px" />
                <ul className="flex flex-col gap-4">
                    {actions.map((ev) => {
                        const Icon = XP_ICON[ev.type] ?? LuBookOpen;
                        const verb = XP_VERB[ev.type] ?? "a contribué";
                        const label = actionLabel(ev.metadata);
                        return (
                            <li
                                key={ev.id}
                                className="relative flex items-start gap-3.5"
                            >
                                <span className="border-border bg-popover text-primary/70 relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2">
                                    <Icon size={15} />
                                </span>
                                <div className="min-w-0 flex-1 pt-1">
                                    <p className="font-body text-foreground/90 text-sm leading-snug">
                                        <span className="text-foreground font-bold">
                                            {ev.userName}
                                        </span>{" "}
                                        <span className="text-muted-foreground">
                                            {verb}
                                        </span>{" "}
                                        {label && (
                                            <span className="text-foreground/85">
                                                « {label} »
                                            </span>
                                        )}
                                    </p>
                                    <div className="mt-1 flex items-center gap-2.5">
                                        {ev.xp > 0 && (
                                            <span className="border-primary/40 bg-primary/10 font-title text-primary inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold">
                                                +{ev.xp} XP
                                            </span>
                                        )}
                                        <span className="font-body text-muted-foreground/75 text-xs">
                                            {formatRelative(ev.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </DashBlock>
    );
}
