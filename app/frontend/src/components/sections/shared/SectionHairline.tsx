import { cn } from "@/lib/utils";

export default function SectionHairline({
    label,
    textClass = "text-sm",
}: {
    label: string;
    textClass?: string;
}) {
    return (
        <div className="flex items-center gap-2.5">
            <span
                className={cn("font-quote text-gold-muted italic", textClass)}
            >
                {label}
            </span>
            <span className="bg-primary/20 h-px flex-1" />
        </div>
    );
}
