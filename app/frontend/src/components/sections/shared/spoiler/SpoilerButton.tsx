import { LuEyeOff } from "react-icons/lu";
import Button from "@/components/UI/Button/Button";
import { SPOILER_MARK, wrapSpoiler } from "@/lib/spoiler";
import { SpoilerButtonProps } from "@/types/types";

/**
 * Remplace la sélection comme le ferait une frappe : `insertText` garde
 * l'annulation (Ctrl+Z) et déclenche `onChange`, donc React Hook Form et le
 * compteur suivent. Repli : setter natif puis événement `input`.
 */
function typeInto(
    textarea: HTMLTextAreaElement,
    from: number,
    to: number,
    replacement: string,
    fullValue: string,
) {
    textarea.focus();
    textarea.setSelectionRange(from, to);
    if (document.execCommand?.("insertText", false, replacement)) return;

    const setValue = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
    )?.set;
    setValue?.call(textarea, fullValue);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

/**
 * Masque la sélection de la zone de texte en l'entourant de `||…||` (ou insère
 * un spoiler d'exemple), puis rend le focus avec le passage sélectionné.
 */
export default function SpoilerButton({ textareaRef }: SpoilerButtonProps) {
    const handleClick = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const from = Math.min(textarea.selectionStart, textarea.selectionEnd);
        const to = Math.max(textarea.selectionStart, textarea.selectionEnd);
        const next = wrapSpoiler(textarea.value, from, to);
        const replacement = next.value.slice(
            from,
            next.selectionEnd + SPOILER_MARK.length,
        );

        typeInto(textarea, from, to, replacement, next.value);
        textarea.setSelectionRange(next.selectionStart, next.selectionEnd);
    };

    return (
        <Button
            type="button"
            variant="text"
            size="xs"
            onClick={handleClick}
            ariaLabel="Masquer la sélection comme spoiler"
            title="Entoure la sélection de ||…|| : le passage sera flouté jusqu'au clic"
            leftIcon={<LuEyeOff />}
        >
            Spoiler
        </Button>
    );
}
