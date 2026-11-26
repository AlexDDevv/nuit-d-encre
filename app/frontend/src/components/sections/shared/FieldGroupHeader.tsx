import { ReactNode } from "react";

/**
 * En-tête de groupe de champs : losange ◆ + libellé mono + filet doré,
 * avec un indice manuscrit optionnel en dessous.
 */
export default function FieldGroupHeader({
    children,
    hint,
}: {
    children: ReactNode;
    hint?: string;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
                <span
                    className="text-primary/55 text-xxxs rotate-45 leading-none"
                    aria-hidden="true"
                >
                    ◆
                </span>
                <h3 className="text-primary/80 tracking-spaced font-mono text-xs font-semibold uppercase">
                    {children}
                </h3>
                <span
                    className="from-primary/35 bg-linear-to-r h-px flex-1 to-transparent"
                    aria-hidden="true"
                />
            </div>
            {hint && (
                <p className="text-muted-foreground/65 font-quote text-xs italic leading-snug">
                    {hint}
                </p>
            )}
        </div>
    );
}
