import { FaCircleInfo } from "react-icons/fa6";
import { cn } from "@/lib/utils";

type IncompleteChipProps = {
    className?: string;
};

/**
 * Chip sobre « Incomplet » (ambre), commun aux cartes livre et auteur.
 * Remplace l'ancien ruban diagonal. Placé en superposition dans un coin.
 */
export default function IncompleteChip({ className }: IncompleteChipProps) {
    return (
        <span
            className={cn(
                "font-body p-0.75 text-xxs text-warning border-warning-border inline-flex items-center gap-1 rounded-full border bg-[hsl(20_3%_10%/0.78)] px-2 font-bold tracking-wide backdrop-blur-sm",
                className,
            )}
            title="Fiche incomplète - informations manquantes"
        >
            <FaCircleInfo size={11} aria-hidden="true" /> Incomplet
        </span>
    );
}
