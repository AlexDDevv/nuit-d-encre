import { useMemo, useState } from "react";
import { parseSpoilers } from "@/lib/spoiler";
import { SpoilerPassageProps, SpoilerTextProps } from "@/types/types";

function HiddenPassage({ value }: SpoilerPassageProps) {
    const [revealed, setRevealed] = useState(false);

    if (revealed) {
        return (
            <span className="bg-foreground/10 rounded-sm px-0.5">{value}</span>
        );
    }

    return (
        <button
            type="button"
            onClick={() => setRevealed(true)}
            aria-label="Spoiler masqué, activer pour l'afficher"
            title="Afficher le spoiler"
            className="focus-visible:ring-ring bg-foreground/10 hover:bg-foreground/15 inline cursor-pointer select-none rounded-sm px-0.5 text-left text-transparent transition-colors [text-shadow:0_0_7px_hsl(20_12%_78%/0.75)] focus-visible:outline-none focus-visible:ring-2"
        >
            {value}
        </button>
    );
}

/**
 * Texte de critique ou de commentaire dont les passages `||…||` sont floutés
 * et se révèlent au clic (ou au clavier). À placer dans l'élément qui porte la
 * typographie et le `whitespace-pre-wrap`.
 */
export default function SpoilerText({ text }: SpoilerTextProps) {
    const segments = useMemo(() => parseSpoilers(text), [text]);

    return (
        <>
            {segments.map((segment, index) =>
                segment.type === "spoiler" ? (
                    <HiddenPassage key={index} value={segment.value} />
                ) : (
                    segment.value
                ),
            )}
        </>
    );
}
