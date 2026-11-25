import { cn } from "@/lib/utils";

/** Ornement signature : filet doré - losange ◆ - filet doré. */
export default function Ornament({
    className = "",
    width = "w-10",
}: {
    className?: string;
    width?: string;
}) {
    return (
        <span
            className={cn(
                "text-primary/55 inline-flex items-center gap-2",
                className,
            )}
            aria-hidden="true"
        >
            <span
                className={cn(
                    "to-primary/55 bg-linear-to-r h-px from-transparent",
                    width,
                )}
            />
            <span className="text-xxxs rotate-45 leading-none">◆</span>
            <span
                className={cn(
                    "to-primary/55 bg-linear-to-l h-px from-transparent",
                    width,
                )}
            />
        </span>
    );
}
