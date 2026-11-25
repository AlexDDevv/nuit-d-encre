import { cn } from "@/lib/utils";
import { BOOK_STATES, STATUS_COLORS } from "@/constants/bookStatus";
import { StatusPillProps } from "@/types/types";

/** Pastille de statut en lecture seule, colorée selon le statut. */
export default function StatusPill({ status }: StatusPillProps) {
    const config = BOOK_STATES.find((s) => s.value === status);
    if (!config) return null;
    const Icon = config.icon;
    return (
        <span
            className={cn(
                "font-body text-xxs inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 font-bold backdrop-blur-sm",
                STATUS_COLORS[status].chip,
            )}
        >
            <Icon className="h-3 w-3" />
            {config.label}
        </span>
    );
}
