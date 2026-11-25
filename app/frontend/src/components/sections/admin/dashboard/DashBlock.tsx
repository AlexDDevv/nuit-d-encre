import type { IconType } from "react-icons";
import type { ReactNode } from "react";

/** En-tête d'un bloc du dashboard. */
function BlockHead({
    icon: Icon,
    title,
    meta,
}: {
    icon: IconType;
    title: string;
    meta?: string;
}) {
    return (
        <div className="border-border flex items-center justify-between gap-3 border-b-2 px-5 py-3.5">
            <div className="flex items-center gap-2.5">
                <span className="border-border bg-popover text-primary/80 grid h-8 w-8 place-items-center rounded-lg border-2">
                    <Icon size={16} />
                </span>
                <h3 className="font-quote text-foreground/90 text-base font-medium uppercase tracking-[0.16em]">
                    {title}
                </h3>
            </div>
            {meta && (
                <span className="font-body text-muted-foreground/70 text-xs uppercase tracking-[0.14em]">
                    {meta}
                </span>
            )}
        </div>
    );
}

/** Coque encadrée d'un bloc du dashboard (en-tête + contenu). */
export default function DashBlock({
    icon,
    title,
    meta,
    children,
}: {
    icon: IconType;
    title: string;
    meta?: string;
    children: ReactNode;
}) {
    return (
        <div className="border-border bg-card overflow-hidden rounded-xl border-2">
            <BlockHead icon={icon} title={title} meta={meta} />
            {children}
        </div>
    );
}
