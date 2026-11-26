import { LuCalendarCheck } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { formatReadingDate, todayInputValue } from "@/lib/readingDate";
import { FinishedAtFieldProps } from "@/types/types";

/**
 * « Lu le » d'un livre lu : date de fin de lecture, qui fait compter le livre
 * pour le défi de son année. Sans date (livre ajouté directement comme lu),
 * le champ invite à la renseigner.
 */
export default function FinishedAtField({
    userBookId,
    finishedAt,
    onChange,
    disabled,
    readOnly = false,
    className,
}: FinishedAtFieldProps) {
    if (readOnly) {
        if (!finishedAt) return null;
        return (
            <p
                className={cn(
                    "text-muted-foreground font-body inline-flex items-center gap-1.5 text-xs",
                    className,
                )}
            >
                <LuCalendarCheck size={12} aria-hidden="true" />
                Lu le {formatReadingDate(finishedAt)}
            </p>
        );
    }

    const inputId = `finished-at-${userBookId}`;

    return (
        <div
            className={cn(
                "font-body inline-flex items-center gap-1.5 text-xs",
                className,
            )}
        >
            <label
                htmlFor={inputId}
                className={cn(
                    "inline-flex shrink-0 items-center gap-1",
                    finishedAt ? "text-muted-foreground" : "text-primary",
                )}
                title={
                    finishedAt
                        ? undefined
                        : "Datez la lecture pour qu'elle compte dans votre défi"
                }
            >
                <LuCalendarCheck size={12} aria-hidden="true" />
                Lu le
            </label>
            <input
                id={inputId}
                type="date"
                value={finishedAt ?? ""}
                max={todayInputValue()}
                disabled={disabled}
                onChange={(event) =>
                    onChange?.(userBookId, event.target.value || null)
                }
                className={cn(
                    "border-border bg-input text-foreground focus-visible:ring-ring h-6 min-w-0 rounded-md border px-1.5 text-xs [color-scheme:dark] focus-visible:outline-none focus-visible:ring-2",
                    !finishedAt && "border-primary/50",
                )}
            />
        </div>
    );
}
